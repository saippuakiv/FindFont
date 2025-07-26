import { ComputedFontInfo, InfoPanelElements } from './types';

// Create and style floating button
export function createFloatingButton(): HTMLDivElement {
  const button = document.createElement('div');
  button.className = 'findfont-floating-button';
  button.textContent = 'ff';
  return button;
}

// Create and style info panel
export function createInfoPanel(): InfoPanelElements & {
  cleanup?: () => void;
  mouseEnterHandler?: (event: Event) => void;
  mouseLeaveHandler?: (event: Event) => void;
} {
  const panel = document.createElement('div');
  panel.className = 'findfont-info-panel';

  const header = document.createElement('div');
  header.className = 'findfont-panel-header';

  const title = document.createElement('span');
  title.className = 'findfont-panel-title';
  title.textContent = '🧾 Find Font';

  const copyAllButton = document.createElement('button');
  copyAllButton.className = 'findfont-copy-button findfont-copy-all-button';
  copyAllButton.title = 'Copy All Font Properties';
  copyAllButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="9" height="9" rx="1" stroke="#888" stroke-width="1.2"/>
    <rect x="5" y="5" width="9" height="9" rx="1" stroke="#888" stroke-width="1.2" fill="#fff"/>
  </svg>`;
  copyAllButton.style.opacity = '0';
  copyAllButton.style.pointerEvents = 'none';
  title.appendChild(copyAllButton);

  const closeButton = document.createElement('button');
  closeButton.className = 'findfont-close-button';
  closeButton.textContent = '×';

  const content = document.createElement('div');
  content.className = 'findfont-panel-content';
  content.id = 'fontInfoContent';

  const mouseEnterHandler = () => {
    console.log('Mouse enter - showing copy button');
    copyAllButton.style.opacity = '1';
    copyAllButton.style.pointerEvents = 'auto';
  };

  const mouseLeaveHandler = () => {
    if (!copyAllButton.classList.contains('copied')) {
      copyAllButton.style.opacity = '0';
      copyAllButton.style.pointerEvents = 'none';
    }
  };

  header.addEventListener('mouseenter', mouseEnterHandler);
  header.addEventListener('mouseleave', mouseLeaveHandler);

  header.appendChild(title);
  header.appendChild(closeButton);
  panel.appendChild(header);
  panel.appendChild(content);

  const cleanup = () => {
    header.removeEventListener('mouseenter', mouseEnterHandler);
    header.removeEventListener('mouseleave', mouseLeaveHandler);
  };

  return {
    panel,
    closeButton,
    content,
    cleanup,
    mouseEnterHandler,
    mouseLeaveHandler,
  };
}

// Create info section
export function createInfoSection(
  title: string,
  contentNode: Node,
  propertyKey?: string,
  propertyValue?: string
): HTMLDivElement & { cleanup?: () => void } {
  const section = document.createElement('div');
  section.className = 'findfont-info-section';

  const titleElement = document.createElement('div');
  titleElement.className = 'findfont-section-title';
  titleElement.textContent = title;

  let sectionCleanup: (() => void) | undefined;
  // Add copy button if propertyKey and propertyValue are provided
  if (propertyKey && propertyValue) {
    const copyButton = document.createElement('button');
    copyButton.className = 'findfont-copy-button';
    copyButton.title = `Copy ${propertyKey}`;
    copyButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3" y="3" width="9" height="9" rx="1" stroke="#888" stroke-width="1.2"/>
  <rect x="5" y="5" width="9" height="9" rx="1" stroke="#888" stroke-width="1.2" fill="#fff"/>
</svg>`;
    copyButton.style.opacity = '0';
    copyButton.style.pointerEvents = 'none';

    const copyClickHandler = (e: Event) => {
      e.stopPropagation();
      const text = `${propertyKey}: ${propertyValue}`;
      navigator.clipboard.writeText(text);
      copyButton.classList.add('copied');
      setTimeout(() => copyButton.classList.remove('copied'), 1000);
    };

    const mouseEnterHandler = () => {
      copyButton.style.opacity = '1';
      copyButton.style.pointerEvents = 'auto';
    };

    const mouseLeaveHandler = () => {
      copyButton.style.opacity = '0';
      copyButton.style.pointerEvents = 'none';
    };

    copyButton.addEventListener('click', copyClickHandler);
    section.addEventListener('mouseenter', mouseEnterHandler);
    section.addEventListener('mouseleave', mouseLeaveHandler);

    titleElement.appendChild(copyButton);

    // clean up function
    sectionCleanup = () => {
      copyButton.removeEventListener('click', copyClickHandler);
      section.removeEventListener('mouseenter', mouseEnterHandler);
      section.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }

  const contentElement = document.createElement('div');
  contentElement.className = 'findfont-section-content';
  contentElement.appendChild(contentNode);

  section.appendChild(titleElement);
  section.appendChild(contentElement);

  return section as HTMLDivElement & { cleanup?: () => void };
}

