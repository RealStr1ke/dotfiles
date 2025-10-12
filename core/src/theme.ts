import * as fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import {
	Theme,
	UniversalColorScheme,
	ThemeAdapter,
	ApplicationConfig,
	ThemeResult,
	ThemeManagerConfig,
	TemplateContext,
} from './utils/types';
import * as utils from './utils/utils';

// Theme Adapters
export interface CatppuccinColors {
  base: string;
  mantle: string;
  crust: string;
  text: string;
  subtext0: string;
  subtext1: string;
  surface0: string;
  surface1: string;
  surface2: string;
  overlay0: string;
  overlay1: string;
  overlay2: string;
  blue: string;
  lavender: string;
  sapphire: string;
  sky: string;
  teal: string;
  green: string;
  yellow: string;
  peach: string;
  maroon: string;
  red: string;
  mauve: string;
  pink: string;
  flamingo: string;
  rosewater: string;
}

export const CatppuccinAdapter: ThemeAdapter<CatppuccinColors> = {
	name: 'catppuccin',
	variants: ['latte', 'frappe', 'macchiato', 'mocha'],
	convert(colors: CatppuccinColors): UniversalColorScheme {
		return {
			background: {
				primary: colors.base,
				secondary: colors.surface0,
				tertiary: colors.surface1,
				overlay: colors.overlay0,
			},
			text: {
				primary: colors.text,
				secondary: colors.subtext1,
				tertiary: colors.subtext0,
				inverse: colors.crust,
			},
			interactive: {
				primary: colors.mauve,
				secondary: colors.sapphire,
				hover: colors.lavender,
				active: colors.blue,
				disabled: colors.overlay1,
			},
			semantic: {
				success: colors.green,
				warning: colors.yellow,
				error: colors.red,
				info: colors.blue,
			},
			border: {
				primary: colors.surface2,
				secondary: colors.surface1,
				focus: colors.mauve,
			},
			palette: {
				red: colors.red,
				orange: colors.peach,
				yellow: colors.yellow,
				green: colors.green,
				blue: colors.blue,
				purple: colors.mauve,
				pink: colors.pink,
				cyan: colors.teal,
				lavender: colors.lavender,
				sapphire: colors.sapphire,
				sky: colors.sky,
				maroon: colors.maroon,
				flamingo: colors.flamingo,
				rosewater: colors.rosewater,
			},
		};
	},
	validate(colors: CatppuccinColors): boolean {
		const requiredColors = [
			'base', 'mantle', 'crust',
			'text', 'subtext0', 'subtext1',
			'surface0', 'surface1', 'surface2',
			'overlay0', 'overlay1', 'overlay2',
			'blue', 'lavender', 'sapphire', 'sky', 'teal',
			'green', 'yellow', 'peach', 'maroon', 'red',
			'mauve', 'pink', 'flamingo', 'rosewater',
		];
		return requiredColors.every(color =>
			colors[color as keyof CatppuccinColors] &&
			typeof colors[color as keyof CatppuccinColors] === 'string',
		);
	},
};

export interface RosePineColors {
  base: string;
  surface: string;
  overlay: string;
  muted: string;
  subtle: string;
  text: string;
  love: string;
  gold: string;
  rose: string;
  pine: string;
  foam: string;
  iris: string;
  highlightLow: string;
  highlightMed: string;
  highlightHigh: string;
}

export const RosePineAdapter: ThemeAdapter<RosePineColors> = {
	name: 'rose-pine',
	variants: ['main', 'moon', 'dawn'],
	convert(colors: RosePineColors): UniversalColorScheme {
		return {
			background: {
				primary: colors.base,
				secondary: colors.surface,
				tertiary: colors.overlay,
				overlay: colors.highlightLow,
			},
			text: {
				primary: colors.text,
				secondary: colors.subtle,
				tertiary: colors.muted,
				inverse: colors.base,
			},
			interactive: {
				primary: colors.rose,
				secondary: colors.foam,
				hover: colors.highlightMed,
				active: colors.love,
				disabled: colors.muted,
			},
			semantic: {
				success: colors.pine,
				warning: colors.gold,
				error: colors.love,
				info: colors.foam,
			},
			border: {
				primary: colors.highlightMed,
				secondary: colors.highlightLow,
				focus: colors.rose,
			},
			palette: {
				red: colors.love,
				orange: colors.gold,
				yellow: colors.gold,
				green: colors.pine,
				blue: colors.foam,
				purple: colors.iris,
				pink: colors.rose,
				cyan: colors.foam,
			},
		};
	},
	validate(colors: RosePineColors): boolean {
		const requiredColors = [
			'base', 'surface', 'overlay', 'muted', 'subtle', 'text',
			'love', 'gold', 'rose', 'pine', 'foam', 'iris',
			'highlightLow', 'highlightMed', 'highlightHigh',
		];
		return requiredColors.every(color =>
			colors[color as keyof RosePineColors] &&
			typeof colors[color as keyof RosePineColors] === 'string',
		);
	},
};

