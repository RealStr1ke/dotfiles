# # If not running interactively, don't do anything
# [[ $- == *i* ]] || return

# [ -n "$PS1" ] && source ~/.bash_profile;

source "./.dotfiles/system/.inputrc"

source "./.dotfiles/runcom/.aliases"
source "./.dotfiles/runcom/.env"
source "./.dotfiles/runcom/.function"
source "./.dotfiles/runcom/.prompt"