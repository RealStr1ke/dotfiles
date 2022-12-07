#!/usr/bin/env bash

# Terminate all instances of waybar
killall -q waybar

# Make sure GDK_BACKEND is set to wayland
export GDK_BACKEND=wayland

# Make sure XDG_CURRENT_DESKTOP is set to Unity (idk waybar said it was needed for a functional tray)
# export XDG_CURRENT_DESKTOP=Unity

# Make sure XDG_CURRENT_DESKTOP is set to sway (I'm gonna need this more because of flameshot)
# export XDG_CURRENT_DESKTOP=sway

# I guess I'm ignoring that last XDG_CURRENT_DESKTOP thing because it's not working
export XDG_CURRENT_DESKTOP=Hyprland

# Launch waybar with logs being piped to /tmp/waybar.log
waybar -l info -c ~/.config/waybar/config > /tmp/waybar.log 2>&1 & disown
