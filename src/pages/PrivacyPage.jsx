import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

export default function PrivacyPage() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    if (meta) meta.setAttribute('content', 'noindex, nofollow')
  }, [])

  return (
    <div className="relative w-screen min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <Stars radius={50} depth={50} count={350} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>

      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-[rgba(10,10,15,0.8)] backdrop-blur-[12px] border-b border-[rgba(255,255,255,0.06)] px-8 py-4 flex items-center justify-between">
          <Link to="/" className="text-[#a5b4fc] hover:text-white transition-colors text-sm font-medium">
            &larr; Back to Home
          </Link>
          <div className="font-mono text-white tracking-wide text-sm font-semibold">
            Proof of Work
          </div>
        </div>

        {/* Content */}
        <div className="pt-[100px] px-8 pb-[60px] max-w-[720px] w-full mx-auto flex-1 flex flex-col">
          <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[16px] p-12">
            <p className="text-[#888] text-[13px] mb-4">Last updated: July 12, 2026</p>
            <h1 className="text-white font-bold text-[32px] leading-none mb-2">Privacy Policy</h1>
            <p className="text-[#888] text-[16px]">We keep it simple and transparent.</p>
            
            <div className="border-b border-[rgba(255,255,255,0.06)] my-6"></div>

            <h2 className="text-[#a5b4fc] text-[16px] font-semibold mt-8 mb-3 tracking-[0.05em]">1. What is Proof of Work?</h2>
            <p className="text-[#ccc] text-[15px] leading-[1.8]">
              Proof of Work is a personal portfolio platform that allows developers, students, and competition enthusiasts to preserve and showcase their participation certificates and competition projects in one place.
            </p>

            <h2 className="text-[#a5b4fc] text-[16px] font-semibold mt-8 mb-3 tracking-[0.05em]">2. What Data We Collect</h2>
            <ul className="list-disc pl-5 text-[#ccc] text-[15px] leading-[1.8] space-y-1">
              <li>Your email address (via Google OAuth or email signup)</li>
              <li>Your chosen username</li>
              <li>Project details you enter: title, competition name, date, project URL, description</li>
              <li>Certificate files you upload (images or PDFs)</li>
              <li>Basic usage analytics (page views, performance metrics via Vercel Analytics)</li>
            </ul>

            <h2 className="text-[#a5b4fc] text-[16px] font-semibold mt-8 mb-3 tracking-[0.05em]">3. How We Use Your Data</h2>
            <ul className="list-disc pl-5 text-[#ccc] text-[15px] leading-[1.8] space-y-1">
              <li>To display your personal vault and public profile</li>
              <li>To authenticate you securely via Supabase Auth</li>
              <li>To store and serve your uploaded certificates via Supabase Storage</li>
              <li>To improve your project descriptions via Gemini AI (text only, not stored by us)</li>
              <li>To monitor site performance via Vercel Analytics</li>
            </ul>

            <h2 className="text-[#a5b4fc] text-[16px] font-semibold mt-8 mb-3 tracking-[0.05em]">4. Third Party Services</h2>
            <div className="space-y-2">
              <div className="text-[15px]"><span className="text-[#a5b4fc] font-medium">Supabase</span> <span className="text-[#ccc]">— authentication, database, and file storage (supabase.com)</span></div>
              <div className="text-[15px]"><span className="text-[#a5b4fc] font-medium">Google OAuth</span> <span className="text-[#ccc]">— sign in with Google (google.com)</span></div>
              <div className="text-[15px]"><span className="text-[#a5b4fc] font-medium">Google Gemini API</span> <span className="text-[#ccc]">— AI description enhancement (ai.google.dev)</span></div>
              <div className="text-[15px]"><span className="text-[#a5b4fc] font-medium">Vercel</span> <span className="text-[#ccc]">— hosting and analytics (vercel.com)</span></div>
            </div>

            <h2 className="text-[#a5b4fc] text-[16px] font-semibold mt-8 mb-3 tracking-[0.05em]">5. Your Rights</h2>
            <ul className="list-disc pl-5 text-[#ccc] text-[15px] leading-[1.8] space-y-1">
              <li>You can delete any project from your vault at any time</li>
              <li>You can update your username and privacy settings anytime</li>
              <li>You can control what is visible on your public profile</li>
              <li>To request full account deletion, contact us at the email below</li>
            </ul>

            <h2 className="text-[#a5b4fc] text-[16px] font-semibold mt-8 mb-3 tracking-[0.05em]">6. Data Security</h2>
            <p className="text-[#ccc] text-[15px] leading-[1.8]">
              Your data is stored securely on Supabase infrastructure with row-level security (RLS) enabled. Certificate files are stored in a secured storage bucket. We never sell your data to third parties.
            </p>

            <h2 className="text-[#a5b4fc] text-[16px] font-semibold mt-8 mb-3 tracking-[0.05em]">7. Contact</h2>
            <p className="text-[#ccc] text-[15px] leading-[1.8]">
              For any privacy concerns or data deletion requests:<br />
              Email: <a href="mailto:naitik.270810@gmail.com" style={{color: '#6366f1'}}>naitik.270810@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
