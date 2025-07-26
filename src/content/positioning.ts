const MARGIN = 10;
const BUTTON_SIZE = 32; // Defined in styles.css as height

export function positionElements(
  rect: DOMRect,
  floatingButton: HTMLDivElement,
  infoPanel: HTMLDivElement
): void {
  // Position the floating button on the right side of selected text
  const buttonLeft = rect.right + MARGIN;
  const buttonTop = rect.top - BUTTON_SIZE - MARGIN;

  const maxLeft = window.innerWidth - BUTTON_SIZE - MARGIN;

  // Ensure button stays within viewport
  const finalLeft = Math.min(Math.max(MARGIN, buttonLeft), maxLeft);
  const finalTop = Math.max(MARGIN, buttonTop);

  floatingButton.style.left = `${finalLeft}px`;
  floatingButton.style.top = `${finalTop}px`;

  if (infoPanel.classList.contains('show')) {
    positionInfoPanel(finalLeft, finalTop, infoPanel);
  }
}

export function positionInfoPanel(
  buttonLeft: number,
  buttonTop: number,
  infoPanel: HTMLDivElement
): void {
  const panelWidth = infoPanel.offsetWidth || 280; // Default width from CSS
  const panelHeight = infoPanel.offsetHeight || 200; // Estimate or calculate dynamically if needed

  let left = buttonLeft + BUTTON_SIZE + MARGIN;
  let top = buttonTop;

  // If not enough space on the right, try to the left
  if (left + panelWidth > window.innerWidth) {
    left = buttonLeft - panelWidth - MARGIN;
  }

  // If not enough space on the left, try below the button
  if (left < MARGIN) {
    left = buttonLeft;
    top = buttonTop + BUTTON_SIZE + MARGIN;
  }

  // If not enough space below, try above the button
  if (top + panelHeight > window.innerHeight) {
    top = buttonTop - panelHeight - MARGIN;
  }

  // Clamp to viewport
  left = Math.max(
    MARGIN,
    Math.min(left, window.innerWidth - panelWidth - MARGIN)
  );
  top = Math.max(
    MARGIN,
    Math.min(top, window.innerHeight - panelHeight - MARGIN)
  );

  infoPanel.style.left = `${left}px`;
  infoPanel.style.top = `${top}px`;
}
