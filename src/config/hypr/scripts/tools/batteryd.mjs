#!/usr/bin/env zx

/**
 * Battery Daemon
 * Monitors battery status and sends smart notifications
 * Features:
 * - Multiple battery source support (upower, sys, acpi fallback)
 * - Configurable thresholds and intervals
 * - Smart notification throttling
 * - Better error handling and logging
 * - Graceful shutdown handling
 */

// Configuration
const CONFIG = {
	// Battery thresholds (percentage)
	thresholds: {
		critical: 10,
		low: 30,
		full: 95,
	},

	// Check interval in seconds
	checkInterval: 60,

	// Notification throttle (don't spam same notification)
	notificationCooldown: 300, // 5 minutes

	// Battery icons
	icons: {
		full: '󰁹',
		charging: '󰂄',
		low: '󰁺',
		critical: '󰁻',
		unknown: '󰁽',
	},

	// Enable debug logging
	debug: false,
};

// State tracking
let lastNotification = null;
let lastNotificationTime = 0;
let shuttingDown = false;

// Logging utility
function log(level, message, ...args) {
	if (level === 'debug' && !CONFIG.debug) return;

	const timestamp = new Date().toISOString();
	const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

	console.log(prefix, message, ...args);
}

// Get battery info using upower (most reliable)
async function getBatteryInfoUpower() {
	try {
		const devices = await $`upower -e`.quiet();
		const batteryDevices = devices.stdout
			.split('\n')
			.filter(line => line.includes('BAT') || line.includes('battery'));

		if (batteryDevices.length === 0) {
			throw new Error('No battery devices found');
		}

		// Use the first battery device
		const batteryDevice = batteryDevices[0].trim();
		const info = await $`upower -i ${batteryDevice}`.quiet();

		const lines = info.stdout.split('\n');
		const data = {};

		for (const line of lines) {
			if (line.includes('percentage')) {
				data.percentage = parseInt(line.split(':')[1].trim().replace('%', ''));
			}
			if (line.includes('state')) {
				data.state = line.split(':')[1].trim();
			}
			if (line.includes('time to')) {
				data.timeRemaining = line.split(':')[1].trim();
			}
		}

		return {
			percentage: data.percentage || 0,
			isCharging: data.state === 'charging',
			isFull: data.state === 'fully-charged' || data.percentage >= 100,
			isDischarging: data.state === 'discharging',
			timeRemaining: data.timeRemaining,
			source: 'upower',
		};
	} catch (error) {
		log('debug', 'upower failed:', error.message);
		throw error;
	}
}

// Get battery info from /sys/class/power_supply (fallback)
async function getBatteryInfoSys() {
	try {
		const batteryPath = '/sys/class/power_supply/BAT0';

		// Check if battery exists
		await $`test -d ${batteryPath}`.quiet();

		const capacity = parseInt(await $`cat ${batteryPath}/capacity`.quiet().then(r => r.stdout.trim()));
		const status = await $`cat ${batteryPath}/status`.quiet().then(r => r.stdout.trim().toLowerCase());

		return {
			percentage: capacity,
			isCharging: status === 'charging',
			isFull: status === 'full' || capacity >= 100,
			isDischarging: status === 'discharging',
			timeRemaining: null,
			source: 'sysfs',
		};
	} catch (error) {
		log('debug', 'sysfs failed:', error.message);
		throw error;
	}
}

// Get battery info using acpi (last resort)
async function getBatteryInfoAcpi() {
	try {
		const output = await $`acpi -b`.quiet();
		const line = output.stdout.trim();

		const percentageMatch = line.match(/(\d+)%/);
		const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 0;

		const isCharging = line.includes('Charging');
		const isFull = line.includes('Full');
		const isDischarging = line.includes('Discharging');

		return {
			percentage,
			isCharging,
			isFull,
			isDischarging,
			timeRemaining: null,
			source: 'acpi',
		};
	} catch (error) {
		log('debug', 'acpi failed:', error.message);
		throw error;
	}
}

// Get battery info with fallback chain
async function getBatteryInfo() {
	const methods = [getBatteryInfoUpower, getBatteryInfoSys, getBatteryInfoAcpi];

	for (const method of methods) {
		try {
			const info = await method();
			log('debug', `Battery info from ${info.source}:`, info);
			return info;
		} catch {
			continue;
		}
	}

	throw new Error('All battery detection methods failed');
}

// Check if we should send a notification (throttling)
function shouldNotify(type) {
	const now = Date.now();

	// Don't send the same notification type within cooldown period
	if (lastNotification === type && (now - lastNotificationTime) < CONFIG.notificationCooldown * 1000) {
		return false;
	}

	return true;
}

// Send notification
async function sendNotification(urgency, title, body, icon = '') {
	try {
		const iconPart = icon ? icon + ' ' : '';
		await $`notify-send -u ${urgency} "${iconPart}${title}" "${body}"`;
		log('info', `Notification sent: ${title}`);
	} catch (error) {
		log('error', 'Failed to send notification:', error.message);
	}
}

