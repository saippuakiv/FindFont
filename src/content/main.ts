import { debounce } from './utils';
import { createFloatingButton, createInfoPanel } from './dom-elements';
import { getFontInfo } from './font-analyze';
import { updateInfoPanel } from './panel-update';
import { positionElements, positionInfoPanel } from './positioning';
import { EventListenerConfig } from './types';

// ===========================
// EVENT LISTENER MANAGER
// ===========================
class EventListenerManager {
  private listeners: EventListenerConfig[] = [];

  add(
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) {
    element.addEventListener(event, handler, options);
    this.listeners.push({ element, event, handler, options });
  }

  removeAll() {
    this.listeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.listeners = [];
  }

  remove(
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListener
  ) {
    element.removeEventListener(event, handler);
    this.listeners = this.listeners.filter(
      (listener) =>
        !(
          listener.element === element &&
          listener.event === event &&
          listener.handler === handler
        )
    );
  }
}

// ===========================
// Global state and variables
// ===========================

// Global event manager
const eventManager = new EventListenerManager();

// DOM elements
let floatingButton: HTMLDivElement;
let infoPanel: HTMLDivElement;
let infoPanelCloseButton: HTMLButtonElement;

// Event handlers
let closePanelHandler: (event: Event) => void;
let floatingButtonClickHandler: (event: Event) => void;
let mouseUpHandler: (event: MouseEvent) => void;
let resizeHandler: () => void;
let outsideClickHandler: (event: Event) => void;

// Chrome extension specific handlers
let chromeRuntimeSuspendHandler: () => void;
let chromeRuntimeMessageHandler: (
  message: any,
  sender: any,
  sendResponse: any
) => void;

// Track panel creation cleanup functions
let panelCleanupFunctions: (() => void)[] = [];
// Track if outside click listener is active
let outsideClickListenerActive = false;

// ===========================
// Util Functions
// ===========================
function isInInputArea(element: HTMLElement): boolean {
  return !!(
    element.matches('input, textarea, [contenteditable="true"]') ||
    element.closest('input, textarea, [contenteditable="true"]') ||
    element.closest('.findfont-floating-button, .findfont-info-panel')
  );
}

function isSelectionInEditableArea(selection: Selection): boolean {
  if (!selection.rangeCount) return false;

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const element =
    container.nodeType === Node.ELEMENT_NODE
      ? (container as Element)
      : container.parentElement;

  if (!element) return false;

  return !!(
    element.closest('input') ||
    element.closest('textarea') ||
    element.closest('[contenteditable="true"]')
  );
}

// ===========================
// Basic Operation Functions
// ===========================
function clearSelection(): void {
  if (window.getSelection) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
  }
}

function hideUIElements(): void {
  floatingButton.style.display = 'none';
  infoPanel.style.display = 'none';
  infoPanel.classList.remove('show');
}

function repositionElements(): void {
  const buttonLeft = parseFloat(floatingButton.style.left);
  const buttonTop = parseFloat(floatingButton.style.top);

  const MARGIN = 10;
  const BUTTON_SIZE = 32;
  const maxLeft = window.innerWidth - BUTTON_SIZE - MARGIN;

  const newLeft = Math.min(Math.max(MARGIN, buttonLeft), maxLeft);
  const newTop = Math.max(MARGIN, buttonTop);

  if (newLeft !== buttonLeft || newTop !== buttonTop) {
    floatingButton.style.left = `${newLeft}px`;
    floatingButton.style.top = `${newTop}px`;
  }

  if (infoPanel.classList.contains('show')) {
    positionInfoPanel(newLeft, newTop, infoPanel);
  }
}

// ===========================
// Panel show and hide
// ===========================
function showPanel(): void {
  infoPanel.style.display = 'block';
  infoPanel.offsetHeight; // Force reflow
  infoPanel.classList.add('show');

  const buttonLeft = parseFloat(floatingButton.style.left);
  const buttonTop = parseFloat(floatingButton.style.top);
  positionInfoPanel(buttonLeft, buttonTop, infoPanel);
  addOutsideClickListener();
}

function hidePanel(): void {
  infoPanel.classList.remove('show');
  setTimeout(() => {
    infoPanel.style.display = 'none';
    // Do clean up
    cleanupDynamicListeners();
  }, 250);

  floatingButton.style.display = 'none';

  // Delay clearing selection to prevent interference with new selections
  setTimeout(() => {
    clearSelection();
  }, 50);

  removeOutsideClickListener();
}

// ===========================
//  Event Handlers
// ===========================
function initializeEventHandlers(): void {
  closePanelHandler = (event: Event) => {
    event.stopPropagation();
    hidePanel();
    floatingButton.style.display = 'none';
    cleanup();
  };

  floatingButtonClickHandler = (event: Event) => {
    event.stopPropagation();
    //globalFocusProtector.protectTemporarily(150);
    const isVisible = infoPanel.classList.contains('show');

    if (isVisible) {
      hidePanel();
    } else {
      showPanel();
    }
  };

  mouseUpHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (
      isInInputArea(target) ||
      target.closest('.findfont-floating-button, .findfont-info-panel')
    ) {
      return;
    }

    debouncedMouseUpHandler(event);
  };

  resizeHandler = () => {
    if (floatingButton.style.display === 'flex') {
      repositionElements();
    }
  };

  // Add event listeners using event manager
  eventManager.add(infoPanelCloseButton, 'click', closePanelHandler);
  eventManager.add(floatingButton, 'click', floatingButtonClickHandler);
  eventManager.add(document, 'mouseup', mouseUpHandler);
  eventManager.add(window, 'resize', resizeHandler);
  eventManager.add(window, 'beforeunload', destroy);
  eventManager.add(document, 'visibilitychange', handleVisibilityChange);
}

