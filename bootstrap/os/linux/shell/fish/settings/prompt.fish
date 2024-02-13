# If the starship binary exists, use it as the prompt
if test -f (whereis starship | cut -d ' ' -f 2)
    starship init fish | source
end