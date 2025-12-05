export const DECK_OPTIONS = {
  FIBONACCI: 'Fibonacci',
  T_SHIRT: 'T-Shirt Sizes',
  LUNCH: 'Lunch Ideas',
  CUSTOM_DECK_KEY: 'Custom'
} as const;

export const CARD_DECKS: Record<typeof DECK_OPTIONS[keyof typeof DECK_OPTIONS], string[]> = {
  [DECK_OPTIONS.FIBONACCI]: ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'],
  [DECK_OPTIONS.T_SHIRT]: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?', '☕'],
  [DECK_OPTIONS.LUNCH]: ['Salad', 'Pizza', 'Tacos', 'Sushi', 'Burger', '?', '☕'], 
  [DECK_OPTIONS.CUSTOM_DECK_KEY]: ['1', '2', '3', '5', '8'],
};

export type DeckKey = keyof typeof CARD_DECKS
export const DEFAULT_DECK_KEY: keyof typeof CARD_DECKS = DECK_OPTIONS.FIBONACCI;
