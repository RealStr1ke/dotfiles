if [ -f ~/.bashrc ]; then
	source ~/.bashrc
fi

if [ -e /home/str1ke/.nix-profile/etc/profile.d/nix.sh ]; then . /home/str1ke/.nix-profile/etc/profile.d/nix.sh; fi # added by Nix installer
