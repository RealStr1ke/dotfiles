# Visual Studio Code
# This was written due to a recent UnknownError bug w/ marketplace signatures
# As of 12/25/22

echo "→ Installing VSCode extensions..."
input="$DOTFILES/packages/Codefile"
while IFS= read -r line
do
	code-insiders --install-extension $line
done < "$input"