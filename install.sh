#!/usr/bin/env bash
# bash -c "`curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/install.sh`"

# Importing
SOURCE="https://github.com/RealStr1ke/dotfiles"
TARBALL="$SOURCE/tarball/master"
TARGET="$HOME/.dotfiles"
TAR_CMD="tar -xzv -C "$TARGET" --strip-components=1 --exclude='{.gitignore}'"
is_executable() {
	type "$1" > /dev/null 2>&1
}

PATH="$HOME/.dotfiles/bin:$PATH"

if is_executable "git"; then
	CMD="git clone $SOURCE $TARGET"
elif is_executable "curl"; then
	CMD="curl -#L $TARBALL | $TAR_CMD"
elif is_executable "wget"; then
	CMD="wget --no-check-certificate -O - $TARBALL | $TAR_CMD"
fi

if [ -z "$CMD" ]; then
	echo "No git, curl or wget available. Aborting."
else
	echo "Downloaded .files from RealStr1ke/dotfiles!"
	mkdir -p "$TARGET"
	eval "$CMD"
	cd "$TARGET"
	# ./install.sh
fi

# Installation
echo "Installing .files from RealStr1ke/dotfiles"

touch $HOME/.dotfiles/system/.extra

for DOTFILE in `find $HOME/.dotfiles/runcom -type f -name ".*" -printf "%f\n"`
do
    echo "Creating symlink to $DOTFILE (runcom) in home directory."
	ln -sf "$HOME/.dotfiles/runcom/$DOTFILE" "$HOME/$DOTFILE"
    # [ -f "~/.dotfiles/runcom/$DOTFILE" ] && ln -sf "~/.dotfiles/runcom/$DOTFILE" "~/$DOTFILE"
	# && source "$DOTFILE"
done

mkdir "$HOME/bin"

# Homebrew Installation

if is-executable gp; then
	echo "Gitpod detected, not installing Homebrew (or Linuxbrew)"
elif [ "$(uname -m)" = "armv7l" ]; then
	echo "ARMv7l CPU detected (possibly Raspberry Pi), not installing Homebrew (or Linuxbrew)"
else
	cd $HOME
	if [ "$(uname)" = "Linux" ]; then
		if [$(sudo -l | grep ALL) = "(ALL : ALL) ALL"]; then
			mkdir .linuxbrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C "/home/linuxbrew/.linuxbrew"
			mkdir "/home/linuxbrew/.linuxbrew/var/tmp"
		else
			mkdir .linuxbrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C "$HOME/.linuxbrew"
			mkdir "$HOME/.linuxbrew/var/tmp"
		fi
	else
		mkdir homebrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C homebrew
		mkdir "$HOME/homebrew/var/tmp"
	fi
fi

# Kitty Installation

# curl -L https://sw.kovidgoyal.net/kitty/installer.sh | sh /dev/stdin
# if [ "$(uname)" = "Linux" ]; then
# 	ln -sf "~/.local/kitty.app/bin/kitty" "~/bin/kitty"
# else
# 	ln -sf "/Applications/kitty.app/bin/kitty" "~/bin/kitty"
# fi
# https://sw.kovidgoyal.net/kitty/binary/
# https://www.gnu.org/gnu/linux-and-gnu.en.html
# https://stackoverflow.com/questions/394230/how-to-detect-the-os-from-a-bash-script#394235


#!/usr/bin/env bash
# Exporting PATH
export PATH;

# Completion Message & Information
echo "→ Installation has been completed!"
echo "→ Thank you for using RealStr1ke's dotfiles, inspired from many dotfile repos."
echo "→ For extra custom configurations, you can edit the ~/.dotfiles/system/.extra file (untracked)."
echo "→ Next up, you should run '~/.dotfiles/packages/install.sh' to install saved packages."
echo "→ Remember to restart your bash prompt after completing the installation."