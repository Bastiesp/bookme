import { supabase } from './supabase';
import { Profile } from '../types';

export async function signUp(email: string, password: string, username: string, displayName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) return { success: false, error: authError.message };
    if (!authData.user) return { success: false, error: 'Failed to create user' };

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      username,
      display_name: displayName,
    });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function updateProfile(id: string, updates: Partial<Profile>): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id);

  return !error;
}
