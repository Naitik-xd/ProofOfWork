// SUPABASE TABLE: profiles
// id: uuid references auth.users(id) primary key
// username: text unique not null
// email: text
// created_at: timestamptz default now()
//
// Also add this trigger to auto-create profile on signup:
// create or replace function public.handle_new_user()
// returns trigger as $$
// begin
//   insert into public.profiles (id, username, email)
//   values (
//     new.id,
//     new.raw_user_meta_data->>'username',
//     new.email
//   );
//   return new;
// end;
// $$ language plpgsql security definer;
//
// create trigger on_auth_user_created
//   after insert on auth.users
//   for each row execute procedure public.handle_new_user();

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
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

export default function PublicProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.title = `${username} | Proof of Work`;
    
    async function fetchProfile() {
      try {
        setLoading(true);
        // 1. Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
          
        if (profileError || !profileData) {
          setNotFound(true);
          return;
        }
        
        setProfile(profileData);
        
        // 2. Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });
          
        if (!projectsError && projectsData) {
          setProjects(projectsData);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [username]);

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

  if (notFound || !profile) {
    return (
      <div className="w-screen min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative text-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <Stars radius={50} depth={50} count={350} factor={4} saturation={0} fade speed={1} />
          </Canvas>
        </div>
        <div className="z-10 flex flex-col items-center">
          <h1 className="text-white text-[72px] font-bold mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">404</h1>
          <p className="text-[#888] text-[16px] mb-8">This vault doesn't exist.</p>
          <Link to="/" className="text-[#a5b4fc] hover:text-white transition-colors text-sm font-medium">
            &larr; Go Home
          </Link>
        </div>
      </div>
    );
  }

  const initial = profile.username.charAt(0).toUpperCase();

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
          <div className="font-mono text-white tracking-wide text-sm font-semibold">
            Proof of Work
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-shadow"
          >
            Create Your Vault
          </button>
        </div>

        {/* PROFILE HEADER */}
        <div className="pt-[100px] px-8 max-w-[900px] w-full mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center sm:items-start"
          >
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center border-2 border-[rgba(99,102,241,0.4)] mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <span className="text-white font-bold text-[28px]">{initial}</span>
            </div>
            <h1 className="text-white font-bold text-[26px] mb-1">
              {profile.username}
            </h1>
            <p className="text-[#888] text-[14px]">
              {projects.length} project{projects.length === 1 ? '' : 's'} in vault
            </p>
          </motion.div>

          {/* Divider */}
          <div className="border-b border-[rgba(255,255,255,0.06)] my-8" />
        </div>

        {/* PROJECT CARDS GRID */}
        <div className="px-8 pb-[60px] max-w-[900px] w-full mx-auto">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center text-center mt-12">
              <h3 className="text-white text-[18px] mb-2 font-medium">No projects yet.</h3>
              <p className="text-[#888] text-[14px]">Check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
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
