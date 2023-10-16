# Start GNOME Keyring
eval $(/usr/bin/gnome-keyring-daemon --start --components=gpg,pkcs11,secrets,ssh)
export SSH_AUTH_SOCK
export GPG_AGENT_INFO
export GNOME_KEYRING_CONTROL
export GNOME_KEYRING_PID

# Start WM based on SESSION variable
if [[ $1 == "openbox" || $1 == "bspwm" ]]; then
    SESSION=$1

    if [ "$SESSION" = "openbox" ]; then
        exec openbox-session
    elif [ "$SESSION" = "bspwm" ]; then 
        exec bspwm
    fi
    
else

    # Start Openbox
    export XDG_CURRENT_DESKTOP=openbox
    exec openbox-session

    # Start BSPWM
    # exec bspwm


    # echo "Invalid session specified!"
fi
