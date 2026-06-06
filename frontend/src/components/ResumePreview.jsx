import React from 'react';

const ResumePreview = ({ resumeData }) => {
  if (!resumeData) {
    return (
      <div className="h-full flex items-center justify-center p-8 border border-dashed border-gray-700 rounded-2xl text-gray-500">
        No active resume data loaded. Use the form to fill in details.
      </div>
    );
  }

  const { personalInfo = {}, skills = [], experience = [], education = [], projects = [] } = resumeData;

  return (
    <div 
      id="resume-print-content" 
      className="print-container bg-white text-black p-10 shadow-lg min-h-[1050px] w-full max-w-[800px] mx-auto font-sans leading-relaxed text-[13px] border border-gray-200"
      style={{ boxSizing: 'border-box' }}
    >
      {/* 1. PERSONAL DETAILS HEADER */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-bold uppercase tracking-wide mb-1" style={{ color: '#000' }}>
          {personalInfo.name || 'Your Full Name'}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-2 text-[11px] text-gray-700">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && (
            <>
              <span className="text-gray-400">•</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo.website && (
            <>
              <span className="text-gray-400">•</span>
              <a href={`https://${personalInfo.website}`} target="_blank" rel="noreferrer" className="underline">
                {personalInfo.website}
              </a>
            </>
          )}
          {personalInfo.location && (
            <>
              <span className="text-gray-400">•</span>
              <span>{personalInfo.location}</span>
            </>
          )}
        </div>
      </div>

      {/* 2. EXECUTIVE SUMMARY */}
      {personalInfo.summary && (
        <div className="mb-5">
          <p className="text-[12px] text-gray-800 text-justify leading-relaxed italic">
            {personalInfo.summary}
          </p>
        </div>
      )}

      {/* 3. TECHNICAL SKILLS SECTION (ATS OPTIMIZED CATEGORIES) */}
      {skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-2" style={{ color: '#000' }}>
            Technical Skills & Tools
          </h2>
          <div className="text-[12px] text-gray-800">
            <strong>Core Skills & Technologies:</strong> {skills.join(', ')}
          </div>
        </div>
      )}

      {/* 4. WORK EXPERIENCE SECTION */}
      {experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-2" style={{ color: '#000' }}>
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={idx} className="text-gray-900">
                {/* Header Row */}
                <div className="flex justify-between items-baseline font-bold text-[12px]">
                  <span>
                    {exp.position || 'Position Title'} <span className="font-normal text-gray-600">at</span> {exp.company || 'Company Name'}
                  </span>
                  <span className="text-gray-700 text-[11px] font-normal">
                    {exp.startDate || 'Start'} – {exp.current ? 'Present' : exp.endDate || 'End'}
                  </span>
                </div>
                {/* Location Subheader */}
                {exp.location && (
                  <div className="text-[10px] text-gray-600 italic -mt-0.5 mb-1">{exp.location}</div>
                )}
                {/* Bullet Descriptions */}
                {exp.description && (
                  <ul className="list-disc pl-5 space-y-1 text-[11.5px] text-gray-800 text-justify mt-1">
                    {exp.description.split('\n').map((bullet, bIdx) => {
                      if (!bullet.trim()) return null;
                      const cleanBullet = bullet.replace(/^[-\*\s•]+/, ''); // remove any leading bullet chars
                      return <li key={bIdx}>{cleanBullet}</li>;
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. PROJECTS SECTION */}
      {projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-[13px] font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-2" style={{ color: '#000' }}>
            Technical Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx} className="text-gray-900">
                <div className="flex justify-between items-baseline font-bold text-[12px]">
                  <span>
                    {proj.title || 'Project Name'}{' '}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <span className="text-[10px] font-normal text-gray-600">
                        ({proj.technologies.join(', ')})
                      </span>
                    )}
                  </span>
                  {proj.link && (
                    <span className="text-[11px] font-normal text-gray-600">
                      <a href={`https://${proj.link}`} target="_blank" rel="noreferrer" className="underline">
                        {proj.link}
                      </a>
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="text-[11.5px] text-gray-800 mt-0.5 text-justify leading-relaxed">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. EDUCATION SECTION */}
      {education.length > 0 && (
        <div>
          <h2 className="text-[13px] font-bold uppercase tracking-wider border-b border-gray-400 pb-0.5 mb-2" style={{ color: '#000' }}>
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx} className="text-gray-900">
                <div className="flex justify-between items-baseline font-bold text-[12px]">
                  <span>
                    {edu.degree || 'Degree'} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}{' '}
                    <span className="font-normal text-gray-600">from</span> {edu.school || 'University Name'}
                  </span>
                  <span className="text-gray-700 text-[11px] font-normal">
                    {edu.startDate || 'Start'} – {edu.endDate || 'End'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-gray-600 mt-0.5">
                  {edu.location && <span className="italic">{edu.location}</span>}
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
