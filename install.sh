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

# Homebrew Installation
cd $HOME
mkdir homebrew && curl -L https://github.com/Homebrew/brew/tarball/master | tar xz --strip 1 -C homebrew
mkdir "$HOME/homebrew/var/tmp"
mkdir "$HOME/bin"
export PATH="$HOME/homebrew/bin:$PATH"

# Completion Message & Information
echo "→ Installation has been completed!"
echo "→ Thank you for using RealStr1ke's dotfiles, inspired from many dotfile repos."
echo "→ For extra custom configurations, you can edit the ~/.dotfiles/system/.extra file (untracked)."
echo "→ Next up, you should run '~/.dotfiles/packages/install.sh' to install saved packages."
echo "→ Remember to restart your bash prompt after completing the installation."