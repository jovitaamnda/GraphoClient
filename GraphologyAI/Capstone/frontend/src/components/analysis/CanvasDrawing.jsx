"use client";

import { useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

export default function CanvasDrawing({
  userId,
  onComplete,
  onError,
  setLoading,
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = 400;
      canvas.height = 300;

      const context = canvas.getContext("2d");
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#333";
      context.lineWidth = 2;
      context.lineCap = "round";
      context.lineJoin = "round";

      setCtx(context);
    }
  }, []);

  const startDrawing = (e) => {
    if (!ctx) return;
    setIsDrawing(true);

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx) ctx.closePath();
  };

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      const canvasData = canvasRef.current.toDataURL("image/png");

      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analysis/canvas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token
          },
          body: JSON.stringify({
            canvasData, // userId removed, backend gets it from token
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Analysis failed");
      }

      onComplete(data.analysis);
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="w-full border border-gray-300 rounded-lg cursor-crosshair bg-white"
        />
      </div>

      <div className="space-y-3">
        <button
          onClick={clearCanvas}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-2xl transition"
        >
          <Trash2 size={20} />
          Clear Canvas
        </button>

        <button
          onClick={handleAnalyze}
          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-2xl transition"
        >
          Analyze Drawing
        </button>
      </div>
    </div>
  );
}
