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

function is-executable() {
	type "$1" > /dev/null 2>&1
}

function is::gitpod() {
    # Check for existent of this gitpod-specific file and the ENV var.
    # Courtesy to axonasif @ github
	test -e /ide/bin/gitpod-code && test -v GITPOD_REPO_ROOT;
}

PATH="$HOME/.dotfiles/bin:$PATH"
mkdir -p "$HOME/.local/bin"

if is-executable "git"; then
	echo "Using git for installation"
	CMD="git clone $SOURCE $TARGET"
elif is-executable "curl"; then
	echo "Using curl for installation"
	CMD="curl -#L $TARBALL | $TAR_CMD"
elif is-executable "wget"; then
	echo "Using wget for installation"
	CMD="wget --no-check-certificate -O - $TARBALL | $TAR_CMD"
fi

if [ -z "$CMD" ]; then
	echo "No git, curl or wget available. Aborting."
	exit
else
	if ! is::gitpod; then
		while true; do
			read -p "Do you wish to install the dotfiles with the given provider? (y/n) " yn
			case $yn in
				[Yy]* ) echo "Installing..."; break;;
				[Nn]* ) echo "Aborting."; exit;;
				* ) echo "Please answer yes or no.";;
			esac
		done
	fi
	mkdir -p "$TARGET"
	eval "$CMD"
	echo "Downloaded .files from RealStr1ke/dotfiles!"
	touch "$HOME/.dotfiles/shell/global/.extra"
	cd "$TARGET"
fi

# Installation
echo "Installing .files from RealStr1ke/dotfiles..."

# Runcom files
for DOTFILE in `find $HOME/.dotfiles/runcom -type f -name ".*" -printf "%f\n"`
do
    echo "Creating symlink to $DOTFILE (runcom) in home directory."
	if [ -f "$HOME/$DOTFILE" ]; then
		[[ -d "$HOME/.dotfiles/backup/runcom" ]] || mkdir -p "$HOME/.dotfiles/backup/runcom"
		echo "$DOTFILE already exists in the home directory, creating backup at $HOME/.dotfiles/backup/$DOTFILE"
		cp "$HOME/$DOTFILE" "$HOME/.dotfiles/backup/$DOTFILE"
	fi
	[ -f "$HOME/.dotfiles/runcom/$DOTFILE" ] && ln -sf "$HOME/.dotfiles/runcom/$DOTFILE" "$HOME/$DOTFILE"
done

# Symlink .config directories
for CONFIG in `find $HOME/.dotfiles/config -type d -printf "%f\n"`
do
	echo "Creating symlink to $CONFIG (config) in home directory."
	if [ -d "$HOME/.config/$CONFIG" ]; then
		[[ -d "$HOME/.dotfiles/backup/config" ]] || mkdir -p "$HOME/.dotfiles/backup/config"
		echo "$CONFIG already exists in the home directory, creating backup at $HOME/.dotfiles/backup/$CONFIG"
		cp -r "$HOME/.config/$CONFIG" "$HOME/.dotfiles/backup/$CONFIG"
		rm -r "$HOME/.config/$CONFIG"
	fi
	[ -d "$HOME/.dotfiles/config/$CONFIG" ] && ln -sf "$HOME/.dotfiles/config/$CONFIG" "$HOME/.config/$CONFIG"
done

# Homebrew Installation
if is::gitpod; then
	echo "Gitpod detected, not installing Homebrew (or Linuxbrew)."
else
	# Prompt for Homebrew installation
	while true; do
		read -p "Do you wish to install Homebrew? (y/n) " yn
		case $yn in
			[Yy]* ) echo "Installing Homebrew..."; NONINTERACTIVE=1 /usr/bin/env bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"; break;;
			[Nn]* ) echo "Skipping Homebrew installation."; exit;;
			* ) echo "Please answer yes or no.";;
		esac
	done
	
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
echo "→ Enjoy!"
