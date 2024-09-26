// Import AGS
import { App, Utils } from './modules/utils/imports.js';

// Modules
import AppLauncher from './modules/applauncher/applauncher.js';
import Bar from './modules/bar/bar.js';

// SCSS Setup
import SCSS from './modules/utils/scss.js';
SCSS();

// Kill all other notification daemons
import { killOtherNotifDaemons } from './modules/utils/utils.js';
killOtherNotifDaemons();

// SCSS Watcher
Utils.subprocess([
	'inotifywait',
	'--recursive',
	'--event', 'create,modify,move,delete',
	'-m', App.configDir + '/assets/styles',
], () => SCSS());

// Main Export
App.config({
	windows: [
		// Bar({ monitor: 0 }),
		Bar({ monitor: 1 }),
		// Bar({ monitor: 2 }),
		AppLauncher(),
	],
});
