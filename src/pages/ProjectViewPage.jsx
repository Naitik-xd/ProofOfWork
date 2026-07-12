import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as pdfjsLib from 'pdfjs-dist';
import html2canvas from 'html2canvas';

// External link icon
const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

// Renders a single page of a PDF
function PdfPageRenderer({ pdfDocument, pageNumber }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let renderTask = null;
    let isMounted = true;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        if (!isMounted) return;

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;

        if (isMounted) setLoading(false);
      } catch (err) {
        console.error(`Error rendering page ${pageNumber}:`, err);
        if (isMounted) setLoading(false);
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDocument, pageNumber]);

  return (
    <div className="relative w-full bg-white mb-2 last:mb-0">
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.2)] animate-pulse flex items-center justify-center">
          <span className="text-[#a5b4fc] text-sm">Loading page {pageNumber}...</span>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-auto block" />
    </div>
  );
}

// Loads the PDF and renders all its pages
function FullPdfViewer({ url }) {
  const [pdfDocument, setPdfDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [numPages, setNumPages] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url, withCredentials: false });
        const pdf = await loadingTask.promise;
        if (!isMounted) return;
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF document:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [url]);

  if (error) {
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

  if (loading) {
    return (
      <div className="w-full h-[300px] bg-gradient-to-br from-[rgba(99,102,241,0.2)] to-[rgba(139,92,246,0.2)] animate-pulse flex items-center justify-center">
        <span className="text-[#a5b4fc] text-sm font-medium">Loading Document...</span>
      </div>
    );
  }

  const pages = [];
  for (let i = 1; i <= numPages; i++) {
    pages.push(<PdfPageRenderer key={i} pdfDocument={pdfDocument} pageNumber={i} />);
  }

  return <div className="flex flex-col w-full">{pages}</div>;
}

