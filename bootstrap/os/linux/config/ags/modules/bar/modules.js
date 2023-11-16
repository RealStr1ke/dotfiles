import { App, Variable, Utils, Widget, Hyprland, Notifications, Network, Mpris, Audio, Battery, SystemTray } from '../utils/imports.js';
const { exec, execAsync } = Utils;
const { Box, Button, Label, Revealer, Icon, EventBox, Slider, ProgressBar, CircularProgress } = Widget;



function Launcher() {
    return Box({
        // className: 'bar-launcher',
        orientation: 'h',
        child: Button({
            onPrimaryClick: () => exec('bash -c "~/.config/rofi/launcher.sh drun"'),
            onSecondaryClick: () => exec('bash -c "~/.config/rofi/launcher.sh run"'),
            child: Icon({
                className: 'bl-icon',
                icon: `${App.configDir}/assets/images/hyprland-logo.png`,
                size: 28,
            }),
        }),
    })
}

function Workspaces() {
    return Box({
        className: 'bar-workspaces',
        connections: [[Hyprland, box => {
            const array = Array.from({ length: 9 }, (_, i) => i + 1);
            // console.log(array)
            box.children = array.map(i => {
                // const icons = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
                const icons = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
                return Button({
                    onClicked: () => {
                        try {
                            exec(`bash -c "~/.config/hypr/scripts/tools/workspaces workspace ${i}"`);
                        } catch (error) {
                            console.log(error);
                        }
                    },
                    // onScrollUp: () => {},
                    child: Label({ label: `${icons[i - 1]}` }),
                    connections: [[Hyprland, 
                        btn => {
                            const occupied = Hyprland.getWorkspace(i)?.windows > 0;
                            if (Hyprland.active.workspace.id == i) {
                                btn.toggleClassName('bw-focused', true);
                                btn.toggleClassName('bw-occupied', true);
                                // console.log(`${i} is focused`)
                            } else if ( Hyprland.getWorkspace(i)?.windows > 0) {
                                btn.toggleClassName('bw-occupied', true);
                                // console.log(`${i} is occupied`);
                            } else {
                                btn.toggleClassName('bw-unoccupied', true);
                                // console.log(`${i} is unoccupied`);
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
        connections: [[Hyprland, label => {
            // Shorten the title if it's over 50 chars long and add elipses
            const window = Hyprland.active.client.title;
            const title = window.length > 50 ? window.substring(0, 50) + '...' : window;
            label.label = title;
        }]],
    });
}

function SystemInfo() {
    const divide = ([total, free]) => free / total;

    const CPUVar = Variable(0, {
        poll: [
            2000, 
            'top -b -n 1', 
            out => {
                divide([100, out.split('\n')
                    .find(line => line.includes('Cpu(s)'))
                    .split(/\s+/)[1]
                    .replace(',', '.')])
            }
        ],
    });

    const RAMVar = Variable(0, {
        poll: [
            2000, 
            'free', 
            out => {
                divide(out.split('\n')
                    .find(line => line.includes('Mem:'))
                    .split(/\s+/)
                    .splice(1, 2))
            }
        ],
    });

    console.log(RAMVar)

    const RAM = CircularProgress({
        className: "bs-ram",
        // thickness: 8,
        binds: [['value', RAMVar]],
        child: Button({
            onClicked: "kitty --detach btm",
            className: "bs-ram-icon",
            child: Label("")
        })
    });

    const CPU = CircularProgress({
        className: "bs-cpu",
        // thickness: 8,
        binds: [['value', CPUVar]],
        child: Button({
            onClicked: "kitty --detach btm",
            className: "bs-cpu-icon",
            child: Label("")
        })
    });

    const system = Box({
        className: "bar-system",
        children: [
            CPU,
            RAM
        ]
    });

    return system;
}

function PowerMenu() {
    const powermenu = Button({
        onPrimaryClick: () => exec('bash -c "~/.config/wlogout/launch.sh"'),
        child: Label({
            className: 'bar-powermenu',
            label: '',
        }),
    });
    return powermenu;
}

function Clock() {
    let hover = false;
    let hoverRevealer = false;
    const clock = EventBox({
        className: 'bar-clock',
        onHover: () => hover = true,
        onHoverLost: () => hover = false,
        child: Box({
            children: [
                Label({
                    className: 'bc-clock',
                    connections: [[
                        1000, // update every second
                        label => execAsync(['date', '+%I:%M:%S %p'])
                            .then(date => label.label = date).catch(console.error)]]
                }),
                Revealer({
                    transition: 'slide_left',
                    'transition-duration': 350,
                    child: EventBox({
                        onHover: () => hoverRevealer = true,
                        onHoverLost: () => hoverRevealer = false,
                        child: Label({
                            className: 'bc-date',
                            connections: [[
                                1000, // update every 60000ms
                                label => execAsync(['date', '+%A, %B %d, %Y (%V)'])
                                    .then(date => label.label = date).catch(console.error)]]
                        }),
                    }),
                    connections: [[
                        100, // update every 100ms
                        (revealer) => {
                            // exec(`notify-send ${revealer.reveal_child}`);
                            if (hover || hoverRevealer) {
                                revealer.reveal_child = true;
                            } else {
                                revealer.reveal_child = false;
                            }
                        }
                    ]]
                })
            ]
        }),
    });
    return clock;
}

function NetworkInfo() {
    let hover = false;
    let hoverRevealer = false;
    const network = EventBox({
        className: 'bar-network',
        onHover: () => hover = true,
        onHoverLost: () => hover = false,
        child: Box({
            children: [
                Label({
                    className: 'bn-icon',
                    connections: [[
                        Network,
                        label => {
                            let icon = '';
                            if (Network.connectivity == "unknown" || Network.connectivity == "none") {
                                icon = "󰤭"
                            } else if (Network.wifi) {
                                if (Network.wifi.internet === "connected") {
                                    const wifiStrength = Network.wifi.strength; // 0 - 100
                                    if (wifiStrength >= 100) {
                                        icon = "󰤩";
                                    } else if (wifiStrength > 75) {
                                        icon = "󰤥";
                                    } else if (wifiStrength > 50) {
                                        icon = "󰤢";
                                    } else if (wifiStrength > 25) {
                                        icon = "󰤟";
                                    } else {
                                        icon = "󰤯";
                                    }
                                } else if (Network.wifi.internet === "connecting") {
                                    icon = "";
                                } else if (Network.wifi.internet === "disconnected") {
                                    icon = "󰤭";
                                }
                            } else if (Network.wired) {
                                icon = "󰈀";
                            }
                            label.label = icon;
                        }
                    ]]
                }),
                Revealer({
                    transition: 'slide_left',
                    'transition-duration': 350,
                    child: EventBox({
                        onHover: () => hoverRevealer = true,
                        onHoverLost: () => hoverRevealer = false,
                        child: Label({
                            className: 'bn-text',
                            connections: [[
                                Network,
                                label => {
                                    let text = "";
                                    if (Network.connectivity === "unknown") {
                                        text = "Unknown"
                                    } else if (Network.connectivity === "none") {
                                        text = "Not Connected"
                                    } else if (Network.wifi) {
                                        if (Network.wifi.internet === "disconnected") {
                                            text = "Disconnected"
                                        } else if (Network.wifi.internet === "connecting") {
                                            text = "Connecting"
                                        } else if (Network.wifi.internet === "connected") {
                                            text = Network.wifi.ssid;
                                        }
                                    } else if (Network.wired) {
                                        text = "Wired"
                                    }
                                    // console.log(text)
                                    label.label = text;
                                },
                            ]]
                        }),
                    }),
                    connections: [[
                        100, // update every 100ms
                        (revealer) => {
                            // exec(`notify-send ${revealer.reveal_child}`);
                            if (hover || hoverRevealer) {
                                revealer.reveal_child = true;
                            } else {
                                revealer.reveal_child = false;
                            }
                        }
                    ]]
                })
            ]
        }),
    });
    return network;
}

function VolumeInfo() {
    let hover = false;
    let hoverRevealer = false;
    const volume = EventBox({
        className: 'bar-volume',
        onHover: () => hover = true,
        onHoverLost: () => hover = false,
        child: Box({
            children: [
                Label({
                    className: 'bv-icon',
                    connections: [[Audio, label => {
                        if (!Audio.speaker) {
                            label.label = '󰖁';
                        } else if (Audio.speaker.isMuted) {
                            label.label = '';
                        } else if (Audio.speaker.volume * 10000 > 50) {
                            label.label = '󰕾';
                        } else if ((Audio.speaker.volume * 10000) > 0) {
                            label.label = '󰖀';
                        } else {
                            label.label = '';
                        }
                        return;
                    }, 'speaker-changed']],
                }),
                Revealer({
                    transition: 'slide_right',
                    'transition-duration': 350,
                    child: EventBox ({
                        onHover: () => hoverRevealer = true,
                        onHoverLost: () => hoverRevealer = false,
                        child: Box({
                            className: 'bv-slider',
                            css: 'min-width: 140px',
                            child: Slider({
                                // className: 'bv-slider',
                                hexpand: true,
                                drawValue: false,
                                onChange: ({ value }) => Audio.speaker.volume = value,
                                connections: [[Audio, slider => {
                                    if (!Audio.speaker)
                                        return;
                                    // console.log(`Volume: ${Audio.speaker.volume * 100}`)
                                    slider.value = Audio.speaker.volume;
                                }, 'speaker-changed']],
                            })
                        }),
                    }),
                    connections: [[
                        100, // update every 100ms
                        (revealer) => {
                            // exec(`notify-send ${revealer.reveal_child}`);
                            if (hover || hoverRevealer) {
                                // console.log("Should reveal")
                                revealer.reveal_child = true;
                            } else {
                                // console.log("Should not reveal")
                                revealer.reveal_child = false;
                            }
                        }
                    ]]
                })
            ]
        }),
    });
    return volume;
}

function BatteryInfo() {
    let hover = false;
    let hoverRevealer = false;
    const battery = EventBox({
        className: 'bar-battery',
        onHover: () => hover = true,
        onHoverLost: () => hover = false,
        child: Box({
            children: [
                Label({
                    className: 'bb-icon',
                    connections: [[Battery, label => {
                        const icons = ["󰂎", "󰁺", "󰁻", "󰁼", "󰁽", "󰁾", "󰁿", "󰂀", "󰂁", "󰂂", "󰁹"];
                        // console.log((Math.floor(Battery.percent / 10) + 1) * 10)
                        if (Battery.charging) {
                            label.label = '󰂄';
                        } else {
                            label.label = `${icons[Math.floor(Battery.percent / 10)]}`;
                            // console.log(Math.floor(Battery.percent / 10))
                        }
                        // console.log(label.label);
                    }]],
                }),
                Revealer({
                    transition: 'slide_right',
                    'transition-duration': 350,
                    child: EventBox ({
                        onHover: () => hoverRevealer = true,
                        onHoverLost: () => hoverRevealer = false,
                        child: Box({
                            css: 'min-width: 140px',
                            child: ProgressBar({
                                className: 'bb-progress',
                                vpack: 'center',
                                connections: [[Battery, progress => {
                                    if (Battery.percent < 0)
                                        return;
                    
                                    progress.fraction = Battery.percent / 100;
                                }]],
                            }),
                        }),
                    }),
                    connections: [[
                        100, // update every 100ms
                        (revealer) => {
                            // exec(`notify-send ${revealer.reveal_child}`);
                            if (hover || hoverRevealer) {
                                // console.log("Should reveal")
                                revealer.reveal_child = true;
                            } else {
                                // console.log("Should not reveal")
                                revealer.reveal_child = false;
                            }
                        }
                    ]]
                })
            ]
        }),
    });
    return battery;
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

function Gap() {
    return Box({
        hexpand: true,
        width: 14,
    });
}

function Separator() {
    return Box({
        className: 'bar-separator',
        // hexpand: true,
        // vexpand: true,
        valign: 'center',
        child: Label({
            label: '|',
        }),
    })
}

function Media() {
    return Button({
        className: 'bar-media',
        onPrimaryClick: () => Mpris.getPlayer('')?.playPause(),
        onScrollUp: () => Mpris.getPlayer('')?.next(),
        onScrollDown: () => Mpris.getPlayer('')?.previous(),
        child: Label({
            className: 'bm-title',
            connections: [[Mpris, label => {
                const mpris = Mpris.getPlayer('');
                // console.log(mpris);
                // mpris player can be undefined
                if (mpris) {
                    // If the artist is unknown, then just show the title
                    if (mpris.trackArtists[0] === 'Unknown artist' || mpris.trackArtists[0] === "") {
                        label.label = `${mpris.trackTitle}`;
                    // If the artist and title exist, then show both
                    } else if (mpris.trackTitle !== "") {
                        label.label = `${mpris.trackArtists.join(', ')} - ${mpris.trackTitle}`;
                    }
                } else {
                    label.label = '';
                }
            }]]
        })
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

// Export all the functions
export default {
    Launcher,
    Workspaces,
    ClientTitle,
    Clock,
    VolumeInfo,
    BatteryInfo,
    NetworkInfo,
    PowerMenu,
    Notification,
    SystemInfo,
    Gap,
    Separator,
    Media,
    SysTray,
};