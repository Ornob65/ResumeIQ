import { createSupabaseClient } from './supabase'

export async function createResume(getToken, resume) {
  const supabase = createSupabaseClient(getToken)

  return supabase
    .from('resumes')
    .insert(resume)
    .select('id, title, content, resume_data, user_id, user_email, created_at')
    .single()
}

export async function getUserResumes(getToken, userId) {
  const supabase = createSupabaseClient(getToken)

  return supabase
    .from('resumes')
    .select('id, title, content, resume_data, user_id, user_email, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

export async function getResume(getToken, resumeId, userId) {
  const supabase = createSupabaseClient(getToken)

  return supabase
    .from('resumes')
    .select('id, title, content, resume_data, user_id, user_email, created_at')
    .eq('id', resumeId)
    .eq('user_id', userId)
    .single()
}

  export async function updateResumeData(getToken, resumeId, userId, resumeData) {
    const supabase = createSupabaseClient(getToken)

    return supabase
      .from('resumes')
      .update({ resume_data: resumeData })
    .eq('id', resumeId)
    .eq('user_id', userId)
      .select('id, title, content, resume_data, user_id, user_email, created_at')
    .single()
  }