export interface GenericColors {
  background: string;
  foreground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack?: string;
  brightRed?: string;
  brightGreen?: string;
  brightYellow?: string;
  brightBlue?: string;
  brightMagenta?: string;
  brightCyan?: string;
  brightWhite?: string;
  accent?: string;
  border?: string;
}

function isLightColor(hex: string): boolean {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const brightness = (r * 299 + g * 587 + b * 114) / 1000;
	return brightness > 128;
}

function lighten(hex: string, amount: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const newR = Math.round(r + (255 - r) * amount);
	const newG = Math.round(g + (255 - g) * amount);
	const newB = Math.round(b + (255 - b) * amount);
	return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, amount: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const newR = Math.round(r * (1 - amount));
	const newG = Math.round(g * (1 - amount));
	const newB = Math.round(b * (1 - amount));
	return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

export const GenericAdapter: ThemeAdapter<GenericColors> = {
	name: 'generic',
	variants: ['dark', 'light'],
	convert(colors: GenericColors): UniversalColorScheme {
		const light = isLightColor(colors.background);
		const surface1 = light ? darken(colors.background, 0.05) : lighten(colors.background, 0.05);
		const surface2 = light ? darken(colors.background, 0.1) : lighten(colors.background, 0.1);

		return {
			background: {
				primary: colors.background,
				secondary: surface1,
				tertiary: surface2,
				overlay: colors.border || colors.brightBlack || surface2,
			},
			text: {
				primary: colors.foreground,
				secondary: colors.brightBlack || colors.white,
				tertiary: colors.black,
				inverse: colors.background,
			},
			interactive: {
				primary: colors.accent || colors.blue,
				secondary: colors.cyan,
				hover: colors.brightBlue || lighten(colors.blue, 0.1),
				active: colors.magenta,
				disabled: colors.brightBlack || colors.black,
			},
			semantic: {
				success: colors.green,
				warning: colors.yellow,
				error: colors.red,
				info: colors.blue,
			},
			border: {
				primary: colors.border || colors.brightBlack || surface2,
				secondary: surface1,
				focus: colors.accent || colors.blue,
			},
			palette: {
				red: colors.red,
				orange: colors.brightRed || colors.red,
				yellow: colors.yellow,
				green: colors.green,
				blue: colors.blue,
				purple: colors.magenta,
				pink: colors.brightMagenta || colors.magenta,
				cyan: colors.cyan,
			},
		};
	},
	validate(colors: GenericColors): boolean {
		const required = ['background', 'foreground', 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white'];
		return required.every(color => colors[color as keyof GenericColors] && typeof colors[color as keyof GenericColors] === 'string');
	},
};

// Template Processor
class TemplateProcessor {
	private helpers: TemplateContext['helpers'];

	constructor() {
		this.helpers = {
			lighten: this.lightenColor.bind(this),
			darken: this.darkenColor.bind(this),
			transparentize: this.transparentizeColor.bind(this),
			saturate: this.saturateColor.bind(this),
			desaturate: this.desaturateColor.bind(this),
		};
	}

	async processTemplate(
		templatePath: string,
		theme: Theme,
		outputPath: string,
		customData?: Record<string, any>,
	): Promise<void> {
		if (!fs.existsSync(templatePath)) {
			throw new Error(`Template file not found: ${templatePath}`);
		}

		const templateContent = fs.readFileSync(templatePath, 'utf8');
		const context: TemplateContext = {
			theme,
			colors: theme.colors,
			helpers: this.helpers,
			custom: customData || {},
		};

		const processedContent = this.replaceTemplateVariables(templateContent, context);
		const outputDir = path.dirname(outputPath);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir, { recursive: true });
		}

		fs.writeFileSync(outputPath, processedContent, 'utf8');
		console.log(`Generated ${outputPath} from template`);
	}

	async applyThemeToApplication(
		theme: Theme,
		appConfig: ApplicationConfig,
		dryRun: boolean = false,
		autoReload: boolean = true,
	): Promise<boolean> {
		try {
			console.log(`${dryRun ? '[DRY RUN] ' : ''}Processing ${appConfig.name}...`);

			if (!fs.existsSync(appConfig.templatePath)) {
				console.warn(`Template not found for ${appConfig.name}: ${appConfig.templatePath}`);
				return false;
			}

			if (dryRun) {
				console.log(`Would generate: ${appConfig.outputPath}`);
				return true;
			}

			await this.processTemplate(
				appConfig.templatePath,
				theme,
				appConfig.outputPath,
			);

			if (appConfig.validate) {
				const outputContent = fs.readFileSync(appConfig.outputPath, 'utf8');
				if (!appConfig.validate(outputContent)) {
					throw new Error(`Generated config failed validation for ${appConfig.name}`);
				}
			}

			if (autoReload && appConfig.reloadCommands && appConfig.reloadCommands.length > 0) {
				console.log(`Reloading ${appConfig.name}...`);
				for (const command of appConfig.reloadCommands) {
					try {
						// Run commands in background using spawn instead of execSync
						const args = command.split(' ');
						const cmd = args[0];
						const cmdArgs = args.slice(1);

						spawn(cmd, cmdArgs, {
							detached: true,
							stdio: 'ignore',
						}).unref();
					} catch (error) {
						console.warn(`Failed to run reload command: ${command}`, error);
					}
				}
			}

			return true;
		} catch (error) {
			console.error(`Failed to apply theme to ${appConfig.name}:`, error);
			return false;
		}
	}

	private replaceTemplateVariables(content: string, context: TemplateContext): string {
		return content.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
			try {
				return this.evaluateExpression(expression.trim(), context);
			} catch (error) {
				console.warn(`Failed to evaluate template expression: ${expression}`, error);
				return match;
			}
		});
	}

	private evaluateExpression(expression: string, context: TemplateContext): string {
		if (!expression.includes('(')) {
			return this.getNestedProperty(context, expression);
		}

		if (expression === 'new Date().toISOString()') {
			return new Date().toISOString();
		}

		const functionMatch = expression.match(/^(\w+)\(([^)]+)\)$/);
		if (functionMatch) {
			const [, functionName, argsString] = functionMatch;
			const args = this.parseArguments(argsString, context);

			if (functionName in context.helpers) {
				const helperFunction = context.helpers[functionName as keyof typeof context.helpers];
				return (helperFunction as any)(...args);
			}
		}

		throw new Error(`Unknown template expression: ${expression}`);
	}

	private getNestedProperty(obj: any, propertyPath: string): string {
		return propertyPath.split('.').reduce((current, key) => {
			if (current && typeof current === 'object' && key in current) {
				return current[key];
			}
			throw new Error(`Property not found: ${propertyPath}`);
		}, obj);
	}

	private parseArguments(argsString: string, context: TemplateContext): any[] {
		return argsString.split(',').map(arg => {
			const trimmedArg = arg.trim();

			if (trimmedArg.startsWith('"') && trimmedArg.endsWith('"')) {
				return trimmedArg.slice(1, -1);
			}

			if (/^-?\d*\.?\d+$/.test(trimmedArg)) {
				return parseFloat(trimmedArg);
			}

			try {
				return this.getNestedProperty(context, trimmedArg);
			} catch {
				return trimmedArg;
			}
		});
	}

	private lightenColor(color: string, amount: number): string {
		return this.adjustColor(color, (r, g, b) => {
			const newR = Math.min(255, Math.round(r + (255 - r) * amount));
			const newG = Math.min(255, Math.round(g + (255 - g) * amount));
			const newB = Math.min(255, Math.round(b + (255 - b) * amount));
			return [newR, newG, newB];
		});
	}

	private darkenColor(color: string, amount: number): string {
		return this.adjustColor(color, (r, g, b) => {
			const newR = Math.max(0, Math.round(r * (1 - amount)));
			const newG = Math.max(0, Math.round(g * (1 - amount)));
			const newB = Math.max(0, Math.round(b * (1 - amount)));
			return [newR, newG, newB];
		});
	}

	private transparentizeColor(color: string, amount: number): string {
		const { r, g, b } = this.parseColor(color);
		const alpha = Math.max(0, Math.min(1, 1 - amount));
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	private saturateColor(color: string, amount: number): string {
		return this.adjustSaturation(color, amount);
	}

	private desaturateColor(color: string, amount: number): string {
		return this.adjustSaturation(color, -amount);
	}

	private adjustColor(color: string, adjustFn: (r: number, g: number, b: number) => [number, number, number]): string {
		const { r, g, b } = this.parseColor(color);
		const [newR, newG, newB] = adjustFn(r, g, b);
		return `#${this.toHex(newR)}${this.toHex(newG)}${this.toHex(newB)}`;
	}

	private adjustSaturation(color: string, amount: number): string {
		const { r, g, b } = this.parseColor(color);
		const [h, s, l] = this.rgbToHsl(r, g, b);
		const newS = Math.max(0, Math.min(1, s + amount));
		const [newR, newG, newB] = this.hslToRgb(h, newS, l);
		return `#${this.toHex(newR)}${this.toHex(newG)}${this.toHex(newB)}`;
	}

	private parseColor(color: string): { r: number; g: number; b: number } {
		if (color.startsWith('#')) {
			const hex = color.slice(1);
			if (hex.length === 3) {
				return {
					r: parseInt(hex[0] + hex[0], 16),
					g: parseInt(hex[1] + hex[1], 16),
					b: parseInt(hex[2] + hex[2], 16),
				};
			} else if (hex.length === 6) {
				return {
					r: parseInt(hex.slice(0, 2), 16),
					g: parseInt(hex.slice(2, 4), 16),
					b: parseInt(hex.slice(4, 6), 16),
				};
			}
		}
		throw new Error(`Unsupported color format: ${color}`);
	}

	private toHex(value: number): string {
		return Math.round(value).toString(16).padStart(2, '0');
	}

	private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
		r /= 255;
		g /= 255;
		b /= 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h: number, s: number;
		const l = (max + min) / 2;

		if (max === min) {
			h = s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
				default: h = 0;
			}

			h /= 6;
		}

		return [h, s, l];
	}

	private hslToRgb(h: number, s: number, l: number): [number, number, number] {
		let r: number, g: number, b: number;

		if (s === 0) {
			r = g = b = l;
		} else {
			const hue2rgb = (p: number, q: number, t: number) => {
				if (t < 0) t += 1;
				if (t > 1) t -= 1;
				if (t < 1 / 6) return p + (q - p) * 6 * t;
				if (t < 1 / 2) return q;
				if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
				return p;
			};

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;

			r = hue2rgb(p, q, h + 1 / 3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1 / 3);
		}

		return [r * 255, g * 255, b * 255];
	}
}

