#!/usr/bin/env bash
# bash -c "`curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/install.sh`"

# If Linux is detected, run bootstrap/linux.sh
# If macOS is detected, tell the user that macOS is not supported yet.
# If Windows is detected, tell the user that Windows is not supported yet.
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
	echo "=====> Detected OS: Linux"
	bash -c "`curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/bootstrap/linux.sh`"
elif [[ "$OSTYPE" == "darwin"* ]]; then
	echo "=====> Detected OS: macOS"
	echo "=====> macOS is not supported yet."
elif [[ "$OSTYPE" == "cygwin" ]]; then
	echo "=====> Detected OS: Windows"
	echo "=====> Windows is not supported yet."
elif [[ "$OSTYPE" == "msys" ]]; then
	echo "=====> Detected OS: Windows"
	echo "=====> Windows is not supported yet."
elif [[ "$OSTYPE" == "win32" ]]; then
	echo "=====> Detected OS: Windows"
	echo "=====> Windows is not supported yet."
else
	echo "=====> Detected OS: Unknown"
	echo "=====> Unknown OS is not supported yet."
fi
