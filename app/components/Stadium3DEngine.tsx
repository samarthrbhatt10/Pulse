"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

export interface SectorMetric {
  id: string;
  name: string;
  capacity: number;
  current: number;
  percent: number;
  status: "Optimal" | "Moderate" | "Congested" | "Critical";
  inflowRate: number;
  temp: number;
  color: string;
}

export interface GateNode {
  id: string;
  name: string;
  rate: number; // fans/min
  status: "Normal" | "Peak" | "Bottleneck";
  angle: number; // angle around perimeter in radians
}

interface Stadium3DEngineProps {
  stadiumId: string;
  stadiumName: string;
  viewLayer: "isometric" | "heatmap" | "turnstile" | "optical";
  isScanning: boolean;
  sectors: SectorMetric[];
  selectedSectorId?: string;
  onSelectSector: (sector: SectorMetric) => void;
  onSelectGate?: (gate: GateNode) => void;
}

const GATES: GateNode[] = [
  { id: "G01", name: "Gate 1 (North Main)", rate: 640, status: "Peak", angle: 0 },
  { id: "G02", name: "Gate 2 (North-East Plaza)", rate: 420, status: "Normal", angle: Math.PI / 6 },
  { id: "G03", name: "Gate 3 (East Concourse)", rate: 580, status: "Normal", angle: Math.PI / 3 },
  { id: "G04", name: "Gate 4 (East Palcos VIP)", rate: 890, status: "Bottleneck", angle: Math.PI / 2 },
  { id: "G05", name: "Gate 5 (South-East)", rate: 410, status: "Normal", angle: (2 * Math.PI) / 3 },
  { id: "G06", name: "Gate 6 (South Plaza)", rate: 720, status: "Peak", angle: (5 * Math.PI) / 6 },
  { id: "G07", name: "Gate 7 (South-West)", rate: 380, status: "Normal", angle: Math.PI },
  { id: "G08", name: "Gate 8 (West Media & VIP)", rate: 510, status: "Normal", angle: (7 * Math.PI) / 6 },
  { id: "G09", name: "Gate 9 (West Grandstand)", rate: 460, status: "Normal", angle: (4 * Math.PI) / 3 },
  { id: "G10", name: "Gate 10 (North-West Express)", rate: 610, status: "Peak", angle: (3 * Math.PI) / 2 },
  { id: "G11", name: "Gate 11 (NFC Wallet Only)", rate: 820, status: "Peak", angle: (5 * Math.PI) / 3 },
  { id: "G12", name: "Gate 12 (Biometric Fast-Pass)", rate: 490, status: "Normal", angle: (11 * Math.PI) / 6 },
];

const SPONSORS = [
  "GLOBAL BEVERAGES · 2026 WORLD CUP™ PARTNER",
  "AERO-DYNAMICS · IMPOSSIBLE IS NOTHING",
  "VERTEX PAYMENTS · EVERYWHERE YOU WANT TO BE",
  "HYPER-DRIVE · DRIVING THE FUTURE OF MOBILITY",
  "SKYLINE AIRWAYS · GOING PLACES TOGETHER",
  "NEXUS DIGITAL ASSETS · OFFICIAL PARTNER",
];

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  targetRadius: number;
  color: string;
}

