// Import AGS + modules + other imports
import { App, Utils, Service, Hyprland } from './modules/utils/imports.js';
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

function createBars() {
	const bars = hyprland.monitors.map((monitor, index) => Bar({ monitor: index }));
	// return bars;
	return bars[0]; // temporarily only return the first bar due to lag issues
}

function reloadBars() {
	const newMonitorCount = hyprland.monitors.length;
	console.log(`Current monitor count: ${newMonitorCount}`);
	if (newMonitorCount !== currentMonitorCount) {
		console.log(`Monitor count changed from ${currentMonitorCount} to ${newMonitorCount}, reloading bars...`);
		currentMonitorCount = newMonitorCount;

		// Close all windows
		const currentWindows = App.windows;
		currentWindows.forEach((window) => {
			console.log(`Closing window ${window.name}`);
			App.closeWindow(window.name);
			App.removeWindow(window);
		});

		// Add new windows
		App.config({
			windows: [
				// ...createBars(),
				Bar({ monitor: 0 }),
				// Bar({ monitor: 1 }),
				AppLauncher(),
			],
		});
	}
}

// Initial setup
App.config({
	windows: [
		// ...createBars(),
		Bar({ monitor: 0 }),
		// Bar({ monitor: 1 }),
		AppLauncher(),
	],
});

// Periodically check for monitor changes
setInterval(reloadBars, 1000);
