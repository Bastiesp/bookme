import React, { useEffect, useState } from 'react';
import { BookWithImages } from '../types';
import { getUserBooks, createBook } from '../services/books';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const GENRES = [
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
];

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

export function Profile() {
  const { user, profile, signOut } = useAuth();
  const [userBooks, setUserBooks] = useState<BookWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    genre: 'ficcion',
    condition_rating: '5',
    importance_level: 'medium',
  });

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    if (!user) return;
    setLoading(true);
    const books = await getUserBooks(user.id);
    setUserBooks(books);
    setLoading(false);
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const book = await createBook(
      {
        user_id: user.id,
        title: formData.title,
        author: formData.author,
        description: formData.description,
        genre: formData.genre,
        condition_rating: parseInt(formData.condition_rating),
        importance_level: formData.importance_level as 'bestseller' | 'medium' | 'low_influence',
      },
      []
    );

    if (book) {
      setFormData({
        title: '',
        author: '',
        description: '',
        genre: 'ficcion',
        condition_rating: '5',
        importance_level: 'medium',
      });
      setShowForm(false);
      await loadBooks();
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="p-8">
          <div className="space-y-4">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            )}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">{profile.display_name}</h1>
              <p className="text-gray-600">@{profile.username}</p>
              {profile.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
            </div>

            <div className="flex gap-3 justify-center pt-4">
              <Button variant="secondary">Editar Perfil</Button>
              <Button variant="danger" onClick={signOut}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Mis Libros</h2>
            <Button
              variant="primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Cancelar' : '+ Agregar Libro'}
            </Button>
          </div>

          {showForm && (
            <Card className="p-6">
              <form onSubmit={handleAddBook} className="space-y-4">
                <input
                  type="text"
                  placeholder="Título"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="Autor"
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  placeholder="Descripción (opcional)"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />

                <select
                  value={formData.genre}
                  onChange={e => setFormData({ ...formData, genre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>
                      {GENRE_LABELS[genre]}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Condición (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.condition_rating}
                      onChange={e => setFormData({ ...formData, condition_rating: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Importancia</label>
                    <select
                      value={formData.importance_level}
                      onChange={e => setFormData({ ...formData, importance_level: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="bestseller">Bestseller</option>
                      <option value="medium">Importancia Media</option>
                      <option value="low_influence">Menos Influyente</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" variant="primary" className="w-full">
                  Guardar Libro
                </Button>
              </form>
            </Card>
          )}

          {loading ? (
            <p className="text-gray-500">Cargando libros...</p>
          ) : userBooks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">No tienes libros publicados aún</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {userBooks.map(book => (
                <Card key={book.id} className="p-4 space-y-3">
                  {book.images?.[0] && (
                    <img
                      src={book.images[0]}
                      alt={book.title}
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-xs text-gray-500 mt-2">Condición: {book.condition_rating}/10</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
