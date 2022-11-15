#!/bin/sh
#             __ _                           _
#  _ __ ___  / _(_)      _ __   ___  _ __ __| |_   ___ __  _ __
# | '__/ _ \| |_| |_____| '_ \ / _ \| '__/ _` \ \ / / '_ \| '_ \
# | | | (_) |  _| |_____| | | | (_) | | | (_| |\ V /| |_) | | | |
# |_|  \___/|_| |_|     |_| |_|\___/|_|  \__,_| \_/ | .__/|_| |_|
#                                                   |_|

# exit when any command fails
set -e

echoexit() {
    # Print to stderr and exit
    printf "%s\n" "$@" 1>&2
    exit 1
}

# Checking dependencies:
whereis nordvpn >/dev/null || echoexit "'nordvpn' not found."

menu() {
    # Menu command, should read from stdin and write to stdout.

    rofi -dmenu -i -p "Select" -no-custom
}

usage() {
    printf "Dynamic menu interface for nordvpn.

Usage:
  rofi-nordvpn [-h] [-s LABEL]
    -h                                 Display this help message.
    -s                                 Display current vpn status, useful for status bars.
"
}

init_menu() {
    # Initial menu.
    local choices
    choices="connect\ndisconnect\nstatus\nsettings"
    printf "%b" "$choices" | menu
}

connect() {
    # nordvpn connect options.
    local choices
    choices="default\ncountries\ncities\np2p\nonion"
    printf "%b" "$choices" | menu
}

countries() {
    # Country selection.
    nordvpn connect --generate-bash-completion | menu
}

cities() {
    # City selection.
    # Arg:
    #   $1: a country
    nordvpn connect "$1" --generate-bash-completion | menu
}

disconnect() {
    # disconnect
    nordvpn disconnect
}

status() {
    # Echo the status.
    local status
    status="$(nordvpn status | tr -d '\r -')"
    if [ -n "${status##*Connected*}" ]; then
        printf "Off"
    else
        printf "%s" "$(printf "%s" "$status" | grep "City" | cut -d ":" -f 2)"
    fi
}

vpn_status() {
    # Show vpn status.
    local choices
    choices="$(nordvpn status | tr -d '\r-' | sed 's/^ *//')"
    printf "%s" "$choices" | menu
}

settings() {
    # Show vpn settings.
    local choices
    choices="$(nordvpn settings | tr -d '\r-' | sed 's/^ *//')"
    printf "%s" "$choices" | menu
}

# Parse options to the `rofi-nordvpn` command
while getopts ":hs" opt; do
    case ${opt} in
    h)
        usage
        exit 0
        ;;
    s)
        status
        exit 0
        ;;
    \?)
        printf "Invalid Option: -%s\n" "$OPTARG" 1>&2
        usage
        exit 1
        ;;
    esac
done

case "$(init_menu)" in
"connect")
    case $(connect) in
    "default")
        nordvpn connect
        ;;
    "countries")
        country="$(countries)"
        [ -n "$country" ] && nordvpn connect "$country"
        ;;
    "cities")
        country="$(countries)"
        [ -n "$country" ] && city="$(cities "$country")"
        [ -n "$city" ] && nordvpn connect "$country" "$city"
        ;;
    "p2p")
        nordvpn connect p2p
        ;;
    "onion")
        nordvpn connect onion_over_vpn
        ;;
    *) ;;

    esac
    ;;
"disconnect")
    disconnect
    ;;
"status")
    vpn_status
    ;;
"settings")
    settings
    ;;
*) ;;

esac