function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    cleanup();
    removeOutsideClickListener();
  }
}

const debouncedMouseUpHandler = debounce((event: MouseEvent) => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    if (isSelectionInEditableArea(selection)) {
      return;
    }

    const target = event.target as HTMLElement;
    if (isInInputArea(target)) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    floatingButton.style.display = 'flex';
    positionElements(rect, floatingButton, infoPanel);

    const selectedElement = selection.focusNode?.parentElement;
    if (selectedElement instanceof HTMLElement) {
      try {
        const fontInfo = getFontInfo(selectedElement);
        if (fontInfo) {
          updateInfoPanel(fontInfo);
        }
      } catch (error) {
        console.error('FindFont: Failed to process selected element:', error);
      }
    }
  } else {
    floatingButton.style.display = 'none';
    infoPanel.style.display = 'none';
    removeOutsideClickListener();
    cleanup();
  }
}, 150);

// ===========================
// Outside Click Listener Management
// ===========================
function addOutsideClickListener(): void {
  if (outsideClickListenerActive) {
    return; // Prevent duplicate listeners
  }

  outsideClickHandler = (event: Event) => {
    const target = event.target as HTMLElement;

    if (
      !target.closest('.findfont-info-panel') &&
      !target.closest('.findfont-floating-button') &&
      !isInInputArea(target)
    ) {
      hidePanel();
    }
  };

  document.addEventListener('click', outsideClickHandler, false);
  outsideClickListenerActive = true;
}

function removeOutsideClickListener(): void {
  if (outsideClickHandler && outsideClickListenerActive) {
    document.removeEventListener('click', outsideClickHandler, false); // Fixed: use same capture flag
    outsideClickHandler = null as any;
    outsideClickListenerActive = false;
  }
}

// ===========================
// Chrome Extension Listener Management
// ===========================
function addChromeExtensionListeners(): void {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    // Extension suspend handler
    chromeRuntimeSuspendHandler = () => {
      destroy();
    };
    chrome.runtime.onSuspend?.addListener(chromeRuntimeSuspendHandler);

    // Runtime message handler
    chromeRuntimeMessageHandler = (
      message: any,
      sender: any,
      sendResponse: any
    ) => {
      if (message.action === 'cleanup') {
        destroy();
        sendResponse({ success: true });
      }
    };
    chrome.runtime.onMessage?.addListener(chromeRuntimeMessageHandler);

    // Note: onConnect listeners are typically auto-cleaned when port disconnects
  }
}

function removeChromeExtensionListeners(): void {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    if (chromeRuntimeSuspendHandler && chrome.runtime.onSuspend) {
      chrome.runtime.onSuspend.removeListener(chromeRuntimeSuspendHandler);
    }
    if (chromeRuntimeMessageHandler && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.removeListener(chromeRuntimeMessageHandler);
    }
  }
}

// ===========================
// Cleanup Functions
// ===========================
function cleanupDynamicListeners(): void {
  panelCleanupFunctions.forEach((cleanup) => cleanup());
  panelCleanupFunctions = [];

  const content = document.getElementById('fontInfoContent');
  if (content) {
    const sections = content.querySelectorAll('.findfont-info-section');
    sections.forEach((section) => {
      if ((section as any).cleanup) {
        (section as any).cleanup();
      }
    });

    const fallbackDisplays = content.querySelectorAll(
      '.findfont-fallback-fonts'
    );
    fallbackDisplays.forEach((display) => {
      if ((display as any).cleanup) {
        (display as any).cleanup();
      }
    });

    content.innerHTML = '';
  }
}

function cleanup(): void {
  hideUIElements();
}

function destroy(): void {
  cleanup();
  removeOutsideClickListener();
  cleanupDynamicListeners();
  removeChromeExtensionListeners();

  // Remove all managed event listeners
  eventManager.removeAll();

  // Remove DOM elements
  if (floatingButton?.parentNode) {
    floatingButton.parentNode.removeChild(floatingButton);
  }
  if (infoPanel?.parentNode) {
    infoPanel.parentNode.removeChild(infoPanel);
  }
}

// ===========================
// Initialization Functions
// ===========================
function initialize(): void {
  // Clean up any existing state
  removeOutsideClickListener();

  panelCleanupFunctions.forEach((cleanup) => cleanup());
  panelCleanupFunctions.length = 0;

  if (floatingButton && document.body.contains(floatingButton)) {
    document.body.removeChild(floatingButton);
  }
  if (infoPanel && document.body.contains(infoPanel)) {
    document.body.removeChild(infoPanel);
  }

  const panelResult = createInfoPanel();
  const { panel, closeButton } = panelResult;

  if ('cleanup' in panelResult && typeof panelResult.cleanup === 'function') {
    panelCleanupFunctions.push(panelResult.cleanup);
  }

  floatingButton = createFloatingButton();
  infoPanel = panel;
  infoPanelCloseButton = closeButton;

  document.body.appendChild(floatingButton);
  document.body.appendChild(infoPanel);

  initializeEventHandlers();
  addChromeExtensionListeners();
}

initialize();
