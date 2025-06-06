import React from 'react';

interface PaginationSearchProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export const PaginationSearch: React.FC<PaginationSearchProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  searchTerm,
  onSearchChange,
  placeholder = "Rechercher..."
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <>
      <div style={{ 
        position: 'relative',
        marginBottom: '2rem',
        padding: '0 1rem'
      }}>
        <div style={{ 
          position: 'relative',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '1rem 1rem 1rem 3rem',
              borderRadius: '14px',
              border: '1px solid #e0e0e0',
              fontSize: '1rem',
              backgroundColor: '#fafafa',
              transition: 'all 0.2s',
              boxShadow: '0 1px 4px 0 rgba(0,0,0,0.03)'
            }}
          />
          <svg
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '20px',
              height: '20px',
              color: '#666'
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '3rem',
          padding: '1rem',
          borderTop: '1px solid #e0e0e0'
        }}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '0.7rem 1.2rem',
              backgroundColor: currentPage === 1 ? '#f3f4f6' : '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? '#9ca3af' : '#1a1a1a',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Précédent
          </button>
          
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0 1rem'
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                style={{
                  padding: '0.7rem 1rem',
                  backgroundColor: currentPage === page ? '#1a1a1a' : '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: currentPage === page ? '#fff' : '#1a1a1a',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  transition: 'all 0.2s'
                }}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.7rem 1.2rem',
              backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? '#9ca3af' : '#1a1a1a',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            Suivant
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}; 