// Theme Manager
export class ThemeManager {
	private config: ThemeManagerConfig;
	private adapters = new Map<string, ThemeAdapter>();
	private applications = new Map<string, ApplicationConfig>();
	private currentTheme: Theme | null = null;

	constructor(config: ThemeManagerConfig) {
		this.config = config;
		config.applications.forEach(app => {
			this.applications.set(app.name, app);
		});
		this.ensureDirectories();
	}

	registerAdapter(adapter: ThemeAdapter): void {
		this.adapters.set(adapter.name, adapter);
		console.log(`Registered theme adapter: ${adapter.name}`);
	}

	async getAvailableThemes(): Promise<Theme[]> {
		const themes: Theme[] = [];
		const themesDir = this.config.themesPath;

		if (!fs.existsSync(themesDir)) {
			return themes;
		}

		const presetDir = path.join(themesDir, 'presets');
		const generatedDir = path.join(themesDir, 'generated');

		for (const dir of [presetDir, generatedDir]) {
			if (fs.existsSync(dir)) {
				const files = fs.readdirSync(dir, { recursive: true });
				for (const file of files) {
					if (typeof file === 'string' && file.endsWith('.json')) {
						try {
							const filePath = path.join(dir, file);
							const themeData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
							if (this.isValidTheme(themeData)) {
								themes.push(themeData);
							}
						} catch (error) {
							console.warn(`Failed to load theme from ${file}:`, error);
						}
					}
				}
			}
		}

		return themes;
	}

