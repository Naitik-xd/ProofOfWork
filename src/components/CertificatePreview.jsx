import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source to match the installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export default function CertificatePreview({ url, isImage }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(!isImage);
  const [error, setError] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isImage || !url) return;

    let renderTask = null;
    let isMounted = true;

    const renderPdf = async () => {
      try {
        setLoading(true);
        setError(false);

        // Load the PDF
        const loadingTask = pdfjsLib.getDocument({ url, withCredentials: false });
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;

        // Get first page
        const page = await pdf.getPage(1);
        
        if (!isMounted) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render page to canvas context
        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error rendering PDF:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [url, isImage]);

  if (isImage) {
    if (imageError) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '32px' }}>🖼️</span>
          <span style={{ color: '#888', fontSize: '13px' }}>Certificate unavailable</span>
        </div>
      );
    }

    return (
      <img 
        src={url} 
        alt="Certificate"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(e) => {
          e.target.style.display = 'none';
          setImageError(true);
        }}
      />
    );
  }

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className={`w-full h-[180px] object-cover block transition-transform duration-500 group-hover:scale-105 ${
          loading || error ? 'hidden' : 'block'
        }`}
      />
      
      {loading && !error && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.2)] animate-pulse flex items-center justify-center">
          <span className="text-[#a5b4fc] text-sm font-medium">Loading...</span>
        </div>
      )}

      {error && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '32px' }}>🖼️</span>
          <span style={{ color: '#888', fontSize: '13px' }}>Certificate unavailable</span>
        </div>
      )}
    </div>
  );
}
