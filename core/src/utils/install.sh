#!/usr/bin/env bash
# bash -c "`curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/core/src/utils/install.sh`"

# Check if git is installed
if ! command -v git &> /dev/null; then
	echo "Error: git is required but not installed. Please install git first."
	exit 1
fi

# Set variables
DOTFILES_DIR="$HOME/.dotfiles"
REPO_URL="https://github.com/RealStr1ke/dotfiles.git"

# Clone the repository if it doesn't exist
if [ ! -d "$DOTFILES_DIR" ]; then
	echo "Cloning dotfiles repository..."
	git clone "$REPO_URL" "$DOTFILES_DIR"
else
	echo "Dotfiles directory already exists. Pulling latest changes..."
	cd "$DOTFILES_DIR" && git pull
fi

# Change to dotfiles directory
cd "$DOTFILES_DIR"

# Detect OS
detect_os() {
	case "$OSTYPE" in
		linux*)   echo "linux" ;;
		darwin*)  echo "macos" ;;
		cygwin)   echo "windows" ;;
		msys)     echo "windows" ;;
		win32)    echo "windows" ;;
		*)
			if [[ -f /etc/os-release ]]; then
				echo "linux"
			else
				echo "unknown"
			fi
			;;
	esac
}

# Install dependencies based on OS
install_dependencies() {
	local os
	os=$(detect_os)

	case "$os" in
		"linux")
			echo "Linux detected. Installing Bun..."
			curl -fsSL https://bun.sh/install | bash
			# Add bun to PATH for the current script execution
			export PATH="$HOME/.bun/bin:$PATH"
			;;
		"macos")
			echo "Error: macOS is not supported. These dotfiles are Linux-only."
			exit 1
			;;
		"windows")
			echo "Error: Windows is not supported. These dotfiles are Linux-only."
			exit 1
			;;
		*) # "unknown"
			echo "Error: Unknown OS detected. Cannot determine installation method."
			echo "Please install Bun manually: curl -fsSL https://bun.sh/install | bash"
			echo "Then run the installation again."
			exit 1
			;;
	esac
}

run_installation() {
	if ! command -v bun &> /dev/null; then
		echo "Error: Bun not detected. Aborting."
		exit 1
	fi
	echo "Running installation program..."
	
	# TODO: Implement installation logic lol
}

# Ensure Bun is installed
if command -v bun &> /dev/null; then
	echo "Bun already installed."
else
	echo "Bun not found. Attempting automatic Bun installation..."
	install_dependencies
	if command -v bun &> /dev/null; then
		echo "Bun installation appears successful."
	else
		echo "Bun still not found after install attempt."
		echo "Please install manually: curl -fsSL https://bun.sh/install | bash"
		exit 1
	fi
fi

# Run installation
run_installation