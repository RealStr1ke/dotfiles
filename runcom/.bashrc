# # If not running interactively, don't do anything
# [[ $- == *i* ]] || return

# [ -n "$PS1" ] && source ~/.bash_profile;

for DOTFILE in `find $HOME/.dotfiles/system -type f -name ".*" -printf "%f\n"`
do
    source "$HOME/.dotfiles/system/$DOTFILE"
done
unset DOTFILE