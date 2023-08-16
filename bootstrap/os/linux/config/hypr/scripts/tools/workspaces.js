#!/usr/bin/env node
const { execSync } = require('child_process');

function dispatch(dispatcher, monitor, workspace) {
    execSync(`hyprctl dispatch ${dispatcher} ${monitor}${workspace}`);
}

const focused = execSync("hyprctl monitors -j | jq -rc '[ .[].focused ] | index(true)'").toString().replace(/\n$/, '');

dispatch(`${process.argv[2]}`, focused, process.argv[3]);


// console.log(focused);
// console.log(monitors);
// console.log(process.argv.slice(2));
// console.log(JSON.parse(execSync("hyprctl monitors -j").toString()));