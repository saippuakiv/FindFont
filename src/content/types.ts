export interface ComputedFontInfo {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  textDecorationLine: string;
  textDecorationStyle: string;
  textDecorationThickness: string;
  color: string;
  lineHeight: string;
  letterSpacing: string;
}

export interface ParsedFontFamily {
  primary: string;
  fallbacks: string[];
}

export interface InfoPanelElements {
  panel: HTMLDivElement;
  closeButton: HTMLButtonElement;
  content: HTMLDivElement;
}

export interface EventListenerConfig {
  element: HTMLElement | Window | Document;
  event: string;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
}

export interface FontDetectedMessage {
  type: 'FONT_DETECTED';
  fontInfo: ComputedFontInfo;
}

export interface GetFontInfoMessage {
  type: 'GET_FONT_INFO';
}

export type ExtensionMessage = FontDetectedMessage | GetFontInfoMessage;
