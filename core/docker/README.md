# Dotfiles Docker Testing Environment

This directory contains a comprehensive Docker-based testing environment for validating dotfiles installation across multiple Linux distributions. The setup includes both automated testing and interactive development containers.

## Features

- **Multi-Distribution Support**: Test on Arch Linux and Ubuntu 22.04
- **Local & Remote Testing**: Test both local repository and GitHub installation
- **Interactive Development**: Full containers with your dotfiles pre-installed
- **No Volume Mounts**: Files are copied for true isolation and portability
- **Convenient Aliases**: Pre-configured shortcuts for dotfiles management

## Quick Start

### 1. Build Containers
```bash
# Build all containers
./test.sh build

# Build specific distribution
./test.sh build arch
./test.sh build ubuntu
```

### 2. Run Tests
```bash
# Test local installation on Arch Linux
./test.sh test arch local

# Test remote installation on Ubuntu
./test.sh test ubuntu remote

# Interactive shell with dotfiles
./test.sh shell arch local
```

### 3. Development Containers
```bash
# Open development environment with your dotfiles
./test.sh dev arch
./test.sh dev ubuntu
```

## Container Types

### Testing Containers
- **`arch-local`**: Arch Linux with copied dotfiles repository
- **`arch-remote`**: Arch Linux for testing GitHub clone installation
- **`ubuntu-local`**: Ubuntu 22.04 with copied dotfiles repository  
- **`ubuntu-remote`**: Ubuntu 22.04 for testing GitHub clone installation

### Development Containers
- **`arch-dev`**: Interactive Arch development environment
- **`ubuntu-dev`**: Interactive Ubuntu development environment

## Available Commands

### Test Management Script (`./test.sh`)

| Command | Description | Example |
|---------|-------------|---------|
| `build [distro]` | Build containers | `./test.sh build arch` |
| `test [distro] [mode]` | Run tests | `./test.sh test arch local` |
| `shell [distro] [mode]` | Interactive shell | `./test.sh shell ubuntu remote` |
| `dev [distro]` | Development container | `./test.sh dev arch` |
| `clean` | Remove all containers | `./test.sh clean` |
| `rebuild [distro]` | Clean and rebuild | `./test.sh rebuild ubuntu` |
| `logs [container]` | Show container logs | `./test.sh logs arch-local` |

### Inside Containers

Each container comes with convenient aliases:

| Alias | Command | Description |
|-------|---------|-------------|
| `dots-install` | `cd ~/.dotfiles/core && bun run src/utils/cli.ts install` | Install dotfiles |
| `dots-status` | `cd ~/.dotfiles/core && bun run src/utils/cli.ts status` | Check status |
| `dots-uninstall` | `cd ~/.dotfiles/core && bun run src/utils/cli.ts uninstall` | Uninstall dotfiles |
| `dots-update` | `cd ~/.dotfiles/core && bun run src/utils/cli.ts update` | Update dotfiles |
| `dots-core` | `cd ~/.dotfiles/core` | Go to core directory |

For remote containers, an additional script is available:
- `./install-remote-dotfiles.sh` - Clone and install from GitHub

## Usage Examples

### Basic Testing

```bash
# Test local installation on Arch Linux
./test.sh test arch local

# Test remote GitHub installation on Ubuntu
./test.sh test ubuntu remote
```

### Interactive Development

```bash
# Open Arch development container
./test.sh dev arch

# Inside the container, your dotfiles are at ~/.dotfiles
# Install them with:
dots-install

# Check status:
dots-status

# Uninstall:
dots-uninstall
```

### Manual Container Management

```bash
# Build specific containers
./test.sh build arch

# Open interactive shell
./test.sh shell arch local

# Inside container - install dotfiles with force flag
dots-install --force

# Check what would be installed (dry run)
dots-install --dry-run
```

### Remote Installation Testing

```bash
# Start remote testing container
./test.sh shell ubuntu remote

# Inside container - install from GitHub
./install-remote-dotfiles.sh

# Or manually clone and install
git clone https://github.com/RealStr1ke/dotfiles.git ~/.dotfiles
cd ~/.dotfiles/core
bun install
bun run src/utils/cli.ts install
```

## Container Environment

### Pre-installed Software
- **Arch Linux**: pacman, base-devel, git, curl, fish, starship, neovim, bun
- **Ubuntu 22.04**: apt, build-essential, git, curl, fish, starship, neovim, bun

### User Setup
- User: `testuser` (with sudo privileges)
- Home: `/home/testuser`
- Shell: `/usr/bin/fish` (default) with Starship prompt
- Dotfiles location: `~/.dotfiles`

### File Structure
```
/home/testuser/
├── .dotfiles/           # Your dotfiles repository (copied, not mounted)
├── .config/fish/        # Fish shell configuration with aliases and Starship
├── .bashrc              # Bash compatibility with same aliases and Starship
├── test-runner.sh       # Automated test script
├── test-scenarios.sh    # Test scenarios
└── install-remote-dotfiles.sh  # Remote installation script (remote containers only)
```

## Architecture

### No Volume Mounts
Unlike typical Docker development setups, this environment **copies** your dotfiles repository into the containers rather than mounting it as a volume. This provides:

- **True Isolation**: Each container has its own copy of the files
- **Portability**: Containers can run anywhere without host dependencies
- **Realistic Testing**: Simulates actual deployment scenarios
- **Performance**: No file system overhead from volume mounts

### Multi-Stage Testing
1. **Local Mode**: Tests with copied repository (development workflow)
2. **Remote Mode**: Tests GitHub clone installation (user workflow)

## Cleanup

```bash
# Remove all containers and images
./test.sh clean

# Rebuild everything from scratch
./test.sh rebuild
```

## Troubleshooting

### Build Issues
```bash
# Clean and rebuild
./test.sh clean
./test.sh build

# Check logs
./test.sh logs arch-local
```

### Runtime Issues
```bash
# Check container status
docker-compose ps

# View logs
./test.sh logs ubuntu-remote

# Open debug shell
./test.sh shell arch local
```

### Bun Installation Issues
If Bun installation fails, the containers will fall back to using Node.js/npm for package management.

## Contributing

When modifying the Docker setup:

1. Test changes on both distributions
2. Verify both local and remote modes work
3. Update documentation if adding new features
4. Run cleanup between tests to ensure isolation

---

**Note**: This testing environment is designed for development and CI/CD purposes. The containers include development tools and are not optimized for production deployment.
