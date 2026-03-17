/** Physical keyboard layout — maps display positions to key codes */

export interface KeyDef {
  key: string;       // The key value (lowercase)
  display: string;   // What to show on the key cap
  width?: number;    // Width multiplier (1 = standard key)
}

export const KEYBOARD_ROWS: KeyDef[][] = [
  // Row 1: Number row (these are preset selectors, not bindable)
  // Row 2: QWERTY
  [
    { key: 'q', display: 'Q' },
    { key: 'w', display: 'W' },
    { key: 'e', display: 'E' },
    { key: 'r', display: 'R' },
    { key: 't', display: 'T' },
    { key: 'y', display: 'Y' },
    { key: 'u', display: 'U' },
    { key: 'i', display: 'I' },
    { key: 'o', display: 'O' },
    { key: 'p', display: 'P' },
  ],
  // Row 3: ASDF
  [
    { key: 'a', display: 'A' },
    { key: 's', display: 'S' },
    { key: 'd', display: 'D' },
    { key: 'f', display: 'F' },
    { key: 'g', display: 'G' },
    { key: 'h', display: 'H' },
    { key: 'j', display: 'J' },
    { key: 'k', display: 'K' },
    { key: 'l', display: 'L' },
  ],
  // Row 4: ZXCV
  [
    { key: 'z', display: 'Z' },
    { key: 'x', display: 'X' },
    { key: 'c', display: 'C' },
    { key: 'v', display: 'V' },
    { key: 'b', display: 'B' },
    { key: 'n', display: 'N' },
    { key: 'm', display: 'M' },
  ],
  // Row 5: Space bar
  [
    { key: ' ', display: 'SPACE', width: 6 },
  ],
];

/** All bindable keys as a flat list */
export const BINDABLE_KEYS = KEYBOARD_ROWS.flat().map(k => k.key);

/** Preset selector keys (number row) */
export const PRESET_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
