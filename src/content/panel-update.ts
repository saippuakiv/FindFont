import { ComputedFontInfo } from './types';
import { rgbToHex } from './utils';
import {
  parseFontFamily,
  getStyleDescription,
  formatFontFamily,
} from './font-analyze';
import {
  createInfoSection,
  createColorDisplay,
  createFallbackFontsDisplay,
  createFontPreview,
} from './dom-elements';

let lastFontInfo: ComputedFontInfo | null = null;
// Update info panel content
export function updateInfoPanel(fontInfo: ComputedFontInfo): void {
  try {
    lastFontInfo = fontInfo;
    const content = document.getElementById('fontInfoContent');
    if (!content) {
      console.warn('FindFont: Info panel content element not found');
      return;
    }

    content.innerHTML = '';

    const colorValue = rgbToHex(fontInfo.color);
    const { primary: primaryFont, fallbacks: fallbackFonts } = parseFontFamily(
      fontInfo.fontFamily
    );

    // Font Family Section
    const fontFamilySection = createInfoSection(
      'Font Family',
      document.createTextNode(formatFontFamily(fontInfo.fontFamily)),
      'font-family',
      fontInfo.fontFamily
    );
    const fallbackFontsDisplay = createFallbackFontsDisplay(fallbackFonts);
    if (fallbackFontsDisplay) {
      const sectionContent = fontFamilySection.querySelector(
        '.findfont-section-content'
      );
      if (sectionContent) {
        sectionContent.appendChild(fallbackFontsDisplay);
      }
    }
    content.appendChild(fontFamilySection);

    // Size and Weight Section
    const sizeWeightContainer = document.createElement('div');
    sizeWeightContainer.className = 'findfont-size-weight-container';

    const sizeSection = createInfoSection(
      'Size',
      document.createTextNode(fontInfo.fontSize),
      'font-size',
      fontInfo.fontSize
    );
    const weightSection = createInfoSection(
      'Weight',
      document.createTextNode(fontInfo.fontWeight),
      'font-weight',
      fontInfo.fontWeight
    );

    sizeWeightContainer.appendChild(sizeSection);
    sizeWeightContainer.appendChild(weightSection);
    content.appendChild(sizeWeightContainer);

    // Color Section
    const colorSection = createInfoSection(
      'Color',
      createColorDisplay(colorValue),
      'color',
      colorValue
    );
    content.appendChild(colorSection);

    // Style Section
    const styleContent = document.createElement('div');
    styleContent.innerHTML = getStyleDescription(fontInfo);
    const styleSection = createInfoSection(
      'Style',
      styleContent,
      'font-style',
      fontInfo.fontStyle
    );
    content.appendChild(styleSection);

    // Font Preview Section
    const previewSection = createFontPreview(fontInfo);
    content.appendChild(previewSection);

    // Header copy button logic
    const headerCopyButton = document.querySelector(
      '.findfont-copy-all-button'
    ) as HTMLButtonElement | null;
    if (headerCopyButton) {
      //Clear the old binding of onclick event
      headerCopyButton.onclick = null;

      headerCopyButton.onclick = () => {
        // Gather all property sections
        const sections = content.querySelectorAll('.findfont-info-section');
        let text = '';
        if (lastFontInfo) {
          text += `font-family: ${lastFontInfo.fontFamily};\n`;
          text += `font-size: ${lastFontInfo.fontSize};\n`;
          text += `font-weight: ${lastFontInfo.fontWeight};\n`;
          text += `color: ${rgbToHex(lastFontInfo.color)};\n`;
          text += `font-style: ${lastFontInfo.fontStyle};\n`;
        }
        navigator.clipboard.writeText(text.trim());
        headerCopyButton.classList.add('copied');
        setTimeout(() => headerCopyButton.classList.remove('copied'), 1000);
      };
    }
  } catch (error) {
    console.error('FindFont: Failed to update info panel:', error);
  }
}
