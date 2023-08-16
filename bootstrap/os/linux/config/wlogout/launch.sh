#!/usr/bin/env bash

# Original script by @adi1090x on Github

LAYOUT="$HOME/.config/wlogout/layout"
STYLE="$HOME/.config/wlogout/style.css"

if [[ ! `pidof wlogout` ]]; then
	wlogout --layout ${LAYOUT} --css ${STYLE} \
		--buttons-per-row 5 \
		--column-spacing 50 \
		--row-spacing 50 \
		--margin-top 390 \
		--margin-bottom 390 \
		--margin-left 150 \
		--margin-right 150
else
	pkill wlogout
fi