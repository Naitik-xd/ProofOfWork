import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { motion } from 'framer-motion';

function ToggleSwitch({ label, description, isOn, onToggle }) {
  return (
    <div className="flex flex-row justify-between items-center py-4 border-b border-[rgba(255,255,255,0.06)]">
      <div>
        <div className="text-white text-[14px] font-bold">{label}</div>
        <div className="text-[#888] text-[13px] mt-1">{description}</div>
      </div>
      <button
        onClick={onToggle}
        className="relative flex items-center shrink-0 w-[44px] h-[24px] rounded-[12px] transition-colors duration-300"
        style={{ background: isOn ? '#6366f1' : 'rgba(255,255,255,0.1)' }}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute bg-white w-[20px] h-[20px] rounded-full shadow-md"
          style={{ left: isOn ? 'calc(100% - 22px)' : '2px' }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    if (meta) meta.setAttribute('content', 'noindex, nofollow')
  }, [])
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [saveError, setSaveError] = useState(null);

  const [settings, setSettings] = useState({
    show_certificate: true,
    show_description: true,
    show_project_url: true,
    show_competition_name: true,
    show_date: true
  });

  useEffect(() => {
    async function loadSettings() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profile) {
        setSettings({
          show_certificate: profile.show_certificate ?? true,
          show_description: profile.show_description ?? true,
          show_project_url: profile.show_project_url ?? true,
          show_competition_name: profile.show_competition_name ?? true,
          show_date: profile.show_date ?? true
        });
      }
      setLoading(false);
    }
    loadSettings();
  }, [navigate]);

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('profiles')
      .update({
        show_certificate: settings.show_certificate,
        show_description: settings.show_description,
        show_project_url: settings.show_project_url,
        show_competition_name: settings.show_competition_name,
        show_date: settings.show_date
      })
      .eq('id', session.user.id);
      
    setSaving(false);
    
    if (error) {
      setSaveError(error.message);
    } else {
      setSaveMessage("Settings saved ✓");
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">Loading Settings...</div>;
  }

  return (
    <div className="relative w-screen min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Fixed Background Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <Stars radius={50} depth={50} count={350} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>
      
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center pt-[100px] px-8 pb-[100px]">
        <div className="w-full max-w-[560px]">
          <Link 
            to="/vault" 
            className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2 mb-6"
          >
            <span>&larr;</span> Back to Vault
          </Link>
          
          <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[12px] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 shadow-2xl">
            <h1 className="text-white font-bold text-[24px] mb-1">Privacy Settings</h1>
            <p className="text-[#888] text-[14px] mb-8">Control what others see on your public profile</p>
            
            <div className="flex flex-col mb-8">
              <ToggleSwitch 
                label="Show Certificates" 
                description="Display certificate images on your public profile" 
                isOn={settings.show_certificate} 
                onToggle={() => handleToggle('show_certificate')} 
              />
              <ToggleSwitch 
                label="Show Project Description" 
                description="Show your project descriptions publicly" 
                isOn={settings.show_description} 
                onToggle={() => handleToggle('show_description')} 
              />
              <ToggleSwitch 
                label="Show Project URL" 
                description="Display live project links on your public profile" 
                isOn={settings.show_project_url} 
                onToggle={() => handleToggle('show_project_url')} 
              />
              <ToggleSwitch 
                label="Show Competition Name" 
                description="Show which competition each project is from" 
                isOn={settings.show_competition_name} 
                onToggle={() => handleToggle('show_competition_name')} 
              />
              <ToggleSwitch 
                label="Show Date" 
                description="Display project dates on your public profile" 
                isOn={settings.show_date} 
                onToggle={() => handleToggle('show_date')} 
              />
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white rounded-[10px] py-[12px] text-[15px] font-semibold shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            
            {saveMessage && (
              <div className="text-[#10b981] text-sm text-center mt-4 font-medium transition-opacity">
                {saveMessage}
              </div>
            )}
            
            {saveError && (
              <div className="text-red-500 text-sm text-center mt-4 transition-opacity">
                {saveError}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
