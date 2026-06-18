"use client";

import { useRef, useState, useEffect } from "react";
import { Eraser, Trash2, Pencil } from "lucide-react";
import { DRAWING_CONFIG } from "@/config/constants";

// Helper function to draw dotted guidelines across the canvas
const drawGuidelines = (ctx, width, height) => {
  ctx.save();
  ctx.strokeStyle = "#EDE0D8"; // very faint warm krem
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 12]); // dotted lines
  const lineSpacing = 50; // space between lines
  for (let y = lineSpacing; y < height; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
};

export default function HandwritingCanvas({ onUploadComplete }) {
  const isDrawingRef = useRef(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  
  // State UI
  const [tool, setTool] = useState("pen");
  const [penThickness, setPenThickness] = useState(4);
  const [hasContent, setHasContent] = useState(false);

  const eraserThickness = penThickness * (DRAWING_CONFIG?.eraserMultiplier || 5);

  // --- 1. SETUP CANVAS & SCROLL LOCK ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas.parentElement;

    const createContext = (width, height) => {
      const ctx = canvas.getContext("2d");
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctxRef.current = ctx;
      drawGuidelines(ctx, width, height);
    };

    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      createContext(rect.width, rect.height);
    };

    updateCanvasSize();

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handlePointerDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      canvas.setPointerCapture(e.pointerId);
      isDrawingRef.current = true;
      setHasContent(true);
      const { x, y } = getPos(e);
      const context = ctxRef.current;
      context.beginPath();
      context.moveTo(x, y);
    };

    const handlePointerMove = (e) => {
      if (!isDrawingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      const { x, y } = getPos(e);
      const context = ctxRef.current;
      context.lineTo(x, y);
      context.stroke();
    };

    const handlePointerUp = (e) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;
      const context = ctxRef.current;
      if (context) context.closePath();
      if (e.pointerId) canvas.releasePointerCapture(e.pointerId);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    canvas.addEventListener("pointerdown", handlePointerDown, { passive: false });
    canvas.addEventListener("pointermove", handlePointerMove, { passive: false });
    canvas.addEventListener("pointerup", handlePointerUp, { passive: false });
    canvas.addEventListener("pointercancel", handlePointerUp, { passive: false });

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  // --- 2. UPDATE STYLE SAAT TOOL GANTI ---
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = eraserThickness;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = penThickness;
      ctx.strokeStyle = "#000000";
    }
  }, [tool, penThickness, eraserThickness]);

  // --- 3. ACTIONS ---
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const rect = canvas.getBoundingClientRect();
    
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    drawGuidelines(ctx, rect.width, rect.height);
    setHasContent(false);
  };

  const handleSubmit = () => {
    if (hasContent && canvasRef.current) {
      const imageData = canvasRef.current.toDataURL("image/jpeg", 0.9);
      onUploadComplete(imageData);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* CANVAS CONTAINER */}
      <div 
        className="w-full rounded-2xl overflow-hidden border border-[#DBC9C4] bg-white relative"
        style={{ touchAction: 'none' }} 
      >
        <canvas
          ref={canvasRef}
          className="bg-white"
          style={{ 
            width: "100%", 
            height: "400px", 
            touchAction: "none", 
            cursor: "crosshair",
            display: "block"
          }}
        />

        {!hasContent && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[#6E5B42]/50 text-base font-medium">Tulis kalimat Anda di sini ✍️</p>
          </div>
        )}
      </div>

      {/* TOOLBAR */}
      <div className="mt-6 w-full bg-[#FFF8F4] border border-[#DBC9C4] rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setTool("pen")} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${tool === "pen" ? "bg-[#854C4A] text-white" : "text-[#524342] hover:bg-[#854C4A]/10"}`}
            title="Pena"
          >
            <Pencil className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setTool("eraser")} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${tool === "eraser" ? "bg-[#854C4A] text-white" : "text-[#524342] hover:bg-[#854C4A]/10"}`}
            title="Penghapus"
          >
            <Eraser className="w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-[#DBC9C4]" />

        {tool === "pen" && (
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <span className="text-xs text-[#6E5B42] font-semibold">Tebal</span>
            <input
              type="range" min="2" max="12"
              value={penThickness}
              onChange={(e) => setPenThickness(Number(e.target.value))}
              className="flex-1 h-1 bg-[#DBC9C4] rounded-full appearance-none cursor-pointer accent-[#854C4A]"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button 
            onClick={clearCanvas} 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-red-600 hover:bg-red-50 transition-all"
            title="Bersihkan Semua"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!hasContent}
          className={`inline-flex items-center justify-center rounded-xl px-12 py-4 text-base font-bold text-white shadow-md transition
            ${hasContent ? "bg-[#854C4A] hover:bg-[#6B3A38] active:scale-95" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          Mulai Analisis
        </button>
      </div>
    </div>
  );
}