# Symlink runcom files
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

# Symlink .config files
for CONFIG in `find $HOME/.dotfiles/config -type f -printf "%f\n"`
do
	echo "Creating symlink to $CONFIG (config) in home directory."
	if [ -f "$HOME/.config/$CONFIG" ]; then
		[[ -d "$HOME/.dotfiles/backup/config" ]] || mkdir -p "$HOME/.dotfiles/backup/config"
		echo "$CONFIG already exists in the home directory, creating backup at $HOME/.dotfiles/backup/$CONFIG"
		cp "$HOME/.config/$CONFIG" "$HOME/.dotfiles/backup/$CONFIG"
	fi
	[ -f "$HOME/.dotfiles/config/$CONFIG" ] && ln -sf "$HOME/.dotfiles/config/$CONFIG" "$HOME/.config/$CONFIG"
done