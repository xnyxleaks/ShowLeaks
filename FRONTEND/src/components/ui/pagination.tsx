import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  // Prevent invalid page changes
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };
  
  // Generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const maxVisibleButtons = 5;
    
    // Always show first page
    items.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`w-10 h-10 rounded-lg transition-all duration-200 ${
          currentPage === 1
            ? 'bg-primary-500 text-white'
            : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
        }`}
      >
        1
      </button>
    );
    
    // Calculate range to display
    let startPage = Math.max(2, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisibleButtons - 3);
    
    // Adjust if we're near the beginning
    if (startPage > 2) {
      items.push(
        <span key="start-ellipsis" className="w-10 h-10 flex items-center justify-center text-gray-400">
          ...
        </span>
      );
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-lg transition-all duration-200 ${
            currentPage === i
              ? 'bg-primary-500 text-white'
              : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipsis if needed
    if (endPage < totalPages - 1) {
      items.push(
        <span key="end-ellipsis" className="w-10 h-10 flex items-center justify-center text-gray-400">
          ...
        </span>
      );
    }
    
    // Always show last page if we have more than one page
    if (totalPages > 1) {
      items.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-10 h-10 rounded-lg transition-all duration-200 ${
            currentPage === totalPages
              ? 'bg-primary-500 text-white'
              : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return items;
  };
  
  return (
    <div className={`flex justify-center items-center space-x-2 ${className}`}>
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 h-10 rounded-lg transition-all duration-200 flex items-center ${
          currentPage === 1
            ? 'bg-dark-300 text-gray-600 cursor-not-allowed'
            : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
        }`}
      >
        Prev
      </button>
      
      {/* Page numbers */}
      {renderPaginationItems()}
      
      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 h-10 rounded-lg transition-all duration-200 flex items-center ${
          currentPage === totalPages
            ? 'bg-dark-300 text-gray-600 cursor-not-allowed'
            : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;