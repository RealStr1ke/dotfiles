#!/bin/bash
# Test scenarios for dotfiles installation

# Test counter
TEST_COUNT=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test helper functions
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TEST_COUNT=$((TEST_COUNT + 1))
    print_step "Test $TEST_COUNT: $test_name"
    
    if eval "$test_command"; then
        print_success "Test $TEST_COUNT PASSED: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        print_error "Test $TEST_COUNT FAILED: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Verify file/directory exists
verify_exists() {
    local path="$1"
    local description="$2"
    
    if [[ -e "$path" ]]; then
        print_success "$description exists: $path"
        return 0
    else
        print_error "$description missing: $path"
        return 1
    fi
}

# Verify symlink points to correct target
verify_symlink() {
    local link_path="$1"
    local expected_target="$2"
    local description="$3"
    
    if [[ -L "$link_path" ]]; then
        local actual_target=$(readlink "$link_path")
        if [[ "$actual_target" == *"$expected_target"* ]]; then
            print_success "$description symlink correct: $link_path -> $actual_target"
            return 0
        else
            print_error "$description symlink incorrect: $link_path -> $actual_target (expected: *$expected_target*)"
            return 1
        fi
    else
        print_error "$description is not a symlink: $link_path"
        return 1
    fi
}

# Local testing scenarios
run_local_tests() {
    print_step "Running LOCAL testing scenarios..."
    
    # Test 1: Verify .dotfiles directory is mounted
    run_test "Local .dotfiles directory accessible" "verify_exists '/home/testuser/.dotfiles' 'Dotfiles directory'"
    
    # Test 2: Verify core structure exists
    run_test "Core TypeScript files exist" "verify_exists '/home/testuser/.dotfiles/core/main.ts' 'Main TypeScript file'"
    run_test "Configuration file exists" "verify_exists '/home/testuser/.dotfiles/src/config.toml' 'Configuration file'"
    
    # Test 3: Install dependencies and run local installation
    run_test "Install dependencies" "cd /home/testuser/.dotfiles/core && bun install"
    
    # Test 4: Run dry-run installation
    run_test "Dry-run installation" "cd /home/testuser/.dotfiles/core && bun run main.ts install --headless --dry-run"
    
    # Test 5: Run actual installation
    run_test "Actual installation" "cd /home/testuser/.dotfiles/core && bun run main.ts install --headless --force"
    
    # Test 6: Verify some key symlinks were created
    run_test "Fish config symlink" "verify_symlink '/home/testuser/.config/fish' 'dotfiles/src/config/fish' 'Fish configuration'"
    
    # Test 7: Test status command
    run_test "Status command" "cd /home/testuser/.dotfiles/core && bun run main.ts status"
    
    # Test 8: Test update command
    run_test "Update command" "cd /home/testuser/.dotfiles/core && bun run main.ts update --headless --force"
    
    # Test 9: Verify active state file was created
    run_test "Active state file" "verify_exists '/home/testuser/.dotfiles/src/config.active.toml' 'Active state file'"
    
    # Test 10: Test uninstall (commented out by default to preserve test environment)
    # run_test "Uninstall command" "cd /home/testuser/.dotfiles/core && bun run main.ts uninstall --force"
    
    print_local_summary
}

# Remote testing scenarios
run_remote_tests() {
    print_step "Running REMOTE testing scenarios..."
    
    # Test 1: Remote installation via install script (headless)
    run_test "Remote headless installation" "curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/install.sh | bash"
    
    # Test 2: Verify .dotfiles was cloned
    run_test "Dotfiles repository cloned" "verify_exists '/home/testuser/.dotfiles' 'Cloned dotfiles directory'"
    
    # Test 3: Verify some key symlinks were created
    run_test "Fish config symlink" "verify_symlink '/home/testuser/.config/fish' 'dotfiles/src/config/fish' 'Fish configuration'"
    
    # Test 4: Test CLI commands work
    run_test "Status command works" "cd /home/testuser/.dotfiles/core && bun run main.ts status"
    
    # Test 5: Test force reinstall
    run_test "Force reinstall" "curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/install.sh | bash -s -- --force"
    
    # Test 6: Test dry-run mode
    run_test "Dry-run mode" "curl -fsSL https://raw.githubusercontent.com/RealStr1ke/dotfiles/master/install.sh | bash -s -- --dry-run"
    
    # Test 7: Verify active state file
    run_test "Active state file exists" "verify_exists '/home/testuser/.dotfiles/src/config.active.toml' 'Active state file'"
    
    print_remote_summary
}

print_local_summary() {
    echo ""
    print_step "LOCAL TEST SUMMARY"
    echo "   Total Tests: $TEST_COUNT"
    echo "   Passed: $PASSED_TESTS"
    echo "   Failed: $FAILED_TESTS"
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        print_success "All local tests passed! ✨"
    else
        print_error "$FAILED_TESTS local tests failed!"
        exit 1
    fi
}

print_remote_summary() {
    echo ""
    print_step "REMOTE TEST SUMMARY"
    echo "   Total Tests: $TEST_COUNT"
    echo "   Passed: $PASSED_TESTS"
    echo "   Failed: $FAILED_TESTS"
    
    if [[ $FAILED_TESTS -eq 0 ]]; then
        print_success "All remote tests passed! 🚀"
    else
        print_error "$FAILED_TESTS remote tests failed!"
        exit 1
    fi
}
