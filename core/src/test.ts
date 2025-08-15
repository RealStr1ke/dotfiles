// import toml from 'toml';
// import fs from 'fs';

// const configContent = fs.readFileSync('/home/str1ke/.dotfiles/src/config.toml', 'utf-8');
// const config = toml.parse(configContent);

// console.log(Object.keys(config.symlinks));

import Dotfiles from './core';

const dotfiles = new Dotfiles();
dotfiles.loadConfig();
dotfiles.checkRequirements();
dotfiles.symlink(true);