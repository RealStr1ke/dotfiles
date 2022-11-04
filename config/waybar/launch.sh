#!/usr/bin/env bash

# Terminate all instances of waybar
killall -q waybar

# Make sure GDK_BACKEND is set to wayland
export GDK_BACKEND=wayland

# Make sure XDG_CURRENT_DESKTOP is set to Unity (idk waybar said it was needed for a functional tray)
export XDG_CURRENT_DESKTOP=Unity

# Launch waybar with logs being piped to /tmp/waybar.log
waybar -l info -c ~/.config/waybar/config > /tmp/waybar.log 2>&1 & disown
