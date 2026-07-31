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

  set -l exec_command_str (string split -f1 ' ' "$argv")

  if test "$exec_command_str" = 'exit'
    return 0
  end

  set -l PLUGIN_NAME "ik11235/wakatime.fish"
  set -l PLUGIN_VERSION "0.0.7"

  set -l wakatime_path

  if type -q wakatime-cli
    set wakatime_path (command -v wakatime-cli)
  else if test -x "$HOME/.wakatime/wakatime-cli"
    set wakatime_path "$HOME/.wakatime/wakatime-cli"
  else if type -q wakatime
    set wakatime_path (command -v wakatime)
  else
    echo "wakatime-cli command not found. Please install wakatime-cli from \"https://github.com/wakatime/wakatime-cli\"."
    return 1
  end

  set -l project
  if git rev-parse --is-inside-work-tree &> /dev/null
    set project (basename (git rev-parse --show-toplevel))
  else
    set project "Terminal"
  end

  $wakatime_path --write --plugin "$PLUGIN_NAME/$PLUGIN_VERSION" --entity-type app --project "$project" --entity "$exec_command_str" &> /dev/null &; disown
end
