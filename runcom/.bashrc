# # If not running interactively, don't do anything
# [[ $- == *i* ]] || return

# [ -n "$PS1" ] && source ~/.bash_profile;
echo "FROM BASHRC"
# cd dotfiles
source ../../workspace/dotfiles/runcom/.inputrc
source ../../workspace/dotfiles/system/.alias
source ../../workspace/dotfiles/system/.env
source ../../workspace/dotfiles/system/.function
source ../../workspace/dotfiles/system/.prompt