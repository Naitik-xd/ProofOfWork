import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { supabase } from '../lib/supabase';
import { getUserProjects } from '../lib/projects';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CertificatePreview from '../components/CertificatePreview';

function ProjectCard({ project, index }) {
  const navigate = useNavigate();
  
  const isPdf = project.certificate_url?.toLowerCase().endsWith('.pdf');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="group relative flex flex-col bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(99,102,241,0.5)] hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)] hover:bg-[rgba(255,255,255,0.07)]"
    >
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
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
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
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Loading Vault...</div>;
  }

  const isEmpty = projects.length === 0;

  return (
    <div className="relative w-screen min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      
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

        {/* Page Content */}
        <div className="pt-[80px] px-8 pb-10 max-w-[1400px] w-full mx-auto flex-1">
          
          <div className="mb-10 mt-8">
            <h1 className="text-white font-bold text-[28px] tracking-tight mb-1">Your Vault</h1>
            <p className="text-[#888] text-[14px]">
              {projects.length} project{projects.length === 1 ? '' : 's'} immortalized
            </p>
          </div>

          {isEmpty ? (
            /* Empty State */
            <div className="mt-[15vh] flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="text-[48px] text-[rgba(99,102,241,0.2)] mb-4"
              >
                ✦
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-[22px] font-bold text-white mb-2"
              >
                Your vault is empty
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[#888] text-[14px] mb-8"
              >
                Add your first project to get started.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link
                  to="/add"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-shadow"
                >
                  Add Project
                </Link>
              </motion.div>
            </div>
          ) : (
            /* Card Grid */
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
              <AnimatePresence>
                {projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
