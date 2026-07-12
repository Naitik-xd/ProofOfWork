import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function FloatingShapes() {
  const shapes = useMemo(() => {
    const items = [];
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0)
    ];
    
    for (let i = 0; i < 8; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
        scale: Math.random() * 0.5 + 0.5,
        geometry: geometries[Math.floor(Math.random() * geometries.length)]
      });
    }
    return items;
  }, []);

  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x += 0.002 * (i % 2 === 0 ? 1 : -1);
        child.rotation.y += 0.003 * (i % 2 === 0 ? 1 : -1);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {shapes.map((shape, i) => (
        <mesh 
          key={i} 
          position={shape.position} 
          rotation={shape.rotation} 
          scale={shape.scale}
          geometry={shape.geometry}
        >
          <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function LandingPage() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    if (meta) meta.setAttribute('content', 'noindex, nofollow')
  }, [])
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0f]">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <Stars radius={50} depth={50} count={250} factor={4} saturation={0} fade speed={1} />
          <FloatingShapes />
          <OrbitControls 
            autoRotate 
            autoRotateSpeed={0.3} 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={false} 
          />
        </Canvas>
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-4 text-sm font-mono tracking-[0.2em] text-[#888]"
        >
          YOUR ACHIEVEMENTS. IMMORTALIZED.
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
        >
          Proof of Work
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-[500px] text-lg text-gray-300 mb-10"
        >
          Every certificate. Every project. Every competition. Preserved in your personal vault.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-6 pointer-events-auto"
        >
          <a
            href="/auth"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
          >
            Start Your Vault
          </a>
          <button
            onClick={() => window.open('/u/naitik.270810_c388', '_blank')}
            className="px-8 py-3 rounded-full border border-[#6366f1] text-white font-semibold hover:bg-[#6366f1]/10 transition-all cursor-pointer"
          >
            View an Example
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-xs text-gray-500"
        >
          Free forever. No credit card.
        </motion.div>
      </div>
    </div>
  );
}
