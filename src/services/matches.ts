import { supabase } from './supabase';
import { Match, Conversation, Message } from '../types';
import { getMatchingLikes } from './books';

export async function createMatchIfPossible(userId: string, bookId: string, userBookId: string): Promise<Match | null> {
  const matchingLikes = await getMatchingLikes(userId, bookId);

  if (matchingLikes.length === 0) {
    return null;
  }

  const targetUserId = (await supabase.from('books').select('user_id').eq('id', bookId).maybeSingle()).data?.user_id;

  if (!targetUserId) return null;

  const { data, error } = await supabase
    .from('matches')
    .insert({
      user1_id: userId,
      user2_id: targetUserId,
      book1_id: userBookId,
      book2_id: bookId,
    })
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error creating match:', error);
    return null;
  }

  if (data) {
    await createConversation(data.id);
  }

  return data || null;
}

export async function getUserMatches(userId: string): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data || [];
}

export async function createConversation(matchId: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ match_id: matchId })
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error creating conversation:', error);
    return null;
  }

  return data;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      matches:match_id(
        *,
        user1:user1_id(id, display_name, avatar_url),
        user2:user2_id(id, display_name, avatar_url)
      ),
      messages(id, sender_id, content, created_at)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  const userMatches = await getUserMatches(userId);
  const userMatchIds = new Set(userMatches.map(m => m.id));

  return (data || [])
    .filter(conv => userMatchIds.has((conv.match_id as any) || (conv.matches?.[0]?.id)))
    .map(conv => ({
      ...conv,
      match: (conv.matches as any)?.[0],
    }));
}

export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  return data;
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
}
