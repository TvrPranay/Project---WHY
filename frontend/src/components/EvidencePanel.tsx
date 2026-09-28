import React, { useState } from 'react';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  User, 
  Search 
} from 'lucide-react';
import { EvidenceItem } from '../types/decision';

interface EvidencePanelProps {
  evidence: EvidenceItem[];
  selectedDocId?: string | null;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  evidence,
  selectedDocId,
}) => {
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!evidence || evidence.length === 0) {
    return null;
  }

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Derive unique source types
  const sourceTypes = ['ALL', ...Array.from(new Set(evidence.map((e) => e.source_type || 'DOCUMENT')))];

  // Helper to format source badge
  const getSourceBadge = (type: string) => {
    const upper = (type || '').toUpperCase();
    if (upper.includes('ADR')) return <span className="badge badge-info">{upper}</span>;
    if (upper.includes('SLACK')) return <span className="badge badge-subtle">{upper}</span>;
    if (upper.includes('INC') || upper.includes('INCIDENT')) return <span className="badge badge-invalidated">{upper}</span>;
    if (upper.includes('JIRA') || upper.includes('TICKET') || upper.includes('PAY-')) return <span className="badge badge-review">{upper}</span>;
    return <span className="badge badge-subtle">{upper || 'DOC'}</span>;
  };

  const filteredEvidence = evidence.filter((item) => {
    // Type filter
    if (filterType !== 'ALL' && (item.source_type || '').toUpperCase() !== filterType.toUpperCase()) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchContent = (item.content || '').toLowerCase().includes(q);
      const matchAuthor = (item.author || '').toLowerCase().includes(q);
      return matchTitle || matchContent || matchAuthor;
    }
    return true;
  });

  return (
    <div className="panel" style={{ padding: '1.75rem', marginBottom: '2.5rem' }} id="evidence-trail">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <FileText size={20} style={{ color: '#60a5fa' }} />
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Organizational Evidence Trail
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Verified historical memory artifacts retrieved from Hindsight persistent bank
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '0.25rem 0.6rem',
            gap: '0.4rem',
          }}>
            <Search size={13} style={{ color: '#64748b' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search evidence..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.78rem',
                width: '130px',
              }}
            />
          </div>

          {/* Source Filter chips */}
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            {sourceTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`chip ${filterType === type ? 'active' : ''}`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem' }}
              >
                {type}
              </button>
            ))}
          </div>

          <span className="badge badge-subtle">
            {filteredEvidence.length} {filteredEvidence.length === 1 ? 'record' : 'records'}
          </span>
        </div>
      </div>

      {/* Evidence items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredEvidence.map((item, idx) => {
          const isSelected = selectedDocId && item.title?.toLowerCase().includes(selectedDocId.toLowerCase());
          const isExpanded = expandedIndices[idx] || isSelected;

          return (
            <div
              key={idx}
              style={{
                backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'rgba(15, 23, 42, 0.65)',
                border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
                onClick={() => toggleExpand(idx)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {getSourceBadge(item.source_type)}
                  <span style={{
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: isSelected ? '#60a5fa' : 'var(--text-primary)',
                  }}>
                    {item.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.recorded_at && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      <Calendar size={12} />
                      {item.recorded_at.split('T')[0]}
                    </span>
                  )}
                  {item.author && (
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}>
                      <User size={12} />
                      {item.author}
                    </span>
                  )}
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Collapsed snippet or expanded full content */}
              <div style={{ marginTop: '0.75rem' }}>
                {isExpanded ? (
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    padding: '0.85rem 1rem',
                    backgroundColor: 'rgba(10, 15, 29, 0.7)',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    whiteSpace: 'pre-wrap',
                    fontFamily: item.source_type.includes('SLACK') || item.source_type.includes('ADR') ? 'inherit' : 'var(--font-mono)',
                  }}>
                    {item.content}
                  </div>
                ) : (
                  <p style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.45,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
