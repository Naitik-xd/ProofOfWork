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

      <div className="relative z-10 w-full min-h-screen flex flex-col items-center pt-[100px] px-8 pb-[100px]">
        <div className="w-full max-w-[700px]">
          <Link 
            to="/" 
            className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 mb-8"
          >
            <span>&larr;</span> Back to Home
          </Link>
          
          <div className="bg-[rgba(255,255,255,0.03)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.06)] rounded-2xl p-8 md:p-12 shadow-2xl text-gray-300 leading-relaxed">
            <h1 className="text-white font-bold text-3xl mb-8">Privacy Policy</h1>
            
            <section className="mb-8">
              <h2 className="text-white font-semibold text-xl mb-3">What data we collect</h2>
              <ul className="list-disc pl-5 space-y-2 text-[#aaa]">
                <li><strong>Email Address:</strong> Used strictly for authentication.</li>
                <li><strong>Username:</strong> Used to generate your personalized public profile link.</li>
                <li><strong>Uploaded Certificates:</strong> Any PDFs or images you upload are stored securely for displaying your proof of work.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-white font-semibold text-xl mb-3">How we use it</h2>
              <p className="text-[#aaa]">
                We only use your data to power your personal Vault and public profile. We do not sell your data, use it for advertising, or share it unconditionally. You have full control over what is visible publicly via the Settings page.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-white font-semibold text-xl mb-3">Third Parties</h2>
              <p className="text-[#aaa] mb-2">We rely on trusted third parties to run the infrastructure:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#aaa]">
                <li><strong>Supabase:</strong> For database, storage, and authentication (Google OAuth).</li>
                <li><strong>Google Gemini API:</strong> For the "Enhance" project description feature.</li>
                <li><strong>Vercel:</strong> For hosting and analytics.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-white font-semibold text-xl mb-3">Data Deletion</h2>
              <p className="text-[#aaa]">
                You have full control over your data. You can delete any of your projects directly from your Vault at any time. When you delete a project, its associated certificate is permanently deleted from our servers.
              </p>
            </section>

            <section>
              <h2 className="text-white font-semibold text-xl mb-3">Contact</h2>
              <p className="text-[#aaa]">
                If you have any questions about this privacy policy, please contact us at: <a href="mailto:privacy@proofofwork.com" className="text-[#a5b4fc] hover:underline">privacy@proofofwork.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