	getCurrentTheme(): Theme | null {
		if (this.currentTheme) {
			return this.currentTheme;
		}

		const activeThemePath = path.join(this.config.themesPath, 'active.json');
		if (fs.existsSync(activeThemePath)) {
			try {
				const themeData = JSON.parse(fs.readFileSync(activeThemePath, 'utf8'));
				if (this.isValidTheme(themeData)) {
					this.currentTheme = themeData;
					return this.currentTheme;
				}
			} catch (error) {
				console.warn('Failed to load active theme:', error);
			}
		}

		return null;
	}

	async applyTheme(themeName: string, options: {
		dryRun?: boolean;
		applications?: string[];
		backup?: boolean;
		reload?: boolean;
	} = {}): Promise<ThemeResult> {
		try {
			const theme = await this.getThemeByName(themeName);
			if (!theme) {
				return {
					success: false,
					message: `Theme '${themeName}' not found`,
					errors: [`No theme found with name: ${themeName}`],
				};
			}

			return await this.applyThemeObject(theme, options);
		} catch (error) {
			return {
				success: false,
				message: 'Failed to apply theme',
				errors: [error instanceof Error ? error.message : String(error)],
			};
		}
	}

	async applyThemeObject(theme: Theme, options: {
		dryRun?: boolean;
		applications?: string[];
		backup?: boolean;
		reload?: boolean;
	} = {}): Promise<ThemeResult> {
		const result: ThemeResult = {
			success: true,
			message: `Applied theme: ${theme.name}`,
			warnings: [],
			errors: [],
			appliedTo: [],
		};

		const targetApps = options.applications || Array.from(this.applications.keys());
		const shouldReload = options.reload !== false && this.config.autoReload;

		if (options.backup && !options.dryRun) {
			await this.backupCurrentConfigs(targetApps);
		}

		for (const appName of targetApps) {
			const appConfig = this.applications.get(appName);
			if (!appConfig) {
				result.warnings?.push(`Unknown application: ${appName}`);
				continue;
			}

			try {
				const applied = await this.applyThemeToApplication(theme, appConfig, options.dryRun || false, shouldReload);
				if (applied) {
					result.appliedTo?.push(appName);
				}
			} catch (error) {
				const errorMsg = `Failed to apply theme to ${appName}: ${error instanceof Error ? error.message : String(error)}`;
				result.errors?.push(errorMsg);
				result.success = false;
			}
		}

		if (result.success && !options.dryRun) {
			await this.saveCurrentTheme(theme);
			this.currentTheme = theme;
		}

		return result;
	}

