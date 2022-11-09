#!/usr/bin/env bash

# Original script by @speltriao on GitHub
# https://github.com/speltriao/Pacman-Update-for-GNOME-Shell

# If the operating system is not Arch Linux, exit the script successfully
if [ ! -f /etc/arch-release ]; then
    echo ""
    exit 0
fi

# Calculate updates for each service
AUR=$(paru -Qua | wc -l)
OFFICIAL=$(checkupdates | wc -l)
FLATPAK=$(flatpak update | wc -l)
if [[ "$FLATPAK" = "2" ]]
then
    ((FLATPAK = 0))
else
    ((FLATPAK = FLATPAK - 5))
fi

# Calculate total number of updates
COUNT=$((OFFICIAL+FLATPAK+AUR))

# If there are updates, the script will output the following:  # Updates
# If there are no updates, the script will output nothing.

if [[ "$COUNT" = "0" ]]
then
    echo ""
else
    echo " $COUNT Updates"
fi