// Handle battery status and send appropriate notifications
async function handleBatteryStatus(battery) {
	const { percentage, isCharging, isFull, isDischarging } = battery;

	// Battery full notification
	if (isFull && isCharging && shouldNotify('full')) {
		await sendNotification(
			'low',
			'Battery is full',
			'Please unplug the AC adapter to preserve battery health.',
			CONFIG.icons.full,
		);
		lastNotification = 'full';
		lastNotificationTime = Date.now();
		return;
	}

	// Critical battery notification
	if (percentage <= CONFIG.thresholds.critical && isDischarging && shouldNotify('critical')) {
		await sendNotification(
			'critical',
			'Battery critically low!',
			`Only ${percentage}% remaining. Please plug in the AC adapter immediately.`,
			CONFIG.icons.critical,
		);
		lastNotification = 'critical';
		lastNotificationTime = Date.now();
		return;
	}

	// Low battery notification
	if (percentage <= CONFIG.thresholds.low && isDischarging && shouldNotify('low')) {
		await sendNotification(
			'normal',
			'Battery low',
			`${percentage}% remaining. Please plug in the AC adapter soon.`,
			CONFIG.icons.low,
		);
		lastNotification = 'low';
		lastNotificationTime = Date.now();
		return;
	}

	// Reset notification state if we're in a good state
	if (isCharging || percentage > CONFIG.thresholds.low) {
		lastNotification = null;
	}
}

// Main monitoring loop
async function monitorBattery() {
	log('info', 'Battery daemon started');
	log('info', 'Configuration:', CONFIG);

	while (!shuttingDown) {
		try {
			const battery = await getBatteryInfo();
			log('debug', 'Battery status:', battery);

			await handleBatteryStatus(battery);

		} catch (error) {
			log('error', 'Error monitoring battery:', error.message);
		}

		// Wait for next check
		await sleep(CONFIG.checkInterval * 1000);
	}

	log('info', 'Battery daemon stopped');
}

// Graceful shutdown handler
function setupShutdownHandlers() {
	const shutdown = (signal) => {
		log('info', `Received ${signal}, shutting down gracefully...`);
		shuttingDown = true;
	};

	process.on('SIGINT', () => shutdown('SIGINT'));
	process.on('SIGTERM', () => shutdown('SIGTERM'));
	process.on('SIGHUP', () => shutdown('SIGHUP'));
}

// CLI argument parsing
function parseArgs() {
	const args = process.argv.slice(3);

	if (args.includes('--help') || args.includes('-h')) {
		const help = [
			'Battery Daemon - Smart battery monitoring for Hyprland',
			'',
			'Usage: batteryd.mjs [options]',
			'',
			'Options:',
			'  --debug, -d           Enable debug logging',
			`  --interval <seconds>  Check interval (default: ${CONFIG.checkInterval})`,
			`  --critical <percent>  Critical threshold (default: ${CONFIG.thresholds.critical})`,
			`  --low <percent>       Low threshold (default: ${CONFIG.thresholds.low})`,
			`  --full <percent>      Full threshold (default: ${CONFIG.thresholds.full})`,
			'  --help, -h            Show this help message',
			'',
			'Examples:',
			'  batteryd.mjs                    # Start with default settings',
			'  batteryd.mjs --debug            # Start with debug logging',
			'  batteryd.mjs --interval 30      # Check every 30 seconds',
			'  batteryd.mjs --critical 5       # Critical at 5%',
		].join('\n');
		console.log(help);
		process.exit(0);
	}

	// Parse options
	if (args.includes('--debug') || args.includes('-d')) {
		CONFIG.debug = true;
	}

	const intervalIndex = args.findIndex(arg => arg === '--interval');
	if (intervalIndex !== -1 && args[intervalIndex + 1]) {
		CONFIG.checkInterval = parseInt(args[intervalIndex + 1]) || CONFIG.checkInterval;
	}

	const criticalIndex = args.findIndex(arg => arg === '--critical');
	if (criticalIndex !== -1 && args[criticalIndex + 1]) {
		CONFIG.thresholds.critical = parseInt(args[criticalIndex + 1]) || CONFIG.thresholds.critical;
	}

	const lowIndex = args.findIndex(arg => arg === '--low');
	if (lowIndex !== -1 && args[lowIndex + 1]) {
		CONFIG.thresholds.low = parseInt(args[lowIndex + 1]) || CONFIG.thresholds.low;
	}

	const fullIndex = args.findIndex(arg => arg === '--full');
	if (fullIndex !== -1 && args[fullIndex + 1]) {
		CONFIG.thresholds.full = parseInt(args[fullIndex + 1]) || CONFIG.thresholds.full;
	}
}

// Main execution
async function main() {
	try {
		parseArgs();
		setupShutdownHandlers();

		// Test battery detection on startup
		const battery = await getBatteryInfo();
		log('info', `Battery detected using ${battery.source}: ${battery.percentage}%`);

		await monitorBattery();

	} catch (error) {
		log('error', 'Failed to start battery daemon:', error.message);
		process.exit(1);
	}
}

// Run the daemon
main().catch(error => {
	log('error', 'Unhandled error:', error);
	process.exit(1);
});
