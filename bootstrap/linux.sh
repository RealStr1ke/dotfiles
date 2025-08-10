#!/usr/bin/env bash

set -euo pipefail  # Exit on error, undefined vars, and pipe failures

if [ -z "${BASH_VERSION:-}" ]; then
    echo "Error: Bash is required to interpret this script." >&2
    exit 1
fi

# Variables
SOURCE="https://github.com/RealStr1ke/dotfiles"
TARGET="$HOME/.dotfiles"
BACKUP_DIR="$TARGET/backup/linux"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Functions
function is-executable() {
    type "$1" > /dev/null 2>&1
}

function is::gitpod() {
    # Check for existence of this gitpod-specific file and the ENV var.
    # Courtesy to axonasif @ github
    test -e /ide/bin/gitpod-code && test -v GITPOD_REPO_ROOT
}

function log() {
    echo "$(date '+%H:%M:%S') $*"
}

function backup_item() {
    local source_path="$1"
    local backup_subdir="$2"
    local item_name="$3"
    
    local backup_path="$BACKUP_DIR/$backup_subdir"
    mkdir -p "$backup_path"
    
    # Create timestamped backup
    local backup_name="${item_name}_${TIMESTAMP}"
    cp -r "$source_path" "$backup_path/$backup_name"
    log "Backed up $source_path to $backup_path/$backup_name"
}

function safe_remove() {
    local path="$1"
    if [ -L "$path" ]; then
        log "Removing existing symlink: $path"
        rm "$path"
    elif [ -f "$path" ]; then
        log "Removing existing file: $path"
        rm "$path"
    elif [ -d "$path" ]; then
        log "Removing existing directory: $path"
        rm -rf "$path"
    fi
}

function create_symlink() {
    local source="$1"
    local target="$2"
    
    if [ ! -e "$source" ]; then
        log "Warning: Source $source does not exist, skipping symlink"
        return 1
    fi
    
    # Ensure target directory exists
    mkdir -p "$(dirname "$target")"
    
    # Remove existing target if it exists
    safe_remove "$target"
    
    # Create the symlink
    ln -sf "$source" "$target"
    log "Created symlink: $target -> $source"
}


# ==========================
# | Installation procedure |
# ==========================

# Parse arguments
headless=false
if [ "${1:-}" == "headless" ]; then
    headless=true
elif is::gitpod; then
    headless=true
fi

# Check dependencies
if ! is-executable "git"; then
    echo "Error: Git is required to install the dotfiles." >&2
    exit 1
fi

if ! is-executable "gum" && [ "$headless" != true ]; then
    echo "Error: Gum is required for interactive installation." >&2
    echo "Install gum or run with 'headless' argument." >&2
    exit 1
fi

# Setup dotfiles directory
if [ ! -d "$TARGET" ]; then
    log "Cloning dotfiles repository..."
    git clone "$SOURCE" "$TARGET"
else
    log "Dotfiles directory already exists, updating..."
    cd "$TARGET"
    git pull origin main 2>/dev/null || log "Warning: Could not update repository"
fi

cd "$TARGET"

log "Starting dotfiles installation..."

# ============> Symlinking

log "Setting up runcom files..."
# Runcom files
if [ -d "$TARGET/bootstrap/os/linux/runcom" ]; then
    while IFS= read -r -d '' runcom_file; do
        filename=$(basename "$runcom_file")
        target_path="$HOME/$filename"
        
        # Skip if not a regular file
        [ ! -f "$runcom_file" ] && continue
        
        # Handle backup
        if [ -e "$target_path" ] && [ ! -L "$target_path" ]; then
            if [ "$headless" = true ]; then
                backup_item "$target_path" "runcom" "$filename"
            else
                if gum confirm "Runcom: Backup existing $filename?"; then
                    backup_item "$target_path" "runcom" "$filename"
                fi
            fi
        fi
        
        create_symlink "$runcom_file" "$target_path"
    done < <(find "$TARGET/bootstrap/os/linux/runcom" -maxdepth 1 -type f -name ".*" -print0)
fi

log "Setting up config directories..."
# Config directories (only top-level directories)
if [ -d "$TARGET/bootstrap/os/linux/config" ]; then
    while IFS= read -r -d '' config_dir; do
        dirname=$(basename "$config_dir")
        target_path="$HOME/.config/$dirname"
        
        # Skip if not a directory
        [ ! -d "$config_dir" ] && continue
        
        # Handle backup
        if [ -d "$target_path" ] && [ ! -L "$target_path" ]; then
            if [ "$headless" = true ]; then
                backup_item "$target_path" "config" "$dirname"
            else
                if gum confirm "Config: Backup existing $dirname directory?"; then
                    backup_item "$target_path" "config" "$dirname"
                fi
            fi
        fi
        
        create_symlink "$config_dir" "$target_path"
    done < <(find "$TARGET/bootstrap/os/linux/config" -maxdepth 1 -type d ! -path "$TARGET/bootstrap/os/linux/config" -print0)
fi

log "Setting up config files..."
# Config files (dotfiles in config directory that should go to ~/.config/)
if [ -d "$TARGET/bootstrap/os/linux/config" ]; then
    while IFS= read -r -d '' config_file; do
        filename=$(basename "$config_file")
        target_path="$HOME/.config/$filename"
        
        # Skip if not a regular file
        [ ! -f "$config_file" ] && continue
        
        # Handle backup
        if [ -e "$target_path" ] && [ ! -L "$target_path" ]; then
            if [ "$headless" = true ]; then
                backup_item "$target_path" "config" "$filename"
            else
                if gum confirm "Config: Backup existing $filename file?"; then
                    backup_item "$target_path" "config" "$filename"
                fi
            fi
        fi
        
        create_symlink "$config_file" "$target_path"
    done < <(find "$TARGET/bootstrap/os/linux/config" -maxdepth 1 -type f -name ".*" -print0)
fi


# ============> Extras
if [ "$headless" != true ]; then
    # Prompt user if they want to install the wallpapers (via the submodule)
    if gum confirm "Extras: Install wallpapers submodule?"; then
        log "Updating wallpapers submodule..."
        if git submodule update --init --recursive bootstrap/os/common/wallpapers; then
            log "Wallpapers submodule updated successfully!"
        else
            log "Warning: Failed to update wallpapers submodule"
        fi
    fi
fi

# Installation complete!
log "Installation complete!"
echo "→ https://github.com/RealStr1ke/dotfiles"
echo "→ Thank you for using RealStr1ke's dotfiles!"
if [ -n "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
    echo "→ Backups saved in: $BACKUP_DIR"
fi
echo "→ Please restart your terminal/session to see the changes."
echo "→ Enjoy!"
echo "=====================================>"