	createTheme(
		name: string,
		colors: UniversalColorScheme,
		metadata: Partial<Theme> = {},
	): Theme {
		return {
			name,
			variant: metadata.variant || 'dark',
			author: metadata.author || 'Unknown',
			description: metadata.description,
			source: metadata.source || 'manual',
			timestamp: Date.now(),
			colors,
			...metadata,
		};
	}

	async saveTheme(theme: Theme, directory: 'presets' | 'generated' = 'presets'): Promise<void> {
		const themesDir = path.join(this.config.themesPath, directory);
		this.ensureDirectory(themesDir);

		const filename = theme.name.toLowerCase()
			.replace(/[^a-z0-9]/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '') + '.json';

		const filePath = path.join(themesDir, filename);
		fs.writeFileSync(filePath, JSON.stringify(theme, null, 2));
		console.log(`Saved theme '${theme.name}' to ${filePath}`);
	}

	convertTheme<T>(
		adapterName: string,
		colors: T,
		themeName: string,
		variant?: string,
		metadata: Partial<Theme> = {},
	): Theme | null {
		const adapter = this.adapters.get(adapterName);
		if (!adapter) {
			console.error(`No adapter found for: ${adapterName}`);
			return null;
		}

		try {
			const universalColors = adapter.convert(colors, variant);
			return this.createTheme(themeName, universalColors, {
				...metadata,
				source: 'preset',
			});
		} catch (error) {
			console.error(`Failed to convert theme with ${adapterName} adapter:`, error);
			return null;
		}
	}

