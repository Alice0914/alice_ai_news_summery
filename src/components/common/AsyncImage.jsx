import React, { useState, useEffect } from 'react';

const AsyncImage = ({ src, alt, className, placeholderClassName }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = src;
  }, [src]);

  return (
    <>
      {!loaded && (
        <div className={`absolute inset-0 bg-[#0f111a] flex items-center justify-center ${placeholderClassName || ''}`}>
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      {loaded && (
        <img
          src={src}
          alt={alt}
          className={`${className} animate-in fade-in duration-500`}
        />
      )}
    </>
  );
};

export default AsyncImage;
