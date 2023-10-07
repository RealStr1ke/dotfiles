#!/usr/bin/env bash

if [ -z "${BASH_VERSION:-}" ]; then
    abort "Bash is required to interpret this script."
fi

# Variables
SOURCE="https://github.com/RealStr1ke/dotfiles"
TARGET="$HOME/.dotfiles"

# Functions
function is-executable() {
    type "$1" > /dev/null 2>&1
}
function is::gitpod() {
    # Check for existent of this gitpod-specific file and the ENV var.
    # Courtesy to axonasif @ github
    test -e /ide/bin/gitpod-code && test -v GITPOD_REPO_ROOT;
}


# ==========================
# | Installation procedure |
# ==========================

# If there is the "headless" argument, set the variable to true.
if [ "$1" == "headless" ]; then
    headless=true
# Else if: This is a Gitpod environment.
elif is::gitpod; then
    headless=true
fi

# If either git or gum (non-headless) is not installed, abort.
if  ! is-executable "git"; then
    echo "Git is required to install the dotfiles."
    exit
fi
if  ! is-executable "gum"; then
    if [ ! "$headless" == true ]; then
        echo "Gum is required to install the dotfiles."
        exit
    fi
fi

# Get parameters by user input using gum
# ./bin/gum choose full minimal --header "Pick the type of installation for the dotfiles" --header.foreground 213
# ./bin/gum choose packages fonts themes wallpapers --header "Pick the extra stuff to install (space to select, enter to continue)" --header.foreground 213 --no-limit
# if [ ! "$headless" == true ]; then
#     if [ -f /etc/arch-release ]; then
#         echo "=====> Distro: Arch Linux"
#         if ! is-executable "git"; then
#             echo "======> Installing git (you might need your sudo password)..."
#             sudo pacman -S git
#         elif ! is-executable "gum"; then
#             echo "======> Installing gum (you might need your sudo password)..."
#             sudo pacman -S gum
#         fi
#     fi
# fi

# Install dotfiles

# Clone the repository to $TARGET
git clone $SOURCE $TARGET
cd $TARGET

# ============> Symlinking

# Runcom
for RUNCOM in `find $TARGET/bootstrap/os/linux/runcom -type f -name ".*" -printf "%f\n"`
do
    if [ -f "$HOME/$RUNCOM" ]; then
        [[ -d "$TARGET/backup/linux/runcom" ]] || mkdir -p "$TARGET/backup/linux/runcom"
        if [ "$1" == "headless" ]; then
            cp -r "$HOME/$RUNCOM" "$TARGET/backup/linux/runcom"
        else
            # Prompt with gum if the user wants to backup the file using gum confirm
            gum confirm "Runcom: Do you want to backup $RUNCOM?"
            if [ $? -eq 0 ]; then
                cp -r "$HOME/$RUNCOM" "$TARGET/backup/linux/runcom"
            fi
        fi
    fi

    # Symlink the runcom file
    [ -f "$TARGET/bootstrap/os/linux/runcom/$RUNCOM" ] && ln -sf "$TARGET/bootstrap/os/linux/runcom/$RUNCOM" "$HOME/$RUNCOM"
done

# Config Directories
for CONFIG in `find $TARGET/bootstrap/os/linux/config -type d -printf "%f\n"`
do
    if [ -d "$HOME/.config/$CONFIG" ]; then
        [[ -d "$TARGET/backup/linux/config" ]] || mkdir -p "$TARGET/backup/linux/config"
        if [ "$1" == "headless" ]; then
            cp -r "$HOME/.config/$CONFIG" "$TARGET/backup/linux/config"
        else
            # Prompt with gum if the user wants to backup the file using gum confirm
            gum confirm "Config: Do you want to backup $CONFIG?"
            if [ $? -eq 0 ]; then
                cp -r "$HOME/.config/$CONFIG" "$TARGET/backup/linux/config"
            fi
        fi
    fi
done

# Config Files
for CONFIG in `find $TARGET/bootstrap/os/linux/config -type f -name ".*" -printf "%f\n"`
do
    if [ -f "$HOME/$CONFIG" ]; then
        [[ -d "$TARGET/backup/linux/config" ]] || mkdir -p "$TARGET/backup/linux/config"
        if [ "$1" == "headless" ]; then
            cp -r "$HOME/$CONFIG" "$TARGET/backup/linux/config"
        else
            # Prompt with gum if the user wants to backup the file using gum confirm
            gum confirm "Config: Do you want to backup $CONFIG?"
            if [ $? -eq 0 ]; then
                cp -r "$HOME/$CONFIG" "$TARGET/backup/linux/config"
            fi
        fi
    fi

    # Symlink the config file
    [ -f "$TARGET/bootstrap/os/linux/config/$CONFIG" ] && ln -sf "$TARGET/bootstrap/os/linux/config/$CONFIG" "$HOME/$CONFIG"
done


# ============> Extras
if [ ! headless == true ]; then
    # Prompt user if they want to install the wallpapers (via the submodule)
    gum confirm "Extras: Do you want to install the wallpapers?"
    if [ $? -eq 0 ]; then
        echo "============> Updating the wallpapers submodule..."
        # Wallpapers submodule: RealStr1ke/Wallpapers at bootstrap/os/common/wallpapers
        git submodule update --init --recursive bootstrap/os/common/wallpapers
        echo "============> Wallpapers submodule updated!"
    fi
fi

# Dotfiles installation complete!
echo "============> Installation complete!"
echo "→ https://github.com/RealStr1ke/dotfiles"
echo "→ Thank you for using RealStr1ke's dotfiles!"
echo "→ Please restart your system to see the changes."
echo "→ Enjoy!"
echo "=====================================>"
