# # If not running interactively, don't do anything
# [[ $- == *i* ]] || return

# [ -n "$PS1" ] && source ~/.bash_profile;

source "$HOME/.dotfiles/runcom/.inputrc"

source "$HOME/.dotfiles/system/.aliases"
source "$HOME/.dotfiles/system/.env"
source "$HOME/.dotfiles/system/.function"
source "$HOME/.dotfiles/system/.prompt"