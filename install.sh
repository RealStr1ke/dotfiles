#!/usr/bin/env bash
# bash -c "`curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/install.sh`"

# Detect OS and run appropriate bootstrap script

# Linux
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
	echo "=====> Detected OS: Linux"
	bash -c "`curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/bootstrap/linux.sh`"
# macOS
elif [[ "$OSTYPE" == "darwin"* ]]; then
	echo "=====> Detected OS: macOS"
	echo "=====> macOS is not supported yet."
# Windows
elif [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
	echo "=====> Detected OS: Windows"
	echo "=====> Windows is not supported yet."
# N/A
else
	echo "=====> Detected OS: Unknown"
	echo "=====> Unknown OS is not supported yet."
fi
