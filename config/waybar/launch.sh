#!/usr/bin/env bash

# Terminate all instances of waybar
killall -q waybar

# Make sure GDK_BACKEND is set to wayland
export GDK_BACKEND=wayland

# Launch waybar with logs being piped to /tmp/waybar.log
waybar -l info -c ~/.config/waybar/config > /tmp/waybar.log 2>&1 & disown
