# # If not running interactively, don't do anything
# [[ $- == *i* ]] || return

# [ -n "$PS1" ] && source ~/.bash_profile;

# Add dotfile binaries to PATH before sourcing dotfiles
PATH="$HOME/.dotfiles/bin:$PATH"

for DOTFILE in `find $HOME/.dotfiles/system -type f -name ".*" -printf "%f\n"`
do
    source "$HOME/.dotfiles/system/$DOTFILE"
done
unset DOTFILE
