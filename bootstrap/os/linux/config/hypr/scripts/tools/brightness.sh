#!/usr/bin/env sh

# Cache variable
cachedBrightness=""

# Function to control brightness
controlBrightness() {
	action=$1
	value=$2

	case $action in
		"set") light -S "$value" ;;
		"inc"|"increase") light -A 5 ;;
		"dec"|"decrease") light -U 5 ;;
	esac
	cachedBrightness=""
}

# Function to get brightness state
getBrightnessState() {
	# Get brightness if not cached
	[ -z "$cachedBrightness" ] && cachedBrightness=$(light)
	brightness=$cachedBrightness

	echo "$brightness"
}

# Function to update wob
updateWob() {
	brightness=$1

	# Omit decimal places
	brightness=${brightness%.*}

	echo "$brightness" > /tmp/wobpipe
}

# Main execution
action=$1
value=$2

case $action in
	"set"|"+"|"inc"|"increase"|"-"|"dec"|"decrease")
		controlBrightness "$action" "$value"
		brightness=$(getBrightnessState)
		updateWob "$brightness"
		;;
	"get")
		brightness=$(getBrightnessState)
		echo "$brightness"
		;;
	*)
		echo "Usage: brightness [action: +|-|increase|decrease|inc|dec|set|get] <value if applicable>" >&2
		exit 1
		;;
esac

exit 0
