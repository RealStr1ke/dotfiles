/**
 * Universal Theme Engine - Refined System
 *
 * Handles theme loading, accent variations, and cross-application theming
 * Supports both preset themes and wallpaper-generated themes
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';

/**
 * Type definitions for the theme system
 */
export interface ThemeStructure {
	name: string;
	default_accent: string;
	background: {
		primary: string;
		secondary: string;
		tertiary: string;
	};
	text: {
		primary: string;
		secondary: string;
		tertiary: string;
		inverse: string;
	};
	border: {
		primary: string;
		secondary: string;
		focus: string; // Will be replaced with accent.base
	};
	interactive: {
		primary: string; // Will be replaced with accent.base
		secondary: string; // Will be replaced with accent.dim
		hover: string; // Will be replaced with accent.light
	};
	semantic: {
		success: string;
		warning: string;
		error: string;
	};
	palette?: Record<string, string>; // Optional, only for preset themes
}

export interface AccentVariations {
	base: string;
	light: string;
	dark: string;
	dim: string;
}

export interface ResolvedTheme extends ThemeStructure {
	accent: AccentVariations;
	resolved_accent: string;
	accent_source: 'hex' | 'palette' | 'default' | 'extracted';
}

/**
 * Color utilities
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16),
	} : null;
}

function rgbToHex(r: number, g: number, b: number): string {
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function lighten(hex: string, percent: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;

	const r = Math.min(255, rgb.r + (255 - rgb.r) * (percent / 100));
	const g = Math.min(255, rgb.g + (255 - rgb.g) * (percent / 100));
	const b = Math.min(255, rgb.b + (255 - rgb.b) * (percent / 100));

	return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

function darken(hex: string, percent: number): string {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;

	const r = Math.max(0, rgb.r - (rgb.r * (percent / 100)));
	const g = Math.max(0, rgb.g - (rgb.g * (percent / 100)));
	const b = Math.max(0, rgb.b - (rgb.b * (percent / 100)));

	return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
}

function dim(hex: string, percent: number, background: string = '#000000'): string {
	const rgb = hexToRgb(hex);
	const bgRgb = hexToRgb(background);
	if (!rgb || !bgRgb) return hex;

	const alpha = (100 - percent) / 100;

	const r = Math.round(rgb.r * alpha + bgRgb.r * (1 - alpha));
	const g = Math.round(rgb.g * alpha + bgRgb.g * (1 - alpha));
	const b = Math.round(rgb.b * alpha + bgRgb.b * (1 - alpha));

	return rgbToHex(r, g, b);
}

/**
 * Accent variation generator
 */
function generateAccentVariations(baseColor: string): AccentVariations {
	return {
		base: baseColor,
		light: lighten(baseColor, 15), // 15% lighter for hover states
		dark: darken(baseColor, 15), // 15% darker for active states
		dim: dim(baseColor, 40, '#1e1e2e'), // 40% opacity for subtle elements
	};
}

/**
 * Resolve accent color from user input
 */
function resolveAccentColor(
	theme: any,
	userAccent?: string,
): { color: string; source: 'hex' | 'palette' | 'default' } {
	// Priority 1: Custom hex color
	if (userAccent && userAccent.startsWith('#')) {
		return { color: userAccent, source: 'hex' };
	}

	// Priority 2: Palette color (for preset themes)
	if (userAccent && theme.palette && theme.palette[userAccent]) {
		return { color: theme.palette[userAccent], source: 'palette' };
	}

	// Priority 3: Theme default accent (palette name for presets, hex for wallpapers)
	if (theme.default_accent) {
		if (theme.palette && theme.palette[theme.default_accent]) {
			return { color: theme.palette[theme.default_accent], source: 'default' };
		} else if (theme.default_accent.startsWith('#')) {
			return { color: theme.default_accent, source: 'default' };
		}
	}

	// Priority 4: Hard fallback
	return { color: '#cba6f7', source: 'default' };
}

// Get directory paths
const THEME_PRESET_DIR = join(__dirname, '../themes/presets');
const THEME_TEMPLATE_DIR = join(__dirname, '../themes/templates');

/**
 * Main theme engine class
 */
export class ThemeEngine {
	private loadedThemes = new Map<string, ThemeStructure>();

	/**
	 * Load a theme from preset or generate from wallpaper
	 */
	async loadTheme(name: string, accentOverride?: string): Promise<ResolvedTheme> {
		// Check if it's a wallpaper path
		if (name.includes('/') || name.endsWith('.jpg') || name.endsWith('.png')) {
			return this.generateFromWallpaper(name, accentOverride);
		}

		// Load preset theme
		return this.loadPresetTheme(name, accentOverride);
	}

	/**
	 * Load a preset theme from JSON
	 */
	private async loadPresetTheme(name: string, accentOverride?: string): Promise<ResolvedTheme> {
		// Check cache first
		if (!this.loadedThemes.has(name)) {
			const themeFile = join(THEME_PRESET_DIR, `${name}.json`);

			try {
				const content = await fs.readFile(themeFile, 'utf-8');
				const theme: ThemeStructure = JSON.parse(content);
				this.loadedThemes.set(name, theme);
			} catch (error: any) {
				throw new Error(`Failed to load theme '${name}': ${error.message}`);
			}
		}

		const theme = this.loadedThemes.get(name)!;
		return this.resolveTheme(theme, accentOverride);
	}

