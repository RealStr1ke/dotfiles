#!/usr/bin/env sh

focused=$(hyprctl monitors -j | jq -rc '[ .[].focused ] | index(true)')

dispatcher=$1
workspace=$2

hyprctl dispatch "$dispatcher" "$focused$workspace"