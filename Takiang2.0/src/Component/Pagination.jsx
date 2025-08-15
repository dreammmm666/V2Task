// components/Pagination.jsx
import React from 'react';
import '../Css/Table.css'

function Pagination({ currentPage, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination">
      <button onClick={onPrev} disabled={currentPage === 1} className='BBB'>ก่อนหน้า</button>
      <span>หน้า {currentPage} / {totalPages}</span>
      <button onClick={onNext} disabled={currentPage === totalPages} className='BBB'>ถัดไป</button>
    </div>
  );
}

export default Pagination;