	private async getThemeByName(name: string): Promise<Theme | null> {
		const themes = await this.getAvailableThemes();

		// Try exact match first
		let theme = themes.find(theme => theme.name === name);
		if (theme) return theme;

		// Try case insensitive match
		theme = themes.find(theme => theme.name.toLowerCase() === name.toLowerCase());
		if (theme) return theme;

		// Try kebab-case to title case conversion (e.g., "rose-pine" -> "Rose Pine")
		const titleCase = name.split('-').map(word =>
			word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
		).join(' ');
		theme = themes.find(theme => theme.name === titleCase);
		if (theme) return theme;

		// Try slug match (remove spaces and convert to lowercase)
		const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
		theme = themes.find(theme =>
			theme.name.toLowerCase().replace(/[^a-z0-9]/g, '') === nameSlug,
		);

		return theme || null;
	}

	private async applyThemeToApplication(
		theme: Theme,
		appConfig: ApplicationConfig,
		dryRun: boolean,
		autoReload: boolean = true,
	): Promise<boolean> {
		const templateProcessor = new TemplateProcessor();
		return await templateProcessor.applyThemeToApplication(theme, appConfig, dryRun, autoReload);
	}

	private async backupCurrentConfigs(applications: string[]): Promise<void> {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const backupDir = path.join(this.config.backupPath, `theme-backup-${timestamp}`);
		this.ensureDirectory(backupDir);

		for (const appName of applications) {
			const appConfig = this.applications.get(appName);
			if (appConfig && fs.existsSync(appConfig.outputPath)) {
				const backupPath = path.join(backupDir, `${appName}.backup`);
				fs.copyFileSync(appConfig.outputPath, backupPath);
			}
		}

		console.log(`Backed up configs to: ${backupDir}`);
	}

	private async saveCurrentTheme(theme: Theme): Promise<void> {
		const activeThemePath = path.join(this.config.themesPath, 'active.json');
		fs.writeFileSync(activeThemePath, JSON.stringify(theme, null, 2));
	}

	private isValidTheme(data: any): data is Theme {
		return (
			data &&
			typeof data.name === 'string' &&
			typeof data.timestamp === 'number' &&
			data.colors &&
			data.colors.background &&
			data.colors.text &&
			data.colors.interactive &&
			data.colors.semantic &&
			data.colors.border
		);
	}

	private ensureDirectories(): void {
		const dirs = [
			this.config.themesPath,
			path.join(this.config.themesPath, 'presets'),
			path.join(this.config.themesPath, 'generated'),
			this.config.templatesPath,
			this.config.backupPath,
		];

		dirs.forEach(dir => this.ensureDirectory(dir));
	}

	private ensureDirectory(dir: string): void {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	}
}

// Theme Command Handler
export class ThemeCommand {
	private themeManager: ThemeManager;

	constructor() {
		const dotfilesPath = utils.getDotfilesDir();

		const config: ThemeManagerConfig = {
			themesPath: path.join(dotfilesPath, 'core', 'src', 'themes'),
			templatesPath: path.join(dotfilesPath, 'core', 'src', 'themes', 'templates'),
			backupPath: path.join(dotfilesPath, 'backup', 'themes'),
			defaultTheme: 'catppuccin-mocha',
			autoBackup: true,
			autoReload: true,
			validateContrast: true,
			minContrastRatio: 4.5,
			applications: [
				{
					name: 'ags-main',
					templatePath: path.join(dotfilesPath, 'core', 'src', 'themes', 'templates', 'ags-main.scss'),
					outputPath: path.join(dotfilesPath, 'src', 'config', 'ags', 'assets', 'styles', 'main.scss'),
					reloadCommands: ['pkill ags', 'ags &'],
					templateOptions: { format: 'scss' },
				},
				{
					name: 'ags-active-theme',
					templatePath: path.join(dotfilesPath, 'core', 'src', 'themes', 'templates', 'ags-active.scss'),
					outputPath: path.join(dotfilesPath, 'src', 'config', 'ags', 'assets', 'styles', 'themes', 'active.scss'),
					reloadCommands: [],
					templateOptions: { format: 'scss' },
				},
				{
					name: 'waybar-style',
					templatePath: path.join(dotfilesPath, 'core', 'src', 'themes', 'templates', 'waybar-style.css'),
					outputPath: path.join(dotfilesPath, 'src', 'config', 'waybar', 'style.css'),
					reloadCommands: ['pkill waybar', 'waybar &'],
					templateOptions: { format: 'css' },
				},
			],
		};

		this.themeManager = new ThemeManager(config);
		this.themeManager.registerAdapter(CatppuccinAdapter);
		this.themeManager.registerAdapter(RosePineAdapter);
		this.themeManager.registerAdapter(GenericAdapter);
	}

