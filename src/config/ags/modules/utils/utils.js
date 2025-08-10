import { Utils } from './imports.js';
const { exec, execAsync } = Utils;
export function killOtherNotifDaemons() {
	const list = ['dunst', 'mako', 'swaync' ];
	for (let i = 0; i < list.length; i++) {
		try {
			exec(`pkill ${list[i]}`);
		} catch {
			console.warn(`Failed to kill ${list[i]}`);
		}
	}
	console.log('Successfully killed all other running notification daemons');
}
