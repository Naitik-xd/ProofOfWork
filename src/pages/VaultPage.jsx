import React, { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { supabase } from '../lib/supabase';
import { getUserProjects } from '../lib/projects';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CertificatePreview from '../components/CertificatePreview';

class ProjectErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ProjectCard error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function ProjectCard({ project, index, onDeleteClick, onEditClick }) {
  const navigate = useNavigate();
  const isPdf = project.certificate_url?.toLowerCase().endsWith('.pdf');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="group relative flex flex-col bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(99,102,241,0.5)] hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)] hover:bg-[rgba(255,255,255,0.07)]"
    >
      {/* Action Buttons (Hover) */}
      <div className="absolute top-3 left-3 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteClick(project); }}
          className="bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] text-[#ef4444] rounded-md px-2 py-1 hover:bg-[rgba(239,68,68,0.25)] transition-colors"
          title="Delete Project"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onEditClick(project); }}
          className="bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.3)] text-[#a5b4fc] rounded-md px-2 py-1 hover:bg-[rgba(99,102,241,0.25)] transition-colors"
          title="Edit Project"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
      </div>

      {/* 1. CERTIFICATE PREVIEW */}
      <div className="relative w-full h-[180px] overflow-hidden bg-[#111] rounded-t-2xl">
        <CertificatePreview
          url={project.certificate_url}
          isImage={!isPdf}
        />
        
        {/* Badge */}
        {project.competition_name && (
          <div className="absolute top-3 right-3 bg-[rgba(0,0,0,0.7)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1 text-[11px] font-medium text-[#a5b4fc] shadow-lg">
            {project.competition_name}
          </div>
        )}
      </div>

      {/* 2. CARD BODY */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-white font-bold text-[16px] mb-1.5 line-clamp-2 leading-tight">
          {project.title}
        </h3>
        <p className="text-[#888] text-[13px] mb-3 font-medium">
          {project.date}
        </p>
        <p className="text-[#aaa] text-[13px] leading-relaxed line-clamp-3 mb-1">
          {project.description}
        </p>
      </div>

      {/* 3. CARD FOOTER */}
      <div className="px-5 pb-5 flex items-center gap-2 mt-auto">
        <button
          onClick={() => navigate(`/project/${project.id}`)}
          className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-lg py-2 text-[13px] font-medium hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-shadow"
        >
          View Details
        </button>
        <button
          onClick={() => window.open(project.certificate_url, '_blank')}
          className="px-3 py-2 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center justify-center"
          title="View Certificate"
        >
          📄
        </button>
        {project.project_url && (
          <button
            onClick={() => window.open(project.project_url, '_blank')}
            className="px-3 py-2 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors flex items-center justify-center"
            title="External Link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function VaultPage() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    if (meta) meta.setAttribute('content', 'noindex, nofollow')
  }, [])
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Modals state
  const [deletingProject, setDeletingProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editCompetition, setEditCompetition] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editFile, setEditFile] = useState(null);
  const [editReplacingFile, setEditReplacingFile] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editEnhancing, setEditEnhancing] = useState(false);
  const [editEnhanceError, setEditEnhanceError] = useState(null);
  const [lastEnhanced, setLastEnhanced] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();
          setProfile(profile);

          const { data } = await getUserProjects(user.id);
          setProjects(data || []);
        }
      } catch (err) {
        console.error("Failed to load vault data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- DELETE LOGIC ---
  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    try {
      if (deletingProject.certificate_url) {
        const parts = deletingProject.certificate_url.split('/certificates/');
        if (parts.length > 1) {
          const filePath = parts[1];
          await supabase.storage.from('certificates').remove([filePath]);
        }
      }
      await supabase.from('projects').delete().eq('id', deletingProject.id);
      setProjects(prev => prev.filter(p => p.id !== deletingProject.id));
      setDeletingProject(null);
      showToast('Project deleted');
    } catch (err) {
      console.error(err);
      alert('Failed to delete project');
    }
  };

  // --- EDIT LOGIC ---
  const openEditModal = (project) => {
    setEditingProject(project);
    setEditTitle(project.title || '');
    setEditCompetition(project.competition_name || '');
    setEditDate(project.date || '');
    setEditUrl(project.project_url || '');
    setEditDescription(project.description || '');
    setEditFile(null);
    setEditReplacingFile(false);
    setEditSaving(false);
    setEditEnhanceError(null);
  };

  const handleEditEnhance = async () => {
    const now = Date.now();
    if (now - lastEnhanced < 10000) {
      setEditEnhanceError('Please wait 10 seconds before enhancing again');
      return;
    }
    setLastEnhanced(now);
    
    if (!editDescription.trim()) return;
    setEditEnhancing(true);
    setEditEnhanceError(null);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-description', {
        body: { description: editDescription }
      });
      if (error) throw error;
      if (data?.enhanced) {
        setEditDescription(data.enhanced);
      } else {
        setEditEnhanceError('Failed to enhance description.');
      }
    } catch (err) {
      console.error(err);
      setEditEnhanceError(err.message || 'An error occurred.');
    } finally {
      setEditEnhancing(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const sanitize = (str) => str.trim().replace(/<[^>]*>/g, '');
      let newCertUrl = editingProject.certificate_url;

      if (editReplacingFile && editFile) {
        // Validation
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024;
        if (!allowedTypes.includes(editFile.type)) throw new Error('Only PNG, JPG, WEBP and PDF files are allowed');
        if (editFile.size > maxSize) throw new Error('File size must be under 10MB');

        // Delete old
        if (newCertUrl) {
           const parts = newCertUrl.split('/certificates/');
           if (parts.length > 1) {
             await supabase.storage.from('certificates').remove([parts[1]]);
           }
        }
        // Upload new
        const fileExt = editFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('certificates').upload(fileName, editFile);
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage.from('certificates').getPublicUrl(fileName);
        newCertUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('projects')
        .update({
          title: sanitize(editTitle),
          competition_name: sanitize(editCompetition),
          date: editDate,
          project_url: editUrl ? sanitize(editUrl) : null,
          description: sanitize(editDescription),
          certificate_url: newCertUrl
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      // Update local state
      setProjects(prev => prev.map(p => {
        if (p.id === editingProject.id) {
          return {
            ...p,
            title: sanitize(editTitle),
            competition_name: sanitize(editCompetition),
            date: editDate,
            project_url: editUrl ? sanitize(editUrl) : null,
            description: sanitize(editDescription),
            certificate_url: newCertUrl
          };
        }
        return p;
      }));

      setEditingProject(null);
      showToast('Project updated ✓');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to update project');
    } finally {
      setEditSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#6366f1] transition-colors disabled:opacity-50";

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Loading Vault...</div>;
  }

  const isEmpty = projects.length === 0;

  return (
    <div className="relative w-screen min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[1000] bg-[#1a1a2e] border border-[rgba(255,255,255,0.1)] text-white px-5 py-3 rounded-lg shadow-2xl font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingProject(null)} />
          <div className="relative w-full max-w-[400px] bg-[rgba(10,10,20,0.95)] border border-[rgba(239,68,68,0.3)] rounded-2xl p-8 shadow-2xl">
            <h2 className="text-white font-bold text-[18px] mb-2">Delete Project?</h2>
            <p className="text-[#888] text-[14px] mb-8">This will permanently delete this project and its certificate. This cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeletingProject(null)}
                className="flex-1 py-2.5 rounded-lg border border-[rgba(255,255,255,0.2)] text-white font-medium hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-lg bg-[#ef4444] text-white font-medium hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto bg-[rgba(10,10,20,0.97)] backdrop-blur-[20px]">
          <div className="relative w-full max-w-[560px] m-auto bg-transparent border border-[rgba(255,255,255,0.1)] rounded-[20px] p-10 my-8">
            <button 
              onClick={() => setEditingProject(null)}
              className="absolute top-6 right-6 text-[#888] hover:text-white text-2xl transition-colors leading-none"
            >
              &times;
            </button>
            <h2 className="text-white font-bold text-[22px] mb-6">Edit Project</h2>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Project Title</label>
                <input required type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} disabled={editSaving} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Competition Name</label>
                <input required type="text" value={editCompetition} onChange={(e) => setEditCompetition(e.target.value)} disabled={editSaving} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Date</label>
                <input required type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} disabled={editSaving} className={`${inputClass} [color-scheme:dark]`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Project URL</label>
                <input type="url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} disabled={editSaving} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea required rows="4" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} disabled={editSaving || editEnhancing} className={`${inputClass} resize-none mb-2`} />
                <div className="flex justify-start">
                  <button type="button" onClick={handleEditEnhance} disabled={editSaving || editEnhancing || !editDescription.trim()} className="px-3 py-1.5 text-xs font-medium rounded-md border border-[#6366f1] text-[#a5b4fc] hover:bg-[rgba(99,102,241,0.1)] transition-colors">
                    ✨ {editEnhancing ? 'Enhancing...' : 'Enhance with Gemini'}
                  </button>
                </div>
                {editEnhanceError && <p className="text-[#ef4444] text-xs mt-2">{editEnhanceError}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Certificate</label>
                {!editReplacingFile ? (
                  <div className="bg-[#111] p-3 rounded-lg border border-[rgba(255,255,255,0.1)] mb-2">
                    <div className="h-[120px] rounded overflow-hidden mb-3 relative">
                      <CertificatePreview url={editingProject.certificate_url} isImage={!editingProject.certificate_url?.toLowerCase().endsWith('.pdf')} />
                    </div>
                    <button type="button" onClick={() => setEditReplacingFile(true)} className="w-full py-2 rounded-md border border-[rgba(255,255,255,0.2)] text-white text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                      Replace Certificate
                    </button>
                  </div>
                ) : (
                  <div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp, application/pdf" onChange={(e) => setEditFile(e.target.files[0])} disabled={editSaving} />
                    <div onClick={() => fileInputRef.current?.click()} className="w-full p-6 rounded-lg border-2 border-dashed border-[rgba(99,102,241,0.4)] bg-[rgba(99,102,241,0.05)] flex flex-col items-center justify-center cursor-pointer hover:bg-[rgba(99,102,241,0.1)] transition-colors text-center">
                      {editFile ? (
                        <>
                          <p className="text-white text-sm mb-1">{editFile.name}</p>
                          <p className="text-[#888] text-xs">{(editFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                      ) : (
                        <p className="text-[#a5b4fc] text-sm">Click to select new certificate</p>
                      )}
                    </div>
                    <button type="button" onClick={() => { setEditReplacingFile(false); setEditFile(null); }} className="text-[#ef4444] text-xs mt-2 hover:underline">Cancel replace</button>
                  </div>
                )}
              </div>

              <button type="submit" disabled={editSaving} className="w-full py-3.5 mt-4 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50">
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Fixed Background Canvas */}
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
          <div className="flex items-center gap-2 font-mono text-white tracking-wide text-sm font-semibold">
            Proof of Work <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] block mt-0.5" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:inline font-medium">
              {user?.user_metadata?.username || user?.email}
            </span>
            {profile && (
              <>
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-[6px] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                  style={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    background: 'transparent'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                  </svg>
                  Settings
                </button>
                <button
                  onClick={() => window.open('/u/' + profile.username, '_blank')}
                  className="flex items-center gap-[6px] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                  style={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    background: 'transparent'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  My Public Profile
                </button>
              </>
            )}
            <Link
              to="/add"
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-shadow"
            >
              Add Project
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm rounded-lg border border-[rgba(255,255,255,0.15)] text-gray-300 hover:text-white hover:border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.05)] transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
        
        <div className="pt-[80px] px-8 pb-10 max-w-[1400px] w-full mx-auto flex-1">
          <div className="mb-10 mt-8">
            <h1 className="text-white font-bold text-[28px] tracking-tight mb-1">Your Vault</h1>
            <p className="text-[#888] text-[14px]">{projects.length} project{projects.length === 1 ? '' : 's'} immortalized</p>
          </div>

          {isEmpty ? (
            <div className="mt-[15vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[48px] text-[rgba(99,102,241,0.2)] mb-4">✦</motion.div>
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[22px] font-bold text-white mb-2">Your vault is empty</motion.h2>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-[#888] text-[14px] mb-8">Add your first project to get started.</motion.p>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Link to="/add" className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow">Add Project</Link>
              </motion.div>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
              <AnimatePresence>
                {projects.map((project, index) => (
                  <ProjectErrorBoundary key={project.id}>
                    <ProjectCard project={project} index={index} onDeleteClick={setDeletingProject} onEditClick={openEditModal} />
                  </ProjectErrorBoundary>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '16px 32px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ color: '#555', fontSize: '13px' }}>
          © 2026 Proof of Work. Built by Naitik.
        </span>
        <Link to="/privacy" style={{ 
          color: '#555', 
          fontSize: '13px', 
          textDecoration: 'none' 
        }}
        onMouseEnter={e => e.target.style.color = '#a5b4fc'}
        onMouseLeave={e => e.target.style.color = '#555'}
        >
          Privacy Policy
        </Link>
      </footer>
    </div>
  );
}
