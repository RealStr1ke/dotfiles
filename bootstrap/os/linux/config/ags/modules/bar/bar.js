import { Widget } from '../utils/imports.js';
const { Box, CenterBox, Window } = Widget;
import BM from './modules.js';

function Left() {
    const left = Box({
        children: [
            BM.Launcher(),
            BM.Separator(),
            BM.Workspaces(),
            BM.Media(),
        ],
    });
    return left;
}

function Center() {
    const center = Box({
        children: [
            BM.ClientTitle(),
        ],
    });
    return center;
}

function Right() {
    const right = Box({
        halign: 'end',
        children: [
            BM.Notification(),
            // BM.VolumeInfo(),
            BM.NetworkInfo(),
            BM.BatteryInfo(),
            BM.Separator(),
            BM.Clock(),
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
    name: `bar${monitor}`, // name has to be unique
    monitor,
    anchor: ['top', 'left', 'right'],
    exclusive: true,
    child: CenterBox({
        className: 'bar',
        startWidget: Left(),
        centerWidget: Center(),
        endWidget: Right(),
    }),
})
