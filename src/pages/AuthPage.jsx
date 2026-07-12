import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { supabase } from '../lib/supabase';



export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session:', session)
        if (session) {
          window.location.href = '/vault'
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authError = null;

    if (isSignUp) {
      if (!username.trim()) {
        setError("Username is required");
        setLoading(false);
        return;
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } }
      });
      authError = signUpError;
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      authError = signInError;
    }

    if (authError) {
      setError(authError.message);
    } else {
      navigate('/vault');
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://my-proof-of-work.vercel.app/auth',
      }
    })
    console.log('OAuth data:', data, 'error:', error)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <Stars radius={50} depth={50} count={250} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>

      {/* Back Link */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-2"
      >
        <span>&larr;</span> Back to Home
      </Link>

      {/* Auth Card Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[420px] rounded-2xl p-10 backdrop-blur-[12px]"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {/* Logo / Header */}
          <div className="text-center mb-8">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#888] mb-2">
              Proof of Work
            </h3>
            <h2 className="text-2xl font-bold text-white">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex bg-[rgba(255,255,255,0.05)] rounded-full p-1 mb-8 relative">
            <button
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors z-10 ${!isSignUp ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors z-10 ${isSignUp ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Sign Up
            </button>
            
            {/* Animated Tab Indicator */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#6366f1] rounded-full z-0"
              style={{ left: isSignUp ? 'calc(50% + 2px)' : '2px' }}
            />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#6366f1] transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#6366f1] transition-colors"
            />
            
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.15)] rounded-lg text-white placeholder-[#555] focus:outline-none focus:border-[#6366f1] transition-colors"
            />

            {error && (
              <div className="text-[#ef4444] text-sm text-center pt-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.1)]"></div>
            <span className="text-xs text-[#555]">or continue with</span>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.1)]"></div>
          </div>

          {/* Google Auth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3 flex items-center justify-center gap-3 rounded-lg border border-[rgba(255,255,255,0.15)] bg-[rgba(255,255,255,0.05)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors disabled:opacity-50"
          >
            <span style={{ 
              fontWeight: 'bold', 
              fontSize: '16px', 
              marginRight: '8px',
              color: 'white'
            }}>G</span>
            Continue with Google
          </button>

        </motion.div>
      </div>
    </div>
  );
}