export default function ProjectViewPage() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    if (meta) meta.setAttribute('content', 'noindex, nofollow')
  }, [])
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const shareCardRef = useRef(null);

  useEffect(() => {
    async function loadProject() {
      try {
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setProject(data);
      } catch (err) {
        console.error(err);
        setError("Project not found");
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCard = async () => {
    if (!shareCardRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        width: 1200,
        height: 630,
        scale: 1,
        useCORS: true,
        backgroundColor: '#0a0a0f'
      });
      const link = document.createElement('a');
      link.download = (project.title || 'Project').replace(/\s+/g, '-') + '-proof-of-work.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Failed to download image:", err);
      alert("Failed to generate image");
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-screen min-h-screen bg-[#0a0a0f] flex items-center justify-center relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <Stars radius={50} depth={50} count={350} factor={4} saturation={0} fade speed={1} />
          </Canvas>
        </div>
        <div className="w-10 h-10 border-4 border-[rgba(255,255,255,0.1)] border-t-[#6366f1] rounded-full animate-spin z-10" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-screen min-h-screen bg-[#0a0a0f] flex items-center justify-center relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <Stars radius={50} depth={50} count={350} factor={4} saturation={0} fade speed={1} />
          </Canvas>
        </div>
        <div className="z-10 text-white text-xl font-medium">{error || "Project not found"}</div>
      </div>
    );
  }

  const isPdf = project.certificate_url?.toLowerCase().endsWith('.pdf');

  return (
    <div className="relative w-screen min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <Stars radius={50} depth={50} count={350} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>

      {/* Main UI Container */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,10,15,0.8)] backdrop-blur-[12px] border-b border-[rgba(255,255,255,0.06)] px-8 py-4 flex items-center justify-between">
          <Link to="/vault" className="text-[#a5b4fc] hover:text-white transition-colors text-sm font-medium">
            &larr; Back to Vault
          </Link>
          <div className="font-mono text-white tracking-wide text-sm font-semibold">
            Proof of Work
          </div>
        </div>

        {/* Content */}
        <div className="pt-[100px] px-8 pb-[60px] max-w-[900px] w-full mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-[55%_45%] gap-10"
          >
            {/* LEFT COLUMN: Certificate */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col"
            >
              <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden h-fit w-full">
                {isPdf ? (
                  <div className="flex flex-col p-2">
                    <div className="max-h-[60vh] overflow-y-auto rounded-lg bg-[#111]">
                      <FullPdfViewer url={project.certificate_url} />
                    </div>
                    <button
                      onClick={() => window.open(project.certificate_url, '_blank')}
                      className="mt-4 w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white py-2.5 px-5 font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                    >
                      Open Full PDF
                    </button>
                  </div>
                ) : imageError ? (
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
                ) : (
                  <img 
                    src={project.certificate_url} 
                    alt="Certificate"
                    className="w-full h-auto block cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxOpen(true)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      setImageError(true);
                    }}
                  />
                )}
              </div>
            </motion.div>

            {/* RIGHT COLUMN: Details */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="flex flex-col gap-5"
            >
              {/* HEADER */}
              <div>
                {project.competition_name && (
                  <div className="inline-block bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] rounded-full px-3.5 py-1 text-[13px] font-medium text-[#a5b4fc] mb-3">
                    {project.competition_name}
                  </div>
                )}
                <h1 className="text-white font-bold text-[28px] leading-[1.2]">
                  {project.title}
                </h1>
                <p className="text-[#888] text-[14px] mt-2 font-medium">
                  {project.date}
                </p>
              </div>

              {/* DESCRIPTION */}
              <div>
                <h3 className="text-[#888] text-[11px] uppercase tracking-[0.1em] font-semibold mb-2">
                  About this project
                </h3>
                <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-xl p-5">
                  <p className="text-[#ccc] text-[15px] leading-[1.7] whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              </div>

              {/* SHARE AND LINKS */}
              <div>
                <h3 className="text-[#888] text-[11px] uppercase tracking-[0.1em] font-semibold mb-2">
                  Share & Links
                </h3>
                
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-[10px] p-3 text-white text-[14px] font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors mb-2"
                >
                  <ShareIcon /> Share Project
                </button>

                {project.project_url && (
                  <button
                    onClick={() => window.open(project.project_url, '_blank')}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-lg py-3 px-4 text-[14px] font-semibold hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all mb-2"
                  >
                    <ExternalLinkIcon /> View Live Project
                  </button>
                )}
                
                <button
                  onClick={() => window.open(project.certificate_url, '_blank')}
                  className={`w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-lg py-3 px-4 text-white text-[14px] font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors`}
                >
                  View Certificate
                </button>
              </div>

            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[rgba(10,10,20,0.97)] backdrop-blur-[20px]"
          >
            <div className="relative w-full max-w-[480px] bg-transparent border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 shadow-2xl">
              <h2 className="text-white font-bold text-[18px] mb-6 text-center">Share Project</h2>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleDownloadCard}
                  disabled={isDownloading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-medium hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-shadow disabled:opacity-50"
                >
                  {isDownloading ? 'Generating Image...' : 'Download Card'}
                </button>
                
                <button 
                  onClick={handleCopyLink}
                  className="w-full py-3 rounded-lg border border-[#6366f1] text-[#a5b4fc] font-medium hover:bg-[rgba(99,102,241,0.1)] transition-colors"
                >
                  {copied ? 'Copied ✓' : 'Copy Link'}
                </button>
                
                <button 
                  onClick={() => setShareModalOpen(false)}
                  className="w-full py-3 rounded-lg border border-[rgba(255,255,255,0.2)] text-white font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors mt-2"
                >
                  Close
                </button>
              </div>

              <p className="text-[#888] text-[13px] text-center mt-6">
                💡 Use the downloaded image as your LinkedIn post cover
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HIDDEN SHARE CARD (For html2canvas capture) */}
      <div 
        ref={shareCardRef}
        style={{
          width: '1200px',
          height: '630px',
          position: 'absolute',
          left: '-9999px',
          top: 0,
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0a2e 50%, #0a0a1f 100%)',
          border: '1px solid rgba(99,102,241,0.3)',
          padding: '60px',
          display: 'flex',
          gap: '60px',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        {/* Left Side (Certificate Preview) */}
        <div style={{ width: '40%', height: '400px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          {isPdf ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '64px' }}>📄</span>
              <span style={{ color: '#888', fontSize: '20px', fontWeight: 'bold' }}>PDF Certificate</span>
            </div>
          ) : (
            <img src={project.certificate_url} alt="Certificate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
          )}
        </div>
        
        {/* Right Side (Details) */}
        <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            background: 'rgba(99,102,241,0.2)', 
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: '20px', 
            padding: '4px 14px', 
            color: '#a5b4fc', 
            fontSize: '14px',
            alignSelf: 'flex-start',
            fontWeight: '600'
          }}>
            Proof of Work
          </div>
          
          <h1 style={{ color: 'white', fontWeight: 'bold', fontSize: '42px', lineHeight: '1.2', margin: '20px 0 12px', wordWrap: 'break-word' }}>
            {project.title}
          </h1>
          
          {project.competition_name && (
            <h2 style={{ color: '#a5b4fc', fontSize: '20px', margin: '0' }}>
              {project.competition_name}
            </h2>
          )}
          
          <p style={{ color: '#888', fontSize: '16px', marginTop: '8px' }}>
            {project.date}
          </p>
          
          <p style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.6', marginTop: '20px', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {project.description}
          </p>

          <p style={{ color: '#555', fontFamily: 'monospace', fontSize: '14px', marginTop: 'auto', paddingTop: '40px' }}>
            my-proof-of-work.vercel.app
          </p>
        </div>
      </div>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {lightboxOpen && !isPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[1000] bg-[rgba(0,0,0,0.95)] flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setLightboxOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 transition-colors"
              onClick={() => setLightboxOpen(false)}
            >
              &times;
            </button>
            <img 
              src={project.certificate_url} 
              alt="Full screen certificate"
              className="max-w-[90vw] max-h-[90vh] object-contain cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
