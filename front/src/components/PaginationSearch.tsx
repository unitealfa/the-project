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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '1rem',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            fontSize: '1rem'
          }}
        />
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem'
      }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: currentPage === 1 ? '#f3f4f6' : '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Précédent
        </button>
        
        <span style={{ padding: '0 1rem' }}>
          Page {currentPage} sur {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}; 