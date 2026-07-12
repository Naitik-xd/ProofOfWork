import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return (
    <div style={{ 
      background: '#0a0a0f', 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTop: '3px solid #6366f1',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  )

  if (!session) return <Navigate to="/auth" replace />

  return children
}
