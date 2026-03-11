import { supabase } from './supabase';
import { Book, BookWithImages, Like } from '../types';

export async function getBooks(filters?: {
  genre?: string;
  importance?: string;
  excludeUserId?: string;
}): Promise<BookWithImages[]> {
  let query = supabase
    .from('books')
    .select(`
      *,
      book_images(image_url),
      profiles(id, display_name, avatar_url, username, bio)
    `)
    .order('created_at', { ascending: false });

  if (filters?.genre) {
    query = query.eq('genre', filters.genre);
  }

  if (filters?.importance) {
    query = query.eq('importance_level', filters.importance);
  }

  if (filters?.excludeUserId) {
    query = query.neq('user_id', filters.excludeUserId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return (data || []).map((book: any) => ({
    ...book,
    images: (book.book_images || []).map((img: any) => img.image_url),
    user: book.profiles,
  }));
}

export async function getBookById(id: string): Promise<BookWithImages | null> {
  const { data, error } = await supabase
    .from('books')
    .select(`
      *,
      book_images(image_url),
      profiles(id, display_name, avatar_url, username, bio)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching book:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    images: (data.book_images || []).map((img: any) => img.image_url),
    user: data.profiles,
  };
}

export async function getUserBooks(userId: string): Promise<BookWithImages[]> {
  const { data, error } = await supabase
    .from('books')
    .select(`
      *,
      book_images(image_url),
      profiles(id, display_name, avatar_url, username, bio)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user books:', error);
    return [];
  }

  return (data || []).map((book: any) => ({
    ...book,
    images: (book.book_images || []).map((img: any) => img.image_url),
    user: book.profiles,
  }));
}

export async function createBook(book: Omit<Book, 'id' | 'created_at'>, images: string[] = []): Promise<Book | null> {
  const { data, error } = await supabase
    .from('books')
    .insert(book)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating book:', error);
    return null;
  }

  if (data && images.length > 0) {
    const imageRecords = images.map(url => ({
      book_id: data.id,
      image_url: url,
    }));

    await supabase.from('book_images').insert(imageRecords);
  }

  return data;
}

export async function deleteBook(id: string): Promise<boolean> {
  const { error } = await supabase.from('books').delete().eq('id', id);
  return !error;
}

export async function likeBook(userId: string, bookId: string): Promise<boolean> {
  const book = await getBookById(bookId);
  if (!book) return false;

  const { error } = await supabase.from('likes').insert({
    user_id: userId,
    target_user_id: book.user_id,
    book_id: bookId,
  });

  if (error && error.code !== 'PGRST116') {
    console.error('Error liking book:', error);
    return false;
  }

  return true;
}

export async function unlikeBook(userId: string, bookId: string): Promise<boolean> {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('book_id', bookId);

  return !error;
}

export async function hasUserLiked(userId: string, bookId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .maybeSingle();

  return !error && !!data;
}

export async function getMatchingLikes(userId: string, bookId: string): Promise<Like[]> {
  const book = await getBookById(bookId);
  if (!book) return [];

  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('user_id', book.user_id)
    .eq('target_user_id', userId);

  if (error) {
    console.error('Error fetching matching likes:', error);
    return [];
  }

  return data || [];
}
