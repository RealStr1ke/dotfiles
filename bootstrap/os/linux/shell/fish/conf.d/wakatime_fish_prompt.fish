# fish-wakatime
#
# See:
# https://github.com/kama-meshi/fish-wakatime

# Plugin version:
set -g FISH_WAKATIME_VERSION "1.0.0"

function wakatime_fish_prompt -e fish_preexec
    set -l entity (string replace -ra '\n' ' ; ' $history[1] | cut -d ' ' -f1)
    if test -z "$entity"
        return 0
    end

    set -l project
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1
        set project (basename (git rev-parse --show-toplevel))
    else
        set project "Terminal"
    end

    wakatime --write \
        --plugin "fish-wakatime/$FISH_WAKATIME_VERSION" \
        --entity-type app \
        --project "$project" \
        --entity $entity \
        2>&1 >/dev/null &
    set PID %1
    disown $PID
end
