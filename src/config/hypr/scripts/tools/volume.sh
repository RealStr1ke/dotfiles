#!/usr/bin/env sh

# Cache variables
cachedVolume=""
cachedMute=""
cachedMicVolume=""
cachedMicMute=""

# Function to control volume
controlVolume() {
	action=$1
	value=$2

	case $action in
		"set") pactl set-sink-volume @DEFAULT_SINK@ "${value}%" ;;
		"inc"|"increase") pactl set-sink-volume @DEFAULT_SINK@ +5% ;;
		"dec"|"decrease") pactl set-sink-volume @DEFAULT_SINK@ -5% ;;
		"togglemute"|"mute"|"unmute") pactl set-sink-mute @DEFAULT_SINK@ toggle; cachedMute="" ;;
	esac
	cachedVolume=""
}

# Function to control microphone volume
controlMic() {
	action=$1
	value=$2

	case $action in
		"set") pactl set-source-volume @DEFAULT_SOURCE@ "${value}%" ;;
		"inc"|"increase") pactl set-source-volume @DEFAULT_SOURCE@ +5% ;;
		"dec"|"decrease") pactl set-source-volume @DEFAULT_SOURCE@ -5% ;;
		"togglemute"|"mute"|"unmute") pactl set-source-mute @DEFAULT_SOURCE@ toggle; cachedMicMute="" ;;
	esac
	cachedMicVolume=""
}

# Function to get volume and mute state
getState() {
	# Get volume if not cached
	[ -z "$cachedVolume" ] && cachedVolume=$(pamixer --get-volume)
	volume=$cachedVolume

	# Get mute state if not cached
	[ -z "$cachedMute" ] && {
		muteStatus=$(pactl list sinks | grep "Mute:" || echo "Mute: no")
		[ "${muteStatus#*: }" = "yes" ] && cachedMute="true" || cachedMute="false"
	}
	mute=$cachedMute

	echo "$volume $mute"
}

# Function to get microphone state
getMicState() {
	# Get mic volume if not cached
	[ -z "$cachedMicVolume" ] && cachedMicVolume=$(pamixer --source @DEFAULT_SOURCE@ --get-volume)
	micVolume=$cachedMicVolume

	# Get mic mute state if not cached
	[ -z "$cachedMicMute" ] && {
		micMuteStatus=$(pactl list sources | grep "Mute:" || echo "Mute: no")
		[ "${micMuteStatus#*: }" = "yes" ] && cachedMicMute="true" || cachedMicMute="false"
	}
	micMute=$cachedMicMute

	echo "$micVolume $micMute"
}

# Function to get icon based on volume and mute state
getIcon() {
	volume=$1
	mute=$2

	if [ "$volume" -eq 0 ] || [ "$mute" = "true" ]; then
		echo "󰝟"  # muted
	elif [ "$volume" -le 25 ]; then
		echo "󰕿"  # low volume
	elif [ "$volume" -le 50 ]; then
		echo "󰖀"  # medium volume
	elif [ "$volume" -le 75 ]; then
		echo "󰕾"  # high volume
	else
		echo "󰕾"  # max volume
	 fi
}

# Function to update wob
updateWob() {
	volume=$1
	mute=$2

	if [ "$mute" = "true" ]; then
		echo 0 > /tmp/wobpipe
	else
		echo "$volume" > /tmp/wobpipe
	fi
}

# Main execution
type=$1
action=$2
value=$3

case $type in
	"output"|"volume"|"vol")
		controlVolume "$action" "$value"
		state=$(getState)
		volume=${state% *}
		mute=${state#* }
		updateWob "$volume" "$mute"
		;;
	"input"|"microphone"|"mic")
		controlMic "$action" "$value"
		micState=$(getMicState)
		;;
	"icon")
		state=$(getState)
		volume=${state% *}
		mute=${state#* }
		getIcon "$volume" "$mute"
		;;
	"get")
		state=$(getState)
		volume=${state% *}
		echo "$volume"
		;;
	*)
		echo "Usage: volume [output|input|volume|microphone|vol|mic] [action: +|-|increase|decrease|inc|decrease|mute|unmute|togglemute|set] <value if applicable>" >&2
		exit 1
		;;
esac

exit 0
