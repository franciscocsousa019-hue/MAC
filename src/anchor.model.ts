export interface Anchor {
  date: string; // YYYY-MM-DD
  title: string;
  valence: 'positive' | 'negative';
  meta: {
    smell: string;
    weather: string;
    imageUrl?: string;
  };
}