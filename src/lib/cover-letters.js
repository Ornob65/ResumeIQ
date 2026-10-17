import { createSupabaseClient } from './supabase'

const coverLetterSelect = 'id, title, content, cover_letter_data, user_id, user_email, created_at, updated_at'

export async function createCoverLetter(getToken, coverLetter) {
  const supabase = createSupabaseClient(getToken)
  return supabase.from('cover_letters').insert(coverLetter).select(coverLetterSelect).single()
}

export async function getUserCoverLetters(getToken, userId) {
  const supabase = createSupabaseClient(getToken)
  return supabase
    .from('cover_letters')
    .select(coverLetterSelect)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
}

export async function getCoverLetter(getToken, coverLetterId, userId) {
  const supabase = createSupabaseClient(getToken)
  return supabase
    .from('cover_letters')
    .select(coverLetterSelect)
    .eq('id', coverLetterId)
    .eq('user_id', userId)
    .single()
}

export async function updateCoverLetter(getToken, coverLetterId, userId, coverLetter) {
  const supabase = createSupabaseClient(getToken)
  return supabase
    .from('cover_letters')
    .update(coverLetter)
    .eq('id', coverLetterId)
    .eq('user_id', userId)
    .select(coverLetterSelect)
    .single()
}