export function Stadium3DEngine({
  stadiumId,
  stadiumName,
  viewLayer,
  isScanning,
  sectors,
  selectedSectorId,
  onSelectSector,
  onSelectGate,
}: Stadium3DEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Camera 3D controls
  const [yaw, setYaw] = useState<number>(0.65); // rotation around Z
  const [pitch, setPitch] = useState<number>(0.92); // tilt
  const [zoom, setZoom] = useState<number>(1.05);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [sponsorIndex, setSponsorIndex] = useState<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize particles
  useEffect(() => {
    const pts: Particle[] = [];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      pts.push({
        angle,
        radius: 220 + Math.random() * 40,
        speed: 0.8 + Math.random() * 1.5,
        targetRadius: 60 + Math.random() * 80,
        color: i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#06b6d4" : "#f59e0b",
      });
    }
    particlesRef.current = pts;
  }, [stadiumId]);

  // Rotate sponsors
  useEffect(() => {
    const interval = setInterval(() => {
      setSponsorIndex((prev) => (prev + 1) % SPONSORS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;
      const dx = (e.clientX - dragStart.x) * 0.008;
      const dy = (e.clientY - dragStart.y) * 0.006;
      setYaw((prev) => prev + dx);
      setPitch((prev) => Math.max(0.35, Math.min(1.4, prev + dy)));
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = () => setIsDragging(false);

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = (e.touches[0].clientX - dragStart.x) * 0.008;
      const dy = (e.touches[0].clientY - dragStart.y) * 0.006;
      setYaw((prev) => prev + dx);
      setPitch((prev) => Math.max(0.35, Math.min(1.4, prev + dy)));
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    },
    [isDragging, dragStart]
  );

  const handleTouchEnd = () => setIsDragging(false);

  // Math projection from 3D (x, y, z) to 2D Canvas (screenX, screenY)
  const project = useCallback(
    (x: number, y: number, z: number, cx: number, cy: number) => {
      // Rotate by yaw
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const rx = x * cosY - y * sinY;
      const ry = x * sinY + y * cosY;

      // Rotate by pitch
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const rz = ry * sinP + z * cosP;
      const ryProjected = ry * cosP - z * sinP;

      const scale = zoom * 1.15;
      const screenX = cx + rx * scale;
      const screenY = cy + ryProjected * scale - rz * 0.15;
      return { x: screenX, y: screenY, z: rz };
    },
    [yaw, pitch, zoom]
  );

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let radarAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2 + 20;

      // Clear stage
      ctx.clearRect(0, 0, width, height);

      // Background ambient gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(width, height) * 0.6);
      bgGrad.addColorStop(0, "#0f172a");
      bgGrad.addColorStop(0.7, "#0a0e17");
      bgGrad.addColorStop(1, "#050810");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Radar pulse sweep if scanning
      if (isScanning) {
        radarAngle = (radarAngle + 0.05) % (Math.PI * 2);
      }

      // 1. Draw Outer Concourse Base Ground & Grid
      ctx.strokeStyle = "rgba(51, 65, 85, 0.35)";
      ctx.lineWidth = 1;
      for (let r = 60; r <= 260; r += 40) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
          const pt = project(Math.cos(a) * r, Math.sin(a) * r, 0, cx, cy);
          if (a === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Crosshairs
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        const p1 = project(0, 0, 0, cx, cy);
        const p2 = project(Math.cos(a) * 260, Math.sin(a) * 260, 0, cx, cy);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }

      // 2. Draw Pitch / Field Level (Layer 0)
      const pitchCorners = [
        project(-80, -50, 4, cx, cy),
        project(80, -50, 4, cx, cy),
        project(80, 50, 4, cx, cy),
        project(-80, 50, 4, cx, cy),
      ];
      ctx.beginPath();
      ctx.moveTo(pitchCorners[0].x, pitchCorners[0].y);
      for (let i = 1; i < 4; i++) ctx.lineTo(pitchCorners[i].x, pitchCorners[i].y);
      ctx.closePath();

      // Pitch texture
      const pitchGrad = ctx.createLinearGradient(pitchCorners[0].x, pitchCorners[0].y, pitchCorners[2].x, pitchCorners[2].y);
      if (viewLayer === "heatmap") {
        pitchGrad.addColorStop(0, "rgba(239, 68, 68, 0.25)");
        pitchGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.25)");
        pitchGrad.addColorStop(1, "rgba(16, 185, 129, 0.25)");
      } else {
        pitchGrad.addColorStop(0, "#064e3b");
        pitchGrad.addColorStop(0.5, "#047857");
        pitchGrad.addColorStop(1, "#065f46");
      }
      ctx.fillStyle = pitchGrad;
      ctx.fill();
      ctx.strokeStyle = "#34d399";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Field markings (Center circle & half line)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 1.5;
      const cCenter = project(0, 0, 4.5, cx, cy);
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.2) {
        const pt = project(Math.cos(a) * 18, Math.sin(a) * 18, 4.5, cx, cy);
        if (a === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      const topHalf = project(0, -50, 4.5, cx, cy);
      const btmHalf = project(0, 50, 4.5, cx, cy);
      ctx.beginPath();
      ctx.moveTo(topHalf.x, topHalf.y);
      ctx.lineTo(btmHalf.x, btmHalf.y);
      ctx.stroke();

      // 3. Draw LED Perimeter Sponsor Ring (around pitch)
      const ledInner = 86;
      const ledOuter = 94;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
        const pt = project(Math.cos(a) * ledOuter, Math.sin(a) * ledOuter, 8, cx, cy);
        if (a === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      for (let a = Math.PI * 2; a >= 0 - 0.1; a -= 0.15) {
        const pt = project(Math.cos(a) * ledInner, Math.sin(a) * ledInner, 8, cx, cy);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fillStyle = "#0284c7";
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.stroke();

      // Draw active sponsor text on LED ribbon
      const sponsorPos = project(0, 90, 10, cx, cy);
      ctx.font = "bold 11px font-mono, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`★ ${SPONSORS[sponsorIndex]} ★`, sponsorPos.x, sponsorPos.y);

      // 4. Draw Seating Tiers (Lower 100s, Palcos 200s, Upper 300s)
      const tiers = [
        { inner: 98, outer: 140, zLow: 10, zHigh: 36, label: "Tier 1 Bowl" },
        { inner: 144, outer: 168, zLow: 40, zHigh: 54, label: "VIP Palcos" },
        { inner: 172, outer: 224, zLow: 58, zHigh: 96, label: "Tier 3 Upper" },
      ];

      tiers.forEach((tier, tIdx) => {
        // Divide into 4 quadrants corresponding to SEC-A, SEC-B, SEC-C, SEC-D
        const sectorsAngles = [
          { sec: sectors[0] || { status: "Critical", color: "#ef4444" }, start: -Math.PI / 4, end: Math.PI / 4 }, // East/North
          { sec: sectors[1] || { status: "Moderate", color: "#f59e0b" }, start: Math.PI / 4, end: (3 * Math.PI) / 4 }, // South
          { sec: sectors[2] || { status: "Congested", color: "#f59e0b" }, start: (3 * Math.PI) / 4, end: (5 * Math.PI) / 4 }, // West
          { sec: sectors[3] || { status: "Optimal", color: "#10b981" }, start: (5 * Math.PI) / 4, end: (7 * Math.PI) / 4 }, // North
        ];

        sectorsAngles.forEach((sa) => {
          const isSelected = selectedSectorId === sa.sec.id;
          const step = 0.12;

          ctx.beginPath();
          // Top slope
          for (let a = sa.start; a <= sa.end + 0.01; a += step) {
            const pt = project(Math.cos(a) * tier.outer, Math.sin(a) * tier.outer, tier.zHigh, cx, cy);
            if (a === sa.start) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          }
          // Bottom slope
          for (let a = sa.end; a >= sa.start - 0.01; a -= step) {
            const pt = project(Math.cos(a) * tier.inner, Math.sin(a) * tier.inner, tier.zLow, cx, cy);
            ctx.lineTo(pt.x, pt.y);
          }
          ctx.closePath();

          // Determine color based on viewLayer & status
          let fillColor = sa.sec.status === "Critical" ? "rgba(239, 68, 68, 0.75)" : sa.sec.status === "Congested" ? "rgba(245, 158, 11, 0.75)" : sa.sec.status === "Moderate" ? "rgba(59, 130, 246, 0.7)" : "rgba(16, 185, 129, 0.7)";

          if (viewLayer === "heatmap") {
            fillColor = sa.sec.status === "Critical" ? "rgba(239, 68, 68, 0.9)" : sa.sec.status === "Congested" ? "rgba(245, 158, 11, 0.85)" : "rgba(16, 185, 129, 0.8)";
          } else if (viewLayer === "turnstile") {
            fillColor = tIdx === 0 ? "rgba(6, 182, 212, 0.3)" : "rgba(15, 23, 42, 0.7)";
          } else if (tIdx === 1) {
            // VIP Palcos ribbon
            fillColor = isSelected ? "rgba(6, 182, 212, 0.9)" : "rgba(139, 92, 246, 0.65)";
          }

          ctx.fillStyle = fillColor;
          ctx.fill();

          ctx.strokeStyle = isSelected ? "#38bdf8" : "rgba(255, 255, 255, 0.25)";
          ctx.lineWidth = isSelected ? 2.5 : 0.8;
          ctx.stroke();
        });
      });

      // 5. Draw Floating Oculus Roof Canopy & Lighting Truss (Layer 4)
      if (viewLayer === "isometric" || viewLayer === "optical") {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
          const pt = project(Math.cos(a) * 236, Math.sin(a) * 236, 120, cx, cy);
          if (a === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        for (let a = Math.PI * 2; a >= 0 - 0.1; a -= 0.15) {
          const pt = project(Math.cos(a) * 150, Math.sin(a) * 150, 120, cx, cy);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
        ctx.fill();
        ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 4 structural support towers
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
          const base = project(Math.cos(a) * 230, Math.sin(a) * 230, 0, cx, cy);
          const top = project(Math.cos(a) * 230, Math.sin(a) * 230, 120, cx, cy);
          ctx.beginPath();
          ctx.moveTo(base.x, base.y);
          ctx.lineTo(top.x, top.y);
          ctx.strokeStyle = "rgba(148, 163, 184, 0.5)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // 6. Draw Concourse Particles (Fans moving along paths)
      if (viewLayer === "isometric" || viewLayer === "turnstile" || viewLayer === "heatmap") {
        particlesRef.current.forEach((pt) => {
          pt.radius -= pt.speed;
          if (pt.radius < pt.targetRadius) {
            pt.radius = 240; // reset at outer perimeter gate
          }
          const pos = project(Math.cos(pt.angle) * pt.radius, Math.sin(pt.angle) * pt.radius, 6, cx, cy);
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, viewLayer === "turnstile" ? 2.5 : 1.8, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.fill();
          if (viewLayer === "turnstile") {
            ctx.shadowColor = pt.color;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      }

      // 7. Draw Radar Sweep Beam if scanning
      if (isScanning) {
        ctx.beginPath();
        const center = project(0, 0, 15, cx, cy);
        ctx.moveTo(center.x, center.y);
        for (let da = 0; da <= 0.4; da += 0.05) {
          const pt = project(Math.cos(radarAngle - da) * 250, Math.sin(radarAngle - da) * 250, 15, cx, cy);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(6, 182, 212, 0.25)";
        ctx.fill();
      }

      // 8. Draw 12 Turnstile Gates around Perimeter
      GATES.forEach((gate) => {
        const gPos = project(Math.cos(gate.angle) * 245, Math.sin(gate.angle) * 245, 2, cx, cy);
        const isBottleneck = gate.status === "Bottleneck";
        const isPeak = gate.status === "Peak";

        ctx.beginPath();
        ctx.arc(gPos.x, gPos.y, isBottleneck ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = isBottleneck ? "#ef4444" : isPeak ? "#f59e0b" : "#10b981";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (isBottleneck || viewLayer === "turnstile") {
          ctx.font = "bold 10px sans-serif";
          ctx.fillStyle = isBottleneck ? "#fca5a5" : "#67e8f9";
          ctx.textAlign = "center";
          ctx.fillText(`${gate.id} (${gate.rate}/m)`, gPos.x, gPos.y - 10);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [yaw, pitch, zoom, viewLayer, isScanning, selectedSectorId, sectors, sponsorIndex, project]);

  return (
    <div className="w-full flex flex-col bg-slate-950/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl relative overflow-hidden select-none">
      {/* Top Controls Overlay */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-200">
            3D DIGITAL TWIN ENGINE · {stadiumName.split("—")[0]}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.12))}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-all font-mono text-xs font-bold"
            title="Zoom In"
          >
            ➕
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.12))}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition-all font-mono text-xs font-bold"
            title="Zoom Out"
          >
            ➖
          </button>
          <button
            onClick={() => {
              setYaw(0.65);
              setPitch(0.92);
              setZoom(1.05);
            }}
            className="px-2.5 py-1 rounded-lg text-slate-300 hover:bg-slate-800 transition-all text-[11px] font-extrabold uppercase"
            title="Reset Orbit Angle"
          >
            ↺ Reset Angle
          </button>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div className="relative w-full aspect-[16/10] max-h-[580px] min-h-[380px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden">
        <canvas
          ref={canvasRef}
          width={900}
          height={560}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full object-contain pointer-events-auto"
        />

        {/* Floating Help Badge */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-400 pointer-events-none flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-cyan-400">360</span>
          <span>Drag mouse or swipe to rotate 360° · Scroll to zoom</span>
        </div>

        {/* Live Sponsor Ticker Pill */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-cyan-950/80 to-slate-900/80 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold text-cyan-300 pointer-events-none flex items-center gap-2">
          <span className="text-emerald-400">★ LED RIBBON:</span>
          <span>{SPONSORS[sponsorIndex]}</span>
        </div>
      </div>

      {/* Bottom Gate & Sector Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 z-20">
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[9px] font-black uppercase text-slate-400 block">Active Turnstile Gates</span>
          <span className="text-sm font-black text-white font-mono mt-0.5 block">12 / 12 GATES LIVE</span>
        </div>
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[9px] font-black uppercase text-slate-400 block">Peak Inflow Node</span>
          <span className="text-sm font-black text-cyan-400 font-mono mt-0.5 block">G04 (890/min)</span>
        </div>
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[9px] font-black uppercase text-slate-400 block">Concourse Heat Index</span>
          <span className="text-sm font-black text-amber-400 font-mono mt-0.5 block">23.4°C · OPTIMAL</span>
        </div>
        <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80">
          <span className="text-[9px] font-black uppercase text-slate-400 block">3D FPS & Latency</span>
          <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">60 FPS (4ms)</span>
        </div>
      </div>
    </div>
  );
}
