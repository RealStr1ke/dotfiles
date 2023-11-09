# Prepend a directory to PATH if it is not already in PATH
function prepend-path
    set -l path $argv[1]
    set -l dir $argv[2]
    if not contains $dir $path
        set -l path $dir $path
    end
    echo $path
end

# Compile and run C/C++ program with clang(++)
# Executable file is created in ~/.local/tmp and removed after program exit
function cmc -d "Compile and run C/C++ program with clang++"
    set -l curdir (pwd)
    set -l dirname (ditname $argv[1])
    set -l filename (basename $argv[1])
    set -l extension (string match -r '\.[^.]*$' $filename)
    set -l filename (string replace -r '\.[^.]*$' '' $filename)

    # Print Debug Info
	echo "==== START DEBUG ===="
	echo "Current Directory: $curdir"
	echo "File Directory: $dirname"
	echo "File Name: $filename"
	echo "File Extension: $extension"
	echo "==== END DEBUG ===="

    # If a file is a C/C++ source file, use clang or clang++ (respectively) to compile and run it
    if test $extension = ".c"
        clang -o ~/.local/tmp/$filename $argv[1] && ~/.local/tmp/$filename
    else if test $extension = ".cpp"
        clang++ -o ~/.local/tmp/$filename $argv[1] && ~/.local/tmp/$filename
    else
        echo "File is not a C/C++ source file"
    end

    # Run the executable file
    echo "==== START PROGRAM ===="
    echo ""
    ~/.local/tmp/$filename
    echo ""
    echo "==== END PROGRAM ===="

    # Remove the executable file
    rm ~/.local/tmp/$filename

end

# TODO: Demonstrate tput color combinations
# TODO: Color table

# Markdown
function md
    # pandoc $argv[1] | lynx -stdin -dump
    glow $argv[1]
end

# Print current directory name
function pwdn
    echo (basename (pwd))
end

# Create a directory and enter it
function mkd
  	mkdir -p "$argv[1]" && cd "$_";
end

# TODO: Create a zip file recursively from a given directory


