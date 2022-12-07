# ================================
# |        Applications          |
# ================================

# Clipboard Manager (copyq)
copyq &

# Discord
# discord &

# Mail Client (mailspring)
# mailspring &

# Waybar
~/.config/waybar/launch.sh &


# ================================
# |      Utilities/Daemons       |
# ================================

# Policy Authentication Agent 
# /usr/lib/policykit-1-gnome/polkit-gnome-authentication-agent-1 &
# /usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1
lxpolkit &

# Bluetooth Utilities
# /usr/lib/bluetooth/mpris-proxy &
mpris-proxy &
blueman-applet &
blueman-tray &

# NetworkManager Applet 
nm-applet &

# Notification Daemon
dunst &

# Spotify Daemon
spotifyd &

# Music Player Daemon (MPD)
mpd --stdout --verbose &
# Wob
function wbs() {
    # Create pipe file if it doesn't exist
    [ -p /tmp/wobpipe ] || mkfifo /tmp/wobpipe

    # Start wob
    tail -f /tmp/wobpipe | wob
}

wbs &

# XDG Desktop Portal (Wayland)
function xdph() {
    # Wait 1 second
    sleep 1

    # Kill all running instances of xdg-desktop-portal and its variants
    killall -9 xdg-desktop-portal
    killall -9 xdg-desktop-portal-wlr
    killall -9 xdg-desktop-portal-hyprland

    # Start xdg-desktop-portal and xdg-desktop-portal-hyprland
    sleep 2 
    /usr/lib/xdg-desktop-portal-hyprland &
    # sleep 2
    /usr/lib/xdg-desktop-portal &
    # sleep 2
    # /usr/lib/xdg-desktop-portal-wlr
}

xdph &

# Swayidle (GitHub Copilot made this so idk)
# swayidle -w timeout 300 'swaylock -f -i /home/alex/Pictures/Wallpapers/lockscreen.png' resume 'swaymsg "output * dpms off"' timeout 600 'swaymsg "output * dpms on"' resume 'swaymsg "output * dpms off"' before-sleep 'swaylock -f -i /home/alex/Pictures/Wallpapers/lockscreen.png'
