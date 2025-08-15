#!/bin/bash
# Docker test management script for dotfiles

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_help() {
    echo -e "${CYAN}Dotfiles Docker Test Management${NC}"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo "  build [distro]           Build containers (arch, ubuntu, or all)"
    echo "  test [distro] [mode]     Run tests (distro: arch|ubuntu, mode: local|remote)"
    echo "  shell [distro] [mode]    Open interactive shell"
    echo "  dev [distro]             Open development container with dotfiles"
    echo "  clean                    Remove all containers and images"
    echo "  rebuild [distro]         Clean and rebuild containers"
    echo "  logs [container]         Show container logs"
    echo "  help                     Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 build arch                 # Build Arch Linux containers"
    echo "  $0 test arch local            # Test local installation on Arch"
    echo "  $0 test ubuntu remote         # Test remote installation on Ubuntu"
    echo "  $0 shell arch local           # Interactive shell with local dotfiles"
    echo "  $0 dev arch                   # Development container with dotfiles"
    echo "  $0 clean                      # Clean up everything"
    echo ""
    echo -e "${YELLOW}Available distributions:${NC} arch, ubuntu"
    echo -e "${YELLOW}Available modes:${NC} local (copied dotfiles), remote (clone from GitHub)"
}

build_containers() {
    local distro=$1
    
    case $distro in
        arch)
            echo -e "${BLUE}Building Arch Linux containers...${NC}"
            docker-compose build arch-local arch-remote
            ;;
        ubuntu)
            echo -e "${BLUE}Building Ubuntu containers...${NC}"
            docker-compose build ubuntu-local ubuntu-remote
            ;;
        all|"")
            echo -e "${BLUE}Building all containers...${NC}"
            docker-compose build
            ;;
        *)
            echo -e "${RED}Unknown distro: $distro${NC}"
            echo "Available: arch, ubuntu, all"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}Build completed!${NC}"
}

run_test() {
    local distro=$1
    local mode=$2
    
    if [[ -z "$distro" ]]; then
        echo -e "${RED}Error: Distribution required${NC}"
        echo "Usage: $0 test <distro> [mode]"
        exit 1
    fi
    
    if [[ -z "$mode" ]]; then
        mode="local"
    fi
    
    local container="${distro}-${mode}"
    
    echo -e "${BLUE}Running dotfiles test on ${distro} (${mode} mode)...${NC}"
    docker-compose run --rm "$container" /home/testuser/test-runner.sh
}

open_shell() {
    local distro=$1
    local mode=$2
    
    if [[ -z "$distro" ]]; then
        echo -e "${RED}Error: Distribution required${NC}"
        echo "Usage: $0 shell <distro> [mode]"
        exit 1
    fi
    
    if [[ -z "$mode" ]]; then
        mode="local"
    fi
    
    local container="${distro}-${mode}"
    
    echo -e "${BLUE}Opening interactive shell for ${distro} (${mode} mode)...${NC}"
    echo -e "${YELLOW}Type 'exit' to return to host shell${NC}"
    docker-compose run --rm "$container" /usr/bin/fish
}

open_dev() {
    local distro=$1
    
    if [[ -z "$distro" ]]; then
        echo -e "${RED}Error: Distribution required${NC}"
        echo "Usage: $0 dev <distro>"
        exit 1
    fi
    
    local container="${distro}-dev"
    
    echo -e "${BLUE}Opening development container for ${distro}...${NC}"
    echo -e "${YELLOW}Your dotfiles are available at ~/.dotfiles${NC}"
    echo -e "${YELLOW}Type 'exit' to return to host shell${NC}"
    docker-compose --profile dev run --rm "$container" /usr/bin/fish
}

clean_up() {
    echo -e "${YELLOW}Cleaning up containers and images...${NC}"
    
    # Stop and remove containers
    docker-compose down --remove-orphans
    docker-compose --profile dev down --remove-orphans
    
    # Remove images
    docker images | grep dotfiles-test | awk '{print $3}' | xargs -r docker rmi -f
    
    echo -e "${GREEN}Cleanup completed!${NC}"
}

rebuild_containers() {
    local distro=$1
    
    echo -e "${YELLOW}Rebuilding containers...${NC}"
    
    if [[ -n "$distro" ]]; then
        # Clean specific distro
        docker-compose rm -f "${distro}-local" "${distro}-remote" 2>/dev/null || true
        docker images | grep "dotfiles.*${distro}" | awk '{print $3}' | xargs -r docker rmi -f
        build_containers "$distro"
    else
        # Clean all
        clean_up
        build_containers "all"
    fi
}

show_logs() {
    local container=$1
    
    if [[ -z "$container" ]]; then
        echo -e "${RED}Error: Container name required${NC}"
        echo "Usage: $0 logs <container>"
        echo "Available containers:"
        docker-compose ps --format table
        exit 1
    fi
    
    docker-compose logs "$container"
}

# Main command handling
case $1 in
    build)
        build_containers "$2"
        ;;
    test)
        run_test "$2" "$3"
        ;;
    shell)
        open_shell "$2" "$3"
        ;;
    dev)
        open_dev "$2"
        ;;
    clean)
        clean_up
        ;;
    rebuild)
        rebuild_containers "$2"
        ;;
    logs)
        show_logs "$2"
        ;;
    help|"")
        print_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
