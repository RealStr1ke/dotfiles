const { Hyprland, Notifications, Mpris, Audio, Battery, SystemTray } = ags.Service;
const { Widget } = ags;
const { exec, execAsync } = ags.Utils;
const { Box, Button, Stack, Label, Icon, CenterBox, Window, Slider, ProgressBar } = Widget;

// widgets can be only assigned as a child in one container
// so to make a reuseable widget, just make it a function
// then you can use it by calling simply calling it

function Workspaces() {
    return Box({
        className: 'bar-workspaces',
        connections: [[Hyprland, box => {
            const array = Array.from({ length: 9 }, (_, i) => i + 1);
            console.log(array)
            box.children = array.map(i => {
                const icons = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
                return Button({
                    onClicked: () => {
                        try {
                            exec(`bash -c "~/.config/hypr/scripts/tools/workspaces workspace ${i}"`);
                        } catch (error) {
                            console.log(error);
                        }
                    },
                    onScrollUp: () => {
                        
                    },
                    child: Label({ label: `${icons[i - 1]}` }),
                    connections: [[Hyprland, 
                        btn => {
                            const occupied = Hyprland.getWorkspace(i)?.windows > 0;
                            if (Hyprland.active.workspace.id == i) {
                                btn.toggleClassName('bw-focused', true);
                                btn.toggleClassName('bw-occupied', true);
                                console.log(`${i} is focused`)
                            } else if ( Hyprland.getWorkspace(i)?.windows > 0) {
                                btn.toggleClassName('bw-occupied', true);
                                console.log(`${i} is occupied`);
                            } else {
                                btn.toggleClassName('bw-unoccupied', true);
                                console.log(`${i} is unoccupied`);
                            }
                        }
                    ]],
                })
            });
        }]],
    });
}

function ClientTitle() {
    return Label({
        className: 'bar-title',
        // an initial label value can be given but its pointless
        // because callbacks from connections are run on construction
        // so in this case this is redundant
        label: Hyprland.active.client.title || '',
        connections: [[Hyprland, label => {
            const title = exec(`bash -c "echo \\"${Hyprland.active.client.title || ''}\\" | cut -c1-50 | awk '{print (length($0) < 20) ? $0 : $0\\"...\\"}'"`)
            label.label = title;
        }]],
    });
}

function Clock() {
    return Label({
        className: 'bar-clock',
        connections: [
            [ 
                500, // Updates every 500ms
                label => {
                    return execAsync(['date', '+%I:%M:%S %p'])
                    .then(date => label.label = date).catch(console.error);
                }
            ]
        ]
    });
}

function Notification() {
    return Box({
        className: 'bar-notification',
        children: [
            Icon({
                icon: 'preferences-system-notifications-symbolic',
                connections: [
                    [Notifications, icon => icon.visible = Notifications.popups.length > 0],
                ],
            }),
            Label({
                connections: [[Notifications, label => {
                    label.label = Notifications.popups[0]?.summary || '';
                }]],
            }),
        ],
    });
}

function Spacer() {
    return Label({
        className: 'bar-spacer',
        label: "",
    });
}

function Media() {
    return Button({
        className: 'bar-media',
        onPrimaryClick: () => Mpris.getPlayer('')?.playPause(),
        onScrollUp: () => Mpris.getPlayer('')?.next(),
        onScrollDown: () => Mpris.getPlayer('')?.previous(),
        child: Label({
            connections: [[Mpris, label => {
                const mpris = Mpris.getPlayer('');
                // mpris player can be undefined
                if (mpris)
                    label.label = `${mpris.trackArtists.join(', ')} - ${mpris.trackTitle}`;
                else
                    label.label = '';
            }]],
        }),
    });
}

function Volume() {
    return Box({
        className: 'bar-volume',
        style: 'min-width: 180px',
        children: [
            Stack({
                items: [
                    // tuples of [string, Widget]
                    ['101', Icon('audio-volume-overamplified-symbolic')],
                    ['67', Icon('audio-volume-high-symbolic')],
                    ['34', Icon('audio-volume-medium-symbolic')],
                    ['1', Icon('audio-volume-low-symbolic')],
                    ['0', Icon('audio-volume-muted-symbolic')],
                ],
                connections: [[Audio, stack => {
                    if (!Audio.speaker)
                        return;
    
                    if (Audio.speaker.isMuted) {
                        stack.shown = '0';
                        return;
                    }
    
                    const show = [101, 67, 34, 1, 0].find(
                        threshold => threshold <= Audio.speaker.volume * 100);
    
                    stack.shown = `${show}`;
                }, 'speaker-changed']],
            }),
            Slider({
                hexpand: true,
                drawValue: false,
                onChange: ({ value }) => Audio.speaker.volume = value,
                connections: [[Audio, slider => {
                    if (!Audio.speaker)
                        return;
    
                    slider.value = Audio.speaker.volume;
                }, 'speaker-changed']],
            }),
        ],
    });
}

function BatteryLabel() {
    return Box({
        className: 'bar-battery',
        children: [
            Icon({
                connections: [[Battery, icon => {
                    icon.icon = `battery-level-${Math.floor(Battery.percent / 10) * 10}-symbolic`;
                }]],
            }),
            ProgressBar({
                valign: 'center',
                connections: [[Battery, progress => {
                    if (Battery.percent < 0)
                        return;
    
                    progress.fraction = Battery.percent / 100;
                }]],
            }),
        ],
    });
}

function SysTray() {
    return Box({
        className: 'bar-systray',
        connections: [[SystemTray, box => {
            box.children = SystemTray.items.map(item => Button({
                child: Icon(),
                onPrimaryClick: (_, event) => item.activate(event),
                onSecondaryClick: (_, event) => item.openMenu(event),
                connections: [[item, button => {
                    button.child.icon = item.icon;
                    button.tooltipMarkup = item.tooltipMarkup;
                }]],
            }));
        }]],
    });
}

function Left() {
    const left = Box({
        children: [
            Workspaces(),
            Media(),
        ],
    });
    return left;
}

function Center() {
    const center = Box({
        children: [
            ClientTitle(),
        ],
    });
    return center;
}

function Right() {
    const right = Box({
        halign: 'end',
        children: [
            Notification(),
            Volume(),
            BatteryLabel(),
            Clock(),
            SysTray(),
        ],
    });
    return right;
}

export default monitor => Window({
    name: `bar${monitor}`, // name has to be unique
    className: 'bar',
    monitor,
    anchor: ['top', 'left', 'right'],
    exclusive: true,
    child: CenterBox({
        startWidget: Left(),
        centerWidget: Center(),
        endWidget: Right(),
    }),
})
