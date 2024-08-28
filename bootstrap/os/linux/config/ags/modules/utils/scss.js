import { App, Utils } from './imports.js';
const { exec, ensureDirectory } = Utils;

export default () => {
	try {
		const tmp = '/tmp/ags/scss';
		ensureDirectory(tmp);

		exec(`sassc ${App.configDir}/assets/styles/main.scss ${tmp}/main.css`);
		App.resetCss();
		App.applyCss(`${tmp}/main.css`);
	} catch (error) {
		console.error(error);
	}
};