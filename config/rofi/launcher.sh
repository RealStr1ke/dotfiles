#!/usr/bin/env bash

# Original Author: Aditya Shakya (@adi1090x) 
# Modified by: @RealStr1ke

dir="$HOME/.config/rofi"

# If $1 exists, then launch that mode, otherwise launch the default mode
if [[ -n "$1" ]]; then
    rofi \
        -no-lazy-grab \
        -show "$1" \
        -theme "$dir/style.rasi"
else
    rofi \
        -no-lazy-grab \
        -show drun \
        -theme "$dir/style.rasi"
fi
