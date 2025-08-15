import * as utils from './utils/utils';
import { execSync } from 'child_process';
import * as fs from 'fs';
import toml from 'toml';
import path from 'path';
import os from 'os';

// Type definitions for configuration structure
interface SymlinkConfig {
	source: string;
	target: string;
	type?: 'file' | 'folder';
}

interface ActiveState {
	version: string;
	timestamp: number;
	symlinks: Record<string, SymlinkConfig>;
}

class Dotfiles {
	private dotfilesPath: string;
	private config: any;
	private activeStatePath: string;
	private logPath: string;

	constructor() {
		this.dotfilesPath = utils.getDotfilesDir();
		this.activeStatePath = path.join(this.dotfilesPath, 'src', 'config.active.toml');
		this.logPath = path.join(this.dotfilesPath, 'src', 'dotfiles.log');
		this.initializeLogging();
	}

	// Initialize logging system and create session header
	private initializeLogging() {
		// Ensure log directory exists
		const logDir = path.dirname(this.logPath);
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true });
		}

		// Log session start with header
		this.log('info', '='.repeat(80));
		this.log('info', `Dotfiles session started at ${new Date().toISOString()}`);
		this.log('info', `Working directory: ${this.dotfilesPath}`);
		this.log('info', '='.repeat(80));
	}

	// Dual logging to both file and console
	private log(level: 'info' | 'warn' | 'error', message: string) {
		const timestamp = new Date().toISOString();
		const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;

		// Write to file
		try {
			fs.appendFileSync(this.logPath, logEntry, 'utf8');
		} catch (e) {
			console.error('Failed to write to log file:', e);
		}

		// Also log to console via utils
		utils.log(level, message);
	}

	// Generate hash for version tracking of symlinks configuration
	private generateConfigHash(config: any): string {
		const symlinks = config?.symlinks || {};
		const sortedKeys = Object.keys(symlinks).sort();
		const hashData = sortedKeys.map(key => {
			const item = symlinks[key];
			return `${key}:${item.source}:${item.target}:${item.type || ''}`;
		}).join('|');

		// Simple hash function for change detection
		let hash = 0;
		for (let i = 0; i < hashData.length; i++) {
			const char = hashData.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash).toString(16);
	}

	// Load previously saved state from active.toml
	private loadActiveState(): ActiveState | null {
		try {
			if (!fs.existsSync(this.activeStatePath)) {
				this.log('info', 'No active state file found');
				return null;
			}

			const stateContent = fs.readFileSync(this.activeStatePath, 'utf8');
			const state = toml.parse(stateContent) as ActiveState;
			this.log('info', `Loaded active state (version: ${state.version})`);
			return state;
		} catch (error) {
			this.log('error', `Failed to load active state: ${error}`);
			return null;
		}
	}

	// Save current configuration state to active.toml
	private saveActiveState(config: any) {
		try {
			const symlinks = config?.symlinks || {};
			const activeState: ActiveState = {
				version: this.generateConfigHash(config),
				timestamp: Date.now(),
				symlinks: symlinks,
			};

			// Generate clean TOML format with proper escaping
			let tomlContent = `version = "${activeState.version.replace(/"/g, '\\"')}"\n`;
			tomlContent += `timestamp = ${activeState.timestamp}\n\n`;

			if (Object.keys(symlinks).length > 0) {
				tomlContent += '[symlinks]\n';

				const symlinkEntries = Object.entries(symlinks).map(([name, item]: [string, any]) => {
					// Validate TOML key names and escape values
					const safeName = name.replace(/[^\w.-]/g, '_');
					let entry = `\n[symlinks.${safeName}]\n`;
					entry += `source = "${item.source.replace(/"/g, '\\"')}"\n`;
					entry += `target = "${item.target.replace(/"/g, '\\"')}"`;
					if (item.type) {
						entry += `\ntype = "${item.type.replace(/"/g, '\\"')}"`;
					}
					return entry;
				});

				tomlContent += symlinkEntries.join('\n');
			}

			fs.writeFileSync(this.activeStatePath, tomlContent, 'utf8');
			this.log('info', `Saved active state (version: ${activeState.version})`);
		} catch (error) {
			this.log('error', `Failed to save active state: ${error}`);
		}
	}

	// Compare current config with previously saved state
	private compareConfigs(current: any, active: ActiveState | null): { needsUpdate: boolean, added: string[], removed: string[], modified: string[] } {
		const currentSymlinks = current?.symlinks || {};
		const activeSymlinks = active?.symlinks || {};

		const currentKeys = new Set(Object.keys(currentSymlinks));
		const activeKeys = new Set(Object.keys(activeSymlinks));

		// Find differences between configurations
		const added = Array.from(currentKeys).filter(key => !activeKeys.has(key));
		const removed = Array.from(activeKeys).filter(key => !currentKeys.has(key));
		const modified = Array.from(currentKeys).filter(key => {
			if (!activeKeys.has(key)) return false;
			const curr = currentSymlinks[key];
			const act = activeSymlinks[key];
			return curr.source !== act.source || curr.target !== act.target || curr.type !== act.type;
		});

		const needsUpdate = added.length > 0 || removed.length > 0 || modified.length > 0;

		return { needsUpdate, added, removed, modified };
	}

	// Load and parse configuration from config.toml
	loadConfig() {
		this.log('info', 'Reading configuration...');
		const configPath = `${this.dotfilesPath}/src/config.toml`;

		if (!fs.existsSync(configPath)) {
			this.log('error', 'config.toml not found');
			return;
		}

		try {
			const configContent = fs.readFileSync(configPath, 'utf8');
			this.config = toml.parse(configContent);
			this.log('info', 'Configuration loaded successfully');
		} catch (error) {
			this.log('error', `Failed to parse config.toml: ${error}`);
		}
	}

	// Verify required tools are installed
	checkRequirements() {
		this.log('info', 'Checking requirements...');

		if (!utils.isCommandInstalled('git')) {
			this.log('error', 'Git is not installed. Please install it to continue.');
			process.exit(1);
		}

		const hasBun = utils.isCommandInstalled('bun');
		const hasTsNode = utils.isCommandInstalled('ts-node');

		if (!hasBun && !hasTsNode) {
			this.log('error', 'Neither Bun nor ts-node are installed. Idk how tf you got here without them but please install one of them to continue.');
			process.exit(1);
		}

		this.log('info', 'All requirements met.');
	}

	// Main installation process
	install(headless: boolean) {
		this.log('info', 'Installing dotfiles...');

		// Load configuration first
		this.loadConfig();
		if (!this.config) {
			this.log('error', 'Configuration loading failed, cannot proceed with installation');
			return;
		}

		if (utils.isGitpod()) {
			headless = true;
			this.log('info', 'Gitpod environment detected, enabling headless mode');
		}

		this.log('info', `Installation mode: ${headless ? 'headless' : 'interactive'}`);

		if (!headless) {
			// Interactive mode - but remove async/await since this method isn't async
			this.log('info', 'Running dry run to preview changes...');
			this.symlink(true); // dry run

			this.log('info', 'Interactive mode not fully implemented - proceeding with installation');
			this.log('info', 'Proceeding with actual symlink creation...');
			this.symlink(false); // actual run

			this.log('info', 'Skipping submodule update (interactive prompts not implemented)');
		} else {
			// Headless mode
			this.log('info', 'Running dry run for logging purposes...');
			this.symlink(true); // dry run for logging

			this.log('info', 'Proceeding with actual symlink creation...');
			this.symlink(false); // actual run

			// Only update submodules if git is available and we're in a git repo
			if (utils.isCommandInstalled('git') && fs.existsSync(path.join(this.dotfilesPath, '.git'))) {
				this.log('info', 'Updating submodules...');
				try {
					execSync('git submodule update --init --recursive', {
						cwd: this.dotfilesPath,
						stdio: 'inherit',
						timeout: 120000, // 2 minute timeout
					});
					this.log('info', 'Submodules updated successfully');
				} catch (error: any) {
					this.log('warn', `Failed to update submodules: ${error.message}`);
				}
			} else {
				this.log('info', 'Skipping submodule update (not in git repository or git not available)');
			}
		}

		this.log('info', 'Installation completed');
	}

	// Main symlink management function
	symlink(dryRun: boolean, force: boolean = false) {
		this.log('info', `Starting symlink operation (dryRun: ${dryRun}, force: ${force})`);

		// Validate configuration is loaded
		if (!this.config) {
			this.log('error', 'Configuration not loaded. Call loadConfig() first.');
			return;
		}

		const symlinks = this.config?.symlinks;

		if (!symlinks || Object.keys(symlinks).length === 0) {
			this.log('warn', 'No symlinks defined in configuration.');
			return;
		}

		// Load state for change tracking and reporting
		let activeState: ActiveState | null = null;
		let currentVersion: string = '';

		try {
			activeState = this.loadActiveState();
			currentVersion = this.generateConfigHash(this.config);
		} catch (error) {
			this.log('error', `Failed to check configuration state: ${error}`);
			if (!force) {
				this.log('info', 'Use force=true to proceed despite state checking errors');
				return;
			}
			this.log('info', 'Force flag enabled, proceeding despite state errors');
		}

		// Report configuration status
		if (activeState && activeState.version === currentVersion) {
			this.log('info', 'Configuration unchanged since last run, but performing full verification');
		} else {
			this.log('info', 'Configuration changes detected or first run, performing full verification');
		}

		// Show what changed since last run
		const comparison = this.compareConfigs(this.config, activeState);

		if (comparison.needsUpdate) {
			this.log('info', 'Configuration changes detected:');
			if (comparison.added.length > 0) {
				this.log('info', `  Added: ${comparison.added.join(', ')}`);
			}
			if (comparison.removed.length > 0) {
				this.log('info', `  Removed: ${comparison.removed.join(', ')}`);
			}
			if (comparison.modified.length > 0) {
				this.log('info', `  Modified: ${comparison.modified.join(', ')}`);
			}
		} else if (activeState) {
			this.log('info', 'No configuration changes detected, but verifying all symlinks are correct');
		}

		if (force) {
			this.log('info', 'Force flag enabled, processing all symlinks');
		}

		const time = Date.now();

		// Validate configuration structure
		for (const [name, config] of Object.entries<any>(symlinks)) {
			if (!config || typeof config !== 'object') {
				this.log('error', `Invalid symlink config for '${name}': not an object`);
				return;
			}
			if (!config.source || typeof config.source !== 'string') {
				this.log('error', `Invalid symlink config for '${name}': missing or invalid source`);
				return;
			}
			if (!config.target || typeof config.target !== 'string') {
				this.log('error', `Invalid symlink config for '${name}': missing or invalid target`);
				return;
			}
			if (config.type && !['file', 'folder'].includes(config.type)) {
				this.log('error', `Invalid symlink type for '${name}': must be 'file' or 'folder'`);
				return;
			}
		}

		// Setup backup directory and validate paths
		const backupRoot = path.join(this.dotfilesPath, 'backup', `backup-${time}`);
		const homeDir = os.homedir();

		// Validate essential directories exist
		if (!fs.existsSync(this.dotfilesPath)) {
			this.log('error', `Dotfiles directory does not exist: ${this.dotfilesPath}`);
			return;
		}

		if (!fs.existsSync(homeDir)) {
			this.log('error', `Home directory does not exist: ${homeDir}`);
			return;
		}

		// Create backup directory (or log intention in dry run)
		if (!dryRun) {
			try {
				if (!fs.existsSync(backupRoot)) {
					fs.mkdirSync(backupRoot, { recursive: true });
					this.log('info', `Created backup directory: ${backupRoot}`);
				}
			} catch (e: any) {
				this.log('error', `Failed to create backup directory: ${e?.message || e}`);
				return;
			}
		} else {
			this.log('info', `Dry run: would create backup directory at: ${backupRoot}`);
		}

		// Track operation results
		let processedCount = 0;
		let errorCount = 0;
		let skippedCount = 0;

		// Process each symlink configuration
		for (const [name, { source, target, type }] of Object.entries<any>(symlinks)) {
			this.log('info', `Processing '${name}' ...`);
			try {
				// Validate paths are not empty
				if (!source || !target) {
					this.log('error', `Invalid paths for '${name}': source or target is empty`);
					errorCount++;
					continue;
				}

				// Resolve absolute paths
				const absSource = path.isAbsolute(source) ? source : path.resolve(this.dotfilesPath, source);
				const absTarget = path.isAbsolute(target) ? target : path.resolve(homeDir, target.replace(/^~\//, ''));

				// Additional path validation
				if (!absSource || !absTarget) {
					this.log('error', `Failed to resolve paths for '${name}'`);
					errorCount++;
					continue;
				}

				// Security: Prevent targeting outside home directory
				if (!path.isAbsolute(target) && !absTarget.startsWith(homeDir)) {
					this.log('error', `Security: Target for '${name}' resolves outside home directory: ${absTarget}`);
					errorCount++;
					continue;
				}

				// Security: Prevent targeting critical system directories
				const dangerousPaths = ['/etc', '/usr', '/bin', '/sbin', '/var', '/sys', '/proc'];
				if (dangerousPaths.some(dangerPath => absTarget.startsWith(dangerPath))) {
					this.log('error', `Security: Target for '${name}' points to system directory: ${absTarget}`);
					errorCount++;
					continue;
				}

				// Check if source exists
				let sourceExists = false;
				try {
					sourceExists = fs.existsSync(absSource);
				} catch (e: any) {
					this.log('warn', `Failed to check source existence for '${name}': ${e?.message || e}`);
				}

				if (!sourceExists) {
					this.log('warn', `Source for '${name}' does not exist (${absSource}). Will create placeholder based on type.`);
				}

				// Ensure target parent directory exists
				const targetParent = path.dirname(absTarget);
				if (!fs.existsSync(targetParent)) {
					if (dryRun) {
						this.log('info', `Dry run: would ensure parent directory exists: ${targetParent}`);
					} else {
						try {
							fs.mkdirSync(targetParent, { recursive: true });
							this.log('info', `Created parent directory: ${targetParent}`);
						} catch (e: any) {
							this.log('error', `Failed to create parent directory for '${name}': ${e?.message || e}`);
							errorCount++;
							continue;
						}
					}
				}

				// Check what exists at target location
				let targetLstat: fs.Stats | null = null;
				try {
					targetLstat = fs.lstatSync(absTarget);
				} catch {
					targetLstat = null;
				}

				let alreadyCorrect = false;

				// Handle existing symlinks at target
				if (targetLstat?.isSymbolicLink()) {
					try {
						const linkTarget = fs.readlinkSync(absTarget);
						const resolvedLink = path.resolve(path.dirname(absTarget), linkTarget);

						// Resolve both current and expected destinations through all symlinks
						let finalLinkDestination = resolvedLink;
						let finalSourceDestination = absSource;

						try {
							if (fs.existsSync(resolvedLink)) {
								finalLinkDestination = fs.realpathSync(resolvedLink);
							}
						} catch {
							finalLinkDestination = resolvedLink;
						}

						try {
							if (sourceExists) {
								finalSourceDestination = fs.realpathSync(absSource);
							}
						} catch {
							finalSourceDestination = absSource;
						}

						// Check if symlink points to correct destination
						if (path.resolve(finalLinkDestination) === path.resolve(finalSourceDestination)) {
							this.log('info', `Symlink '${name}' already correct: ${absTarget} -> ${linkTarget}`);
							if (finalLinkDestination !== resolvedLink) {
								this.log('info', `  (via symlink chain, final destination: ${finalLinkDestination})`);
							}
							alreadyCorrect = true;
							skippedCount++;
						} else {
							// Symlink exists but points to wrong location
							this.log('warn', `Symlink '${name}' mismatch:`);
							this.log('warn', `  Current: ${absTarget} -> ${linkTarget} (final destination: ${finalLinkDestination})`);
							this.log('warn', `  Expected: ${absTarget} -> ${finalSourceDestination}`);

							// Backup existing symlink with path validation
							const relTarget = absTarget.startsWith(homeDir)
								? path.relative(homeDir, absTarget)
								: path.basename(absTarget);

							// Security: Prevent path traversal in backup destination
							const sanitizedRelTarget = relTarget.replace(/\.\./g, '_');
							const backupDest = path.join(backupRoot, sanitizedRelTarget);

							// Ensure backup destination is within backup directory
							if (!backupDest.startsWith(backupRoot)) {
								this.log('error', `Security: Invalid backup destination for '${name}'`);
								errorCount++;
								continue;
							}

							if (dryRun) {
								this.log('info', `Dry run: would back up mismatched symlink '${name}' from ${absTarget} to ${backupDest}`);
							} else {
								try {
									fs.mkdirSync(path.dirname(backupDest), { recursive: true });
									fs.renameSync(absTarget, backupDest);
									this.log('info', `Backed up existing (mismatched) symlink for '${name}' to ${backupDest}`);
								} catch (e: any) {
									this.log('error', `Failed to backup mismatched symlink for '${name}': ${e?.message || e}`);
									errorCount++;
									continue;
								}
							}
						}
					} catch (e: any) {
						this.log('error', `Failed to read existing symlink for '${name}': ${e?.message || e}`);
						errorCount++;
						continue;
					}
				// Handle existing files/directories at target
				} else if (targetLstat) {
					const relTarget = absTarget.startsWith(homeDir)
						? path.relative(homeDir, absTarget)
						: path.basename(absTarget);

					// Security: Prevent path traversal in backup destination
					const sanitizedRelTarget = relTarget.replace(/\.\./g, '_');
					const backupDest = path.join(backupRoot, sanitizedRelTarget);

					// Ensure backup destination is within backup directory
					if (!backupDest.startsWith(backupRoot)) {
						this.log('error', `Security: Invalid backup destination for '${name}'`);
						errorCount++;
						continue;
					}

					if (dryRun) {
						this.log('info', `Dry run: would back up existing ${targetLstat.isDirectory() ? 'directory' : 'file'} for '${name}' from ${absTarget} to ${backupDest}`);
					} else {
						try {
							fs.mkdirSync(path.dirname(backupDest), { recursive: true });
							fs.renameSync(absTarget, backupDest);
							this.log('info', `Backed up existing ${targetLstat.isDirectory() ? 'directory' : 'file'} for '${name}' to ${backupDest}`);
						} catch (e: any) {
							this.log('error', `Failed to backup existing item for '${name}': ${e?.message || e}`);
							errorCount++;
							continue;
						}
					}
				}

				if (alreadyCorrect) continue;

				// Create missing source files/directories
				if (!sourceExists) {
					const sourceParent = path.dirname(absSource);
					const isDirectory = type === 'folder';

					if (dryRun) {
						this.log('info', `Dry run: would create placeholder ${isDirectory ? 'directory' : 'file'} for missing source '${name}' at ${absSource}`);
					} else {
						try {
							if (!fs.existsSync(sourceParent)) {
								fs.mkdirSync(sourceParent, { recursive: true });
							}

							if (isDirectory) {
								fs.mkdirSync(absSource, { recursive: true });
								this.log('info', `Created placeholder directory for '${name}' at ${absSource}`);
							} else {
								fs.writeFileSync(absSource, '', 'utf8');
								this.log('info', `Created placeholder file for '${name}' at ${absSource}`);
							}
							sourceExists = true;
						} catch (e: any) {
							this.log('error', `Failed to create placeholder for '${name}': ${e?.message || e}`);
							errorCount++;
							continue;
						}
					}
				}

				// Determine symlink type for creation
				let symlinkType: fs.symlink.Type | undefined;
				if (type) {
					symlinkType = type === 'folder' ? 'dir' : 'file';
				} else if (sourceExists) {
					try {
						const srcStat = fs.lstatSync(absSource);
						symlinkType = srcStat.isDirectory() ? 'dir' : 'file';
					} catch {
						symlinkType = undefined;
					}
				}

				// Get final source path for symlink creation
				let linkSource = absSource;
				if (sourceExists) {
					try {
						linkSource = fs.realpathSync(absSource);
					} catch { /* use absSource as fallback */ }
				}

				// Create the symlink (or log intention in dry run)
				if (dryRun) {
					this.log('info', `Dry run: would create symlink '${name}': ${absTarget} -> ${linkSource} (type=${symlinkType || 'auto'})`);
					processedCount++; // Count as processed in dry run
				} else {
					try {
						fs.symlinkSync(linkSource, absTarget, symlinkType);
						this.log('info', `Created symlink '${name}': ${absTarget} -> ${linkSource}`);
						processedCount++;
					} catch (e: any) {
						this.log('error', `Failed to create symlink '${name}': ${e?.message || e}`);
						errorCount++;
					}
				}
			} catch (err: any) {
				this.log('error', `Unhandled error while processing symlink '${name}': ${err?.message || err}`);
				errorCount++;
			}
		}

		// Save state if operation was successful
		if (!dryRun && errorCount === 0) {
			try {
				this.saveActiveState(this.config);
			} catch (e: any) {
				this.log('error', `Failed to save active state: ${e?.message || e}`);
			}
		}

		// Log operation summary
		const totalItems = Object.keys(symlinks).length;
		this.log('info', `Symlink operation summary: ${processedCount} ${dryRun ? 'would be created' : 'created'}, ${skippedCount} already correct, ${errorCount} errors out of ${totalItems} total`);

		if (dryRun) {
			this.log('info', 'Dry run complete: no changes were made.');
		} else {
			this.log('info', 'Symlink operation completed.');
		}
	}

	// Check status of dotfiles (to be implemented)
	status() {
		this.log('info', 'Checking dotfiles status...');
		// Status checking logic here
	}
}

export default Dotfiles;