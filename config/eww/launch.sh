#!/usr/bin/env bash

# This script will manage all running eww instances
# Parameters: --wm <WM> [COMMAND]
#   WM: The window manager to use
#   COMMAND: The command to run
#     start: Start the eww daemon
#     stop: Stop the eww daemon
#     reload: Reload the eww daemon

# Array of currently available window managers
WM_LIST=(bspwm hyprland)


# Function to print the help message
function print_help() {
    white=$(tput setaf 7)
    bold=$(tput bold)
    normal=$(tput sgr0)

    echo -e "${white}${bold}Usage:${normal}${white} $0 --wm <WM> [COMMAND]"
    echo ""
    echo -e "    ${white}${bold}WM:${normal}${white} The window manager to use"
    echo -e "        ${white}${bold}Currently available:${normal}${white} ${WM_LIST[@]}"
    echo -e "    ${white}${bold}COMMAND:${normal}${white} The command to run"
    echo -e "        ${white}${bold}start:${normal}${white} Start the eww daemon"
    echo -e "        ${white}${bold}stop:${normal}${white} Stop the eww daemon"
    echo -e "        ${white}${bold}reload:${normal}${white} Reload the eww daemon"
    echo ""
    echo -e "    ${white}${bold}Example:${normal}${white} $0 --wm bspwm start"

}

print_help
