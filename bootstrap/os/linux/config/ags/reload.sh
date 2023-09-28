#!/usr/bin/bash
DIRECTORY_TO_OBSERVE="."
function block_for_change {
    inotifywait --recursive \
        --event modify,move,create,delete \
        $DIRECTORY_TO_OBSERVE
}

function run {
    pkill ags && hyprctl dispatch exec ags
}

while true; do
    inotifywait --recursive \
        --event create,delete,modify,move \
        $DIRECTORY_TO_OBSERVE
    pkill ags && hyprctl dispatch exec ags
    echo HELLO
done
