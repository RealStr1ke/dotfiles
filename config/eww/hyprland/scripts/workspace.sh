#! /bin/bash

#define icons for workspaces 1-9
# ic=(0     輸  " " " " )
# ic=(0 1 2 3 4 5 6 7 8 9)
# ic=(0 一 二 三 四 五 六 七 八 九 〇)
ic=(0 一 二 三 四 五 六 七 八 九)

#initial check for occupied workspaces
for num in $(hyprctl workspaces | grep ID | awk '{print $3}'); do 
  export o"$num"="$num"
done
 
#initial check for focused workspace
for num in $(hyprctl monitors | grep -B 4 "focused: yes" | awk 'NR==1{print $3}'); do 
  export f"$num"="$num"
  export fnum=f"$num"
  export mon=$(hyprctl monitors | grep -B 2 "\($num\)" | awk 'NR==1{print $2}')
done

workspaces() {
  if [[ ${1:0:9} == "workspace" ]] && [[ ${1:11} != "special" ]]; then #set focused workspace
    unset -v "$fnum" 
    num=${1:11}
    export f"$num"="$num"
    export fnum=f"$num"

  elif [[ ${1:0:10} == "focusedmon" ]]; then #set focused workspace following monitor focus change
    unset -v "$fnum"
    string=${1:12}
    num=${string##*,}
    export mon=${string/,*/}
    export f"$num"="$num"
    export fnum=f"$num"

  elif [[ ${1:0:13} == "moveworkspace" ]] && [[ ${1##*,} == "$mon" ]]; then #Set focused workspace following swapactiveworkspace
    unset -v "$fnum"
    string=${1:15}
    num=${string/,*/}
    export f"$num"="$num"
    export fnum=f"$num"

  elif [[ ${1:0:15} == "createworkspace" ]]; then #set Occupied workspace
    num=${1:17}
    export o"$num"="$num"
    export onum=o"$num"

  elif [[ ${1:0:16} == "destroyworkspace" ]]; then #unset unoccupied workspace
    num=${1:18}
    unset -v o"$num"
  fi
}
module() {
  # Output EWW Widget
  echo 	"(eventbox :onscroll \"echo {} | sed -e 's/up/e+1/g' -e 's/down/e-1/g' | xargs hyprctl dispatch workspace\" \
            (box	:class \"works\"	:orientation \"h\" :spacing 5 :space-evenly \"false\" :valign \"center\"	\
                (button :onclick \"~/.config/hypr/scripts/tools/workspaces 1\" :class \"ws-btn 0$o1$f1\" \"${ic[1]}\") \
                (button :onclick \"~/.config/hypr/scripts/tools/workspaces 2\'\" :class \"ws-btn 0$o2$f2\" \"${ic[2]}\") \
                (button :onclick \"~/.config/hypr/scripts/tools/workspaces 3\'\" :class \"ws-btn 0$o3$f3\" \"${ic[3]}\") \
                (button :onclick \"~/.config/hypr/scripts/tools/workspaces 4\'\" :class \"ws-btn 0$o4$f4\" \"${ic[4]}\") \
                (button :onclick \"~/.config/hypr/scripts/tools/workspaces 5\'\" :class \"ws-btn 0$o5$f5\" \"${ic[5]}\") \
                (button :onclick \"~/.config/hypr/scripts/tools/workspaces 6\'\" :class \"ws-btn 0$o6$f6\" \"${ic[6]}\") \
                (button :onclick \"~/.config/hypr/scripts/tools/workspaces 7\'\" :class \"ws-btn 0$o7$f7\" \"${ic[7]}\") \
                (button :onclick \"~/.config/hypr/scripts/tools/workspaces 8\'\" :class \"ws-btn 0$o8$f8\" \"${ic[8]}\") \
                (button :onclick \"~/.config/hypr/scripts/tools/workspaces 9\'\" :class \"ws-btn 0$o9$f9\" \"${ic[9]}\") \
            )\
          )"
}

module

socat -u UNIX-CONNECT:/tmp/hypr/"$HYPRLAND_INSTANCE_SIGNATURE"/.socket2.sock - | while read -r event; do 
workspaces "$event"
module
done