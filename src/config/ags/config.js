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

// Pick HDMI-A-1 if BOTH HDMI-A-1(id:1) and DP-1(id:2) exist, else pick eDP-1 (fallback to any eDP-* if needed)
function getPreferredMonitorIndex() {
	const mons = hyprland.monitors;

	const hasHdmi1 = mons.some(m => m.name === 'HDMI-A-1' && m.id === 1 && !m.disabled);
	const hasDp1 = mons.some(m => m.name === 'DP-1' && m.id === 2 && !m.disabled);

	if (hasHdmi1 && hasDp1) {
		const idx = mons.findIndex(m => m.name === 'HDMI-A-1');
		return idx !== -1 ? idx : 0;
	}

	// Default to eDP-1; if not present (e.g. eDP-2), fallback to first eDP-*
	let idx = mons.findIndex(m => m.name === 'eDP-1');
	if (idx === -1) idx = mons.findIndex(m => /^eDP-\d+$/.test(m.name));
	return idx !== -1 ? idx : 0;
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
