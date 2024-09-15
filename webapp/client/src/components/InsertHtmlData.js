import React from 'react';
import DOMPurify from 'dompurify';

const InsertHtmlData = ({ htmlContent }) => {
  // Sanitize the HTML content
  const cleanHtml = DOMPurify.sanitize(htmlContent);

  return (
    <div className='inserted-html'
      // Render sanitized HTML
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
};

export default InsertHtmlData;