# Add dotfile binaries to PATH before sourcing dotfiles
set -gx PATH "$HOME/.dotfiles/src/bin/main" $PATH
set -gx PATH "$HOME/.dotfiles/src/bin/apps" $PATH
set -gx PATH "$HOME/.dotfiles/src/bin/fun" $PATH

# Source all the files in the settings folder
for file in ~/.dotfiles/src/shell/fish/settings/*.fish
    source $file
end