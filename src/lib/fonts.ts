interface LocalFontTokens {
  variable: string;
  className: string;
}

interface FontOptions {
  variable?: string;
  [option: string]: unknown;
}

const displayFont: LocalFontTokens = {
  variable: "font-display-local",
  className: "font-display-local",
};

const bodyFont: LocalFontTokens = {
  variable: "font-body-local",
  className: "font-body-local",
};

const monoFont: LocalFontTokens = {
  variable: "font-mono-local",
  className: "font-mono-local",
};

export function Fraunces(_options: FontOptions): LocalFontTokens {
  return displayFont;
}

export function Inter(_options: FontOptions): LocalFontTokens {
  return bodyFont;
}

export function IBM_Plex_Mono(_options: FontOptions): LocalFontTokens {
  return monoFont;
}

export function Poppins(_options: FontOptions): LocalFontTokens {
  return bodyFont;
}
