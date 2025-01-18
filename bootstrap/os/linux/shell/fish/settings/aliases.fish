
# ----------------------------
# |     Safety Features      |
# ----------------------------

# Safety Features (Confirm before overwriting)
alias rm='rm -I'     # 'rm -i' prompts for every file
alias cp='cp -i'
alias mv='mv -i'
alias ln='ln -i'

# More Safety Features
alias chown='chown --preserve-root'
alias chmod='chmod --preserve-root'
alias chgrp='chgrp --preserve-root'


# ----------------------------
# |        Languages         |
# ----------------------------

# Python
alias 2to="2to3"
alias idle="idle3"
alias pip="pip3"
alias pydoc="pydoc3"
alias python="python3"
alias python-config="python3-config"
alias wheel="wheel3"
alias py="python3"

# Java
# alias javasel="sudo update-alternatives --config java"
# archlinux-java 

# ----------------------------
# |       Applications       |
# ----------------------------

# Homebrew
# alias brewu='brew update && brew upgrade && brew cleanup && brew doctor'
# alias bi='brew install'

# Yarn
# alias yi='yarn install'

# nano
# alias sano="sudo nano"

# kitty
alias icat="kitty +kitten icat --align left"

# npm
alias ni="npm install"
alias nu="npm uninstall"
alias nup="npm update"
alias nri="rm -r node_modules package-lock.json && npm install"
alias ncd="npm-check -su"

# Nodejs
# alias noderi="node index.js"

# Microsoft VS Code
# If VS Code Insiders is installed and the default VS Code isn't,
# set `code` as an alias of `code-insiders`
# if ! is-executable code && is-executable code-insiders; then
#     alias code="code-insiders"
# fi

# aocs
alias aocs="cd ~/Projects/GitHub/AoC && bun ./bin/run.js"

# bat
# alias bat="\bat --theme=GitHub"

# Hyprland
alias hyprexec="hyprctl dispatch exec"

# cat
alias cat="cat -s"

# gping
alias gping="gping -c magenta"

# pfetch
# alias pfetch='PF_INFO="ascii os host de uptime pkgs memory" pfetch'

# APT (Advanced Packaging Tool)
alias apti="sudo apt-get install"
alias aptr="sudo apt-get remove"
alias apts="sudo apt-cache search"
alias aptu="sudo apt-get update && sudo apt-get upgrade"

# Pacman (Arch Linux Package Manager)
alias paci="sudo pacman -S"
# alias pacr="sudo pacman -R"
# alias pacs="pacman -Ss"
alias pacu="sudo pacman -Syu"

# Pacman/Paru (From @orange in AUR)
alias pacs='pacman --color always -Sl | sed -e "s: :/:; /installed/d" | cut -f 1 -d " " | fzf --multi --ansi --preview "pacman -Si {1}" | xargs -ro sudo pacman -S'
alias pars='paru --color always -Sl | sed -e "s: :/:; s/ unknown-version//; /installed/d" | fzf --multi --ansi --preview "paru -Si {1}" | xargs -ro paru -S'
alias pacr="pacman --color always -Q | cut -f 1 -d ' ' | fzf --multi --ansi --preview 'pacman -Qi {1}' | xargs -ro sudo pacman -Rns"

# Paru (AUR Helper)
# alias paru="paru --needed --noconfirm"
alias pari="paru --needed --noconfirm -S"
alias parr="paru --noconfirm -R"
alias parus="paru -Ss"
alias paruu="paru --needed --noconfirm -Syu"


# Docker
# alias docker="sudo docker"


# ----------------------------
# |        Date/Time         |
# ----------------------------

# Date
alias date_iso_8601='date "+%Y%m%dT%H%M%S"'
alias date_clean='date "+%Y-%m-%d"'
alias date_year='date "+%Y"'
alias date_month='date "+%m"'
alias date_week='date "+%V"'
alias date_day='date "+%d"'
alias date_hour='date "+%H"'
alias date_minute='date "+%M"'
alias date_second='date "+%S"'
alias date_time='date "+%H:%M:%S"'

# Stopwatch
alias timer='echo "Timer started. Stop with Ctrl-D." && date && time cat && date'


# ----------------------------
# |  File/Folder Management  |
# ----------------------------

# Directory Traversal
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias ......="cd ../../../../.."
alias .......="cd ../../../../../.."
# alias ~="cd ~" # `cd` is probably faster to type though
# alias -- -="cd -"

# Directory Listing
# Use exa if installed, ls otherwise
if type eza > /dev/null 2>&1
    alias ls "eza --icons --group-directories-first"
else
    alias ls "ls --color=auto"
end

alias l="ls -F"
alias lf="ls -F"
alias la="ls -A"
alias ll="ls -alF"
alias ld="ls -ld */"

# Directory shortcuts
# alias desktop="cd ~/Desktop"
# alias dotfiles="cd ~/.dotfiles"
# alias projects="cd ~/Projects"
# alias drives="cd /media/$USER/"
# alias documents="cd ~/Documents"
# alias downloads="cd ~/Downloads"

# File shortcuts
alias hosts="sudo nvim /etc/hosts"
alias notes="nvim ~/notes.md"

# VS Code Dotfile shortcut
# if ! is-executable code && is-executable code-insiders; then
#     alias df-vscode="code-insiders ~/.dotfiles"
# else
#     alias df-vscode="code ~/.dotfiles"
# fi

# Dotfile shortcuts
# alias dots-alias="nano ~/.dotfiles/shell/global/.aliases"
alias dots-funcs="nano ~/.dotfiles/shell/global/.functions"
# alias dots-path="nano ~/.dotfiles/shell/global/.path"
# alias dots-env="nano ~/.dotfiles/shell/global/.env"

