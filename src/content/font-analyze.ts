import { ComputedFontInfo, ParsedFontFamily } from './types';

// Function to get computed font information
export function getFontInfo(element: HTMLElement): ComputedFontInfo | null {
  try {
    const computedStyle = window.getComputedStyle(element);
    return {
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      fontStyle: computedStyle.fontStyle,
      textDecorationLine: computedStyle.textDecorationLine,
      textDecorationStyle: computedStyle.textDecorationStyle,
      textDecorationThickness: computedStyle.textDecorationThickness,
      color: computedStyle.color,
      lineHeight: computedStyle.lineHeight,
      letterSpacing: computedStyle.letterSpacing,
    };
  } catch (error) {
    console.warn('FindFont: Failed to get font info:', error);
    return null;
  }
}

// Function to parse font family string
export function parseFontFamily(fontFamily: string): ParsedFontFamily {
  const fonts = fontFamily
    .split(',')
    .map((font) => font.trim().replace(/['"]/g, ''));

  return {
    primary: fonts[0],
    fallbacks: fonts.slice(1),
  };
}

export function getFontSource(fontFamily: string): string {
  const fontName = fontFamily.toLowerCase();

  // System Font
  if (fontName.includes('-apple-system') || fontName.includes('system-ui')) {
    return 'System Font';
  }
  if (fontName.includes('segoe ui')) {
    return 'Windows System Font';
  }
  if (fontName.includes('roboto') || fontName.includes('noto')) {
    return 'Android System Font';
  }

  // Google Fonts
  const googleFonts = [
    'roboto',
    'open sans',
    'lato',
    'montserrat',
    'source sans pro',
    'raleway',
    'ubuntu',
    'lora',
    'merriweather',
    'nunito',
    'playfair display',
    'oswald',
    'poppins',
    'inter',
    'fira sans',
    'pt sans',
    'work sans',
  ];

  if (googleFonts.some((font) => fontName.includes(font))) {
    return 'Google Fonts';
  }

  // Adobe Fonts
  const adobeFonts = [
    'proxima nova',
    'minion pro',
    'myriad pro',
    'source serif pro',
    'acumin',
    'brandon grotesque',
    'futura pt',
    'trade gothic',
    'museo',
    'ff din',
    'adelle',
    'freight text',
  ];

  if (adobeFonts.some((font) => fontName.includes(font))) {
    return 'Adobe Fonts';
  }

  // Other Common Fonts
  if (
    fontName.includes('helvetica') ||
    fontName.includes('times') ||
    fontName.includes('arial') ||
    fontName.includes('courier')
  ) {
    return 'Standard Font';
  }

  return ''; // Unrecognized fonts do not show source
}

// format font family with source
export function formatFontFamily(fontFamily: string): string {
  const source = getFontSource(fontFamily);
  const mainFont = fontFamily.split(',')[0].trim().replace(/['"]/g, '');

  return source ? `${mainFont} (${source})` : mainFont;
}

// Function to get style description
export function getStyleDescription(fontInfo: ComputedFontInfo): string {
  if (fontInfo.fontStyle !== 'normal') {
    return fontInfo.fontStyle;
  }
  const fontName = fontInfo.fontFamily.toLowerCase();
  if (fontName.includes('italic')) {
    return 'normal (italic font)';
  }

  return 'normal';
}
