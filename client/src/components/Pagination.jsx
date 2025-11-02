import React from 'react';
import './Pagination.css';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  // Calculate total pages if itemsPerPage is provided
  const calculatedTotalPages = itemsPerPage 
    ? Math.ceil(totalItems / itemsPerPage) 
    : totalPages || 1;
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 7; // Show max 7 page buttons
    
    if (calculatedTotalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= calculatedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(calculatedTotalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < calculatedTotalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(calculatedTotalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      <button 
        className="pagination-btn pagination-nav"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Previous page"
      >
        ‹
      </button>

      {pageNumbers.map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
        ) : (
          <button
            key={page}
            className={`pagination-btn pagination-number ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      ))}

      <button 
        className="pagination-btn pagination-nav"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === calculatedTotalPages}
        title="Next page"
      >
        ›
      </button>

      <div className="pagination-info">
        Total: {totalItems} items
      </div>
    </div>
  );
}