	async handle(subcommand: string, args: string[], options: any): Promise<void> {
		try {
			switch (subcommand) {
				case 'list':
					await this.listThemes();
					break;
				case 'current':
					await this.showCurrentTheme();
					break;
				case 'set':
				case 'apply':
					if (!args[0]) {
						console.error('❌ Theme name required. Usage: dots theme set <theme-name>');
						process.exit(1);
					}
					await this.applyTheme(args[0], options);
					break;
				case 'preview':
					if (!args[0]) {
						console.error('❌ Theme name required. Usage: dots theme preview <theme-name>');
						process.exit(1);
					}
					await this.previewTheme(args[0], options);
					break;
				case 'create':
					if (!args[0]) {
						console.error('❌ Theme name required. Usage: dots theme create <theme-name>');
						process.exit(1);
					}
					await this.createTheme(args[0], args.slice(1));
					break;
				case 'backup':
					await this.backupCurrentTheme();
					break;
				case 'restore':
					await this.restoreTheme(args[0]);
					break;
				case 'help':
					this.showHelp();
					break;
				default:
					console.error(`❌ Unknown theme subcommand: ${subcommand}`);
					this.showHelp();
					process.exit(1);
			}
		} catch (error) {
			console.error('❌ Theme command failed:', error);
			process.exit(1);
		}
	}

	private async listThemes(): Promise<void> {
		console.log('🎨 Available themes:');
		console.log('');

		const themes = await this.themeManager.getAvailableThemes();

		if (themes.length === 0) {
			console.log('No themes found. Create some themes first!');
			return;
		}

		const currentTheme = this.themeManager.getCurrentTheme();
		const presetThemes = themes.filter(t => t.source === 'preset');
		const generatedThemes = themes.filter(t => t.source === 'generated');
		const manualThemes = themes.filter(t => t.source === 'manual');

		if (presetThemes.length > 0) {
			console.log('📦 Preset themes:');
			presetThemes.forEach(theme => {
				const isCurrent = currentTheme?.name === theme.name;
				const marker = isCurrent ? '→' : ' ';
				const variant = theme.variant ? ` (${theme.variant})` : '';
				console.log(`  ${marker} ${theme.name}${variant} - ${theme.description || 'No description'}`);
				if (theme.author) console.log(`    By: ${theme.author}`);
			});
			console.log('');
		}

		if (generatedThemes.length > 0) {
			console.log('🖼️  Generated themes:');
			generatedThemes.forEach(theme => {
				const isCurrent = currentTheme?.name === theme.name;
				const marker = isCurrent ? '→' : ' ';
				console.log(`  ${marker} ${theme.name} - Generated from image`);
				if (theme.sourceImage) console.log(`    Source: ${theme.sourceImage}`);
			});
			console.log('');
		}

		if (manualThemes.length > 0) {
			console.log('✏️  Manual themes:');
			manualThemes.forEach(theme => {
				const isCurrent = currentTheme?.name === theme.name;
				const marker = isCurrent ? '→' : ' ';
				console.log(`  ${marker} ${theme.name} - ${theme.description || 'Custom theme'}`);
			});
			console.log('');
		}

		console.log(`Total: ${themes.length} themes`);
		if (currentTheme) {
			console.log(`Current: ${currentTheme.name}`);
		}
	}

	private async showCurrentTheme(): Promise<void> {
		const currentTheme = this.themeManager.getCurrentTheme();

		if (!currentTheme) {
			console.log('No theme is currently active.');
			return;
		}

		console.log('🎨 Current theme:');
		console.log('');
		console.log(`Name: ${currentTheme.name}`);
		console.log(`Variant: ${currentTheme.variant || 'Unknown'}`);
		console.log(`Author: ${currentTheme.author || 'Unknown'}`);
		console.log(`Source: ${currentTheme.source}`);

		if (currentTheme.description) {
			console.log(`Description: ${currentTheme.description}`);
		}

		if (currentTheme.sourceImage) {
			console.log(`Source Image: ${currentTheme.sourceImage}`);
		}

		console.log(`Applied: ${new Date(currentTheme.timestamp).toLocaleString()}`);
		console.log('');

		console.log('Color preview:');
		console.log(`  Background: ${currentTheme.colors.background.primary}`);
		console.log(`  Text: ${currentTheme.colors.text.primary}`);
		console.log(`  Primary Accent: ${currentTheme.colors.interactive.primary}`);
		console.log(`  Success: ${currentTheme.colors.semantic.success}`);
		console.log(`  Warning: ${currentTheme.colors.semantic.warning}`);
		console.log(`  Error: ${currentTheme.colors.semantic.error}`);
	}

