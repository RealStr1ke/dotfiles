echo "→ Installing packages..."

cd "$DOTFILES/packages"

# Homebrew
echo "→ Installing Homebrew taps, formulae, and casks..."
brew bundle

# NPM
echo "→ Installing NPM packages globally..."
input="$DOTFILES/packages/npmfile"
while IFS= read -r line
do
	"npm install -g $line"
done < "$input"

# Visual Studio Code
echo "→ Installing VSCode extensions..."
input="$DOTFILES/packages/Codefile"
while IFS= read -r line
do
	"code --install-extension $line"
done < "$input"

# Pip (Python)
echo "→ Installing PIP packages..."
input="$DOTFILES/packages/pipfile"
while IFS= read -r line
do
	"pip install $line"
done < "$input"

unset input

echo "→ Installation complete! All packages have been installed."

