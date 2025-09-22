import React from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  isNext: boolean;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, isNext, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (isNext) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="pagination">
      <button
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={handlePrevious}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>
      
      <span className="pagination-info">
        Page {currentPage}
      </span>
      
      <button
        className={`pagination-btn ${!isNext ? 'disabled' : ''}`}
        onClick={handleNext}
        disabled={!isNext}
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;
