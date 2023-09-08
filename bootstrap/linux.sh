#!/usr/bin/bash

# If there is the "headless" argument, set the variable to true.
if [ "$1" == "headless" ]; then
    headless=true
fi

# Get parameters by user input using gum
# ./bin/gum choose full minimal --header "Pick the type of installation for the dotfiles" --header.foreground 213
# ./bin/gum choose packages fonts themes wallpapers --header "Pick the extra stuff to install (space to select, enter to continue)" --header.foreground 213 --no-limit
if [ "$headless" == true ]; then
    installType="minimal"
else
    installType=$(./bin/gum choose full minimal --header "Pick the type of installation for the dotfiles" --header.foreground 213)
    if [ "$installType" == "full" ]; then
        extra=$(./bin/gum choose packages fonts themes wallpapers --header "Pick the extra stuff to install (space to select, enter to continue)" --header.foreground 213 --no-limit)
    fi
    # Parse extra parameter with new line as delimiter
    IFS=$'\n' extra=($extra)
fi

# Install dotfiles



# TEST: Print parameters
# echo "type: $installType"
# echo "extra: ${extra[@]}"