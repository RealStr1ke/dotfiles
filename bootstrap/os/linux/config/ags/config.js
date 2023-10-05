// Modules
import Bar from "./modules/bar/bar.js"

// SCSS Setup
import SCSS from "./modules/utils/scss.js";
SCSS();

// SCSS Watcher
ags.Utils.subprocess([
    'inotifywait',
    '--recursive',
    '--event', 'create,modify,move,delete',
    '-m', ags.App.configDir + '/assets/styles',
], () => SCSS());

// Main Export
export default {
    // style: ags.App.configDir + '/style.css',
    windows: [
        Bar(    { monitor: 0 }),
        // Bar({ monitor: 0 }),
        // Bar({ monitor: 1 })
    ],
};
