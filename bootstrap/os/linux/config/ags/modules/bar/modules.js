import { App, Variable, Utils, Widget, Hyprland, Notifications, Network, Mpris, Audio, Battery, SystemTray } from '../utils/imports.js';
const { exec, execAsync } = Utils;
const { Box, Button, Label, Revealer, Icon, EventBox, Slider, ProgressBar, CircularProgress } = Widget;
import settings from '../settings.js'

function Launcher() {
    return Box({
        className: 'bar-launcher',
        orientation: 'h',
        child: Button({
            onPrimaryClick: () => exec('bash -c "~/.config/rofi/launcher.sh drun"'),
            onSecondaryClick: () => exec('bash -c "~/.config/rofi/launcher.sh run"'),
            child: Icon({
                icon: `${App.configDir}/assets/images/hyprland-logo.png`,
                size: 16,
            }),
        }),
    })
}

function Workspaces() {
    const japanese = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
    const arabic = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const greek = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι"];
    const dots = ["●", "●", "●", "●", "●", "●", "●", "●", "●"];
    const iconSets = [ japanese, arabic, greek, dots ];
    const icons = iconSets[Math.floor(Math.random() * iconSets.length)];
    // const icons = iconSets[2];
    const status = num => {
        if (Hyprland.active.workspace.id == num) return "bw-focused bw-occupied";
        else if (Hyprland.getWorkspace(num)?.windows > 0) return "bw-occupied";
        else return "bw-unoccupied";
    }

    const array = Array.from({ length: 9 }, (_, i) => i + 1);
    return Box({
        className: 'bar-workspaces',
        children: array.map(i => {
            return Button({
                onClicked: () => {
                    try {
                        exec(`bash -c "~/.config/hypr/scripts/tools/workspaces workspace ${i}"`);
                    } catch (error) {
                        console.log(error);
                    }
                },
                // className: status(i),
                // onScrollUp: () => {},
                child: Label({ label: `${icons[i - 1]}` }),
                connections: [[
                    Hyprland,
                    btn => {
                        btn.toggleClassName('bw-focused', Hyprland.active.workspace.id == i);
                        btn.toggleClassName('bw-occupied', Hyprland.active.workspace.id == i || Hyprland.getWorkspace(i)?.windows > 0);
                        btn.toggleClassName('bw-unoccupied', !(Hyprland.active.workspace.id == i || Hyprland.getWorkspace(i)?.windows > 0));
                    }
                ]],
            })
        })
    });
}

