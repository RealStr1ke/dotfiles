import Dotfiles from '../core';

interface CliOptions {
	headless: boolean;
	interactive: boolean;
	force: boolean;
	dryRun: boolean;
	verbose: boolean;
}

class CLI {
	private options: CliOptions;
	private dotfiles: Dotfiles;

	constructor() {
		this.options = {
			headless: false,
			interactive: false,
			force: false,
			dryRun: false,
			verbose: false,
		};

		try {
			this.dotfiles = new Dotfiles();
			this.dotfiles.loadConfig();
			this.dotfiles.checkRequirements();
		} catch (error) {
			console.error('❌ Initialization failed:', error);
			process.exit(1);
		}
	}

	public run(args: string[]) {
		const command = args[0];

		if (!command) {
			console.error('No command provided. Use "help" to see available commands.');
			process.exit(1);
		}

		// For theme command, handle arguments differently
		if (command === 'theme') {
			this.handleThemeCommand(args);
			return;
		}

		// For other commands, parse options normally
		const { command: parsedCommand, options } = this.parseArgs(args);
		Object.assign(this.options, options);

		switch (parsedCommand) {
			case 'install':
				this.install();
				break;
			case 'status':
				this.status();
				break;
			case 'update':
				this.update();
				break;
			case 'uninstall':
				this.uninstall();
				break;
			case 'help':
				this.help();
				break;
			default:
				console.error(`Unknown command: ${parsedCommand}`);
				console.error('Available commands: install, status, update, uninstall, theme, help');
				process.exit(1);
		}
	}

	private async handleThemeCommand(args: string[]) {
		// Parse options for theme command more flexibly
		const themeArgs: string[] = [];
		const options: CliOptions & { 
			backup?: boolean;
			reload?: boolean;
			apps?: string;
		} = {
			headless: false,
			interactive: false,
			force: false,
			dryRun: false,
			verbose: false,
		};

		// Skip 'theme' command itself
		for (let i = 1; i < args.length; i++) {
			const arg = args[i];
			switch (arg) {
				case '--headless':
					options.headless = true;
					break;
				case '--interactive':
					options.interactive = true;
					break;
				case '--force':
					options.force = true;
					break;
				case '--dry-run':
					options.dryRun = true;
					break;
				case '--verbose':
					options.verbose = true;
					break;
				case '--no-backup':
					options.backup = false;
					break;
				case '--no-reload':
					options.reload = false;
					break;
				default:
					// Handle --apps flag
					if (arg.startsWith('--apps=')) {
						options.apps = arg.split('=')[1];
					} else if (arg === '--apps' && i + 1 < args.length) {
						options.apps = args[i + 1];
						i++; // Skip next arg since we consumed it
					} else if (arg.startsWith('--')) {
						console.error(`Unknown option: ${arg}`);
						process.exit(1);
					} else {
						// Otherwise, it's a theme command argument
						themeArgs.push(arg);
					}
					break;
			}
		}

		Object.assign(this.options, options);

		const { ThemeCommand } = await import('../theme');
		const themeCommand = new ThemeCommand();

		const subcommand = themeArgs[0] || 'help';
		const subArgs = themeArgs.slice(1);

		await themeCommand.handle(subcommand, subArgs, options);
	}

	private parseArgs(args: string[]): { command: string; options: CliOptions } {
		const command = args[0];
		const options: CliOptions = {
			headless: false,
			interactive: false,
			force: false,
			dryRun: false,
			verbose: false,
		};

		args.slice(1).forEach((arg) => {
			switch (arg) {
				case '--headless':
					options.headless = true;
					break;
				case '--interactive':
					options.interactive = true;
					break;
				case '--force':
					options.force = true;
					break;
				case '--dry-run':
					options.dryRun = true;
					break;
				case '--verbose':
					options.verbose = true;
					break;
				default:
					console.error(`Unknown option: ${arg}`);
					process.exit(1);
			}
		});

		return { command, options };
	}

	// ----- COMMANDS -----
	private install() {
		console.log('🚀 Installing dotfiles...');

		// Determine mode - default to headless unless interactive is specified
		const isHeadless = !this.options.interactive;

		if (this.options.verbose) {
			console.log(`Mode: ${isHeadless ? 'headless' : 'interactive'}`);
			console.log(`Options: force=${this.options.force}, dryRun=${this.options.dryRun}`);
		}

		try {
			// Call the core install method with all parameters
			this.dotfiles.install(isHeadless, this.options.force, this.options.dryRun);
			console.log('✅ Install command completed');
		} catch (error) {
			console.error('❌ Install failed:', error);
			process.exit(1);
		}
	}

	private status() {
		console.log('📊 Checking dotfiles status...');

		try {
			// Call the core status method
			this.dotfiles.status();

			// Additional status info we can add here
			if (this.options.verbose) {
				console.log('Use --verbose for detailed status information');
			}

			console.log('✅ Status check completed');
		} catch (error) {
			console.error('❌ Status check failed:', error);
			process.exit(1);
		}
	}

	private update() {
		console.log('🔄 Updating/refreshing dotfiles symlinks...');

		if (this.options.verbose) {
			console.log('Note: Update performs the same operation as install - refreshing all symlinks');
		}

		// Determine mode - default to headless unless interactive is specified
		const isHeadless = !this.options.interactive;

		try {
			// Call the core install method (same as install, just refreshes symlinks)
			this.dotfiles.install(isHeadless, this.options.force, this.options.dryRun);
			console.log('✅ Update command completed');
		} catch (error) {
			console.error('❌ Update failed:', error);
			process.exit(1);
		}
	}

	private uninstall() {
		console.log('🗑️  Uninstalling dotfiles...');
		console.log('⚠️  WARNING: This will remove all dotfiles symlinks!');

		if (this.options.verbose) {
			console.log(`Force mode: ${this.options.force}`);
			console.log('This operation will remove all symlinks and the active state file');
		}

		// Call the core uninstall method with force flag
		this.dotfiles.uninstall(this.options.force);

		console.log('✅ Uninstall command completed');
	}

	private help() {
		console.log('🔧 Dotfiles Management CLI');
		console.log('');
		console.log('Usage: dotfiles <command> [options]');
		console.log('');
		console.log('Commands:');
		console.log('  install     Install/setup the dotfiles symlinks');
		console.log('  status      Show the current status of dotfiles');
		console.log('  update      Update/refresh all symlinks (same as install)');
		console.log('  uninstall   Remove all dotfiles symlinks (DANGEROUS!)');
		console.log('  theme       Manage themes (use "theme help" for details)');
		console.log('  help        Show this help message');
		console.log('');
		console.log('Options:');
		console.log('  --headless      Run in headless mode (default)');
		console.log('  --interactive   Run in interactive mode with prompts');
		console.log('  --force         Skip confirmations (required for uninstall)');
		console.log('  --dry-run       Show what would be done without making changes');
		console.log('  --verbose       Show detailed output');
		console.log('');
		console.log('Examples:');
		console.log('  dotfiles install --interactive --verbose');
		console.log('  dotfiles update --force');
		console.log('  dotfiles uninstall --force');
		console.log('  dotfiles status');
	}

}

export default CLI;