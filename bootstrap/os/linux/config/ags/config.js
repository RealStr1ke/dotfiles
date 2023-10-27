// Import AGS
import { App, Utils } from './modules/utils/imports.js';

// Modules
import Bar from "./modules/bar/bar.js"

// SCSS Setup
import SCSS from "./modules/utils/scss.js";
SCSS();

// SCSS Watcher
Utils.subprocess([
    'inotifywait',
    '--recursive',
    '--event', 'create,modify,move,delete',
    '-m', App.configDir + '/assets/styles',
], () => SCSS());

// Main Export
export default {
    windows: [
        Bar(    { monitor: 0 }),
        // Bar({ monitor: 1 })
    ],
};