function ClientTitle() {
    return Label({
        className: 'bar-title',
        connections: [[Hyprland, label => {
            let window;
            if (Hyprland.active.client.class) window = Hyprland.active.client.class;
            else window = "Desktop";
            let replacements = settings.global.classReplacements;
            if (replacements[window]) {
                window = replacements[window]
            } else {
                window.length > 25 ? window.substring(0, 25) + '...' : window;
            } 
            label.label = window;
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
        setup: self => {
            self.bind('value', RAMVar);
        },
        child: Button({
            onClicked: "kitty --detach btm",
            className: "bs-ram-icon",
            child: Label("")
        })
    });

    const CPU = CircularProgress({
        className: "bs-cpu",
        // thickness: 8,
        setup: self => {
            self.bind('value', CPUVar);
        },
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

function Clock(type) {
    if (type === 'revealer') {
        let hover = false;
        let hoverRevealer = false;
        const clockRevealer = EventBox({
            className: 'bar-clock-revealer',
            onHover: () => hover = true,
            onHoverLost: () => hover = false,
            child: Box({
                children: [
                    Label({
                        className: 'bcr-clock',
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
                                className: 'bcr-date',
                                connections: [[
                                    1000, // update every 60000ms
                                    label => execAsync(['date', '+%A, %B %d, %Y (%V)'])
                                        .then(date => label.label = date).catch(console.error)]]
                            }),
                        }),
                        connections: [[
                            10, // update every 100ms
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
    } else if (type === 'button') {
        let shortLong = true;
        const clock = Button({
            onPrimaryClick: () => shortLong = !shortLong,
            className: 'bar-clock-button',
            child: Label({
                className: 'bcb-label',
                connections: [[
                    10, // update every 10ms
                    label => {
                        // console.log("BUTTON HAS BEEN SELECTED")
                        if (shortLong == false) {
                            execAsync(['date', "+%I:%M:%S %p | %a, %b %d, %Y"])
                                .then(date => label.label = date).catch(console.error);
                        } else if (shortLong == true) {
                            execAsync(['date', "+%I:%M:%S %p | %A, %B %d, %Y (%V)"])
                                .then(date => label.label = date).catch(console.error);
                        };
                    }
                ]]
            })
        });
        return clock;
    }
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
    return Button({
        className: 'bar-notification',
        child: Box({
            className: 'bnf-button',
            children: [
                Revealer({
                    transition: 'slide_right',
                    'transition-duration': 350,
                    child: Label({
                        connections: [[Notifications, label => {
                            label.label = Notifications.popups[Notifications.popups.length - 1]?.summary || '';
                        }]],
                    }),
                    connections: [[
                        Notifications, // update every 100ms
                        (revealer) => {
                            if (Notifications.popups.length > 0) {
                                revealer.reveal_child = true;
                            } else {
                                revealer.reveal_child = false;
                            }
                        }
                    ]]
                }),
                Icon({
                    className: 'bnf-icon',
                    // icon: 'preferences-system-notifications-symbolic',
                    size: 18,
                    connections: [
                        [Notifications, 
                            icon => {
                                if (Notifications.popups.length > 0) {
                                    icon.icon = `${App.configDir}/assets/images/notif-alert.svg`;
                                } else {
                                    icon.icon = `${App.configDir}/assets/images/notif-regular.svg`;
                                }
                            }],
                    ],
                }),
            ],
            connections: [[
                Notifications,
                box => {
                    if (Notifications.popups[Notifications.popups.length - 1]?.urgency === "critical") box.toggleClassName('bnf-notif-critical', true);
                    else box.toggleClassName('bnf-notif-critical', false);
                }
            ]]
        }),
    });
}

function Gap() {
    return Box({
        hexpand: true,
        width: 14,
    });
}

function Separator(sep) {
    if (sep) {
        return Box({
            className: 'bar-separator',
            // hexpand: true,
            // vexpand: true,
            valign: 'center',
            child: Label({
                label: sep,
            }),
        })
    } else {
        return Box({
            className: 'bar-separator',
            // hexpand: true,
            // vexpand: true,
            valign: 'center',
            child: Label({
                label: '●',
            }),
        })
    }
}

function Media() {
    let hover = false;
    return Button({
        className: 'bar-media',
        onPrimaryClick: () => Mpris.getPlayer('')?.playPause(),
        onScrollUp: () => Mpris.getPlayer('')?.next(),
        onScrollDown: () => Mpris.getPlayer('')?.previous(),
        onHover: () => hover = true,
        onHoverLost: () => hover = false,
        child: Box({
            children: [
                Icon({
                    className: 'bm-icon',
                    icon: `${App.configDir}/assets/images/music.svg`
                }),
                Revealer({
                    transition: 'slide_left',
                    'transition-duration': 350,
                    child: Label({
                        className: 'bm-title',
                        connections: [[Mpris, label => {
                            const mpris = Mpris.getPlayer('');
                            let text = "";
                            if (mpris) {
                                if (mpris.trackArtists[0] === 'Unknown artist' || mpris.trackArtists[0] === "") {
                                    text = `${mpris.trackTitle}`;
                                } else if (mpris.trackTitle !== "") {
                                    text = `${mpris.trackArtists.join(', ')} - ${mpris.trackTitle}`;
                                }
                            } else {
                                text = '';
                            }
                            label.label = text.length > 30 ? text.substring(0, 30) + '...' : text;
                        }]]
                    }),
                    connections: [[
                        100, // update every 100ms
                        (revealer) => {
                            if (hover) {
                                revealer.reveal_child = true;
                            } else {
                                revealer.reveal_child = false;
                            }
                        }
                    ]]
                }),
            ]
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
