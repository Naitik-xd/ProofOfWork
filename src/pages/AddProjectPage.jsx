import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { supabase } from '../lib/supabase';

// Inline Upload Cloud SVG
const UploadIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 16L12 11L17 16" stroke="rgba(99,102,241,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 11V21" stroke="rgba(99,102,241,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20.39 16.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" stroke="rgba(99,102,241,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 16H20.39" stroke="rgba(99,102,241,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 16H3.6" stroke="rgba(99,102,241,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function AddProjectPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form State
  const [title, setTitle] = useState('');
  const [competitionName, setCompetitionName] = useState('');
  const [date, setDate] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    if (meta) meta.setAttribute('content', 'noindex, nofollow')
  }, [])

  // Handle File Selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selectedFile));
      } else {
        setPreviewUrl(null);
      }
      setErrors((prev) => ({ ...prev, file: null }));
    }
  };

  const [lastEnhanced, setLastEnhanced] = useState(0);

  const handleEnhance = async () => {
    const now = Date.now();
    if (now - lastEnhanced < 10000) {
      setEnhanceError('Please wait 10 seconds before enhancing again');
      return;
    }
    setLastEnhanced(now);
    
    if (!description.trim()) return;
    setEnhancing(true);
    setEnhanceError(null);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-description', {
        body: { description: description }
      });
      
      console.log('enhance response:', data, error);

      if (error) throw error;
      
      if (data?.enhanced) {
        setDescription(data.enhanced);
      } else {
        console.log('no enhanced field in response:', data);
        setEnhanceError('Failed to enhance description. Try again.');
      }
    } catch (err) {
      console.error("Error enhancing description:", err);
      setEnhanceError(err.message || 'An error occurred while enhancing.');
    } finally {
      setEnhancing(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!competitionName.trim()) newErrors.competitionName = 'Competition name is required';
    if (!date) newErrors.date = 'Date is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!file) newErrors.file = 'Certificate is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    const sanitize = (str) => str.trim().replace(/<[^>]*>/g, '');
    const sanitizedTitle = sanitize(title);
    const sanitizedCompetitionName = sanitize(competitionName);
    const sanitizedDescription = sanitize(description);
    const sanitizedProjectUrl = projectUrl ? sanitize(projectUrl) : '';

    if (sanitizedProjectUrl && !sanitizedProjectUrl.match(/^https?:\/\/.+/)) {
      setSubmitError('Project URL must start with http:// or https://');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setSubmitError('Only PNG, JPG, WEBP and PDF files are allowed');
      return;
    }

    if (file.size > maxSize) {
      setSubmitError('File size must be under 10MB');
      return;
    }
    
    setLoading(true);
    setSubmitError(null);

    try {
      if (!userId) throw new Error("User not authenticated.");

      // Step 1: Upload certificate
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Step 2: Get Public URL
      const { data: urlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);
        
      const certificate_url = urlData.publicUrl;

      // Step 3: Insert into projects table
      const { error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: userId,
          title: sanitizedTitle,
          competition_name: sanitizedCompetitionName,
          date,
          project_url: sanitizedProjectUrl || null,
          description: sanitizedDescription,
          certificate_url
        });

      if (insertError) throw insertError;

      // Success
      navigate('/vault');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong adding your project.");
    } finally {
      setLoading(false);
    }
  };

  // Common input classes
  const inputClass = "w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#6366f1] transition-colors disabled:opacity-50";

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative w-screen min-h-screen overflow-y-auto bg-[#0a0a0f]">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <Stars radius={50} depth={50} count={250} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>

      {/* Progress Bar (Loading State) */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-[rgba(255,255,255,0.1)]">
          <motion.div 
            className="h-full bg-[#6366f1]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center p-6 min-h-screen">
        
        {/* Top Link */}
        <div className="w-full max-w-[560px] flex justify-start mb-4 pt-4">
          <Link 
            to="/vault" 
            className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
          >
            <span>&larr;</span> Back to Vault
          </Link>
        </div>

        {/* Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.05, delayChildren: 0.1 }
            }
          }}
          className="w-full max-w-[560px] rounded-2xl p-8 backdrop-blur-[12px] mb-12 shadow-2xl"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Add New Project</h1>
            <p className="text-[#a1a1aa] text-sm">Immortalize your work.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Project Title *</label>
              <input
                type="text"
                placeholder="e.g. NeuralOps — AI SaaS Dashboard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              {errors.title && <p className="text-[#ef4444] text-xs mt-1.5">{errors.title}</p>}
            </motion.div>

            {/* Competition Name */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Competition Name *</label>
              <input
                type="text"
                placeholder="e.g. Frontend Battle 3.0, IIT Bhubaneswar"
                value={competitionName}
                onChange={(e) => setCompetitionName(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
              {errors.competitionName && <p className="text-[#ef4444] text-xs mt-1.5">{errors.competitionName}</p>}
            </motion.div>

            {/* Date */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                className={`${inputClass} [color-scheme:dark]`}
              />
              {errors.date && <p className="text-[#ef4444] text-xs mt-1.5">{errors.date}</p>}
            </motion.div>

            {/* Project URL */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Project URL</label>
              <input
                type="url"
                placeholder="https://your-project.vercel.app"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                disabled={loading}
                className={inputClass}
              />
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Description *</label>
              <textarea
                rows="5"
                placeholder="Describe your project, what you built, what you learned..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading || enhancing}
                className={`${inputClass} resize-none mb-2`}
              />
              {errors.description && <p className="text-[#ef4444] text-xs mb-2 mt-[-4px]">{errors.description}</p>}
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={handleEnhance}
                  disabled={loading || enhancing || !description.trim()}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#6366f1] text-[#a5b4fc] hover:bg-[rgba(99,102,241,0.1)] transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  ✨ {enhancing ? 'Enhancing...' : 'Enhance with Gemini'}
                </button>
              </div>
              {enhanceError && <p style={{ color: '#ef4444', fontSize: '13px' }} className="mt-2">{enhanceError}</p>}
            </motion.div>

            {/* Certificate Upload */}
            <motion.div variants={itemVariants}>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Certificate *</label>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf"
                onChange={handleFileChange}
                disabled={loading}
              />
              <div 
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`w-full p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors
                  ${errors.file ? 'border-[#ef4444] bg-[rgba(239,68,68,0.05)]' : 'border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.05)] hover:bg-[rgba(99,102,241,0.1)]'}
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {!file ? (
                  <>
                    <UploadIcon />
                    <p className="text-sm text-white mt-3 font-medium">Drop your certificate here or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, PDF supported</p>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-auto h-24 object-cover rounded mb-3 border border-[rgba(255,255,255,0.1)]" />
                    ) : (
                      <div className="w-16 h-16 rounded bg-[rgba(255,255,255,0.1)] flex items-center justify-center mb-3">
                        <span className="text-xs text-white uppercase">{file.name.split('.').pop()}</span>
                      </div>
                    )}
                    <p className="text-sm text-white font-medium truncate max-w-full px-4">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>
              {errors.file && <p className="text-[#ef4444] text-xs mt-1.5">{errors.file}</p>}
            </motion.div>

            {submitError && (
              <motion.div variants={itemVariants} className="text-[#ef4444] text-sm text-center pt-2">
                {submitError}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? 'Adding to Vault...' : 'Add to Vault'}
              </button>
            </motion.div>

          </form>
        </motion.div>
      </div>
    </div>
  );
}