// Create color display
export function createColorDisplay(colorValue: string): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'findfont-color-display';

  const colorBox = document.createElement('span');
  colorBox.className = 'findfont-color-box';
  colorBox.style.backgroundColor = colorValue;

  const colorText = document.createElement('span');
  colorText.textContent = colorValue;

  container.appendChild(colorBox);
  container.appendChild(colorText);
  return container;
}

// Create fallback fonts display
export function createFallbackFontsDisplay(
  fallbackFonts: string[]
): (HTMLDivElement & { cleanup?: () => void }) | null {
  if (fallbackFonts.length === 0) return null;

  const container = document.createElement('div');
  container.className = 'findfont-fallback-fonts';

  // Show only first 4 fallback fonts initially
  const header = document.createElement('div');
  header.className = 'findfont-fallback-header';
  header.textContent = 'Fallback Fonts';
  container.appendChild(header);

  const maxVisible = 3;
  const visibleFonts = fallbackFonts.slice(0, maxVisible);
  const hiddenFonts = fallbackFonts.slice(maxVisible);

  const textWrapper = document.createElement('div');
  textWrapper.className = 'findfont-fallback-wrapper';

  const fallbackText = document.createElement('div');
  fallbackText.className = 'findfont-fallback-text';
  fallbackText.textContent = visibleFonts.join(', ');
  textWrapper.appendChild(fallbackText);

  let toggleClickHandler: ((event: Event) => void) | undefined;
  // Add expand/collapse functionality if there are hidden fonts
  if (hiddenFonts.length > 0) {
    const toggleButton = document.createElement('button');
    toggleButton.className = 'findfont-fallback-toggle';
    toggleButton.textContent = `+${hiddenFonts.length}`;

    let isExpanded = false;

    toggleClickHandler = (event: Event) => {
      event.stopPropagation();

      isExpanded = !isExpanded;

      if (isExpanded) {
        fallbackText.textContent = fallbackFonts.join(', ');
        toggleButton.textContent = 'less';
      } else {
        fallbackText.textContent = visibleFonts.join(', ');
        toggleButton.textContent = `+${hiddenFonts.length}`;
      }
    };

    toggleButton.addEventListener('click', toggleClickHandler);

    textWrapper.appendChild(toggleButton);
  }
  container.appendChild(textWrapper);

  const cleanup = () => {
    if (toggleClickHandler) {
      const toggleButton = textWrapper.querySelector(
        '.findfont-fallback-toggle'
      ) as HTMLButtonElement;
      if (toggleButton) {
        toggleButton.removeEventListener('click', toggleClickHandler);
      }
    }
  };

  return container as HTMLDivElement & { cleanup?: () => void };
}

// Create font preview component
export function createFontPreview(fontInfo: ComputedFontInfo): HTMLDivElement {
  const previewContainer = document.createElement('div');
  previewContainer.className = 'findfont-font-preview';

  // Calculate appropriate preview font size
  const originalSize = parseInt(fontInfo.fontSize);
  const maxPreviewSize = 24;
  const minPreviewSize = 12;

  let previewSize: number;
  if (originalSize > maxPreviewSize) {
    previewSize = maxPreviewSize;
  } else if (originalSize < minPreviewSize) {
    previewSize = minPreviewSize;
  } else {
    previewSize = originalSize;
  }

  const previewText = document.createElement('div');
  previewText.className = 'findfont-preview-text';
  previewText.style.cssText = `
    font-family: ${fontInfo.fontFamily};
    font-size: ${previewSize}px;
    font-weight: ${fontInfo.fontWeight};
    font-style: ${fontInfo.fontStyle};
    color: ${fontInfo.color};
    line-height: 1.3;
    text-align: center;
    margin-bottom: 6px;
  `;

  previewText.innerHTML = `
    <div style="font-size: 0.85em;">The quick brown fox jumps over the lazy dog</div>
  `;

  const previewLabel = document.createElement('div');
  previewLabel.textContent = 'Preview';
  previewLabel.className = 'findfont-preview-label';

  if (previewSize !== originalSize) {
    previewLabel.textContent = `Preview (scaled from ${fontInfo.fontSize})`;
  }

  // if preview size is not original size, add a label
  if (previewSize !== originalSize) {
    previewLabel.textContent = `Preview (scaled from ${fontInfo.fontSize})`;
  }

  previewContainer.appendChild(previewText);
  previewContainer.appendChild(previewLabel);

  return previewContainer;
}