	/**
	 * Generate theme from wallpaper colors
	 */
	private async generateFromWallpaper(wallpaperPath: string, accentOverride?: string): Promise<ResolvedTheme> {
		try {
			// Import Vibrant for color extraction
			const { Vibrant } = (await import('node-vibrant/node'));

			// Extract colors from image
			const palette = await Vibrant.from(wallpaperPath).getPalette();

			// Extract and sort colors by population
			const colors = Object.values(palette)
				.filter((swatch: any) => swatch !== null)
				.sort((a: any, b: any) => b.population - a.population);

			if (colors.length === 0) {
				throw new Error('Could not extract colors from image');
			}

			// Build color scheme from extracted colors
			const dominantColor = (colors[0] as any).hex;
			const vibrantColor = (palette as any).Vibrant?.hex || dominantColor;
			const darkMutedColor = (palette as any).DarkMuted?.hex || darken(dominantColor, 30);
			const lightMutedColor = (palette as any).LightMuted?.hex || lighten(dominantColor, 30);
			const mutedColor = (palette as any).Muted?.hex || dominantColor;

			// Determine if image is light or dark themed
			const isDarkTheme = this.isColorDark(dominantColor);

			const baseTheme: ThemeStructure = {
				name: `Generated: ${wallpaperPath.split('/').pop()}`,
				default_accent: '', // Not used for wallpaper themes
				background: {
					primary: isDarkTheme ? darkMutedColor : lightMutedColor,
					secondary: isDarkTheme ? darken(darkMutedColor, 10) : darken(lightMutedColor, 5),
					tertiary: isDarkTheme ? lighten(darkMutedColor, 10) : lighten(lightMutedColor, 5),
				},
				text: {
					primary: isDarkTheme ? lightMutedColor : darkMutedColor,
					secondary: isDarkTheme ? mutedColor : darken(mutedColor, 20),
					tertiary: isDarkTheme ? darken(mutedColor, 10) : darken(mutedColor, 30),
					inverse: isDarkTheme ? darkMutedColor : lightMutedColor,
				},
				border: {
					primary: isDarkTheme ? lighten(darkMutedColor, 20) : darken(lightMutedColor, 20),
					secondary: isDarkTheme ? lighten(darkMutedColor, 10) : darken(lightMutedColor, 10),
					focus: 'accent.base',
				},
				interactive: {
					primary: 'accent.base',
					secondary: 'accent.dim',
					hover: 'accent.light',
				},
				semantic: {
					success: '#22c55e', // Green
					warning: '#f59e0b', // Amber
					error: '#ef4444', // Red
				},
			};

			console.log(`🎨 Extracted colors from ${wallpaperPath}:`);
			console.log(`  Dominant: ${dominantColor}`);
			console.log(`  Vibrant: ${vibrantColor}`);
			console.log(`  Theme: ${isDarkTheme ? 'Dark' : 'Light'}`);

			// For wallpaper themes, use the extracted vibrant color directly as accent
			const finalAccent = accentOverride || vibrantColor;
			const accent = generateAccentVariations(finalAccent);

			return {
				...baseTheme,
				accent,
				resolved_accent: finalAccent,
				accent_source: accentOverride ? 'hex' : 'extracted',
			};
		} catch (error: any) {
			console.error(`Failed to extract colors from ${wallpaperPath}: ${error.message}`);
			console.log('Falling back to default theme structure...');

			// Fallback to basic theme structure
			const baseTheme: ThemeStructure = {
				name: `Generated: ${wallpaperPath.split('/').pop()}`,
				default_accent: 'primary',
				background: {
					primary: '#1e1e2e',
					secondary: '#181825',
					tertiary: '#313244',
				},
				text: {
					primary: '#cdd6f4',
					secondary: '#bac2de',
					tertiary: '#a6adc8',
					inverse: '#1e1e2e',
				},
				border: {
					primary: '#585b70',
					secondary: '#45475a',
					focus: 'accent.base',
				},
				interactive: {
					primary: 'accent.base',
					secondary: 'accent.dim',
					hover: 'accent.light',
				},
				semantic: {
					success: '#a6e3a1',
					warning: '#f9e2af',
					error: '#f38ba8',
				},
			};

			return this.resolveTheme(baseTheme, accentOverride);
		}
	}

	/**
	 * Helper: Check if a color is dark
	 */
	private isColorDark(hex: string): boolean {
		const rgb = hexToRgb(hex);
		if (!rgb) return false;
		const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
		return brightness < 128;
	}

	/**
	 * Resolve theme with accent variations
	 */
	private resolveTheme(theme: ThemeStructure, accentOverride?: string): ResolvedTheme {
		// Resolve accent color
		const accentResult = resolveAccentColor(theme, accentOverride);

		// Generate accent variations
		const accent = generateAccentVariations(accentResult.color);

		return {
			...theme,
			accent,
			resolved_accent: accentResult.color,
			accent_source: accentResult.source,
		};
	}