# Grep Coloring
alias rgrep="rg --color=auto"
alias grep="rgrep --color=auto"
alias egrep="egrep --color=auto"
alias fgrep="fgrep --color=auto"

# Empty trash
alias empty-trash="rm -rf ~/.local/share/Trash/files/*"

# Zippin
alias gz='tar -zcvf'

# Open dotfiles directory
alias dfs="cd $DOTFILES"

# Recursively remove given folder
alias rr="rm -r -i" # Added -i since I accidentally deleted my ~ directory once :skull:

# Recursively copy given folder into new directory
alias cpr="cp -r -i"

# Turn given file into executable (chmod alias)
alias chmox='chmod +x'

# Recursively remove ._ files (from macOS)
alias cleanupmos="find . -type f -name '._*' -ls -delete"

# Recursively remove .DS_Store files
alias cleanupds="find . -type f -name '*.DS_Store' -ls -delete"

# Recursively remove .spotdl-cache files
alias cleanupspdl='find . -type f -name '\''.spotdl-cache'\'' -ls -delete'


# ----------------------------
# |        Networking        |
# ----------------------------
alias pubip="curl 'https://api.ipify.org?format=json' | jq .ip"
alias localip="ipconfig getifaddr en0"
alias ips="ifconfig -a | grep -o 'inet6\? \(addr:\)\?\s\?\(\(\([0-9]\+\.\)\{3\}[0-9]\+\)\|[a-fA-F0-9:]\+\)' | awk '{ sub(/inet6? (addr:)? ?/, \"\"); print }'"

# API Requests
# One of @janmoesen's ProTip™s
# for method in GET HEAD POST PUT DELETE TRACE OPTIONS
#     alias $method "lwp-request -m $method"
# end

# Weather
alias weather="curl wttr.in"
# alias wttr="curl wttr.in"


# ----------------------------
# |          Typos           |
# ----------------------------
alias breq="brew"
alias pary="paru"
alias sl="ls" # fuck that locomotive :troll:


# ----------------------------
# |  Hardware/Software Info  |
# ----------------------------

# Pass options to free
alias meminfo="free -m -l -t"

# Get top process eating memory
alias psmem="ps -o time,ppid,pid,nice,pcpu,pmem,user,comm -A | sort -n -k 6"
alias psmem5="psmem | tail -5"
alias psmem10="psmem | tail -10"

# Get top process eating cpu
alias pscpu="ps -o time,ppid,pid,nice,pcpu,pmem,user,comm -A | sort -n -k 5"
alias pscpu5="pscpu5 | tail -5"
alias pscpu10="pscpu | tail -10"

# Shows the corresponding process to ...
alias psx="ps auxwf | grep "

# Shows the process structure to clearly
alias pst="pstree -Alpha"

# Shows all your processes
alias psmy="ps -ef | grep $USER"

# The load-avg
alias loadavg="cat /proc/loadavg"

# Show all partitions
alias partitions="cat /proc/partitions"

# Shows the disk usage of a directory legibly
alias du='du -kh'

# Show the biggest files in a folder first
alias du_overview='du -h | grep "^[0-9,]*[MG]" | sort -hr | less'

# Shows the complete disk usage to legibly
alias df='df -kTh'


# # ----------------------------
# # |           Fun            |
# # ----------------------------
alias starwars="telnet towel.blinkenlights.nl"


# ----------------------------
# |      Miscellaneous       |
# ----------------------------
# Alias for `exit` command
alias quit="exit"

# Alias for `neofetch` command
alias nf="neofetch"

# Clear
alias clr="clear"
# Clear and list directories
alias cls="clear;ls"
# Clear shell and list directories (full)
alias cla="clear;la"
# Clear shell and show tasks (taskbook)
alias ctb="clear;tb"
# Clear shell and return to home directory
alias clh="cd;clear"

# Reset shell
alias rst="reset;pfetch"
alias rsh="reset;cd;pfetch"

# Decimal 2 Hexadecimal
# alias dec2hex="od -v -t x1"
alias dec2hex='printf "%x\n" $1'

# Just a regular speedtest
alias speedtest="wget -O /dev/null http://speed.transip.nl/100mb.bin"

# Reload the shell (i.e. invoke as a login shell)
alias reload="exec $SHELL -l"

# Print each PATH entry on a separate line
# alias path="$PATH" | tr ':' '\n'
# alias path='echo -e ${PATH//:/\\n}'

# Removes duplicate PATH entries
# alias dpath="printf %s "$PATH" | awk -v RS=: -v ORS=: '!arr[$0]++'"

# Kill all the tabs in Chrome to free up memory
# [C] explained: http://www.commandlinefu.com/commands/view/402/exclude-grep-from-your-grepped-output-of-ps-alias-included-in-description
alias chromekill="ps ux | grep '[C]hrome Helper --type=renderer' | grep -v extension-process | tr -s ' ' | cut -d ' ' -f2 | xargs kill"

# Lock the screen (when going AFK)
# alias afk="i3lock -c 000000"
# alias afk="gnome-screensaver-command -l"
# alias afk="xdg-screensaver lock"

# Open hosts file with nano
# alias hosts='sudo nano /etc/hosts'

# Copy working directory
alias cwd='pwd | tr -d "\r\n" | xclip -selection clipboard'

# Enable aliases to be sudo-ed
alias sudo='sudo '

# Merge PDF files, preserving hyperlinks
# Usage: `mergepdf input{1,2,3}.pdf`
alias mergepdf='gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=_merged.pdf'
