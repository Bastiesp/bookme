export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  description?: string;
  genre: string;
  condition_rating: number;
  importance_level: 'bestseller' | 'medium' | 'low_influence';
  created_at: string;
}

export interface BookWithImages extends Book {
  images: string[];
  user?: Profile;
}

export interface Like {
  id: string;
  user_id: string;
  target_user_id: string;
  book_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  book1_id: string;
  book2_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  match_id: string;
  created_at: string;
  match?: Match;
  messages?: Message[];
}

export const GENRES = [
  'ficcion',
  'literatura_clasica',
  'autoayuda',
  'mystery',
  'romance',
  'ciencia_ficcion',
  'fantasia',
  'historia',
  'biografia',
  'poesia',
] as const;

export type Genre = typeof GENRES[number];
