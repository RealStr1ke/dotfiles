# Lines configured by zsh-newuser-install
HISTFILE=~/.zsh_history
HISTSIZE=32768
SAVEHIST=4096
bindkey -e
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '/home/str1ke/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall

if [ -e /home/str1ke/.nix-profile/etc/profile.d/nix.sh ]; then . /home/str1ke/.nix-profile/etc/profile.d/nix.sh; fi # added by Nix installer
