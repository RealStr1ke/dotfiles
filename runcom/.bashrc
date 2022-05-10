# # If not running interactively, don't do anything
# [[ $- == *i* ]] || return

# [ -n "$PS1" ] && source ~/.bash_profile;

source "$HOME/.dotfiles/system/.inputrc"

source "$HOME/.dotfiles/runcom/.aliases"
source "$HOME/.dotfiles/runcom/.env"
source "$HOME/.dotfiles/runcom/.function"
source "$HOME/.dotfiles/runcom/.prompt"