for DOTFILE in `find ~$(cd .. && pwd)`
do
    [ -f "$DOTFILE" ] && source "$DOTFILE"
done