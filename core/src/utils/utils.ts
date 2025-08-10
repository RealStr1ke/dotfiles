import { execSync } from 'child_process';
import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import { join, dirname, basename } from 'path';
import { homedir, platform } from 'os';

// Types
export type Platform = 'linux' | 'macos' | 'windows' | 'unknown';
export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';

// Platform Detection
export function detectPlatform(): Platform {
	const osType = platform();
	switch (osType) {
		case 'linux': return 'linux';
		case 'darwin': return 'macos';
		case 'win32': return 'windows';
		default: return 'unknown';
	}
}

// Gitpod Detection
export function isGitpod(): boolean {
	try {
		// Check for Gitpod-specific file and environment variable
		return fs.existsSync('/ide/bin/gitpod-code') && process.env.GITPOD_REPO_ROOT !== undefined;
	} catch {
		return false;
	}
}

// WSL Detection
export function isWSL(): boolean {
	try {
		// Only check on Windows/Linux platforms
		const currentPlatform = detectPlatform();
		if (currentPlatform !== 'linux' && currentPlatform !== 'windows') return false;

		// Check for WSL environment variables first (faster)
		if (process.env.WSL_DISTRO_NAME || process.env.WSLENV) return true;

		// Fallback to uname check (Linux only)
		if (currentPlatform === 'linux') {
			const release = execSync('uname -r', { encoding: 'utf8' });
			return release.toLowerCase().includes('microsoft');
		}

		return false;
	} catch {
		return false;
	}
}

// Logging
export function log(level: LogLevel, message: string, ...args: any[]): void {
	const timestamp = new Date().toLocaleTimeString();
	const colors = {
		info: '\x1b[36m', // cyan
		warn: '\x1b[33m', // yellow
		error: '\x1b[31m', // red
		success: '\x1b[32m', // green
		debug: '\x1b[35m', // magenta
	};
	const reset = '\x1b[0m';

	const prefix = `${colors[level]}[${timestamp}] ${level.toUpperCase()}${reset}`;
	console.log(`${prefix} ${message}`, ...args);
}

export async function pathExists(path: string): Promise<boolean> {
	try {
		await fsPromises.access(path);
		return true;
	} catch {
		return false;
	}
}

export async function isFile(path: string): Promise<boolean> {
	try {
		const stats = await fsPromises.stat(path);
		return stats.isFile();
	} catch {
		return false;
	}
}

export async function isDirectory(path: string): Promise<boolean> {
	try {
		const stats = await fsPromises.stat(path);
		return stats.isDirectory();
	} catch {
		return false;
	}
}

export async function isSymlink(path: string): Promise<boolean> {
	try {
		const stats = await fsPromises.lstat(path);
		return stats.isSymbolicLink();
	} catch {
		return false;
	}
}

export async function getSymlinkTarget(path: string): Promise<string | null> {
	try {
		const stats = await fsPromises.lstat(path);
		if (stats.isSymbolicLink()) {
			return await fsPromises.readlink(path);
		}
		return null;
	} catch {
		return null;
	}
}

export async function ensureDir(path: string): Promise<void> {
	try {
		await fsPromises.mkdir(path, { recursive: true });
	} catch (error: any) {
		if (error.code !== 'EEXIST') throw error;
	}
}


export async function safeRemove(path: string): Promise<void> {
	if (!await pathExists(path)) return;
	if (await isSymlink(path)) {
		log('info', `Removing symlink: ${path}`);
		await fsPromises.unlink(path);
	} else if (await isDirectory(path)) {
		log('info', `Removing directory: ${path}`);
		await fsPromises.rmdir(path, { recursive: true });
	} else {
		log('info', `Removing file: ${path}`);
		await fsPromises.unlink(path);
	}
}

