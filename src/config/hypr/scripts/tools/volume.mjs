#!/usr/bin/env zx
// Not in use atm because it's kinda slow (as in like 100ms of delay or smth idk)

let cachedVolume = null;
let cachedMute = null;

// Volume control function
async function controlVolume(action, value) {
	switch (action) {
		case 'set':
			await $`pactl set-sink-volume @DEFAULT_SINK@ ${value}%`;
			break;
		case 'inc':
			await $`pactl set-sink-volume @DEFAULT_SINK@ +5%`;
			break;
		case 'dec':
			await $`pactl set-sink-volume @DEFAULT_SINK@ -5%`;
			break;
		case 'toggle':
			await $`pactl set-sink-mute @DEFAULT_SINK@ toggle`;
			cachedMute = null; // Invalidate mute cache
			break;
	}
	cachedVolume = null; // Invalidate volume cache
}

// Volume getter function
async function getState() {
	if (cachedVolume === null) {
		cachedVolume = parseInt((await $`pamixer --get-volume`).toString());
	}
	if (cachedMute === null) {
		try {
			const muteStatus = (await $`pactl list sinks | grep "Mute:"`).toString();
			cachedMute = muteStatus.includes('yes');
		} catch (error) {
			cachedMute = false; // Default to unmuted if command fails
		}
	}
	return { volume: cachedVolume, mute: cachedMute };
}

// Get icon based on volume and mute state
function getIcon(state) {
	if (state.volume === 0 || state.mute) return 'ﱝ';
	if (state.volume <= 30) return '奄';
	if (state.volume <= 60) return '奔';
	return '墳';
}

// Update wob with current volume
async function updateWob(state) {
	await $`echo ${state.mute ? 0 : state.volume} > /tmp/wobpipe`;
}

// Main execution
const [arg, value] = process.argv.slice(3);

(async () => {
	try {
		let state;
		switch (arg) {
			case 'set':
				await controlVolume('set', value);
				state = await getState();
				await updateWob(state);
				break;
			case '+':
			case 'inc':
			case 'increase':
				await controlVolume('inc');
				state = await getState();
				await updateWob(state);
				break;
			case '-':
			case 'dec':
			case 'decrease':
				await controlVolume('dec');
				state = await getState();
				await updateWob(state);
				break;
			case 'mute':
				await controlVolume('toggle');
				state = await getState();
				await updateWob(state);
				break;
			case 'icon':
				state = await getState();
				console.log(getIcon(state));
				break;
			case 'get':
				state = await getState();
				console.log(state.volume);
				break;
			default:
				console.error('Usage: volume [set <value> | + | - | mute | icon | get]');
				process.exit(1);
		}
	} catch (error) {
		console.error('Error:', error.message);
		process.exit(1);
	}
})();