	private async applyTheme(themeName: string, options: any): Promise<void> {
		console.log(`🎨 Applying theme: ${themeName}`);

		const result = await this.themeManager.applyTheme(themeName, {
			dryRun: options.dryRun || false,
			backup: options.backup !== false,
			applications: options.apps ? options.apps.split(',') : undefined,
			reload: options.reload !== false,
		});

		if (result.success) {
			console.log('✅ Theme applied successfully!');
			if (result.appliedTo && result.appliedTo.length > 0) {
				console.log(`Applied to: ${result.appliedTo.join(', ')}`);
			}

			if (result.warnings && result.warnings.length > 0) {
				console.log('⚠️  Warnings:');
				result.warnings.forEach(warning => console.log(`  - ${warning}`));
			}
		} else {
			console.error('❌ Failed to apply theme');
			console.error(result.message);

			if (result.errors && result.errors.length > 0) {
				console.error('Errors:');
				result.errors.forEach(error => console.error(`  - ${error}`));
			}
		}
	}

	private async previewTheme(themeName: string, options: any): Promise<void> {
		console.log(`👀 Previewing theme: ${themeName}`);

		const result = await this.themeManager.applyTheme(themeName, {
			dryRun: true,
			backup: false,
			applications: options.apps ? options.apps.split(',') : undefined,
			reload: false,
		});

		if (result.success) {
			console.log('✅ Preview successful!');
			console.log('This is what would be applied:');

			if (result.appliedTo && result.appliedTo.length > 0) {
				console.log(`Applications: ${result.appliedTo.join(', ')}`);
			}

			console.log('');
			console.log('To actually apply this theme, run:');
			console.log(`  dots theme set ${themeName}`);
		} else {
			console.error('❌ Preview failed');
			console.error(result.message);
		}
	}

	private async createTheme(themeName: string, _args: string[]): Promise<void> {
		console.log(`🎨 Creating new theme: ${themeName}`);
		console.log('');
		console.log('Theme creation wizard is not yet implemented.');
		console.log('For now, you can:');
		console.log('1. Copy an existing theme from src/themes/presets/');
		console.log('2. Modify the colors to your liking');
		console.log('3. Save it with a new name');
		console.log('');
		console.log('Auto-generation from images will be added in a future update!');
	}

	private async backupCurrentTheme(): Promise<void> {
		console.log('💾 Backing up current theme...');
		console.log('Backup functionality is handled automatically when applying themes.');
		console.log('Manual backup is not yet implemented.');
	}

	private async restoreTheme(_backupName?: string): Promise<void> {
		console.log('🔄 Restoring theme from backup...');
		console.log('Theme restoration is not yet implemented.');
	}

	private showHelp(): void {
		console.log('🎨 Theme management commands:');
		console.log('');
		console.log('Usage: dots theme <command> [options]');
		console.log('');
		console.log('Commands:');
		console.log('  list                    List all available themes');
		console.log('  current                 Show current theme information');
		console.log('  set <theme-name>        Apply a theme');
		console.log('  preview <theme-name>    Preview a theme (dry run)');
		console.log('  create <theme-name>     Create a new theme (wizard)');
		console.log('  backup                  Backup current theme');
		console.log('  restore [backup-name]   Restore theme from backup');
		console.log('  help                    Show this help');
		console.log('');
		console.log('Options:');
		console.log('  --dry-run              Preview changes without applying');
		console.log('  --apps <app1,app2>     Apply only to specific applications');
		console.log('  --no-backup            Skip backup before applying');
		console.log('  --no-reload            Skip automatic reloading of applications');
		console.log('');
		console.log('Examples:');
		console.log('  dots theme list');
		console.log('  dots theme set catppuccin-mocha');
		console.log('  dots theme set rose-pine --no-reload');
		console.log('  dots theme preview "Rose Pine"');
		console.log('  dots theme set catppuccin-mocha --apps ags,waybar');
	}
}