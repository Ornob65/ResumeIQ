import React, { createContext, useContext, useState } from 'react'

const defaultResumeInfo = {
  template: 'classic',
  profileImage: '',
  personal: {
    firstName: '',
    lastName: '',
    jobTitle: '',
    email: '',
    phone: '',
    address: '',
    socialLinks: [],
  },
  summary: '',
  experience: [
    {
      company: '',
      role: '',
      dates: '',
      description: '',
    },
  ],
  education: [
    {
      school: '',
      degree: '',
      dates: '',
    },
  ],
  technicalSkills: [
    {
      name: '',
      category: '',
    },
  ],
  projects: [
    {
      name: '',
      technologies: '',
      dates: '',
      description: '',
    },
  ],
  competitiveAdvantages: '',
  interests: '',
  extraCurricularActivities: '',
  communication: '',
  references: [
    {
      name: '',
      role: '',
      organization: '',
      email: '',
      phone: '',
    },
  ],
  themeColor: '#0f766e',
  fontFamily: 'Inter',
}

const ResumeContext = createContext(null)

function mergeResumeInfo(data = {}) {
  const legacyName = data.personal?.fullName?.trim().split(/\s+/) ?? []
  const personal = data.personal ?? {}
  const arrayOrDefault = (value, fallback) => Array.isArray(value) && value.length ? value : fallback

  return {
    ...defaultResumeInfo,
    ...data,
    personal: {
      ...defaultResumeInfo.personal,
      ...personal,
      firstName: personal.firstName ?? legacyName[0] ?? '',
      lastName: personal.lastName ?? legacyName.slice(1).join(' '),
      socialLinks: Array.isArray(personal.socialLinks) ? personal.socialLinks : [],
    },
    experience: arrayOrDefault(data.experience, defaultResumeInfo.experience),
    education: arrayOrDefault(data.education, defaultResumeInfo.education),
    technicalSkills: Array.isArray(data.technicalSkills) && data.technicalSkills.length
      ? data.technicalSkills
      : data.skills?.length
        ? data.skills.map((skill) => ({ name: skill.name, category: '' }))
        : defaultResumeInfo.technicalSkills,
    projects: arrayOrDefault(data.projects, defaultResumeInfo.projects),
    references: Array.isArray(data.references)
      ? data.references
      : data.references
        ? [{ name: data.references, role: '', organization: '', email: '', phone: '' }]
        : defaultResumeInfo.references,
  }
}

export function ResumeProvider({ initialData, children }) {
  const [resumeInfo, setResumeInfo] = useState(() => mergeResumeInfo(initialData))

  function updateResumeInfo(section, value) {
    setResumeInfo((current) => ({ ...current, [section]: value }))
  }

  function updatePersonalField(field, value) {
    setResumeInfo((current) => ({
      ...current,
      personal: { ...current.personal, [field]: value },
    }))
  }

  return (
    <ResumeContext.Provider value={{ resumeInfo, updateResumeInfo, updatePersonalField }}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const context = useContext(ResumeContext)
  if (!context) throw new Error('useResume must be used inside ResumeProvider')
  return context
}

export { defaultResumeInfo }
