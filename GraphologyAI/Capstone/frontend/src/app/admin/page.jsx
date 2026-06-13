"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, FileText, Clock, TrendingUp, Award, Target, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminApi } from "@/api";

/* ─── Enneagram colour map ────────────────────────────── */
const TYPE_COLORS = {
  "Tipe 1":"#C17F7C","Tipe 2":"#D4956A","Tipe 3":"#C8A87A",
  "Tipe 4":"#8FAD88","Tipe 5":"#7A9EAD","Tipe 6":"#9A8FB5",
  "Tipe 7":"#D4A574","Tipe 8":"#854C4A","Tipe 9":"#B5917A",
};
const TYPE_NAMES = {
  "Tipe 1":"Reformer","Tipe 2":"Helper","Tipe 3":"Achiever",
  "Tipe 4":"Individualist","Tipe 5":"Investigator","Tipe 6":"Loyalist",
  "Tipe 7":"Enthusiast","Tipe 8":"Challenger","Tipe 9":"Peacemaker",
  "Lainnya":"Tipe Lainnya",
};

/* ─── Build weekly trend ──────────────────────────────── */
function buildTrend(tests = []) {
  const weeks = {};
  tests.forEach((t) => {
    const d = new Date(t.createdAt);
    const s = new Date(d); s.setDate(d.getDate() - d.getDay());
    const k = s.toISOString().slice(0,10);
    weeks[k] = (weeks[k]||0) + 1;
  });
  return Object.entries(weeks)
    .sort((a,b)=>a[0].localeCompare(b[0])).slice(-8)
    .map(([k,v])=>({ label: new Date(k).toLocaleDateString("id-ID",{day:"numeric",month:"short"}), count:v }));
}

