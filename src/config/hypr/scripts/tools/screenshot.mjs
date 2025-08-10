#!/usr/bin/env zx
// Custom script for screenshotting w/ Hyprland
// Usage: screenshot [full | slurp | flameshot | swappy | satty]

import { $ } from 'zx';
import chalk from 'chalk';

const filename = `Screenshot-[${new Date().toISOString().split('T')[0]}]-(${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}).png`;
const arg = process.argv[3];

if (arg === 'full') {
	console.log(chalk.yellow('This feature is not yet implemented.'));
} else if (arg === 'slurp') {
	console.log(chalk.yellow('This feature is not yet implemented.'));
} else if (arg === 'flameshot') {
	// Set environment variables for Flameshot
	process.env.XDG_CURRENT_DESKTOP = 'sway';

	// Get current monitor info
	// const activeWorkspace = JSON.parse((await $`hyprctl activeworkspace -j`).toString());
	// const monitors = JSON.parse((await $`hyprctl monitors -j`).toString());
	// const monitorId = monitorInfo.monitorID;
	// const monitorName = monitorInfo.monitor;

	// Take screenshot with Flameshot
	console.log(chalk.gray('Taking screenshot with Flameshot...'));
	const output = await $`flameshot gui --path ~/Pictures/Screenshots/${filename}`.quiet();

	// Copy to clipboard
	if (output.toString().includes('Screenshot aborted')) {
		console.log(chalk.yellow('Screenshot aborted. No region was selected.'));
		await $`notify-send "Screenshot aborted." "No region was selected."`;
	} else {
		console.log(chalk.green('Screenshot taken! Saved to ~/Pictures/Screenshots'));
		await $`wl-copy < ~/Pictures/Screenshots/${filename}`;
		await $`notify-send "Screenshot Taken!" "Saved to ~/Pictures/Screenshots" -i ~/Pictures/Screenshots/${filename}`;
	}
} else if (arg === 'swappy') {
	console.log(chalk.yellow('This feature is not yet implemented.'));
} else if (arg === 'satty') {
	console.log(chalk.yellow('This feature is not yet implemented.'));
} else {
	console.log(chalk.red('Invalid argument.'));
	console.log(chalk.yellow('Usage: screenshot [full | slurp | flameshot | swappy | satty]'));
}

// Old script using slurp and grim idk
/**
{
	const date = new Date().toISOString().split('T')[0];
	const time = new Date().toTimeString().split(' ')[0];

	if (process.argv[3] === 'select') {
		// Take selected area screenshot
		const screenshotPath = `${process.env.HOME}/Pictures/Screenshots/Screenshot from ${date}= ${time}.png`;
		const selection = await $`slurp`;
		await $`grim -g "${selection}" "${screenshotPath}"`;
		await $`wl-copy < "${screenshotPath}"`;

		// Send notification
		await $`notify-send "Screenshot Taken!" "Saved to ~/Pictures/Screenshots" -i "${screenshotPath}"`;
	} else {
		// Take full screenshot
		const screenshotPath = `${process.env.HOME}/Pictures/Screenshots/Screenshot from ${date}= ${time}.png`;
		await $`grim "${screenshotPath}"`;
		await $`wl-copy < "${screenshotPath}"`;

		// Send notification
		await $`notify-send "Screenshot Taken!" "Saved to ~/Pictures/Screenshots" -i "${screenshotPath}"`;
	}
}
**/