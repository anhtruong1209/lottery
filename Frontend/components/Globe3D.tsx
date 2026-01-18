import React, { useEffect, useRef, useMemo } from 'react';
import { Participant } from '../types';

interface Globe3DProps {
  participants: Participant[];
  isSpinning: boolean;
  speed: number;
}

const Globe3D: React.FC<Globe3DProps> = ({ participants, isSpinning, speed }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const angleX = useRef(0);
  const angleY = useRef(0);

  // Interaction State
  const isDragging = useRef(false);
  const lastMouse = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const velocity = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const scaleRef = useRef(1); // Zoom level

  // Configuration
  const GLOBE_RADIUS_BASE = 400;
  const PERSPECTIVE = 1000;
  // Offset to shift globe left. Positive X moves right, Negative X moves left.
  // Since we are translating elements, we might need a wrapper or offset the points.
  // Easiest is to offset the center calculation.
  const CENTER_OFFSET_X = -50;

  // Generate 3D coordinates
  const points = useMemo(() => {
    const phi = Math.PI * (3 - Math.sqrt(5));
    const count = participants.length;

    return participants.map((p, i) => {
      const y = count > 1 ? 1 - (i / (count - 1)) * 2 : 0;
      const radius = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      return {
        ...p,
        baseX: x * GLOBE_RADIUS_BASE,
        baseY: y * GLOBE_RADIUS_BASE,
        baseZ: z * GLOBE_RADIUS_BASE,
        curX: 0, curY: 0, curZ: 0, scale: 0,
        element: null as HTMLDivElement | null
      };
    });
  }, [participants]);

  // Interaction Handlers
  const handleStart = (clientX: number, clientY: number) => {
    // Only allow interaction if not auto-spinning (or allow override?)
    // Let's allow override but it might fight with auto-spin. 
    // Usually manual interaction pauses or is ignored during 'draw' spin.
    if (isSpinning) return;

    isDragging.current = true;
    lastMouse.current = { x: clientX, y: clientY };
    velocity.current = { x: 0, y: 0 };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const dx = clientX - lastMouse.current.x;
    const dy = clientY - lastMouse.current.y;

    angleX.current += dx * 0.005;
    angleY.current += dy * 0.005;

    velocity.current = { x: dx * 0.005, y: dy * 0.005 };
    lastMouse.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isSpinning) return;
    // Zoom limit
    const newScale = scaleRef.current - e.deltaY * 0.001;
    scaleRef.current = Math.min(Math.max(0.5, newScale), 2);
  };

  useEffect(() => {
    const animate = () => {
      // 1. Logic for Rotation
      if (isSpinning) {
        // Fast Spin State (during Draw)
        const baseSpeed = 0.002;
        const currentSpeed = baseSpeed * speed;
        angleX.current += currentSpeed;
        angleY.current += currentSpeed * 0.4;
      } else if (!isDragging.current) {
        // Idle State: Constant Auto-Rotation + Inertia
        const idleSpeed = 0.001; // Constant slow spin

        angleY.current += idleSpeed; // Always rotate slowly on Y axis

        // Add momentum from previous drag
        angleX.current += velocity.current.x;
        angleY.current += velocity.current.y;

        // Friction/Decay for momentum
        velocity.current.x *= 0.95;
        velocity.current.y *= 0.95;
      }

      const cx = Math.cos(angleX.current);
      const sx = Math.sin(angleX.current);
      const cy = Math.cos(angleY.current);
      const sy = Math.sin(angleY.current);

      const currentRadius = GLOBE_RADIUS_BASE * scaleRef.current;

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
        ctx.lineWidth = 2;
      }

      // Calculate Positions
      points.forEach(point => {
        // Apply rotation
        let x1 = point.baseX * scaleRef.current * cy - point.baseZ * scaleRef.current * sy;
        let z1 = point.baseZ * scaleRef.current * cy + point.baseX * scaleRef.current * sy;

        let y1 = (point.baseY * scaleRef.current) * cx - z1 * sx;
        let z2 = z1 * cx + (point.baseY * scaleRef.current) * sx;

        const scale = PERSPECTIVE / (PERSPECTIVE + z2);
        // Apply Center Offset here
        const x2d = x1 * scale + CENTER_OFFSET_X;
        const y2d = y1 * scale;

        point.curX = x2d;
        point.curY = y2d;
        point.curZ = z2;
        point.scale = scale;

        if (point.element) {
          const opacity = Math.max(0.2, (z2 + currentRadius) / (2 * currentRadius));
          const zIndex = Math.floor(scale * 100);
          const blur = Math.max(0, (1 - scale) * 4);

          point.element.style.transform = `translate3d(${x2d}px, ${y2d}px, 0) scale(${scale})`;
          point.element.style.opacity = isSpinning ? (opacity > 0.4 ? '1' : '0.5') : opacity.toString();
          point.element.style.zIndex = zIndex.toString();
          point.element.style.filter = `blur(${isSpinning ? 0.5 : blur}px)`;

          const isFront = z2 > -50;
          point.element.style.color = isFront ? '#ffffff' : '#FFD700';
          point.element.style.textShadow = isFront
            ? '0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(255, 215, 0, 0.8)'
            : '0 0 5px rgba(0, 0, 0, 0.8)';
        }
      });

      // Draw Connections
      if (ctx && canvasRef.current && points.length > 0) {
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        // Shift Canvas Center
        const centerX = (width / 2) + CENTER_OFFSET_X;
        const centerY = height / 2;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentRadius * 0.9);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.25)');
        gradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius * 1.2, 0, Math.PI * 2);
        ctx.fill();

        if (points.length > 2) {
          const lineCount = isSpinning ? 1 : 2;
          for (let i = 0; i < points.length; i += lineCount) {
            const p1 = points[i];
            if (p1.curZ < -100) continue;

            const p2 = points[(i + 7) % points.length];
            const dist = Math.sqrt(Math.pow(p1.curX - p2.curX, 2) + Math.pow(p1.curY - p2.curY, 2));

            if (dist < 180 * scaleRef.current) {
              const alpha = (1 - dist / (180 * scaleRef.current)) * 0.8 * (p1.scale);
              ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(centerX + p1.curX, centerY + p1.curY);
              ctx.lineTo(centerX + p2.curX, centerY + p2.curY);
              ctx.stroke();
            }
          }
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    if (canvasRef.current && containerRef.current) {
      canvasRef.current.width = containerRef.current.clientWidth || window.innerWidth;
      canvasRef.current.height = containerRef.current.clientHeight || window.innerHeight;
    }

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current !== undefined) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isSpinning, speed, points]);

  if (participants.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-yellow-400/60 text-2xl tracking-[0.5em] uppercase font-bold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
        CHỜ DỮ LIỆU...
      </div>
    );
  }

  // Calculate Golden Aura position with offset
  const GOLDEN_AURA_LEFT = `calc(50% + ${CENTER_OFFSET_X}px)`;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center perspective-container overflow-hidden cursor-grab active:cursor-grabbing touch-none"
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onWheel={handleWheel}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      {/* Background Overlay - Adjusted to be lighter/brighter as requested */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-yellow-500/10 to-blue-500/10 pointer-events-none mix-blend-screen z-0"></div>

      {/* Center VISHIPEL Text (Floating in 3D space purely visual) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none text-center">
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)] tracking-widest" style={{ fontFamily: "'Inter', sans-serif" }}>
          VISHIPEL
        </h1>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Golden Aura Background - shifted */}
      <div
        className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-transparent rounded-full blur-[120px] pointer-events-none animate-pulse"
        style={{ left: GOLDEN_AURA_LEFT }}
      />

      <div className="relative w-0 h-0 pointer-events-none">
        {points.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => { points[i].element = el; }}
            className="absolute left-0 top-0 whitespace-nowrap text-base font-bold transition-colors will-change-transform select-none cursor-default flex flex-col items-center"
            style={{ transform: 'translate3d(0,0,0)' }}
          >
            <div className={`w-2 h-2 rounded-full mb-1 ${isSpinning ? 'bg-yellow-300' : 'bg-white'} shadow-[0_0_12px_#FFD700]`}></div>
            <span className="block text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wide">{p.name}</span>
            {!isSpinning && (
              <span className="block text-[11px] text-center text-yellow-100 font-bold bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md mt-1 border border-yellow-500/30">
                {p.department}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Globe3D;
