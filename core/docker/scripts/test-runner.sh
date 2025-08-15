#!/bin/bash
# Main test runner for dotfiles testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}🧪 Dotfiles Testing Suite - ${DISTRO^} (${TEST_MODE} mode)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_step() {
    echo -e "${YELLOW}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running in local or remote mode
check_test_mode() {
    print_step "Checking test mode configuration..."
    
    if [[ "$TEST_MODE" == "local" ]]; then
        print_info "Local testing mode - using mounted .dotfiles directory"
        if [[ ! -d "/home/testuser/.dotfiles" ]]; then
            print_error "Local .dotfiles directory not found! Make sure volume is mounted correctly."
            exit 1
        fi
        print_success "Local .dotfiles directory found"
    elif [[ "$TEST_MODE" == "remote" ]]; then
        print_info "Remote testing mode - will clone from GitHub"
        REPO_URL="${REPO_URL:-https://github.com/RealStr1ke/dotfiles.git}"
        print_info "Repository URL: $REPO_URL"
    else
        print_error "Unknown test mode: $TEST_MODE"
        exit 1
    fi
}

# System information
show_system_info() {
    print_step "System Information"
    echo "   Distribution: $DISTRO"
    echo "   Test Mode: $TEST_MODE"
    echo "   User: $(whoami)"
    echo "   Home: $HOME"
    echo "   Shell: $SHELL"
    echo "   PATH: $PATH"
    
    # Check essential tools
    print_step "Checking essential tools..."
    for tool in git curl bun; do
        if command -v "$tool" &> /dev/null; then
            version=$(command -v "$tool" && "$tool" --version 2>/dev/null | head -n1 || echo "unknown")
            print_success "$tool: $version"
        else
            print_error "$tool: not found"
        fi
    done
}

# Run the actual test scenarios
run_tests() {
    print_step "Running test scenarios..."
    
    # Source and run test scenarios
    if [[ -f "/home/testuser/test-scenarios.sh" ]]; then
        source /home/testuser/test-scenarios.sh
        
        # Run tests based on mode
        if [[ "$TEST_MODE" == "local" ]]; then
            run_local_tests
        else
            run_remote_tests
        fi
    else
        print_error "Test scenarios script not found!"
        exit 1
    fi
}

# Main execution
main() {
    print_header
    
    # Run checks and tests
    check_test_mode
    show_system_info
    run_tests
    
    print_step "Test Summary"
    print_success "All tests completed successfully on ${DISTRO^}!"
    echo -e "${GREEN}🎉 Dotfiles are working correctly in ${TEST_MODE} mode!${NC}"
}

# Execute main function
main "$@"
