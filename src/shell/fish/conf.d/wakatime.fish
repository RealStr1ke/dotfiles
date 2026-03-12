###
# wakatime.fish
#
# hook script to send wakatime a tick (unofficial)
# see: https://github.com/ik11235/wakatime.fish
###

function __register_wakatime_fish_before_exec -e fish_postexec
  if set -q FISH_WAKATIME_DISABLED
    return 0
  end
  
  set -l exec_command_str

  set exec_command_str (string split -f1 ' ' "$argv")

  if test "$exec_command_str" = 'exit'
    return 0
  end

  set -l PLUGIN_NAME "ik11235/wakatime.fish"
  set -l PLUGIN_VERSION "0.0.6"

  set -l project
  set -l wakatime_path

  if type -p wakatime 2>&1 > /dev/null
    set wakatime_path (type -p wakatime)
  else if type -p ~/.wakatime/wakatime-cli 2>&1 > /dev/null
    set wakatime_path (type -p ~/.wakatime/wakatime-cli)
  else
    echo "wakatime command not found. Please read \"https://wakatime.com/terminal\" and install wakatime."
    return 1
  end

  if git rev-parse --is-inside-work-tree &> /dev/null
    set project (basename (git rev-parse --show-toplevel))
  else
    set project "Terminal"
  end

  $wakatime_path --write --plugin "$PLUGIN_NAME/$PLUGIN_VERSION" --entity-type app --project "$project" --entity "$exec_command_str" &> /dev/null&; disown
end
