// Import AGS + modules + other imports
import { App, Utils, Service } from './modules/utils/imports.js';
import AppLauncher from './modules/applauncher/applauncher.js';
import Bar from './modules/bar/bar.js';
import { killOtherNotifDaemons } from './modules/utils/utils.js';
import SCSS from './modules/utils/scss.js';

// Setup
SCSS(); // Compile SCSS
killOtherNotifDaemons(); // Kill other notification daemons

// SCSS Watcher
Utils.subprocess([
	'inotifywait',
	'--recursive',
	'--event', 'create,modify,move,delete',
	'-m', App.configDir + '/assets/styles',
], () => SCSS());

const hyprland = await Service.import('hyprland');

let currentMonitorCount = hyprland.monitors.length;

// Monitor configurations - checks in order until a match is found
const monitorConfigs = [
	{
		name: 'docked-dual-monitor',
		enabled: true,
		condition: (monitors) => {
			const hasHdmi1 = monitors.some(m => m.name === 'HDMI-A-1' && m.id === 1 && !m.disabled);
			const hasDp1 = monitors.some(m => m.name === 'DP-1' && m.id === 2 && !m.disabled);
			return hasHdmi1 && hasDp1;
		},
		barMonitor: 'HDMI-A-1',
	},
	{
		name: 'hdmi-only',
		enabled: true,
		condition: (monitors) => monitors.some(m => m.name === 'HDMI-A-1' && !m.disabled),
		barMonitor: 'HDMI-A-1',
	},
	{
		name: 'laptop-primary',
		enabled: true,
		condition: (monitors) => monitors.some(m => m.name === 'eDP-1' && !m.disabled),
		barMonitor: 'eDP-1',
	},
	{
		name: 'laptop-fallback',
		enabled: true,
		condition: (monitors) => monitors.some(m => /^eDP-\d+$/.test(m.name) && !m.disabled),
		barMonitor: (monitors) => {
			const edp = monitors.find(m => /^eDP-\d+$/.test(m.name) && !m.disabled);
			return edp?.name || null;
		},
	},
	{
		name: 'fallback',
		enabled: true,
		condition: () => true,
		barMonitor: 0,
	},
];

function getPreferredMonitorIndex() {
	const mons = hyprland.monitors;

	// Find the first matching configuration
	for (const config of monitorConfigs) {
		if (config.enabled && config.condition(mons)) {
			const monitorTarget = typeof config.barMonitor === 'function'
				? config.barMonitor(mons)
				: config.barMonitor;

			// If it's a string (monitor name), find its index
			if (typeof monitorTarget === 'string') {
				const idx = mons.findIndex(m => m.name === monitorTarget);
				if (idx !== -1) return idx;
			}
			// If it's a number, return it directly
			else if (typeof monitorTarget === 'number') {
				return monitorTarget;
			}
		}
	}

	// Ultimate fallback
	return 0;
}

let currentTargetIndex = getPreferredMonitorIndex();

function applyWindows(targetIdx) {
	App.config({
		windows: [
			Bar({ monitor: targetIdx }),
			AppLauncher(),
		],
	});
}

// Initial setup
applyWindows(currentTargetIndex);

function reloadBars() {
	const newMonitorCount = hyprland.monitors.length;
	const newTargetIndex = getPreferredMonitorIndex();

	// Reload if monitor count changed OR target monitor changed
	if (newMonitorCount !== currentMonitorCount || newTargetIndex !== currentTargetIndex) {
		currentMonitorCount = newMonitorCount;
		currentTargetIndex = newTargetIndex;

		// Close all windows
		const currentWindows = App.windows.slice();
		currentWindows.forEach((window) => {
			App.closeWindow(window.name);
			App.removeWindow(window);
		});

		// Add new windows
		applyWindows(currentTargetIndex);
	}
}

// Periodically check for monitor changes
setInterval(reloadBars, 1000);