export async function createSymlink(source: string, target: string): Promise<void> {
	if (!await pathExists(source)) {
		log('warn', `Source does not exist: ${source}`);
		return;
	}

	// Ensure target directory exists
	await ensureDir(dirname(target));

	// Remove existing target
	await safeRemove(target);

	try {
		// Windows requires different handling for symlinks
		const currentPlatform = detectPlatform();
		if (currentPlatform === 'windows') {
			const isDir = await isDirectory(source);
			await fsPromises.symlink(source, target, isDir ? 'dir' : 'file');
		} else {
			await fsPromises.symlink(source, target);
		}
		log('success', `Created symlink: ${target} -> ${source}`);
	} catch (error: any) {
		const currentPlatform = detectPlatform();
		if (currentPlatform === 'windows' && error.code === 'EPERM') {
			log('warn', 'Symlink creation failed (requires admin privileges on Windows), copying instead...');
			if (await isDirectory(source)) {
				await fsPromises.cp(source, target, { recursive: true });
			} else {
				await copyFile(source, target);
			}
		} else {
			throw error;
		}
	}
}

export async function copyFile(source: string, target: string): Promise<void> {
	await ensureDir(dirname(target));
	await fsPromises.copyFile(source, target);
	log('info', `Copied: ${source} -> ${target}`);
}

// Git Operations
export async function gitClone(url: string, target: string): Promise<void> {
	if (await pathExists(target)) {
		log('info', 'Repository already exists, pulling latest changes...');
		execSync('git pull origin main', { cwd: target, stdio: 'inherit' });
	} else {
		log('info', `Cloning repository: ${url}`);
		await ensureDir(dirname(target));
		execSync(`git clone "${url}" "${target}"`, { stdio: 'inherit' });
	}
}

export function isExecutable(command: string): boolean {
	try {
		const currentPlatform = detectPlatform();
		if (currentPlatform === 'windows') {
			// Windows uses 'where' instead of 'which'
			execSync(`where ${command}`, { stdio: 'ignore' });
		} else {
			execSync(`which ${command}`, { stdio: 'ignore' });
		}
		return true;
	} catch {
		return false;
	}
}

// Path Utilities
export function expandHome(path: string): string {
	if (path.startsWith('~/')) {
		return join(homedir(), path.slice(2));
	}
	// Windows also supports %USERPROFILE% expansion
	if (path.includes('%USERPROFILE%')) {
		return path.replace('%USERPROFILE%', homedir());
	}
	return path;
}

export function getTimestamp(): string {
	return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// Backup Utilities
export async function createBackup(source: string, backupDir: string): Promise<string> {
	if (!await pathExists(source)) return '';

	const timestamp = getTimestamp();
	const fileName = basename(source);
	const backupPath = join(backupDir, `${fileName}_${timestamp}`);

	await ensureDir(backupDir);
	if (await isDirectory(source)) {
		await fsPromises.cp(source, backupPath, { recursive: true });
	} else {
		await copyFile(source, backupPath);
	}

	return backupPath;
}

// Environment Utilities
export function getEnv(key: string, defaultValue: string = ''): string {
	return process.env[key] || defaultValue;
}

export function getDotfilesDir(): string {
	const currentPlatform = detectPlatform();

	// Use platform-specific default paths
	if (currentPlatform === 'windows') {
		return getEnv('DOTFILES_DIR', join(homedir(), 'dotfiles'));
	} else {
		return getEnv('DOTFILES_DIR', join(homedir(), '.dotfiles'));
	}
}

export function getConfigDir(): string {
	const currentPlatform = detectPlatform();

	switch (currentPlatform) {
		case 'windows':
			return getEnv('APPDATA', join(homedir(), 'AppData', 'Roaming'));
		case 'macos':
			return getEnv('XDG_CONFIG_HOME', join(homedir(), 'Library', 'Application Support'));
		default: // linux
			return getEnv('XDG_CONFIG_HOME', join(homedir(), '.config'));
	}
}

// Add platform helper functions
export function isWindows(): boolean {
	return detectPlatform() === 'windows';
}

export function isMacOS(): boolean {
	return detectPlatform() === 'macos';
}

export function isLinux(): boolean {
	return detectPlatform() === 'linux';
}