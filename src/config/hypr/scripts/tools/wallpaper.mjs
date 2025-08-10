#!/usr/bin/env zx

import { $, fs } from 'zx';
import chalk from 'chalk';

// Start swww if it hasn't already started
try {
	await $`swww query`.quiet();
} catch {
	await $`hyprctl dispatch exec swww-daemon`;
}

// Set directory for wallpapers
const wallDir = `${process.env.HOME}/.dotfiles/assets/wallpapers/current`;
const fallback = `${process.env.HOME}/.dotfiles/assets/wallpapers/collection/catppuccin/cat-sound.png`;

// Function to set wallpaper
async function setWallpaper(path) {
	await $`swww img ${path} --transition-type grow --transition-fps 144 --transition-duration 5 --transition-step 255 --transition-bezier 0.32,0.0,0.67,0.0`;
	console.log(chalk.green(`Set wallpaper to ${path}`));
	// Set global env SWWW_WALL to the path of the current wallpaper
	// await $`hyprctl dispatch exec 'export SWWW_WALL=${path}'`;
}

// Get command argument
const [arg, value] = process.argv.slice(3);
let wallpaper = '';

if (!arg) {
	wallpaper = fallback;
} else if (arg === 'random') {
	const files = await fs.readdir(wallDir);
	wallpaper = `${wallDir}/${files[Math.floor(Math.random() * files.length)]}`;
} else if (arg === 'set' && value) {
	if (fs.existsSync(value)) {
		let fileType = (await $`file ${value}`).toString();
		if (fileType.includes('symbolic link')) fileType = (await $`file ${await fs.readlink(value)}`).toString();
		if (fileType.includes('image data')) {
			wallpaper = value;
		} else {
			wallpaper = fallback;
		}
	} else {
		wallpaper = fallback;
	}
} else if (arg === 'shuffle') {
	while (true) {
		const files = await fs.readdir(wallDir);
		wallpaper = `${wallDir}/${files[Math.floor(Math.random() * files.length)]}`;
		await setWallpaper(wallpaper);
		console.log(chalk.green(`Set wallpaper to ${wallpaper}`));
		await sleep(20000);
	}
} else {
	wallpaper = fallback;
}

if (arg !== 'shuffle') {
	await setWallpaper(wallpaper);
}
