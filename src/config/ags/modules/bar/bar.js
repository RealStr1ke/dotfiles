import { Widget } from '../utils/imports.js';
import BM from './modules.js';
const { Box, CenterBox, Window } = Widget;

function Left(monitor) {
	const left = Box({
		children: [
			BM.Launcher(),
			BM.Separator('|'),
			BM.Workspaces(monitor),
			BM.ClientTitle(),
		],
	});
	return left;
}

function Center() {
	const center = Box({
		children: [
			BM.Notification(),
			BM.Separator(),
			BM.Clock('button'),
			BM.Separator(),
			BM.Media(),
		],
	});
	return center;
}

function Right() {
	const right = Box({
		hpack: 'end',
		children: [
			BM.VolumeInfo(),
			BM.NetworkInfo(),
			BM.BatteryInfo(),
			BM.Separator(),
			// BM.SystemInfo(),
			// BM.Separator(),
			BM.SysTray(),
			BM.Separator(),
			BM.PowerMenu(),
		],
	});
	return right;
}

export default monitor => Window({
	name: `bar${monitor.monitor}`, // name has to be unique
	monitor: monitor.monitor,
	anchor: ['top', 'left', 'right'],
	exclusivity: 'exclusive',
	child: CenterBox({
		className: 'bar',
		startWidget: Left(monitor.monitor),
		centerWidget: Center(),
		endWidget: Right(),
	}),
});
