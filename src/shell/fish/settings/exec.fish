if status is-interactive
    # Commands to run in interactive sessions can go here
    echo ""
    PF_INFO="ascii os host de uptime pkgs memory" pfetch
end

set fish_greeting "'Documentation? We don't do that here.' - @Eoghanmc22"