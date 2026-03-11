import React, { useEffect, useState } from 'react';
import { Match, BookWithImages, Profile } from '../types';
import { getUserMatches } from '../services/matches';
import { getBookById } from '../services/books';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<(Match & { book1?: BookWithImages | null; book2?: BookWithImages | null; otherUserId?: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    setLoading(true);
    const userMatches = await getUserMatches(user.id);

    const matchesWithBooks = await Promise.all(
      userMatches.map(async match => {
        const [book1, book2] = await Promise.all([
          getBookById(match.book1_id),
          getBookById(match.book2_id),
        ]);

        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;

        return {
          ...match,
          book1: book1 || undefined,
          book2: book2 || undefined,
          otherUserId,
        };
      })
    );

    setMatches(matchesWithBooks);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando coincidencias...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <p className="text-2xl mb-4">💔</p>
            <p className="text-gray-600 text-lg">Sin coincidencias aún. ¡Explora más libros!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Coincidencias</h1>

        <div className="grid gap-6">
          {matches.map(match => (
            <Card key={match.id} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Tu libro</h3>
                  {match.book1 ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {match.book1.images?.[0] && (
                        <img
                          src={match.book1.images[0]}
                          alt={match.book1.title}
                          className="w-full h-40 object-cover rounded mb-3"
                        />
                      )}
                      <p className="font-semibold text-gray-900">{match.book1.title}</p>
                      <p className="text-sm text-gray-600">{match.book1.author}</p>
                      <p className="text-xs text-gray-500 mt-2">Condición: {match.book1.condition_rating}/10</p>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Su libro</h3>
                  {match.book2 ? (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      {match.book2.images?.[0] && (
                        <img
                          src={match.book2.images[0]}
                          alt={match.book2.title}
                          className="w-full h-40 object-cover rounded mb-3"
                        />
                      )}
                      <p className="font-semibold text-gray-900">{match.book2.title}</p>
                      <p className="text-sm text-gray-600">{match.book2.author}</p>
                      <p className="text-xs text-gray-500 mt-2">Condición: {match.book2.condition_rating}/10</p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button variant="primary" className="w-full">
                  💬 Enviar Mensaje
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
