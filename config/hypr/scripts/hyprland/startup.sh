# ================================
# |        Applications          |
# ================================

# Clipboard Manager (copyq)
copyq &

# Network Manager Applet 
nm-applet &

# Discord
# discord &

# Notification Daemon
dunst &

# Spotify Daemon
spotifyd &

# Mail Client (mailspring)
# mailspring &

# Waybar
~/.config/waybar/launch.sh &

# Policy Authentication Agent 
# /usr/lib/policykit-1-gnome/polkit-gnome-authentication-agent-1 &
# /usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1
lxpolkit &

# Bluetooth Utilities
# /usr/lib/bluetooth/mpris-proxy &
mpris-proxy &
blueman-applet &
blueman-tray &

# Swayidle (GitHub Copilot made this so idk)
# swayidle -w timeout 300 'swaylock -f -i /home/alex/Pictures/Wallpapers/lockscreen.png' resume 'swaymsg "output * dpms off"' timeout 600 'swaymsg "output * dpms on"' resume 'swaymsg "output * dpms off"' before-sleep 'swaylock -f -i /home/alex/Pictures/Wallpapers/lockscreen.png'
