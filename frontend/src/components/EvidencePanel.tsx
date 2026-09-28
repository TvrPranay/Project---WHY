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
    <div className="panel" style={{ padding: '1.5rem', marginBottom: '2.5rem' }} id="evidence-trail">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} style={{ color: 'var(--accent-blue)' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Organizational Evidence Trail
            </h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Verified historical memory artifacts retrieved from Hindsight persistent bank
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Search box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-strong)',
            borderRadius: '6px',
            padding: '0.25rem 0.55rem',
            gap: '0.4rem',
          }}>
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
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
                width: '140px',
              }}
            />
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
            {sourceTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  backgroundColor: filterType === type ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${filterType === type ? '#bfdbfe' : 'var(--border-default)'}`,
                  color: filterType === type ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence items list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {filteredEvidence.map((item, idx) => {
          const isSelected = selectedDocId && item.title.includes(selectedDocId);
          const isExpanded = expandedIndices[idx];

          return (
            <div
              key={idx}
              style={{
                backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-default)'}`,
                borderRadius: '6px',
                padding: '0.85rem 1rem',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                onClick={() => toggleExpand(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1, flexWrap: 'wrap' }}>
                  {getSourceBadge(item.source_type)}
                  <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </span>
                  {(item.recorded_at || item.timestamp) && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      <Calendar size={11} />
                      {(item.recorded_at || item.timestamp)?.split('T')[0]}
                    </span>
                  )}
                  {item.author && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                    }}>
                      <User size={11} />
                      {item.author}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '0.72rem' }}>{isExpanded ? 'Collapse' : 'Inspect'}</span>
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </div>
              </div>

              {/* Preview Content */}
              {!isExpanded && item.content && (
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.45rem',
                  lineHeight: 1.45,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {item.content}
                </div>
              )}

              {/* Expanded Detailed View */}
              {isExpanded && (
                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-default)',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  lineHeight: 1.55,
                }}>
                  <div style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-default)',
                    borderRadius: '4px',
                    padding: '0.75rem',
                    fontFamily: item.source_type === 'slack' ? 'inherit' : 'var(--font-mono)',
                    fontSize: '0.78rem',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-secondary)',
                  }}>
                    {item.content}
                  </div>

                  {item.relevance_rationale && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                    }}>
                      Relevance: {item.relevance_rationale}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
