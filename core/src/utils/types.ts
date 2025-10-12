/**
 * Core types for dotfiles utilities
 */

// Theme system types
export interface UniversalColorScheme {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  interactive: {
    primary: string;
    secondary: string;
    hover: string;
    active: string;
    disabled: string;
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
  palette?: {
    red: string;
    orange: string;
    yellow: string;
    green: string;
    blue: string;
    purple: string;
    pink: string;
    cyan: string;
    [key: string]: string;
  };
}

export interface Theme {
  name: string;
  variant?: 'dark' | 'light';
  author?: string;
  description?: string;
  source: 'preset' | 'generated' | 'manual';
  sourceImage?: string;
  timestamp: number;
  colors: UniversalColorScheme;
  overrides?: Record<string, Partial<UniversalColorScheme>>;
  wallpaper?: string;
  config?: {
    autoApply?: boolean;
    timeRange?: {
      start: string;
      end: string;
    };
  };
}

export interface ThemeAdapter<T = any> {
  name: string;
  variants: string[];
  convert(colors: T, variant?: string): UniversalColorScheme;
  validate?(colors: T): boolean;
}

export interface ApplicationConfig {
  name: string;
  templatePath: string;
  outputPath: string;
  reloadCommands?: string[];
  templateOptions?: {
    format: 'scss' | 'css' | 'conf' | 'json' | 'toml';
    customFunctions?: string[];
  };
  validate?: (content: string) => boolean;
}

export interface TemplateContext {
  theme: Theme;
  colors: UniversalColorScheme;
  helpers: {
    lighten(color: string, amount: number): string;
    darken(color: string, amount: number): string;
    transparentize(color: string, amount: number): string;
    saturate(color: string, amount: number): string;
    desaturate(color: string, amount: number): string;
  };
  custom?: Record<string, any>;
}

export interface ThemeManagerConfig {
  themesPath: string;
  templatesPath: string;
  backupPath: string;
  defaultTheme?: string;
  autoBackup: boolean;
  autoReload: boolean;
  applications: ApplicationConfig[];
  validateContrast: boolean;
  minContrastRatio: number;
}

export interface ThemeResult {
  success: boolean;
  message: string;
  warnings?: string[];
  errors?: string[];
  appliedTo?: string[];
}