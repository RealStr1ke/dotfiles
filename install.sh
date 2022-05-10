#!/usr/bin/env bash
echo "Installing .files from RealStr1ke/dotfiles"

cd ~/.dotfiles

runcom="bash_profile bashrc inputrc"
system="alias env function prompt"

ln -sf $HOME/.dotfiles/runcom/.bashrc $HOME/.bashrc
# install=""

# echo "RUNCOM"
# for file in ${runcom}; do
#     echo "Creating symlink to $file in home directory."
#     ln -sf $HOME/.dotfiles/system/.${file} $HOME/.${file}
# done

# echo "SYSTEM"
# for file in ${system}; do
#     echo "Creating symlink to $file in home directory."
#     ln -sf $HOME/.dotfiles/system/.${file} $HOME/.${file}
# done