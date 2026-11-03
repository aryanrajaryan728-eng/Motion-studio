import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Check,
  RotateCcw,
  Zap,
  Activity,
  Sliders,
  Play,
} from 'lucide-react';
import { BezierControlPoints, EasingType, Keyframe } from '../types/editor';
import { CURVE_PRESETS, generateCurveSvgPath, evaluateCubicBezier } from '../utils/easing';

interface KeyframeCurveEditorProps {
  selectedKeyframe: Keyframe | null;
  onApplyCurve: (bezier: BezierControlPoints, easingType: EasingType) => void;
  onClose?: () => void;
  activeLayerName?: string;
}

export const KeyframeCurveEditor: React.FC<KeyframeCurveEditorProps> = ({
  selectedKeyframe,
  onApplyCurve,
  onClose,
  activeLayerName,
}) => {
  const [currentCurveType, setCurrentCurveType] = useState<EasingType>(
    selectedKeyframe?.easing || 'overshoot'
  );
  const [controlPoints, setControlPoints] = useState<BezierControlPoints>(
    selectedKeyframe?.bezier || CURVE_PRESETS['overshoot'].points
  );

  // Live preview test animation progress (0 -> 1 loop)
  const [previewProgress, setPreviewProgress] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiGoal, setAiGoal] = useState('Snappy Viral Reel Hook with Bass Punch');
  const [aiTip, setAiTip] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingHandle, setDraggingHandle] = useState<'cp1' | 'cp2' | null>(null);

  // Animate the test preview box continuously
  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const cycleTime = 1.6; // 1.6s loop
      const progress = (elapsed % cycleTime) / cycleTime;
      // In cycle: first 70% is moving, remaining 30% is hold
      const activeProgress = Math.min(1, progress / 0.7);
      setPreviewProgress(activeProgress);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  const svgWidth = 320;
  const svgHeight = 240;
  const padding = 36;

  const { curvePath, p0, p1, p2, p3 } = generateCurveSvgPath(
    controlPoints,
    svgWidth,
    svgHeight,
    padding
  );

  // Handle dragging handles on the SVG graph
  const handleSvgMouseDown = (e: React.MouseEvent, handle: 'cp1' | 'cp2') => {
    e.stopPropagation();
    setDraggingHandle(handle);
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (!draggingHandle || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const usableW = svgWidth - padding * 2;
    const usableH = svgHeight - padding * 2;

    const normX = Math.max(0, Math.min(1, (mouseX - padding) / usableW));
    const normY = (svgHeight - padding - mouseY) / usableH;

    if (draggingHandle === 'cp1') {
      setControlPoints((prev) => ({
        ...prev,
        x1: parseFloat(normX.toFixed(2)),
        y1: parseFloat(normY.toFixed(2)),
      }));
    } else {
      setControlPoints((prev) => ({
        ...prev,
        x2: parseFloat(normX.toFixed(2)),
        y2: parseFloat(normY.toFixed(2)),
      }));
    }
    setCurrentCurveType('custom-bezier');
  };

  const handleSvgMouseUp = () => {
    setDraggingHandle(null);
  };

  // Select Preset
  const handleSelectPreset = (type: EasingType) => {
    setCurrentCurveType(type);
    setControlPoints(CURVE_PRESETS[type].points);
    setAiTip(null);
  };

  // AI Curve Recommender
  const handleAskAiCurve = async () => {
    try {
      setIsAiLoading(true);
      const res = await fetch('/api/gemini/suggest-easing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animationGoal: aiGoal,
          currentLayerType: activeLayerName || 'Motion Graphic',
        }),
      });

      if (!res.ok) throw new Error('Failed to get AI recommendation');
      const data = await res.json();
      if (data.controlPoints) {
        setControlPoints(data.controlPoints);
        setCurrentCurveType('custom-bezier');
        setAiTip(data.hindiTip || `${data.name}: ${data.bezierString}`);
      }
    } catch (err) {
      console.error(err);
      // Fallback to energetic overshoot
      setControlPoints(CURVE_PRESETS['overshoot'].points);
      setAiTip('AI Recommended: Alight Snappy Overshoot Curve for High Retention');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Evaluated eased preview value for the preview block
  const easedVal = evaluateCubicBezier(previewProgress, controlPoints);

  return (
    <div
      onMouseMove={handleSvgMouseMove}
      onMouseUp={handleSvgMouseUp}
      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl max-w-xl mx-auto flex flex-col gap-4 text-xs select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-display">
              Alight Motion Animation Curve Editor
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive Bezier curve engine for smooth keyframe physics
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Curve Graph & Physics Live Sandbox */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Left: SVG Bezier Curve Graph with Drag Handles */}
        <div className="flex flex-col items-center bg-slate-950 rounded-xl p-3 border border-slate-800 relative">
          <div className="w-full flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Graph (0,0 to 1,1)</span>
            <span className="font-mono-nums text-cyan-400">
              P1({controlPoints.x1}, {controlPoints.y1}) · P2({controlPoints.x2},{' '}
              {controlPoints.y2})
            </span>
          </div>

          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="w-full h-auto cursor-crosshair rounded-lg bg-slate-900/40"
          >
            {/* Grid Lines */}
            <line
              x1={padding}
              y1={svgHeight - padding}
              x2={svgWidth - padding}
              y2={svgHeight - padding}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={svgHeight - padding}
              stroke="#334155"
              strokeWidth="1.5"
            />
            <line
              x1={padding}
              y1={padding}
              x2={svgWidth - padding}
              y2={padding}
              stroke="#1e293b"
              strokeDasharray="4"
            />
            <line
              x1={svgWidth - padding}
              y1={padding}
              x2={svgWidth - padding}
              y2={svgHeight - padding}
              stroke="#1e293b"
              strokeDasharray="4"
            />

            {/* Handle Lines */}
            <line
              x1={p0.x}
              y1={p0.y}
              x2={p1.x}
              y2={p1.y}
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeDasharray="3"
            />
            <line
              x1={p3.x}
              y1={p3.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#ec4899"
              strokeWidth="1.5"
              strokeDasharray="3"
            />

            {/* Main Bezier Curve */}
            <path d={curvePath} fill="none" stroke="#6366f1" strokeWidth="3" />

            {/* Start (0,0) and End (1,1) Dots */}
            <circle cx={p0.x} cy={p0.y} r="4" fill="#94a3b8" />
            <circle cx={p3.x} cy={p3.y} r="4" fill="#94a3b8" />

            {/* Draggable Handle P1 */}
            <circle
              cx={p1.x}
              cy={p1.y}
              r="7"
              fill="#06b6d4"
              stroke="#ffffff"
              strokeWidth="2"
              onMouseDown={(e) => handleSvgMouseDown(e, 'cp1')}
              className="cursor-pointer hover:scale-125 transition-transform"
            />

            {/* Draggable Handle P2 */}
            <circle
              cx={p2.x}
              cy={p2.y}
              r="7"
              fill="#ec4899"
              stroke="#ffffff"
              strokeWidth="2"
              onMouseDown={(e) => handleSvgMouseDown(e, 'cp2')}
              className="cursor-pointer hover:scale-125 transition-transform"
            />
          </svg>
        </div>

        {/* Right: Real-time Physics Preview */}
        <div className="flex flex-col gap-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-200 flex items-center gap-1">
                <Play className="w-3 h-3 text-cyan-400" />
                Live Motion Physics
              </span>
              <span className="font-mono-nums text-[10px] text-indigo-400">
                {(easedVal * 100).toFixed(0)}%
              </span>
            </div>

            {/* Animated Motion Object */}
            <div className="h-20 bg-slate-900/60 rounded-lg relative overflow-hidden flex items-center px-4 border border-slate-800">
              <div
                style={{
                  transform: `translateX(${easedVal * 140}px) scale(${0.8 + easedVal * 0.3})`,
                }}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/40 flex items-center justify-center text-white font-bold text-xs"
              >
                ♦
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Inspect how kinetic cards and banners will snap and settle before applying.
            </p>
          </div>

          {/* AI Easing Assistant */}
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Curve Recommender
              </span>
            </div>
            <input
              type="text"
              value={aiGoal}
              onChange={(e) => setAiGoal(e.target.value)}
              placeholder="e.g. Punchy fast hook or smooth float"
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAskAiCurve}
              disabled={isAiLoading}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3" />
              {isAiLoading ? 'Analyzing Curve...' : 'Generate Perfect Curve'}
            </button>
            {aiTip && (
              <p className="text-[10px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 p-2 rounded-md">
                💡 {aiTip}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preset Curve Pills */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">
          Alight Motion Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(CURVE_PRESETS) as EasingType[]).map((type) => {
            const preset = CURVE_PRESETS[type];
            const isSelected = currentCurveType === type;
            return (
              <button
                key={type}
                onClick={() => handleSelectPreset(type)}
                className={`p-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-[11px] text-white truncate">
                  {preset.name}
                </div>
                <div className="text-[9px] text-slate-500 truncate mt-0.5">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
        <button
          onClick={() => {
            setControlPoints(CURVE_PRESETS['overshoot'].points);
            setCurrentCurveType('overshoot');
          }}
          className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>

        <button
          onClick={() => onApplyCurve(controlPoints, currentCurveType)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold rounded-lg transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          Apply Curve to Keyframes
        </button>
      </div>
    </div>
  );
};
