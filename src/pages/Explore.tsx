import React, { useEffect, useState } from 'react';
import { BookWithImages, GENRES } from '../types';
import { getBooks, likeBook, getUserBooks } from '../services/books';
import { createMatchIfPossible } from '../services/matches';
import { BookCard } from '../components/BookCard';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

const GENRE_LABELS: Record<string, string> = {
  ficcion: 'Ficción',
  literatura_clasica: 'Literatura Clásica',
  autoayuda: 'Autoayuda',
  mystery: 'Misterio',
  romance: 'Romance',
  ciencia_ficcion: 'Ciencia Ficción',
  fantasia: 'Fantasía',
  historia: 'Historia',
  biografia: 'Biografía',
  poesia: 'Poesía',
};

export function Explore() {
  const { user, profile } = useAuth();
  const [books, setBooks] = useState<BookWithImages[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedImportance, setSelectedImportance] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userBooks, setUserBooks] = useState<BookWithImages[]>([]);

  useEffect(() => {
    loadBooks();
  }, [user]);

  const loadBooks = async () => {
    setLoading(true);
    if (user) {
      const books = await getBooks({ excludeUserId: user.id });
      setBooks(books);
      setFilteredBooks(books);

      const myBooks = await getUserBooks(user.id);
      setUserBooks(myBooks);
    }
    setLoading(false);
  };

  useEffect(() => {
    let filtered = books;

    if (selectedGenre) {
      filtered = filtered.filter(b => b.genre === selectedGenre);
    }

    if (selectedImportance) {
      filtered = filtered.filter(b => b.importance_level === selectedImportance);
    }

    setFilteredBooks(filtered);
    setCurrentIndex(0);
  }, [selectedGenre, selectedImportance, books]);

  const handleLike = async () => {
    const currentBook = filteredBooks[currentIndex];
    if (!currentBook || !user || userBooks.length === 0) return;

    await likeBook(user.id, currentBook.id);

    const randomBook = userBooks[Math.floor(Math.random() * userBooks.length)];
    const match = await createMatchIfPossible(user.id, currentBook.id, randomBook.id);

    if (match) {
      alert('¡Match! Se creó una nueva conexión');
    }

    handlePass();
  };

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando libros...</p>
      </div>
    );
  }

  if (filteredBooks.length === 0 || currentIndex >= filteredBooks.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center py-12">
            <p className="text-2xl mb-4">📚</p>
            <p className="text-gray-600 text-lg">
              {filteredBooks.length === 0 && selectedGenre ? 'No hay libros en este género' : 'No hay más libros para mostrar'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentBook = filteredBooks[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-3">
          <select
            value={selectedGenre}
            onChange={e => setSelectedGenre(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los géneros</option>
            {GENRES.map(genre => (
              <option key={genre} value={genre}>
                {GENRE_LABELS[genre] || genre}
              </option>
            ))}
          </select>

          <select
            value={selectedImportance}
            onChange={e => setSelectedImportance(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Cualquier importancia</option>
            <option value="bestseller">Bestseller</option>
            <option value="medium">Importancia Media</option>
            <option value="low_influence">Menos Influyente</option>
          </select>
        </div>

        <div className="flex justify-center">
          <BookCard
            book={currentBook}
            onLike={handleLike}
            onPass={handlePass}
            isLoading={loading}
          />
        </div>

        <div className="text-center text-sm text-gray-500">
          {currentIndex + 1} / {filteredBooks.length}
        </div>
      </div>
    </div>
  );
}
