for DOTFILE in `find ~/projects/.dotfiles`
do
    [ -f "$DOTFILE" ] && source "$DOTFILE"
done