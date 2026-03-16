import { useEffect, useState, useMemo, useCallback } from 'react'
import './ParticleSystem.css'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  color: string
  rotation: number
  rotationSpeed: number
  type: 'neural' | 'apex' | 'nexus'
}

export default function ParticleSystem() {
  const [particles, setParticles] = useState<Particle[]>([])

  // Memoize colors array to prevent recreation on each render
  const neuralColors = useMemo(() => [
    'rgba(255, 215, 0, 1)',
    'rgba(0, 255, 255, 0.8)',
    'rgba(255, 0, 255, 0.8)',
    'rgba(139, 0, 255, 0.7)',
    'rgba(255, 255, 255, 0.6)',
    'rgba(255, 107, 107, 0.7)'
  ], [])

  // Reduce particle count on mobile for better performance
  const maxParticles = useMemo(() => {
    return window.innerWidth < 768 ? 20 : 35
  }, [])

  const createParticle = useCallback((id: number): Particle => {
    const types: ('neural' | 'apex' | 'nexus')[] = ['neural', 'apex', 'nexus']
    const type = types[Math.floor(Math.random() * types.length)]
    
    return {
      id,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 30,
      size: Math.random() * 4 + 2, // Reduced size for better performance
      speed: Math.random() * 3 + 1.5, // Slightly slower for smoother animation
      opacity: Math.random() * 0.8 + 0.3,
      color: neuralColors[Math.floor(Math.random() * neuralColors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4, // Reduced rotation speed
      type
    }
  }, [neuralColors])

  useEffect(() => {
    const initialParticles = Array.from({ length: maxParticles }, (_, i) => createParticle(i))
    setParticles(initialParticles)

    // Reduced update frequency for better performance
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          y: particle.y - particle.speed,
          x: particle.x + Math.sin(particle.y * 0.004) * 1.5, // Reduced wave effect
          rotation: particle.rotation + particle.rotationSpeed,
          opacity: particle.y < -30 ? 0 : particle.opacity * 0.999
        })).filter(particle => particle.y > -30)
      )
    }, 60) // Increased interval for better performance

    const addParticleInterval = setInterval(() => {
      setParticles(prev => {
        if (prev.length < maxParticles) {
          return [...prev, createParticle(Date.now())]
        }
        return prev
      })
    }, 200) // Slower particle generation

    return () => {
      clearInterval(interval)
      clearInterval(addParticleInterval)
    }
  }, [maxParticles, createParticle])

  return (
    <div className="particle-system">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`particle-dot particle-${particle.type}`}
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            transform: `rotate(${particle.rotation}deg) translate3d(0, 0, 0)`, // Added translate3d for GPU acceleration
            boxShadow: `
              0 0 ${particle.size * 3}px ${particle.color},
              0 0 ${particle.size * 6}px ${particle.color}
            ` // Reduced glow for better performance
          }}
        />
      ))}
    </div>
  )
}