/* ─── Clean SVG Line Chart ────────────────────────────── */
function LineChart({ data }) {
  const [activeIdx, setActiveIdx] = useState(null);

  if (!data || data.length < 2) {
    return (
      <div className="h-44 flex items-center justify-center rounded-xl bg-[#FFF8F4]">
        <p className="text-sm text-[#B8A89E]">Belum cukup data untuk menampilkan tren</p>
      </div>
    );
  }

  const W=760, H=210, PL=40, PR=20, PT=52, PB=36;
  const cW=W-PL-PR, cH=H-PT-PB;
  const max=Math.max(...data.map(d=>d.count),1);

  const xs = data.map((_,i)=> PL + (i/(data.length-1))*cW);
  const ys = data.map(d  => PT + (1 - d.count/max)*cH);

  // Smooth Cubic Bezier Spline
  const linePath = xs.map((x,i)=>{
    if(i===0) return `M ${x},${ys[i]}`;
    const prevX = xs[i-1];
    const prevY = ys[i-1];
    const cp1x = prevX + (x - prevX) * 0.35;
    const cp1y = prevY;
    const cp2x = x - (x - prevX) * 0.35;
    const cp2y = ys[i];
    return `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${ys[i]}`;
  }).join(" ");

  const areaPath = `${linePath} L ${xs[xs.length-1]},${PT+cH} L ${PL},${PT+cH} Z`;
  const yTicks   = [0,0.5,1];

  const halfW = data.length > 1 ? cW / (data.length - 1) / 2 : 20;

  // Horizontal tooltip boundary calculation to prevent cropping on left/right edges
  const rectW = 110;
  const rectX = activeIdx !== null ? Math.max(8, Math.min(W - rectW - 8, xs[activeIdx] - 55)) : 0;
  const textX = rectX + rectW / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" preserveAspectRatio="xMidYMid meet" style={{display:"block"}}>
      <defs>
        {/* Soft shadow for the curve */}
        <filter id="shadow" x="-5%" y="-10%" width="110%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#854C4A" floodOpacity="0.18"/>
        </filter>
        {/* Soft gradient fill under the curve */}
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#854C4A" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#854C4A" stopOpacity="0.00"/>
        </linearGradient>
      </defs>

      {/* y-grid + y-labels */}
      {yTicks.map((v,i)=>{
        const cy = PT+(1-v)*cH;
        return (
          <g key={i}>
            <line x1={PL} x2={PL+cW} y1={cy} y2={cy} stroke="#EDE0D8" strokeWidth="1" strokeDasharray="4 4" opacity="0.7"/>
            <text x={PL-10} y={cy+3.5} textAnchor="end" fontSize="10" fill="#B8A89E" fontWeight="600">{Math.round(v*max)}</text>
          </g>
        );
      })}

      {/* vertical guide line on hover */}
      {activeIdx !== null && (
        <line
          x1={xs[activeIdx]}
          x2={xs[activeIdx]}
          y1={PT}
          y2={PT + cH}
          stroke="#854C4A"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.4"
          style={{ transition: "x1 0.1s ease-out, x2 0.1s ease-out" }}
        />
      )}

      {/* area under curve */}
      <path d={areaPath} fill="url(#ag)"/>

      {/* curve line */}
      <path d={linePath} fill="none" stroke="#854C4A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#shadow)"/>

      {/* elegant glowing data dots */}
      {xs.map((x,i)=>(
        <g key={i}>
          {/* Outer glowing border ring */}
          <circle
            cx={x}
            cy={ys[i]}
            r={activeIdx === i ? "8.5" : "6"}
            fill="#FFF8F4"
            stroke="#854C4A"
            strokeWidth={activeIdx === i ? "3.5" : "2.5"}
            style={{ transition: "all 0.15s ease-out" }}
          />
          {/* Inner core */}
          <circle
            cx={x}
            cy={ys[i]}
            r={activeIdx === i ? "3.5" : "2"}
            fill="#854C4A"
            style={{ transition: "all 0.15s ease-out" }}
          />
        </g>
      ))}

      {/* Elegant Floating Tooltip Pill */}
      {activeIdx !== null && (
        <g style={{ transition: "all 0.12s ease-out" }}>
          {/* Tooltip background pill */}
          <rect
            x={rectX}
            y={ys[activeIdx] - 46}
            width={rectW}
            height="32"
            rx="8"
            fill="#854C4A"
            filter="drop-shadow(0px 4px 8px rgba(133, 76, 74, 0.25))"
          />
          {/* Pointer triangle */}
          <polygon
            points={`${xs[activeIdx] - 5},${ys[activeIdx] - 14} ${xs[activeIdx] + 5},${ys[activeIdx] - 14} ${xs[activeIdx]},${ys[activeIdx] - 9}`}
            fill="#854C4A"
          />
          {/* Tooltip Content */}
          <text x={textX} y={ys[activeIdx] - 33} textAnchor="middle" fontSize="10" fill="#FFFFFF" fontWeight="800">
            {data[activeIdx].count} Analisis
          </text>
          <text x={textX} y={ys[activeIdx] - 22} textAnchor="middle" fontSize="9" fill="#FFFFFF" opacity="0.8" fontWeight="600">
            {data[activeIdx].label}
          </text>
        </g>
      )}

      {/* x baseline */}
      <line x1={PL} x2={PL+cW} y1={PT+cH} y2={PT+cH} stroke="#E3D5CD" strokeWidth="1.5"/>
      {/* x labels */}
      {xs.map((x,i)=>(
        <text key={i} x={x} y={PT+cH+22} textAnchor="middle" fontSize="11" fill="#B8A89E" fontWeight="500">{data[i].label}</text>
      ))}

      {/* Invisible hover zone overlays for smooth interactivity */}
      {xs.map((x,i)=>(
        <rect
          key={`hit-${i}`}
          x={x - halfW}
          y={0}
          width={halfW * 2}
          height={H}
          fill="transparent"
          className="cursor-pointer"
          onMouseEnter={() => setActiveIdx(i)}
          onMouseLeave={() => setActiveIdx(null)}
        />
      ))}
    </svg>
  );
}

