import { Widget, App, Applications } from '../utils/imports.js';
const windowName = 'applauncher';
const { Button, Box, Label, Entry, Scrollable, Window, Icon } = Widget;
/** @param {import('../utils/imports.js'),Applications.Application} app */
function AppItem(app) {
	return Button({
		className: 'al-item',
		on_clicked: () => {
			App.closeWindow(windowName);
			app.launch();
		},
		setup: self => self.app = app,
		child: Box({
			children: [
				Icon({
					icon: app.icon_name || '',
					size: 40,
				}),
				Box({
					vertical: true,
					vpack: 'center',
					children: [
						Label({
							class_name: 'al-item-title',
							label: app.name,
							xalign: 0,
							vpack: 'center',
							truncate: 'end',
						}),
						// short circuit if there is no description
						// !!app.description && Label({
						//     class_name: 'description',
						//     label: app.description || '',
						//     wrap: true,
						//     xalign: 0,
						//     justification: 'left',
						//     vpack: 'center',
						// }),
					],
				}),
			],
		}),
	});
}

function Applauncher({ width = 500, height = 500, spacing = 12 } = {}) {
	const list = Box({
		className: 'al-list',
		vertical: true,
		spacing,
	});

	const entry = Entry({
		hexpand: true,
		css: `margin-bottom: ${spacing}px;`,
		className: 'al-entry',

		// set some text so on-change works the first time
		text: '-',

		// to launch the first item on Enter
		on_accept: ({ text }) => {
			const list = Applications.query(text || '');
			if (list[0]) {
				App.toggleWindow(windowName);
				list[0].launch();
			}
		},

		// filter out the list
		on_change: ({ text }) => list.children.map(item => {
			item.visible = item.app.match(text);
		}),
	});

	return Box({
		className: 'applauncher',
		vertical: true,
		css: `margin: ${spacing * 2}px;`,
		children: [
			entry,

			// wrap the list in a scrollable
			Scrollable({
				hscroll: 'never',
				css: `
                    min-width: ${width}px;
                    min-height: ${height}px;
                `,
				child: list,
			}),
		],

		// make entry.text empty on launch
		// and update the list's children so it is sorted by frequency
		connections: [[App, (_, name, visible) => {
			if (name !== windowName) {return;}

			list.children = Applications.list.map(AppItem);

			entry.text = '';
			if (visible) {entry.grab_focus();}
		}]],
	});
}

export default () => Window({
	name: windowName,
	popup: true,
	visible: false,
	focusable: true,
	child: Applauncher({
		width: 500,
		height: 500,
		spacing: 12,
	}),
});