	/**
	 * Apply theme to specific application
	 */
	async applyTheme(theme: ResolvedTheme, application: string): Promise<void> {
		const templateFile = join(THEME_TEMPLATE_DIR, `${application}-active.scss`);

		try {
			// Read template
			const template = await fs.readFile(templateFile, 'utf-8');

			// Apply theme colors to template
			const compiled = this.compileTemplate(template, theme);

			// Write to application config
			const outputPath = this.getApplicationConfigPath(application);
			await this.ensureDirectoryExists(dirname(outputPath));
			await fs.writeFile(outputPath, compiled);

			console.log(`✓ Applied theme '${theme.name}' to ${application}`);
		} catch (error: any) {
			console.error(`✗ Failed to apply theme to ${application}: ${error.message}`);
		}
	}

	/**
	 * Compile template with theme variables using {{ }} format
	 */
	private compileTemplate(template: string, theme: ResolvedTheme): string {
		let compiled = template;

		// Replace background colors
		compiled = compiled.replace(/\{\{background\.primary\}\}/g, theme.background.primary);
		compiled = compiled.replace(/\{\{background\.secondary\}\}/g, theme.background.secondary);
		compiled = compiled.replace(/\{\{background\.tertiary\}\}/g, theme.background.tertiary);

		// Replace text colors
		compiled = compiled.replace(/\{\{text\.primary\}\}/g, theme.text.primary);
		compiled = compiled.replace(/\{\{text\.secondary\}\}/g, theme.text.secondary);
		compiled = compiled.replace(/\{\{text\.tertiary\}\}/g, theme.text.tertiary);
		compiled = compiled.replace(/\{\{text\.inverse\}\}/g, theme.text.inverse);

		// Replace border colors
		compiled = compiled.replace(/\{\{border\.primary\}\}/g, theme.border.primary);
		compiled = compiled.replace(/\{\{border\.secondary\}\}/g, theme.border.secondary);
		compiled = compiled.replace(/\{\{border\.focus\}\}/g, theme.accent.base);

		// Replace interactive colors
		compiled = compiled.replace(/\{\{interactive\.primary\}\}/g, theme.accent.base);
		compiled = compiled.replace(/\{\{interactive\.secondary\}\}/g, theme.accent.dim);
		compiled = compiled.replace(/\{\{interactive\.hover\}\}/g, theme.accent.light);

		// Replace semantic colors
		compiled = compiled.replace(/\{\{semantic\.success\}\}/g, theme.semantic.success);
		compiled = compiled.replace(/\{\{semantic\.warning\}\}/g, theme.semantic.warning);
		compiled = compiled.replace(/\{\{semantic\.error\}\}/g, theme.semantic.error);

		// Replace accent variations
		compiled = compiled.replace(/\{\{accent\.base\}\}/g, theme.accent.base);
		compiled = compiled.replace(/\{\{accent\.light\}\}/g, theme.accent.light);
		compiled = compiled.replace(/\{\{accent\.dark\}\}/g, theme.accent.dark);
		compiled = compiled.replace(/\{\{accent\.dim\}\}/g, theme.accent.dim);

		return compiled;
	}

	/**
	 * Get application config file path
	 */
	private getApplicationConfigPath(application: string): string {
		const configDir = join(process.env.HOME || '~', '.dotfiles/src/config');

		switch (application) {
			case 'ags':
				return join(configDir, 'ags/assets/styles/themes/active.scss');
			case 'waybar':
				return join(configDir, 'waybar/themes/active.css');
			default:
				throw new Error(`Unknown application: ${application}`);
		}
	}

	/**
	 * Ensure directory exists
	 */
	private async ensureDirectoryExists(path: string): Promise<void> {
		try {
			await fs.mkdir(path, { recursive: true });
		} catch {
			// Ignore if directory already exists
		}
	}

	/**
	 * List available preset themes
	 */
	async listThemes(): Promise<string[]> {
		try {
			const files = await fs.readdir(THEME_PRESET_DIR);
			return files
				.filter(file => file.endsWith('.json'))
				.map(file => file.replace('.json', ''));
		} catch (error: any) {
			console.error('Failed to list themes:', error.message);
			return [];
		}
	}

	/**
	 * Get current theme info
	 */
	async getCurrentTheme(): Promise<{ name: string; accent?: string } | null> {
		try {
			const stateFile = join(process.env.HOME || '~', '.dotfiles/src/config.active.toml');
			const content = await fs.readFile(stateFile, 'utf-8');

			// Basic TOML parsing for theme info
			const themeMatch = content.match(/theme\s*=\s*"([^"]+)"/);
			const accentMatch = content.match(/accent\s*=\s*"([^"]+)"/);

			if (themeMatch) {
				return {
					name: themeMatch[1],
					accent: accentMatch?.[1],
				};
			}
		} catch {
			// File doesn't exist or couldn't be read
		}

		return null;
	}
}

// Export for backward compatibility
export const ThemeManager = ThemeEngine;

// Default export
export default ThemeEngine;