/* ─── Dashboard ───────────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [stats, setStats]   = useState(null);
  const [busy, setBusy]     = useState(true);
  const [clock, setClock]   = useState("");
  const [hoveredSeg, setHoveredSeg] = useState(null);
  const [hoveredGaugeMode, setHoveredGaugeMode] = useState(null); // null, 'highest', 'lowest'

  useEffect(()=>{
    const tick=()=>{
      const d=new Date();
      setClock(d.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"})+" · "+d.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}));
    };
    tick(); const id=setInterval(tick,60000); return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    if(!loading&&(!user||user.role!=="admin")) router.push(user?"/user/dashboard":"/auth/login");
  },[user,loading,router]);

  useEffect(()=>{
    if(user?.role==="admin") adminApi.getStats().then(d=>{setStats(d);setBusy(false);}).catch(()=>setBusy(false));
  },[user]);

  if(loading||busy) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-[#DBC9C4] border-t-[#854C4A] rounded-full animate-spin"/>
    </div>
  );
  if(!user||user.role!=="admin") return null;

  /* derived */
  const totalA = stats?.totalTests??0;
  const totalU = stats?.totalUsers??0;
  const recent = stats?.recentTests??[];
  const rawD   = stats?.distribution??[];

  // Clean raw distribution data (ensure all 9 standard Enneagram types are ALWAYS shown, pre-initialized to 0 to fill empty layout spaces)
  const cleanMap = {};
  for (let k = 1; k <= 9; k++) {
    cleanMap[`Tipe ${k}`] = 0;
  }

  rawD.forEach(item => {
    let typeId = item._id ? item._id.trim() : "";
    if (!typeId) return;
    
    // Normalize types e.g. "Tipe 1 (Fallback)" -> "Tipe 1"
    let matched = null;
    for (let k = 1; k <= 9; k++) {
      if (typeId.includes(`Tipe ${k}`) || typeId === String(k)) {
        matched = `Tipe ${k}`;
        break;
      }
    }

    if (matched) {
      cleanMap[matched] = (cleanMap[matched] || 0) + item.count;
    }
  });

  const cleanSegs = Object.entries(cleanMap).map(([type, count]) => ({
    type,
    count,
    color: TYPE_COLORS[type] || "#DBC9C4"
  }));

  // Sort by highest count
  const sortedSegs = cleanSegs.sort((a, b) => b.count - a.count);
  const totalD = sortedSegs.reduce((a, b) => a + b.count, 0) || 1;

  let cum = 0;
  const segs = sortedSegs.map(item => {
    const pct = (item.count / totalD) * 100;
    const seg = { type: item.type, count: item.count, color: item.color, pct, start: cum };
    cum += pct;
    return seg;
  });

  const top     = segs.length ? segs.reduce((a,b)=>a.count>b.count?a:b) : null;
  const avgConf = recent.length ? Math.round(recent.reduce((s,t)=>s+(t.confidence??0),0)/recent.length) : 0;
  const maxConf = recent.length ? Math.round(Math.max(...recent.map(t=>t.confidence??0))) : null;
  const minConf = recent.length ? Math.round(Math.min(...recent.map(t=>t.confidence??0))) : null;
  const trend   = buildTrend(recent);
  const CIRC    = 2*Math.PI*48;
  const up = i=>({initial:{opacity:0,y:14},animate:{opacity:1,y:0},transition:{delay:i*0.06,duration:0.4,ease:"easeOut"}});

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div {...up(0)} className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-semibold font-serif text-[#221A13] tracking-tight">Dashboard</h1>
          <p className="mt-2 text-lg text-[#6E5B42]">
            Selamat datang, <span className="font-semibold text-[#854C4A]">{user.name??"Admin"}</span>!
          </p>
        </div>
        <span className="hidden md:flex items-center gap-1.5 text-sm text-[#B8A89E] bg-white border border-[#EDE0D8] rounded-xl px-4 py-2 shadow-sm">
          <Clock className="w-3.5 h-3.5"/>
          {clock}
        </span>
      </motion.div>

      {/* ── Row 1 — Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* Pengguna */}
        <motion.div {...up(1)}
          className="bg-white rounded-2xl border border-[#EDE0D8] shadow-sm overflow-hidden">
          <div className="flex items-stretch">
            <div className="w-1.5 bg-[#C17F7C] rounded-l-2xl shrink-0"/>
            <div className="flex items-center gap-4 px-6 py-5 flex-1">
              <div className="w-11 h-11 bg-[#F8E3DC] rounded-xl flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#854C4A]"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B8A89E]">Total Pengguna</p>
                <p className="text-4xl font-bold text-[#221A13] leading-tight mt-1">{totalU}</p>
                <p className="text-xs text-[#B8A89E] mt-1">Pengguna terdaftar</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#DBC9C4] shrink-0"/>
            </div>
          </div>
        </motion.div>

        {/* Analisis */}
        <motion.div {...up(2)}
          className="bg-white rounded-2xl border border-[#EDE0D8] shadow-sm overflow-hidden">
          <div className="flex items-stretch">
            <div className="w-1.5 bg-[#D4956A] rounded-l-2xl shrink-0"/>
            <div className="flex items-center gap-4 px-6 py-5 flex-1">
              <div className="w-11 h-11 bg-[#F8E3DC] rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#854C4A]"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B8A89E]">Total Analisis</p>
                <p className="text-4xl font-bold text-[#221A13] leading-tight mt-1">{totalA}</p>
                <p className="text-xs text-[#B8A89E] mt-1">Analisis tulisan tangan</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#DBC9C4] shrink-0"/>
            </div>
          </div>
        </motion.div>

        {/* Sesi Login */}
        <motion.div {...up(3)}
          className="bg-[#854C4A] rounded-2xl border border-[#6B3A38] shadow-sm overflow-hidden">
          <div className="flex items-stretch h-full">
            <div className="w-1.5 bg-white/20 rounded-l-2xl shrink-0"/>
            <div className="flex items-center gap-4 px-6 py-5 flex-1">
              <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-white"/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Sesi Login</p>
                <p className="text-base font-bold text-white leading-tight mt-1 truncate">{clock||"Memuat…"}</p>
                <p className="text-xs text-white/50 mt-1 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Row 2 — Enneagram + Confidence ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Enneagram — 3/5 */}
        <motion.div {...up(4)} className="lg:col-span-3 bg-white rounded-2xl border border-[#EDE0D8] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F8E3DC] flex items-center justify-center shrink-0">
                <Award className="w-4.5 h-4.5 text-[#854C4A]"/>
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-[#221A13]">Distribusi Tipe Enneagram</h3>
                <p className="text-xs md:text-sm text-[#6E5B42] mt-0.5">Sebaran tipe enneagram berdasarkan hasil tes pengguna</p>
              </div>
            </div>
            {top && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                style={{backgroundColor:top.color}}>
                Terbanyak · {top.type}
              </span>
            )}
          </div>

          {segs.length===0 ? (
            <p className="text-sm text-[#B8A89E] text-center py-10">Belum ada data distribusi</p>
          ):(
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Donut */}
              <div className="relative shrink-0 w-48 h-48 md:w-56 md:h-56 my-auto">
                <svg viewBox="0 0 200 200" className="w-full h-full" style={{transform:"rotate(-90deg)"}}>
                  <circle cx="100" cy="100" r="78" fill="none" stroke="#F8E3DC" strokeWidth="28"/>
                  {segs.map((s,i)=>(
                    <circle key={i} cx="100" cy="100" r="78" fill="none"
                      stroke={s.color} 
                      strokeWidth={hoveredSeg === i ? "38" : "28"}
                      strokeDasharray={`${s.pct*4.9} 490`}
                      strokeDashoffset={-s.start*4.9}
                      className="cursor-pointer"
                      style={{ transition: "stroke-width 0.25s ease-out, stroke 0.25s ease-out" }}
                      onMouseEnter={() => setHoveredSeg(i)}
                      onMouseLeave={() => setHoveredSeg(null)}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {hoveredSeg !== null ? (
                    <>
                      <p className="text-3xl md:text-4xl font-extrabold leading-none transition-all duration-200" style={{ color: segs[hoveredSeg].color }}>
                        {segs[hoveredSeg].count}
                      </p>
                      <p className="text-xs md:text-sm font-black mt-1.5 uppercase tracking-wide text-[#221A13] text-center max-w-[130px] truncate leading-tight">
                        {segs[hoveredSeg].type}
                      </p>
                      <p className="text-[10px] md:text-xs font-semibold text-[#857168] mt-0.5 capitalize">
                        {TYPE_NAMES[segs[hoveredSeg].type]}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl md:text-4xl font-extrabold text-[#221A13] leading-none transition-all duration-200">{totalA}</p>
                      <p className="text-xs md:text-sm font-semibold text-[#B8A89E] mt-1.5 uppercase tracking-wider">analisis</p>
                    </>
                  )}
                </div>
              </div>

              {/* Bars - Elegant Two Column Grid with dynamic cross-hover highlighting */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 flex-1 w-full">
                {segs.map((s,i)=>(
                  <div 
                    key={i} 
                    className="flex flex-col justify-center cursor-pointer transition-all duration-300"
                    onMouseEnter={() => setHoveredSeg(i)}
                    onMouseLeave={() => setHoveredSeg(null)}
                    style={{
                      opacity: hoveredSeg !== null && hoveredSeg !== i ? 0.45 : 1,
                      transform: hoveredSeg === i ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.2s ease-in-out"
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{backgroundColor:s.color}}/>
                        <span className="text-base font-extrabold text-[#221A13] truncate max-w-[170px]">
                          {s.type}
                          <span className="text-xs md:text-sm text-[#857168] font-semibold ml-2">{TYPE_NAMES[s.type]}</span>
                        </span>
                      </div>
                      <span className="text-base font-black text-[#221A13] tabular-nums">
                        {s.count}
                        <span className="text-xs md:text-sm text-[#857168] font-medium ml-2">({Math.round(s.pct)}%)</span>
                      </span>
                    </div>
                    <div className="h-2.5 bg-[#F8E3DC] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{width:`${s.pct}%`,backgroundColor:s.color}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Confidence — 2/5 */}
        {(() => {
          const activeGaugeVal = hoveredGaugeMode === 'highest' ? (maxConf ?? 0) : (hoveredGaugeMode === 'lowest' ? (minConf ?? 0) : avgConf);
          const activeGaugeLabel = hoveredGaugeMode === 'highest' ? "tertinggi" : (hoveredGaugeMode === 'lowest' ? "terendah" : "rata-rata");
          const activeGaugeColor = hoveredGaugeMode === 'lowest' ? "#D4956A" : "#854C4A";
          const activeGaugeStatus = hoveredGaugeMode === 'highest' ? "🏆 Kepercayaan Tertinggi" : (hoveredGaugeMode === 'lowest' ? "📉 Kepercayaan Terendah" : (avgConf >= 80 ? "🟢 Akurasi Sangat Tinggi" : (avgConf >= 60 ? "🟡 Akurasi Cukup Baik" : (avgConf > 0 ? "🔴 Perlu Ditingkatkan" : "Belum ada data"))));

          return (
            <motion.div {...up(5)} className="lg:col-span-2 bg-white rounded-2xl border border-[#EDE0D8] shadow-sm p-6 flex flex-col">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-[#F8E3DC] flex items-center justify-center shrink-0">
                  <Target className="w-4.5 h-4.5 text-[#854C4A]"/>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-[#221A13]">Kepercayaan Grafologi</h3>
                  <p className="text-xs md:text-sm text-[#6E5B42] mt-0.5">Tingkat akurasi analisis tulisan tangan</p>
                </div>
              </div>

              {/* Gauge */}
              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="relative w-44 h-44 md:w-48 md:h-48 cursor-pointer transition-all duration-300">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="#F8E3DC" strokeWidth="10" strokeLinecap="round" transform="rotate(-90 60 60)"/>
                    <circle cx="60" cy="60" r="48" fill={hoveredGaugeMode !== null ? `${activeGaugeColor}08` : "none"} stroke={activeGaugeColor} strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={`${(activeGaugeVal/100)*CIRC} ${CIRC}`} transform="rotate(-90 60 60)"
                      style={{ transition: "stroke-dasharray 0.45s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.45s ease-out, fill 0.45s ease-out" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-4xl font-black leading-none transition-all duration-200" style={{ color: activeGaugeColor }}>
                      {activeGaugeVal}%
                    </p>
                    <p className="text-xs md:text-sm font-bold text-[#857168] mt-1.5 uppercase tracking-wider transition-all duration-200">
                      {activeGaugeLabel}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-bold mt-4 transition-all duration-250 ease-out" style={{ color: activeGaugeColor }}>
                  {activeGaugeStatus}
                </p>
              </div>

              {/* Min / Max with dynamic highlights */}
              <div className="grid grid-cols-2 gap-3.5 pt-5 border-t border-[#EDE0D8]">
                <div 
                  className="bg-white border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredGaugeMode('highest')}
                  onMouseLeave={() => setHoveredGaugeMode(null)}
                  style={{
                    borderColor: hoveredGaugeMode === 'highest' ? "#854C4A" : "#EDE0D8",
                    opacity: hoveredGaugeMode !== null && hoveredGaugeMode !== 'highest' ? 0.5 : 1,
                    transform: hoveredGaugeMode === 'highest' ? "scale(1.03)" : "scale(1)",
                    transition: "all 0.2s ease-in-out"
                  }}
                >
                  <div className="w-1.5 h-10 bg-[#854C4A] rounded-full shrink-0"/>
                  <div>
                    <p className="text-[10px] text-[#B8A89E] font-bold uppercase tracking-wider">Tertinggi</p>
                    <p className="text-lg font-bold text-[#221A13] mt-0.5">{maxConf!=null?`${maxConf}%`:"–"}</p>
                  </div>
                </div>
                
                <div 
                  className="bg-white border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredGaugeMode('lowest')}
                  onMouseLeave={() => setHoveredGaugeMode(null)}
                  style={{
                    borderColor: hoveredGaugeMode === 'lowest' ? "#D4956A" : "#EDE0D8",
                    opacity: hoveredGaugeMode !== null && hoveredGaugeMode !== 'lowest' ? 0.5 : 1,
                    transform: hoveredGaugeMode === 'lowest' ? "scale(1.03)" : "scale(1)",
                    transition: "all 0.2s ease-in-out"
                  }}
                >
                  <div className="w-1.5 h-10 bg-[#D4956A] rounded-full shrink-0"/>
                  <div>
                    <p className="text-[10px] text-[#B8A89E] font-bold uppercase tracking-wider">Terendah</p>
                    <p className="text-lg font-bold text-[#221A13] mt-0.5">{minConf!=null?`${minConf}%`:"–"}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </div>

      {/* ── Row 3 — Tren Analisis ───────────────────────────── */}
      <motion.div {...up(6)} className="bg-white rounded-2xl border border-[#EDE0D8] shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F8E3DC] flex items-center justify-center shrink-0">
              <TrendingUp className="w-4.5 h-4.5 text-[#854C4A]"/>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-[#221A13]">Tren Analisis per Minggu</h3>
              <p className="text-xs md:text-sm text-[#6E5B42] mt-0.5">Visualisasi jumlah tulisan tangan yang telah dianalisis</p>
            </div>
          </div>
          
          {trend.length > 0 && (
            <span className="text-xs font-semibold text-[#854C4A] bg-[#FFF3ED] border border-[#F5E6DE] rounded-full px-3.5 py-1.5 shadow-sm">
              {trend.length} minggu terakhir
            </span>
          )}
        </div>
        <div className="pt-2">
          <LineChart data={trend}/>
        </div>
      </motion.div>

    </div>
  );
}