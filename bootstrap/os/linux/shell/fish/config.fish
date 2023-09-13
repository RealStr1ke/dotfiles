# Add dotfile binaries to PATH before sourcing dotfiles
set -gx PATH "$HOME/.dotfiles/bin/main" $PATH
set -gx PATH "$HOME/.dotfiles/bin/apps" $PATH
set -gx PATH "$HOME/.dotfiles/bin/fun" $PATH

# Source all the files in the settings folder
for file in ~/.dotfiles/bootstrap/os/linux/shell/fish/settings/*.fish
    source $file
end