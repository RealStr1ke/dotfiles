#!/usr/bin/env bun

import CLI from './src/utils/cli';

async function main() {
	try {
		const cli = new CLI();
		cli.run(process.argv.slice(2));
	} catch (error) {
		console.error('❌ Fatal error:', error);
		process.exit(1);
	}
}

// Only run if this file is executed directly
if (import.meta.main) {
	main();
}