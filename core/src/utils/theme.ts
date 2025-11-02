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
	async loadTheme(name: string, accentOverride?: string, themeMode?: string): Promise<ResolvedTheme> {
		// Check if it's a wallpaper path
		if (name.includes('/') || name.endsWith('.jpg') || name.endsWith('.png')) {
			return this.generateFromWallpaper(name, accentOverride, themeMode);
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
	 * Load theme configuration from config.toml
	 */
	private async loadThemeConfig(): Promise<{ wallpaper_mode: string; default_dark_theme: string; default_light_theme: string }> {
		try {
			const configPath = join(process.env.HOME || '~', '.dotfiles/src/config.toml');
			const configContent = await fs.readFile(configPath, 'utf-8');
			
			// Simple TOML parsing for theme section
			const themeSection = configContent.match(/\[theme\]([\s\S]*?)(?=\[|$)/);
			if (!themeSection) {
				// Return defaults if no theme section found
				return {
					wallpaper_mode: 'auto',
					default_dark_theme: 'catppuccin-mocha',
					default_light_theme: 'catppuccin-latte'
				};
			}

			const sectionContent = themeSection[1];
			const wallpaperModeMatch = sectionContent.match(/wallpaper_mode\s*=\s*"([^"]+)"/);
			const defaultDarkMatch = sectionContent.match(/default_dark_theme\s*=\s*"([^"]+)"/);
			const defaultLightMatch = sectionContent.match(/default_light_theme\s*=\s*"([^"]+)"/);

			return {
				wallpaper_mode: wallpaperModeMatch?.[1] || 'auto',
				default_dark_theme: defaultDarkMatch?.[1] || 'catppuccin-mocha',
				default_light_theme: defaultLightMatch?.[1] || 'catppuccin-latte'
			};
		} catch (error: any) {
			console.warn('Could not load theme config, using defaults');
			return {
				wallpaper_mode: 'auto',
				default_dark_theme: 'catppuccin-mocha',
				default_light_theme: 'catppuccin-latte'
			};
		}
	}

	/**
	 * Generate theme from wallpaper using base theme + accent extraction
	 */
	private async generateFromWallpaper(wallpaperPath: string, accentOverride?: string, themeMode?: string): Promise<ResolvedTheme> {
		try {
			// Load theme configuration
			const config = await this.loadThemeConfig();

			// Import Vibrant for color extraction
			const { Vibrant } = (await import('node-vibrant/node'));

			// Extract colors from image
			const palette = await Vibrant.from(wallpaperPath).getPalette();

			// Get the most vibrant color as accent
			const vibrantColor = (palette as any).Vibrant?.hex;
			if (!vibrantColor) {
				throw new Error('Could not extract vibrant color from image');
			}

			// Detect if wallpaper is light or dark based on dominant/muted colors, not vibrant
			const dominantColor = (palette as any).DarkMuted?.hex || (palette as any).Muted?.hex || (palette as any).LightMuted?.hex;
			const isDarkWallpaper = dominantColor ? this.isColorDark(dominantColor) : true; // Default to dark if no dominant color

			// Determine which base theme to use
			let baseThemeName: string;
			
			if (themeMode === 'dark') {
				baseThemeName = config.default_dark_theme;
			} else if (themeMode === 'light') {
				baseThemeName = config.default_light_theme;
			} else if (config.wallpaper_mode === 'dark') {
				baseThemeName = config.default_dark_theme;
			} else if (config.wallpaper_mode === 'light') {
				baseThemeName = config.default_light_theme;
			} else {
				// Auto mode - use wallpaper detection
				baseThemeName = isDarkWallpaper ? config.default_dark_theme : config.default_light_theme;
			}

			console.log(`🎨 Extracted accent color: ${vibrantColor}`);
			console.log(`🎨 Wallpaper detected as: ${isDarkWallpaper ? 'Dark' : 'Light'}`);
			console.log(`🎨 Using base theme: ${baseThemeName}`);

			// Load the base theme
			const baseTheme = await this.loadPresetTheme(baseThemeName);

			// Override the accent with extracted color (or user override)
			const finalAccent = accentOverride || vibrantColor;
			const accent = generateAccentVariations(finalAccent);

			// Return base theme with new accent
			return {
				...baseTheme,
				name: `${baseTheme.name} (from ${wallpaperPath.split('/').pop()})`,
				accent,
				resolved_accent: finalAccent,
				accent_source: accentOverride ? 'hex' : 'extracted',
			};

		} catch (error: any) {
			console.error(`Failed to extract colors from ${wallpaperPath}: ${error.message}`);
			console.log('Falling back to default theme...');

			// Fallback to default theme
			return this.loadPresetTheme('catppuccin-mocha', accentOverride);
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
	async getCurrentTheme(): Promise<{ 
		name: string; 
		accent?: string; 
		accent_source?: string;
		theme_type?: string;
		theme_mode?: string;
		wallpaper_path?: string;
		timestamp?: number;
	} | null> {
		try {
			const stateFile = join(process.env.HOME || '~', '.dotfiles/src/config.active.toml');
			const content = await fs.readFile(stateFile, 'utf-8');

			// Parse theme section information
			const nameMatch = content.match(/\[theme\][\s\S]*?name\s*=\s*"([^"]+)"/);
			const accentMatch = content.match(/\[theme\][\s\S]*?accent\s*=\s*"([^"]+)"/);
			const accentSourceMatch = content.match(/\[theme\][\s\S]*?accent_source\s*=\s*"([^"]+)"/);
			const themeTypeMatch = content.match(/\[theme\][\s\S]*?theme_type\s*=\s*"([^"]+)"/);
			const themeModeMatch = content.match(/\[theme\][\s\S]*?theme_mode\s*=\s*"([^"]+)"/);
			const wallpaperPathMatch = content.match(/\[theme\][\s\S]*?wallpaper_path\s*=\s*"([^"]+)"/);
			const timestampMatch = content.match(/\[theme\][\s\S]*?timestamp\s*=\s*(\d+)/);

			if (nameMatch) {
				return {
					name: nameMatch[1],
					accent: accentMatch?.[1],
					accent_source: accentSourceMatch?.[1],
					theme_type: themeTypeMatch?.[1],
					theme_mode: themeModeMatch?.[1],
					wallpaper_path: wallpaperPathMatch?.[1],
					timestamp: timestampMatch ? parseInt(timestampMatch[1]) : undefined,
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