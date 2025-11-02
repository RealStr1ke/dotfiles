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
			accent?: string;
			apps?: string;
			themeMode?: string;
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
				case '--dry-run':
					options.dryRun = true;
					break;
				case '--verbose':
					options.verbose = true;
					break;
				case '--dark':
					options.themeMode = 'dark';
					break;
				case '--light':
					options.themeMode = 'light';
					break;
				default:
					// Handle --accent flag
					if (arg.startsWith('--accent=')) {
						options.accent = arg.split('=')[1];
					} else if (arg === '--accent' && i + 1 < args.length) {
						options.accent = args[i + 1];
						i++; // Skip next arg since we consumed it
					} else if (arg.startsWith('--apps=')) {
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

		// Import theme engine and handle theme commands
		const { ThemeEngine } = await import('./theme');
		const themeEngine = new ThemeEngine();

		const subcommand = themeArgs[0] || 'help';
		const subArgs = themeArgs.slice(1);

		await this.handleThemeSubcommand(themeEngine, subcommand, subArgs, options);
	}

	private async handleThemeSubcommand(themeEngine: any, subcommand: string, args: string[], options: any): Promise<void> {
		try {
			switch (subcommand) {
				case 'list':
					await this.listThemes(themeEngine);
					break;
				case 'current':
					await this.showCurrentTheme(themeEngine);
					break;
				case 'set':
				case 'apply':
					if (!args[0]) {
						console.error('❌ Theme name required. Usage: dots theme set <theme-name> [--accent color]');
						process.exit(1);
					}
					await this.applyTheme(themeEngine, args[0], options);
					break;
				case 'preview':
					if (!args[0]) {
						console.error('❌ Theme name required. Usage: dots theme preview <theme-name> [--accent color]');
						process.exit(1);
					}
					await this.previewTheme(themeEngine, args[0], options);
					break;
				case 'help':
					this.showThemeHelp();
					break;
				default:
					console.error(`❌ Unknown theme subcommand: ${subcommand}`);
					this.showThemeHelp();
					process.exit(1);
			}
		} catch (error: any) {
			console.error('❌ Theme command failed:', error.message);
			process.exit(1);
		}
	}

	private async listThemes(themeEngine: any): Promise<void> {
		console.log('🎨 Available themes:');
		console.log('');

		const themes = await themeEngine.listThemes();

		if (themes.length === 0) {
			console.log('No themes found. Make sure theme presets exist in core/src/themes/presets/');
			return;
		}

		const currentTheme = await themeEngine.getCurrentTheme();

		themes.forEach((theme: string) => {
			const isCurrent = currentTheme?.name === theme;
			const marker = isCurrent ? '→' : ' ';
			console.log(`  ${marker} ${theme}`);
		});

		console.log('');
		console.log(`Total: ${themes.length} themes`);
		if (currentTheme) {
			console.log(`Current: ${currentTheme.name}${currentTheme.accent ? ` (accent: ${currentTheme.accent})` : ''}`);
		}
	}

	private async showCurrentTheme(themeEngine: any): Promise<void> {
		const currentTheme = await themeEngine.getCurrentTheme();

		if (!currentTheme) {
			console.log('No theme is currently active.');
			return;
		}

		console.log('🎨 Current theme:');
		console.log('');
		console.log(`Name: ${currentTheme.name}`);
		if (currentTheme.accent) {
			console.log(`Accent: ${currentTheme.accent}`);
		}
		console.log('');
		console.log('To change theme: dots theme set <theme-name> [--accent color]');
		console.log('To change accent: dots theme set <current-theme> --accent <color>');
	}

	private async applyTheme(themeEngine: any, themeName: string, options: any): Promise<void> {
		const modeStr = options.themeMode ? ` (${options.themeMode} mode)` : '';
		console.log(`🎨 Applying theme: ${themeName}${options.accent ? ` with accent: ${options.accent}` : ''}${modeStr}`);

		try {
			// Load theme with accent override and theme mode
			const theme = await themeEngine.loadTheme(themeName, options.accent, options.themeMode);

			// Apply to specified applications or default to AGS
			const applications = options.apps ? options.apps.split(',') : ['ags'];

			for (const app of applications) {
				await themeEngine.applyTheme(theme, app);
			}

			// Save current theme state with comprehensive info
			await this.saveThemeState(themeName, options.accent || theme.resolved_accent, options.themeMode, theme);

			console.log('✅ Theme applied successfully!');
			console.log(`Applied to: ${applications.join(', ')}`);

			if (options.accent) {
				console.log(`Using custom accent: ${theme.accent.base}`);
			} else if (theme.accent_source === 'extracted') {
				console.log(`Using extracted accent: ${theme.accent.base}`);
			}
		} catch (error: any) {
			console.error('❌ Failed to apply theme:', error.message);
			process.exit(1);
		}
	}

	private async previewTheme(themeEngine: any, themeName: string, options: any): Promise<void> {
		const modeStr = options.themeMode ? ` (${options.themeMode} mode)` : '';
		console.log(`👀 Previewing theme: ${themeName}${options.accent ? ` with accent: ${options.accent}` : ''}${modeStr}`);

		try {
			// Load theme with accent override and theme mode
			const theme = await themeEngine.loadTheme(themeName, options.accent, options.themeMode);

			console.log('✅ Preview successful!');
			console.log('');
			console.log('Theme details:');
			console.log(`  Name: ${theme.name}`);
			console.log(`  Background: ${theme.background.primary}`);
			console.log(`  Text: ${theme.text.primary}`);
			console.log(`  Accent: ${theme.accent.base}`);
			console.log(`  - Light: ${theme.accent.light}`);
			console.log(`  - Dark: ${theme.accent.dark}`);
			console.log(`  - Dim: ${theme.accent.dim}`);
			console.log('');
			console.log('To apply this theme, run:');
			const cmdOptions = [
				options.accent ? `--accent ${options.accent}` : '',
				options.themeMode ? `--${options.themeMode}` : ''
			].filter(Boolean).join(' ');
			console.log(`  dots theme set ${themeName}${cmdOptions ? ` ${cmdOptions}` : ''}`);
		} catch (error: any) {
			console.error('❌ Preview failed:', error.message);
		}
	}

	private async saveThemeState(themeName: string, accent?: string, themeMode?: string, resolvedTheme?: any): Promise<void> {
		try {
			const fs = await import('fs/promises');
			const path = await import('path');
			const toml = await import('toml');

			const configPath = path.join(process.env.HOME || '~', '.dotfiles/src/config.active.toml');

			// Read existing config to preserve other sections
			let existingData: any = {};
			try {
				const existingContent = await fs.readFile(configPath, 'utf-8');
				existingData = toml.parse(existingContent);
			} catch {
				// File doesn't exist or is empty
			}

			// Update theme section
			const isWallpaper = themeName.includes('/') || themeName.endsWith('.jpg') || themeName.endsWith('.png');
			
			existingData.theme = {
				name: themeName,
				timestamp: Date.now(),
				theme_type: isWallpaper ? 'wallpaper' : 'preset'
			};

			if (accent) {
				existingData.theme.accent = accent;
				
				// Use accent source from resolved theme
				existingData.theme.accent_source = resolvedTheme?.accent_source || 'custom';
			}

			if (isWallpaper) {
				existingData.theme.wallpaper_path = themeName;
				if (themeMode) {
					existingData.theme.theme_mode = themeMode;
				}
			}

			// Generate complete multi-section TOML
			let content = `# Multi-component active state file\n# Auto-generated by dotfiles system\n\n`;

			// Preserve symlinks section
			if (existingData.symlinks) {
				content += `[symlinks]\n`;
				content += `version = "${existingData.symlinks.version || 'unknown'}"\n`;
				content += `timestamp = ${existingData.symlinks.timestamp || Date.now()}\n\n`;

				Object.entries(existingData.symlinks).forEach(([key, value]) => {
					if (typeof value === 'object' && value !== null && key !== 'version' && key !== 'timestamp') {
						const safeName = key.replace(/[^\w.-]/g, '_');
						content += `[symlinks.${safeName}]\n`;
						const item = value as any;
						content += `source = "${item.source.replace(/"/g, '\\"')}"\n`;
						content += `target = "${item.target.replace(/"/g, '\\"')}"\n`;
						if (item.type) {
							content += `type = "${item.type.replace(/"/g, '\\"')}"\n`;
						}
						content += `\n`;
					}
				});
			}

			// Theme section
			content += `[theme]\n`;
			Object.entries(existingData.theme).forEach(([key, value]) => {
				if (typeof value === 'string') {
					content += `${key} = "${value.replace(/"/g, '\\"')}"\n`;
				} else {
					content += `${key} = ${value}\n`;
				}
			});

			content += `\n# Last updated: ${new Date().toISOString()}\n`;

			// Ensure directory exists
			await fs.mkdir(path.dirname(configPath), { recursive: true });

			// Write config
			await fs.writeFile(configPath, content);
		} catch (error: any) {
			console.warn(`Warning: Could not save theme state: ${error.message}`);
		}
	}

	private showThemeHelp(): void {
		console.log('🎨 Theme management commands:');
		console.log('');
		console.log('Usage: dots theme <command> [options]');
		console.log('');
		console.log('Commands:');
		console.log('  list                    List all available themes');
		console.log('  current                 Show current theme information');
		console.log('  set <theme-name>        Apply a theme');
		console.log('  preview <theme-name>    Preview a theme without applying');
		console.log('  help                    Show this help');
		console.log('');
		console.log('Options:');
		console.log('  --accent <color>        Override accent color (hex or palette name)');
		console.log('  --apps <app1,app2>      Apply only to specific applications');
		console.log('  --dark                  Force dark theme (for wallpaper themes)');
		console.log('  --light                 Force light theme (for wallpaper themes)');
		console.log('  --dry-run              Preview changes without applying');
		console.log('');
		console.log('Examples:');
		console.log('  dots theme list');
		console.log('  dots theme set catppuccin-mocha');
		console.log('  dots theme set rose-pine --accent "#ff79c6"');
		console.log('  dots theme set catppuccin-mocha --accent blue');
		console.log('  dots theme set ~/wallpaper.jpg                # Auto-detect light/dark');
		console.log('  dots theme set ~/wallpaper.jpg --dark         # Force dark theme');
		console.log('  dots theme set ~/wallpaper.jpg --accent blue  # Custom accent');
		console.log('  dots theme preview ~/wallpaper.jpg --light    # Preview light theme');
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