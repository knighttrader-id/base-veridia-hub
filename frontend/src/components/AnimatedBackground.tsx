import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  variant?: 'gradient' | 'particles' | 'grid' | 'waves';
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export function AnimatedBackground({ 
  variant = 'gradient', 
  intensity = 'medium',
  className = '' 
}: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (variant === 'particles' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Particle system
      const particles: Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
        opacity: number;
        color: string;
      }> = [];

      const colors = [
        '#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'
      ];

      const createParticle = () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (intensity === 'high' ? 2 : intensity === 'medium' ? 1 : 0.5),
        vy: (Math.random() - 0.5) * (intensity === 'high' ? 2 : intensity === 'medium' ? 1 : 0.5),
        size: Math.random() * (intensity === 'high' ? 4 : intensity === 'medium' ? 3 : 2) + 1,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)]
      });

      // Initialize particles
      const particleCount = intensity === 'high' ? 100 : intensity === 'medium' ? 60 : 30;
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, index) => {
          // Update position
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Bounce off edges
          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          // Keep particles in bounds
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));

          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
          ctx.fill();

          // Draw connections
          particles.slice(index + 1).forEach(otherParticle => {
            const dx = particle.x - otherParticle.x;
            const dy = particle.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(otherParticle.x, otherParticle.y);
              ctx.strokeStyle = particle.color + '20';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });

        requestAnimationFrame(animate);
      };

      animate();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [variant, intensity]);

  if (variant === 'gradient') {
    return (
      <div className={`fixed inset-0 -z-10 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900" />
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-pink-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/30 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-400/30 via-transparent to-transparent" />
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`fixed inset-0 -z-10 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite'
          }}
        />
        <style>{`
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
        `}</style>
      </div>
    );
  }

  if (variant === 'waves') {
    return (
      <div className={`fixed inset-0 -z-10 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-l from-cyan-500/10 to-pink-500/10 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 to-blue-500/10 animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>
    );
  }

  if (variant === 'particles') {
    return (
      <div className={`fixed inset-0 -z-10 ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: intensity === 'high' ? 0.8 : intensity === 'medium' ? 0.6 : 0.4 }}
        />
      </div>
    );
  }

  return null;
}

// Floating elements component
export function FloatingElements() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }} />
      <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500/20 rounded-lg rotate-45 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-cyan-500/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }} />
      <div className="absolute bottom-20 right-1/3 w-24 h-24 bg-pink-500/20 rounded-lg animate-pulse" style={{ animationDelay: '3s' }} />
      
      {/* Animated lines */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-pulse" />
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
}

// Glitch effect component
export function GlitchEffect({ children, intensity = 'low' }: { children: React.ReactNode; intensity?: 'low' | 'medium' | 'high' }) {
  const glitchIntensity = intensity === 'high' ? '0.5px' : intensity === 'medium' ? '0.3px' : '0.1px';
  
  return (
    <div className="relative">
      <div className="glitch-text" style={{ 
        filter: `blur(${glitchIntensity})`,
        animation: 'glitch 2s infinite'
      }}>
        {children}
      </div>
      <style>{`
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
      `}</style>
    </div>
  );
}
