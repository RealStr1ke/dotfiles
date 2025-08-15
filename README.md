# [RealStr1ke](https://github.com/RealStr1ke)'s dotfiles

![I use Catppuccin btw](assets/images/catppuccin.svg)

## Welcome `~`

**Hi! Welcome to my mildly amusing dotfiles collection!** I guess I kinda ~~wasted~~ spent a lot of time on these, but here they are in all their glory. This repository contains my meticulously crafted (and slightly over-engineered) development environment focused on Hyprland/Wayland with extensive customizations, automation tools, and a TypeScript-based management system. Have fun and rob what you want lol.

## ⚡ TL;DR

Hyprland + AGS + Fish + Kitty + Neovim + Catppuccin Mocha (Mauve). Managed by a Bun/TypeScript tool exposed as `dots` (Fish alias). Install with one-liner below, dry-run before nuking stuff, star if you vibe.

<details>
<summary><strong>📑 Table of Contents</strong></summary>

- [🌟 Features](#-features)
  - [Major Configurations](#major-configurations)
  - [Custom Tooling & Scripts](#custom-tooling--scripts)
  - [Theming](#theming)
- [🚀 Quick Installation](#-quick-installation)
  - [Installation Options](#installation-options)
- [🛠️ Management System](#️-management-system)
  - [Core Commands](#core-commands)
- [🖼️ Showcase](#️-showcase)
- [⚙️ System Requirements](#️-system-requirements)
  - [Essential Packages](#essential-packages)
- [🐋 Docker Development](#-docker-development)
- [⚠️ Important Notes](#️-important-notes)
- [🔮 Roadmap](#-roadmap)
  - [Current Priorities](#current-priorities)

</details>


## 🌟 Features

### **Major Configurations**
- **Hyprland** - Modern Wayland compositor with advanced window management
- **AGS (Aylur's GTK Shell)** - Dynamic widgets and system bars
- **Fish Shell** - Modern shell with intelligent autocompletions and custom functions
- **Kitty** - GPU-accelerated terminal emulator
- **Neovim** - Highly configured text editor
- **And more** - Rofi, Dunst, Starship, and dozens of other applications

### **Custom Tooling & Scripts**
- **TypeScript-based management system** - Sophisticated dotfiles management via `dots` command
- **25+ Custom utility scripts** - Organized collection of system utilities and fun tools
- **Wallpaper Collection** - Curated collection available at [RealStr1ke/Wallpapers](https://github.com/RealStr1ke/Wallpapers)

### **Theming**
- **[Catppuccin](https://github.com/catppuccin/catppuccin) Mocha Mauve** - Consistent theming applied everywhere

## 🚀 Quick Installation
**Main "interactive" install** (when it decides to work lmao):
```bash
curl -fsSL "https://str1ke.codes/install" | bash
```

**One-liner headless installation** (automatically installs Bun and dependencies):
```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/install.sh)"
```

### Installation Options
```bash
# Interactive mode (guided setup)
./install.sh --interactive

# Headless mode (automated)
./install.sh --headless

# Force mode (overwrite existing configs)
./install.sh --force

# Dry run (see what would be changed)
./install.sh --dry-run
```

## 🛠️ Management System

This dotfiles collection features a **TypeScript-based management system** accessible via the `dots` command (works via Fish alias, so it won't work elsewhere... yet):

### Core Commands
```bash
# Install/update all dotfiles
dots install [options]

# Check symlink status  
dots status

# Update configurations
dots update

# Backup current configs
dots backup
```

The system handles symlink management, conflict resolution, and automated backups through TOML-based configuration.

## 🖼️ Showcase

<div align="center">
  <h3>HackClub Riceathon Winter 2024 Showcase</h3>
  <img src="assets/showcase/hackclub-riceathon-showcase-winter-2024.png" alt="Riceathon Showcase" width="800"/>
  
  [▶️ Watch the Showcase Video](https://cloud-6ji362ttf-hack-club-bot.vercel.app/0realstr1ke-riceathon-submission.mp4)
</div>

<div align="center">
  <h3>Hyprland Rice Competition Winter 2022 Showcase [Legacy]</h3>
  <img src="assets/showcase/hyprland-rice-competition-winter-2022.png" alt="Legacy Showcase" width="800"/>
  
  [▶️ Watch the Legacy Video](https://cloud-92tb4q7ml-hack-club-bot.vercel.app/0hyprland-rice-competition-submission-winter-2022.mp4)
</div>

## ⚙️ System Requirements

- **Operating System**: Linux (Arch-based distributions recommended)
- **Display Server**: Wayland (primary) or X11 (legacy support)
- **Runtime**: Bun (automatically installed by setup script)
- **Shell**: Fish (preferred) or Bash/Zsh (secondary)

## 🐋 Docker Development

For testing and development, a Docker environment is available. See [`core/docker/README.md`](core/docker/README.md) for setup instructions.

---

## ⚠️ Important Notes

- **Backup First**: Seriously, copy your existing `~/.config` and dotfiles before running anything.
- **Linux Only**: These configs target Linux (Wayland-first). macOS/Windows not supported.
- **Fish Alias Only**: The `dots` command is a Fish alias (`alias dots="bun run ~/.dotfiles/core/main.ts"`). It won't exist in Bash/Zsh until you add your own alias.
- **Dry Run Available**: Use `./install.sh --dry-run` or `dots install --dry-run` to preview symlinks/changes.
- **Force Overwrites**: `--force` will replace existing files/symlinks. Use with caution.
- **Active Development**: Things change, break, get rewritten at 3AM. Pin a commit if you need stability.
- **Personal Taste**: These are tuned to my workflow + Catppuccin Mocha Mauve aesthetic. Adjust to taste.
- **Use At Your Own Risk**: No warranty. If it eats your rice, you keep both halves.

## 🔮 Roadmap

### Current Priorities
- Rebuild AGS config from scratch using Astal
- Enhance TypeScript tooling with more automation
- Investigate Pyprland integration
- Make `dots` command work outside Fish shell

---

**Made with ❤️ and way too many all-nighters lmao** 🌙☕

*Feel free to explore, fork, and adapt these configurations to your needs. If you find something useful, a star ⭐ would be appreciated!*
