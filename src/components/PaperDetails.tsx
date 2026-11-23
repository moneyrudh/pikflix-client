// components/PaperDetails.tsx
import React from 'react';
import { Paper } from '@/types/content';

interface PaperDetailsProps {
  paper: Paper;
}

const linkClass = 'px-4 py-2 hover:bg-theme-primary hover:text-theme-background text-theme-primary rounded-lg transition-colors duration-300 inline-flex items-center';

// Paper-specific body of the details panel. Everything comes with the search result, so nothing loads here.
const PaperDetails: React.FC<PaperDetailsProps> = ({ paper }) => {
  const stats = [
    { label: 'Citations', value: paper.citation_count?.toLocaleString() },
    { label: 'Published', value: paper.year?.toString() },
    { label: 'Venue', value: paper.venue },
  ];
  const links = [
    paper.open_access_pdf && { href: paper.open_access_pdf, label: 'Read PDF (open access)' },
    paper.arxiv_id && { href: `https://arxiv.org/abs/${paper.arxiv_id}`, label: 'arXiv' },
    paper.doi && { href: `https://doi.org/${paper.doi}`, label: 'Publisher (DOI)' },
    { href: `https://www.semanticscholar.org/paper/${paper.id}`, label: 'Semantic Scholar' },
  ].filter((link): link is { href: string; label: string } => !!link);

  return (
    <>
      {/* Key stats row */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="text-center min-w-0">
            <div className="text-2xl font-bold text-theme-text truncate" title={stat.value ?? undefined}>{stat.value ?? 'N/A'}</div>
            <div className="text-xs text-theme-text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* TLDR */}
      {paper.tldr && (
        <div className="mb-6 italic text-theme-text-muted text-lg border-l-4 border-theme-primary/30 pl-4 py-1">
          <span className="not-italic font-semibold text-theme-text">TL;DR </span>
          {paper.tldr}
        </div>
      )}

      {/* Abstract */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3 text-theme-text">Abstract</h2>
        <p className="text-theme-text leading-relaxed whitespace-pre-line">{paper.abstract || 'No abstract available.'}</p>
      </div>

      {/* Fields of study */}
      {paper.fields_of_study.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2 text-theme-text">Fields of study</h2>
          <div className="flex flex-wrap gap-2">
            {paper.fields_of_study.map(field => (
              <span key={field} className="px-3 py-1 bg-theme-text-muted text-theme-background font-bold rounded-full text-sm shadow-sm border border-theme-text-muted">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* External links */}
      <div className="mt-8 flex flex-wrap gap-2">
        {links.map(link => (
          <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {link.label}
          </a>
        ))}
      </div>
      <p className="mt-6 text-xs text-theme-text-muted">Paper data from Semantic Scholar.</p>
    </>
  );
};

export default PaperDetails;
