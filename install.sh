#!/usr/bin/env bash
# bash -c "`curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/install.sh`"

if [ -z "${BASH_VERSION:-}" ]; then
	abort "Bash is required to interpret this script."
fi

# Importing
SOURCE="https://github.com/RealStr1ke/dotfiles"
TARBALL="$SOURCE/tarball/master"
TARGET="$HOME/.dotfiles"
TAR_CMD="tar -xzv -C "$TARGET" --strip-components=1 --exclude='{.gitignore}'"

is_executable() {
	type "$1" > /dev/null 2>&1
}

PATH="$HOME/.dotfiles/bin:$PATH"
mkdir -p "$HOME/.local/bin"

if is_executable "git"; then
	echo "Using git for installation"
	CMD="git clone $SOURCE $TARGET"
elif is_executable "curl"; then
	echo "Using curl for installation"
	CMD="curl -#L $TARBALL | $TAR_CMD"
elif is_executable "wget"; then
	echo "Using wget for installation"
	CMD="wget --no-check-certificate -O - $TARBALL | $TAR_CMD"
fi

if [ -z "$CMD" ]; then
	echo "No git, curl or wget available. Aborting."
else
	while true; do
		read -p "Do you wish to install the dotfiles with the given provider? (y/n) " yn
		case $yn in
			[Yy]* ) echo "Installing..."; break;;
			[Nn]* ) echo "Aborting."; exit;;
			* ) echo "Please answer yes or no.";;
		esac
	done
	mkdir -p "$TARGET"
	eval "$CMD"
	echo "Downloaded .files from RealStr1ke/dotfiles!"
	cd "$TARGET"
fi

# Installation
echo "Installing .files from RealStr1ke/dotfiles"

touch "$HOME/.dotfiles/system/.extra"
mkdir -p "$HOME/.dotfiles/backup"

# Backups
# BACKUPS="$HOME/.local/backups"
# if [ ! -d "$BACKUPS/info" ]; then
# 	mkdir -p "$BACKUPS/info"
# fi

# function backup() {
# 
# }


# Dotfiles
for DOTFILE in `find $HOME/.dotfiles/runcom -type f -name ".*" -printf "%f\n"`
do
    echo "Creating symlink to $DOTFILE (runcom) in home directory."
	if [ -f "$HOME/$DOTFILE" ]; then
		echo "$DOTFILE already exists in the home directory, creating backup at $HOME/.dotfiles/backup/$DOTFILE"
		cp "$HOME/$DOTFILE" "$HOME/.dotfiles/backup/$DOTFILE"
		# echo "$DOTFILE|$HOME/$DOTFILE|RealStr1ke's dotfiles overriding" >> $BACKUPS/info/list.txt
	fi
	[ -f "$HOME/.dotfiles/runcom/$DOTFILE" ] && ln -sf "$HOME/.dotfiles/runcom/$DOTFILE" "$HOME/$DOTFILE"
	#  && source "$DOTFILE"
done


# Homebrew Installation
if is-executable "gp"; then
	echo "Gitpod detected, not installing Homebrew (or Linuxbrew)"
else
	NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
	if [ -d "$HOME/.linuxbrew/" ]
fi

# if is-executable "gp"; then
# 	echo "Gitpod detected, not installing Homebrew (or Linuxbrew)"
# elif [ "$(uname -m)" = "armv7l" ]; then
# 	echo "ARMv7l CPU detected (possibly Raspberry Pi), not installing Homebrew (or Linuxbrew)"
# else
# 	cd $HOME
# 	if [ "$(uname)" = "Linux" ]; then
# 		if [ "$EUID" -ne 0 ]; then
# 			mkdir .linuxbrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C "/home/linuxbrew/.linuxbrew"
# 			mkdir "/home/linuxbrew/.linuxbrew/var/tmp"
# 		else
# 			mkdir .linuxbrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C "$HOME/.linuxbrew"
# 			mkdir "$HOME/.linuxbrew/var/tmp"
# 		fi
# 	else
# 		mkdir homebrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C homebrew
# 		mkdir "$HOME/homebrew/var/tmp"
# 	fi
# fi

# Kitty Installation
# https://sw.kovidgoyal.net/kitty/binary/

curl -L https://sw.kovidgoyal.net/kitty/installer.sh | sh /dev/stdin \\
    installer=nightly launch=n

if [ "$(uname)" = "Linux" ]; then
	# Create a symbolic link to add kitty to PATH (assuming ~/.local/bin is in
	# your system-wide PATH)
	ln -s ~/.local/kitty.app/bin/kitty ~/.local/bin/
	# Place the kitty.desktop file somewhere it can be found by the OS
	cp ~/.local/kitty.app/share/applications/kitty.desktop ~/.local/share/applications/
	# If you want to open text files and images in kitty via your file manager also add the kitty-open.desktop file
	cp ~/.local/kitty.app/share/applications/kitty-open.desktop ~/.local/share/applications/
	# Update the paths to the kitty and its icon in the kitty.desktop file(s)
	sed -i "s|Icon=kitty|Icon=/home/$USER/.local/kitty.app/share/icons/hicolor/256x256/apps/kitty.png|g" ~/.local/share/applications/kitty*.desktop
	sed -i "s|Exec=kitty|Exec=/home/$USER/.local/kitty.app/bin/kitty|g" ~/.local/share/applications/kitty*.desktop
fi

# https://www.gnu.org/gnu/linux-and-gnu.en.html

# Exporting PATH
export PATH;

# Completion Message & Information
echo "→ Installation has been completed!"
echo "→ Thank you for using RealStr1ke's dotfiles, inspired from many dotfile repos."
echo "→ For extra custom configurations, you can edit the ~/.dotfiles/system/.extra file (untracked)."
echo "→ Next up, you should run '~/.dotfiles/packages/install.sh' to install saved packages."
echo "→ Remember to restart your bash prompt after completing the installation."