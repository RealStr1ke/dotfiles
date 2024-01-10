# rbenv
if is-executable rbenv
    rbenv init - | source
end

# Homebrew
if is-executable brew
    brew shellenv | source
end

# bun
# If the ~/.bun directory exists, then source the bun env
if test -d "$HOME/.bun"
    set --export BUN_INSTALL "$HOME/.bun"
    set --export PATH $BUN_INSTALL/bin $PATH
end

# TheFuck
# MOVED to an autoloaded function at fish/functions/thefuck.fish
# if is-executable thefuck
#     # thefuck --alias | source
#     # thefuck --alias fix | source
# end

# Spotify TUI
if is-executable spt
    spt --completions fish | source
end

# Atuin
if is-executable atuin
    atuin init fish | source
end

# FNM
# if is-executable fnm
# 	fnm env 2> /dev/null
# end

# pyenv
# if is-executable pyenv
# 	eval "$(pyenv init -)" &>/dev/null
# end

# find-the-command
# if [ (cat /etc/os-release | grep -i arch ) ]
# 	# If shell is Bash, then source bash script
# 	if [[ "$SHELL" == "/usr/bin/fish" ]]
# 		source /usr/share/doc/find-the-command/ftc.fish quiet su noupdate noprompt
# 	end
# end
