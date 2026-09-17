import React, { forwardRef } from 'react'
import { useResume } from '@/context/ResumeContext'

const ResumePreview = forwardRef(function ResumePreview(_, ref) {
  const { resumeInfo } = useResume()
  const {
    personal,
    summary,
    experience,
    education,
    technicalSkills,
    projects,
    competitiveAdvantages,
    interests,
    extraCurricularActivities,
    communication,
    references,
    themeColor,
    fontFamily,
    template,
  } = resumeInfo

  if (template === 'image') {
    return <ImageResumePreview ref={ref} resumeInfo={resumeInfo} />
  }

  const fullName = [personal.firstName, personal.lastName].filter(Boolean).join(' ')
  const contactDetails = [personal.address, personal.email, personal.phone].filter(Boolean)
  const socialLinks = (Array.isArray(personal.socialLinks) ? personal.socialLinks : [])
    .filter((link) => link && typeof link === 'object' && link.url)

  return (
    <article ref={ref} className='resume-preview-page mx-auto w-full max-w-[210mm] min-h-[297mm] overflow-wrap-anywhere border border-slate-300 bg-white px-[18mm] py-[16mm] text-[13px] leading-[1.35] text-black shadow-sm' style={{ fontFamily: `'${fontFamily || 'Inter'}', sans-serif` }}>
      <header className='border-b pb-5 text-center' style={{ borderColor: themeColor }}>
        <h1 className='text-3xl font-normal' style={{ color: themeColor }}>
          {fullName || 'Your Name'}
        </h1>
        <p className='mt-1 font-semibold'>{personal.jobTitle || 'Professional Title'}</p>
        <div className='mt-2 flex flex-wrap justify-center gap-x-1 text-xs'>
          {contactDetails.map((detail, index) => (
            <React.Fragment key={`${detail}-${index}`}>
              {index > 0 && <span>|</span>}
              <span>{detail}</span>
            </React.Fragment>
          ))}
        </div>
        {socialLinks.length > 0 && (
          <div className='mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs' style={{ color: themeColor }}>
            {socialLinks.map((link, index) => (
              <React.Fragment key={`${link.platform}-${index}`}>
                {index > 0 && <span>|</span>}
                <span>{link.platform}: {link.url}</span>
              </React.Fragment>
            ))}
          </div>
        )}
      </header>

      <PreviewSection title='Personal Statement' color={themeColor}>
        <p className='whitespace-pre-wrap break-words text-justify'>{summary || 'Your professional summary will appear here.'}</p>
      </PreviewSection>

      <PreviewSection title='Employment History' color={themeColor}>
        {(Array.isArray(experience) ? experience : []).filter((item) => item.company || item.role || item.description).map((item, index) => (
          <div key={`${item.company}-${index}`} className='mb-5 last:mb-0'>
            <div className='flex flex-wrap justify-between gap-x-4'>
              <div>
                <h3 className='font-bold'>{item.role || 'Role'}, {item.company || 'Company'}</h3>
              </div>
              <span>{item.dates}</span>
            </div>
            {item.description && (
              <div className='ql-editor mt-2 !p-0' dangerouslySetInnerHTML={{ __html: item.description }} />
            )}
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title='Education' color={themeColor}>
        {(Array.isArray(education) ? education : []).filter((item) => item.school || item.degree).map((item, index) => (
          <div key={`${item.school}-${index}`} className='mb-3 flex justify-between gap-4 last:mb-0'>
            <div>
              <h3 className='font-bold'>{item.degree || 'Degree'}, {item.school || 'Institution'}</h3>
            </div>
            <span className='text-xs text-slate-500'>{item.dates}</span>
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title='Technical Skills' color={themeColor}>
        <div className='space-y-1'>
          {(Array.isArray(technicalSkills) ? technicalSkills : []).filter((skill) => skill.name).map((skill, index) => (
            <p key={`${skill.name}-${index}`}>
              {skill.name}
            </p>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection title='Projects' color={themeColor}>
        {(Array.isArray(projects) ? projects : []).filter((project) => project.name || project.description).map((project, index) => (
          <div key={`${project.name}-${index}`} className='mb-4 last:mb-0'>
            <div className='flex flex-wrap justify-between gap-x-4'>
              <h3 className='font-bold'>{project.name || 'Project'}</h3>
              <span>{project.dates}</span>
            </div>
            {project.technologies && <p className='italic'>{project.technologies}</p>}
            {project.description && <p className='mt-1 whitespace-pre-wrap'>{project.description}</p>}
          </div>
        ))}
      </PreviewSection>

      <PreviewTextSection title='Competitive Advantages' value={competitiveAdvantages} color={themeColor} />
      <PreviewTextSection title='Interests' value={interests} color={themeColor} />
      <PreviewTextSection title='Extra Curricular Activities' value={extraCurricularActivities} color={themeColor} />
      <PreviewTextSection title='Communication' value={communication} color={themeColor} />
      <ReferencesSection references={references} color={themeColor} />
    </article>
  )
})

const ImageResumePreview = forwardRef(function ImageResumePreview({ resumeInfo }, ref) {
  const {
    personal,
    summary,
    experience,
    education,
    technicalSkills,
    projects,
    competitiveAdvantages,
    interests,
    extraCurricularActivities,
    communication,
    profileImage,
    references,
    themeColor,
    fontFamily,
  } = resumeInfo
  const fullName = [personal.firstName, personal.lastName].filter(Boolean).join(' ')
  const contactDetails = [personal.email, personal.phone, personal.address].filter(Boolean)
  const socialLinks = (Array.isArray(personal.socialLinks) ? personal.socialLinks : [])
    .filter((link) => link && typeof link === 'object' && link.url)
  const visibleExperience = experience.filter((item) => item.company || item.role || item.description)
  const visibleEducation = education.filter((item) => item.school || item.degree)
  const visibleSkills = technicalSkills.filter((skill) => skill.name)
  const visibleProjects = projects.filter((project) => project.name || project.description)
  const visibleReferences = references.filter((reference) => (
    reference.name || reference.role || reference.organization || reference.email || reference.phone
  ))
  const accentColor = themeColor || '#173852'

  return (
    <article ref={ref} className='resume-preview-page mx-auto w-full max-w-[210mm] min-h-[297mm] overflow-wrap-anywhere bg-white text-[10px] leading-[1.25] text-slate-700 shadow-sm' style={{ fontFamily: `'${fontFamily || 'Inter'}', sans-serif` }}>
      <header className='flex items-center gap-5 px-[12mm] py-[9mm] text-white' style={{ background: accentColor }}>
        {profileImage && <img src={profileImage} alt='' className='size-[25mm] shrink-0 rounded-full object-cover ring-4 ring-white/10' />}
        <div className='min-w-0'>
          <h1 className='text-[25px] font-bold uppercase leading-none tracking-wide'>{fullName || 'Your Name'}</h1>
          <p className='mt-2 text-[13px] font-semibold'>{personal.jobTitle || 'Professional Title'}</p>
          <div className='mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-white/90'>
            {contactDetails.map((detail) => <span key={detail}>{detail}</span>)}
          </div>
          {socialLinks.length > 0 && (
            <div className='mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-white/90'>
              {socialLinks.map((link, index) => <span key={`${link.platform}-${index}`}>{link.platform}: {link.url}</span>)}
            </div>
          )}
        </div>
      </header>

      <div className='grid grid-cols-[1.55fr_1fr] gap-[8mm] px-[12mm] py-[8mm]'>
        <div>
          <ImagePreviewSection title='Experience' color={accentColor}>
            {visibleExperience.map((item, index) => (
              <div key={`${item.company}-${index}`} className='border-b border-slate-200 pb-3 pt-1 last:border-0'>
                <div className='flex justify-between gap-3'>
                  <div>
                    <h3 className='text-[12px] font-semibold' style={{ color: accentColor }}>{item.role || 'Role'}</h3>
                    <p className='font-bold text-slate-800'>{item.company || 'Company'}</p>
                  </div>
                  <span className='shrink-0 text-[9px]'>{item.dates}</span>
                </div>
                {item.description && <div className='ql-editor mt-1 !p-0 [&_ul]:list-disc [&_ul]:pl-4' dangerouslySetInnerHTML={{ __html: item.description }} />}
              </div>
            ))}
          </ImagePreviewSection>

          <ImagePreviewSection title='Education' color={accentColor}>
            {visibleEducation.map((item, index) => (
              <div key={`${item.school}-${index}`} className='border-b border-slate-200 pb-3 pt-1 last:border-0'>
                <h3 className='text-[12px] font-semibold' style={{ color: accentColor }}>{item.degree || 'Degree'}</h3>
                <p className='font-bold text-slate-800'>{item.school || 'Institution'}</p>
                <p>{item.dates}</p>
              </div>
            ))}
          </ImagePreviewSection>

          <ImagePreviewSection title='Skills' color={accentColor}>
            <div className='flex flex-wrap gap-x-5 gap-y-2 font-semibold'>
              {visibleSkills.map((skill, index) => <span key={`${skill.name}-${index}`}>{skill.name}</span>)}
            </div>
          </ImagePreviewSection>

          <ImagePreviewSection title='Projects' color={accentColor}>
            {visibleProjects.map((project, index) => (
              <div key={`${project.name}-${index}`} className='border-b border-slate-200 pb-3 pt-1 last:border-0'>
                <h3 className='font-semibold' style={{ color: accentColor }}>{project.name || 'Project'}</h3>
                {project.technologies && <p className='italic'>{project.technologies}</p>}
                {project.dates && <p>{project.dates}</p>}
                {project.description && <p className='mt-1 whitespace-pre-wrap'>{project.description}</p>}
              </div>
            ))}
          </ImagePreviewSection>
        </div>

        <div>
          <ImagePreviewSection title='Summary' color={accentColor}><p className='whitespace-pre-wrap'>{summary || 'Your professional summary will appear here.'}</p></ImagePreviewSection>
          <ImagePreviewSection title='Competitive Advantages' color={accentColor}><ImagePreviewText value={competitiveAdvantages} /></ImagePreviewSection>
          <ImagePreviewSection title='Interests' color={accentColor}><ImagePreviewText value={interests} /></ImagePreviewSection>
          <ImagePreviewSection title='Extra Curricular Activities' color={accentColor}><ImagePreviewText value={extraCurricularActivities} /></ImagePreviewSection>
          <ImagePreviewSection title='Communication' color={accentColor}><ImagePreviewText value={communication} /></ImagePreviewSection>
          <ImagePreviewSection title='References' color={accentColor}>
            {visibleReferences.map((reference, index) => (
              <div key={`${reference.name}-${index}`} className='border-b border-slate-200 pb-2 pt-1 last:border-0'>
                <p className='font-semibold' style={{ color: accentColor }}>{reference.name}</p>
                <p>{[reference.role, reference.organization].filter(Boolean).join(' | ')}</p>
                <p>{[reference.email, reference.phone].filter(Boolean).join(' | ')}</p>
              </div>
            ))}
          </ImagePreviewSection>
        </div>
      </div>
    </article>
  )
})

function ImagePreviewSection({ title, children, color }) {
  return (
    <section className='mb-5'>
      <h2 className='mb-2 border-b-2 pb-1 text-[14px] font-bold uppercase' style={{ borderColor: color, color }}>{title}</h2>
      {children}
    </section>
  )
}

function ImagePreviewText({ value }) {
  if (!value) return null
  return <p className='whitespace-pre-wrap'>{value}</p>
}

function PreviewTextSection({ title, value, color }) {
  if (!value) return null

  return (
    <PreviewSection title={title} color={color}>
      <p className='whitespace-pre-wrap'>{value}</p>
    </PreviewSection>
  )
}

function ReferencesSection({ references, color }) {
  const visibleReferences = (Array.isArray(references) ? references : []).filter((reference) => (
    reference.name || reference.role || reference.organization || reference.email || reference.phone
  ))

  if (!visibleReferences.length) return null

  return (
    <section className='resume-preview-section mt-7'>
      <h2 className='mb-3 border-b pb-1 text-sm font-bold uppercase' style={{ color, borderColor: `${color}55` }}>
        References
      </h2>
      <div className='mt-1 grid gap-0 md:grid-cols-2'>
        {visibleReferences.map((reference, index) => (
          <div key={`${reference.name}-${index}`} className={`py-2 ${index % 2 === 1 ? 'border-l-2 pl-8' : 'pr-8'} ${index > 1 ? 'border-t' : ''}`} style={{ borderColor: `${color}88`, color }}>
            <p>{index + 1}. {reference.name}</p>
            <p className='mt-2'>{reference.role}</p>
            <p className='mt-2'>{reference.organization}</p>
            <p className='mt-2'>{[reference.email, reference.phone].filter(Boolean).join(' || ')}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function PreviewSection({ title, color, children }) {
  return (
    <section className='resume-preview-section mt-7'>
      <h2 className='mb-3 border-b pb-1 text-sm font-bold uppercase' style={{ color, borderColor: `${color}55` }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default ResumePreview
