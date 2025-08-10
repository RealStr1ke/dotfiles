
# Main editor
set -gx EDITOR "nvim"

# pfetch config
set -gx PF_INFO "ascii os host de uptime pkgs memory"

# Dotfiles Directory
set -gx DOTFILES "$HOME/.dotfiles"

# Enable persistent REPL history for `node`.
set -gx NODE_REPL_HISTORY "$HOME/.node_history"

# Allow 32³ entries; the default is 1000.
set -gx NODE_REPL_HISTORY_SIZE "32768"

# Use sloppy mode by default, matching web browsers.
set -gx NODE_REPL_MODE "sloppy"

# Make Python use UTF-8 encoding for output to stdin, stdout, and stderr.
set -gx PYTHONIOENCODING "UTF-8"

# Sets history file location
set -gx HISTFILE "$HOME/.history"

# Increase Bash history size. Allow 32³ entries; the default is 500.
set -gx HISTSIZE "32768"
set -gx HISTFILESIZE "$HISTSIZE"
set -gx SAVEHIST "4096"

# Omit duplicates and commands that begin with a space from history.
set -gx HISTCONTROL "ignoreboth"

# Prefer US English and use UTF-8.
set -gx LANG "en_US.UTF-8" 2>/dev/null
set -gx LC_ALL "en_US.UTF-8" 2>/dev/null

# Highlight section titles in manual pages.
set -gx LESS_TERMCAP_md "$yellow"

# Don’t clear the screen after quitting a manual page.
set -gx MANPAGER "bat -"

# Avoid issues with `gpg` as installed via Homebrew.
# https://stackoverflow.com/a/42265848/96656
set -gx GPG_TTY (tty)

# Hide the “default interactive shell is now zsh” warning on macOS.
set -gx BASH_SILENCE_DEPRECATION_WARNING 1

# Enable colors
set -gx CLICOLOR 1

# Config Directories
set -gx XDG_CONFIG_HOME "$HOME/.config"

# Set's the Homebrew temp directory for installations
if is-executable "brew"
    set -gx HOMEBREW_TEMP (brew --prefix)/var/tmp
    # set -gx LIBRARY_PATH (brew --prefix)/lib:$LIBRARY_PATH
    # set -gx LDFLAGS "${LDFLAGS} -L$(brew --prefix)/lib"
    # set -gx CPPFLAGS "${CPPFLAGS} -I$(brew --prefix)/include"
end
