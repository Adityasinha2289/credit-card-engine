export interface DemoMovie {
  movieId: string;
  title: string;
  genre: string;
  duration: number; // minutes
  rating: number;
  language: string;
}

export const DEMO_MOVIES: DemoMovie[] = [
  { movieId: 'm1', title: 'The Silent Echo - Demo', genre: 'Thriller', duration: 135, rating: 4.2, language: 'English' },
  { movieId: 'm2', title: 'Summer in the City - Demo', genre: 'Romance', duration: 110, rating: 3.8, language: 'Hindi' },
  { movieId: 'm3', title: 'Galactic Wars - Demo', genre: 'Sci-Fi', duration: 160, rating: 4.8, language: 'English' },
  { movieId: 'm4', title: 'Mystery at Midnight - Demo', genre: 'Mystery', duration: 125, rating: 4.1, language: 'English' },
  { movieId: 'm5', title: 'Laugh Out Loud - Demo', genre: 'Comedy', duration: 95, rating: 3.5, language: 'Hindi' },
  { movieId: 'm6', title: 'The Last Hero - Demo', genre: 'Action', duration: 140, rating: 4.5, language: 'English' },
  { movieId: 'm7', title: 'Dancing in the Rain - Demo', genre: 'Musical', duration: 130, rating: 4.3, language: 'Hindi' },
  { movieId: 'm8', title: 'Ghosts of the Past - Demo', genre: 'Horror', duration: 105, rating: 3.9, language: 'English' },
  { movieId: 'm9', title: 'Journey to the Core - Demo', genre: 'Adventure', duration: 150, rating: 4.6, language: 'English' },
  { movieId: 'm10', title: 'A Beautiful Mind - Demo', genre: 'Drama', duration: 115, rating: 4.4, language: 'Hindi' },
];

export const getDemoMovies = (): DemoMovie[] => DEMO_MOVIES;
