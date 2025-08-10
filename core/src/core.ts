import * as utils from './utils';
import * as fs from 'fs';
import { isGitpod } from './utils/utils';

class Dotfiles {
	private dotfilesPath: string;

	constructor() {
		this.dotfilesPath = utils.getDotfilesDir();
	}

	install(headless: boolean) {
		// If we're at this point, the dotfiles should already be in .dotfiles
		utils.log('info', 'Installing dotfiles...');

		const platform = utils.getPlatform();

		if (utils.isWindows()) {
			utils.log('warn', 'Windows hasn\'t been fully implemented yet.');
		} else if (utils.isMacOS()) {
			utils.log('warn', 'macOS hasn\'t been fully implemented yet.');
		} else if (utils.isLinux()) {
			utils.log('info', 'Linux detected, proceeding with installation...');

			if (isGitpod) headless = true;
			if (headless) {
				utils.log('info', 'Running in headless mode...');
				// Headless installation logic here
			} else {
				utils.log('info', 'Running in normal mode...');
				// Normal installation logic here
			}
		}
	}

	// status() {
	// 	// Status checking logic here
	// }
}

export default Dotfiles;