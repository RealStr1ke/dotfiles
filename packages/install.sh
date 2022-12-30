echo "→ Installing packages..."

cd "$DOTFILES/packages"

# Ask for sudo password upfront
sudo -v

# Keep-alive: update existing `sudo` time stamp until `install.sh` has finished
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &

# Homebrew
# TODO: Make different Brewfiles for macOS and Linux
if ! is-executable brew; then
	echo "Homebrew is not installed."
	while true; do
		read -p "Do you wish to install Homebrew? (y/n) " yn
		case $yn in
			[Yy]* ) echo "Installing Homebrew..."; /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"; break;;
			[Nn]* ) echo "Skipping Homebrew installation."; break;;
			* ) echo "Please answer yes or no.";;
		esac
	done
fi

if is-executable brew; then
	echo "Homebrew is installed."
	while true; do
		read -p "Do you wish to install Homebrew packages? (y/n) " yn
		case $yn in
			[Yy]* ) echo "Installing Homebrew tabs, formulae, and casks..."; brew bundle; break;;
			[Nn]* ) echo "Skipping Homebrew package installation."; break;;
			* ) echo "Please answer yes or no.";;
		esac
	done
fi

# NPM
# Prompt for NPM installation
if ! is-executable npm; then
	echo "NPM is not installed."
	while true; do
		read -p "Do you wish to install NPM? (y/n) " yn
		case $yn in
			[Yy]* ) echo "Installing NPM..."; curl -L https://npmjs.org/install.sh | sh; break;;
			[Nn]* ) echo "Skipping NPM installation."; break;;
			* ) echo "Please answer yes or no.";;
		esac
	done
fi
# Prompt for NPM packages installation. If user agrees, install NPM packages from npmfile, assuming that each line contains a package name (use sed to replace \n with space).
if is-executable npm; then
	echo "NPM is installed."
	while true; do
		read -p "Do you wish to install NPM packages? (y/n) " yn
		case $yn in
			[Yy]* ) echo "Installing NPM packages..."; npm install -g $(sed ':a;N;$!ba;s/\n/ /g' npmfile); break;;
			[Nn]* ) echo "Skipping NPM package installation."; break;;
			* ) echo "Please answer yes or no.";;
		esac
	done
fi


# Visual Studio Code

# echo "→ Installing VSCode extensions..."
# input="$DOTFILES/packages/Codefile"
# while IFS= read -r line
# do
# 	code --install-extension $line
# done < "$input"

# Pip (Python)
# Prompt for PIP package installation. If user agrees, install PIP packages from pipfile, assuming that each line contains a package name (use sed to replace \n with space).
# If PIP is not installed, skip this step.
if is-executable pip; then
	echo "PIP is installed."sed ':a;N;$!ba;s/\n/ /g' pacfile
	while true; do
		read -p "Do you wish to install PIP packages? (y/n) " yn
		case $yn in
			[Yy]* ) echo "Installing PIP packages..."; pip install $(sed ':a;N;$!ba;s/\n/ /g' pipfile); break;;
			[Nn]* ) echo "Skipping PIP package installation."; break;;
			* ) echo "Please answer yes or no.";;
		esac
	done
fi

# Arch Linux packages
if [[ "$OS" == "arch" ]]; then
	echo "Arch Linux has been detected (btw I use Arch)."
	if ! is-executable paru; then
		echo "Paru is not installed."
		while true; do
			read -p "Do you wish to install Paru? (y/n) " yn
			case $yn in
				[Yy]* ) echo "Installing Paru..."; mkdir -p ~/.local/src; cd ~/.local/src; git clone https://aur.archlinux.org/paru.git; cd paru; makepkg -si; cd "$DOTFILES/packages"; break;;
				[Nn]* ) echo "Skipping Paru installation."; break;;
				* ) echo "Please answer yes or no.";;
			esac
		done
	fi
	if is-executable paru; then
		echo "Paru is installed."
		while true; do
			read -p "Do you wish to install Arch Linux packages? (y/n) " yn
			case $yn in
				[Yy]* ) echo "Installing Arch Linux packages..."; paru -S $(sed ':a;N;$!ba;s/\n/ /g' pacfile); break;;
				[Nn]* ) echo "Skipping Arch Linux package installation."; break;;
				* ) echo "Please answer yes or no.";;
			esac
		done
	fi
fi



# Unset input variable
unset input

echo "→ Installation complete! All packages have been installed."

