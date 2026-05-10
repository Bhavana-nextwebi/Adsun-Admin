import React, { useState, useEffect } from 'react';

export const SubElements = () => {

    const [showButton, setShowButton] = useState(false);

    const handleScroll = () => {
      if (window.scrollY > 200) { 
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
  
    useEffect(() => {
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    return (
        <>
<button style={{ display: showButton ? 'block' : 'none' }}
onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
className="btn btn-danger btn-icon" id="back-to-top">
        <i className="ri-arrow-up-line"></i>
    </button>
    
</>
    )
}