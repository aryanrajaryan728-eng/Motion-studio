import React, { useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Plus,
  Scissors,
  Trash2,
  Copy,
  Diamond,
  ZoomIn,
  ZoomOut,
  Type,
  Sparkles,
  Activity,
  Layers,
  Film,
} from 'lucide-react';
import { Layer, LayerType } from '../types/editor';

interface TimelineProps {
  layers: Layer[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (updated: Layer) => void;
  onAddLayer: (type: LayerType) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onSplitLayer: (id: string, time: number) => void;
  onAddKeyframeAtPlayhead: (layerId: string) => void;
  audioTrackWaveform?: number[];
}

export const Timeline: React.FC<TimelineProps> = ({
  layers,
  currentTime,
  duration,
  onSeek,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onAddLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onSplitLayer,
  onAddKeyframeAtPlayhead,
  audioTrackWaveform,
}) => {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // pixels per second
  const [isScrubbing, setIsScrubbing] = useState(false);

  const totalWidth = Math.max(800, duration * zoomLevel);

  // Handle ruler click/drag
  const handleRulerMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    updatePlayheadFromMouse(e);
  };

  const updatePlayheadFromMouse = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, e.clientX - rect.left);
    const newTime = Math.min(duration, Math.max(0, offsetX / zoomLevel));
    onSeek(newTime);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isScrubbing) {
      updatePlayheadFromMouse(e);
    }
  };

  const handleMouseUp = () => {
    setIsScrubbing(false);
  };

  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'kinetic_text':
        return <Type className="w-3.5 h-3.5 text-cyan-400" />;
      case 'motion_banner':
        return <Sparkles className="w-3.5 h-3.5 text-indigo-400" />;
      case 'sound_visualizer':
        return <Activity className="w-3.5 h-3.5 text-pink-400" />;
      case 'vfx_filter':
        return <Layers className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  // Generate ruler tick marks
  const secondMarkers = [];
  for (let s = 0; s <= duration; s += 0.5) {
    secondMarkers.push(s);
  }

  const selectedLayer = layers.find((l) => l.id === selectedLayerId);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="flex flex-col bg-slate-950 border-t border-slate-800 h-[36vh] min-h-[220px] select-none text-xs"
    >
      {/* Timeline Action Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center gap-2">
          {/* Quick Add Layer Dropdown */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              onClick={() => onAddLayer('kinetic_text')}
              className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center gap-1 font-medium"
            >
              <Type className="w-3 h-3 text-cyan-400" />
              + Text
            </button>
            <button
              onClick={() => onAddLayer('motion_banner')}
              className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              + Motion Banner
            </button>
            <button
              onClick={() => onAddLayer('shape')}
              className="px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors flex items-center gap-1 font-medium"
            >
              <Plus className="w-3 h-3 text-emerald-400" />
              + Shape
            </button>
          </div>

          {/* Keyframe & Split Tools */}
          {selectedLayer && (
            <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-800">
              <button
                onClick={() => onAddKeyframeAtPlayhead(selectedLayer.id)}
                title="Add Keyframe at Playhead (Alight Diamond)"
                className="px-2.5 py-1 rounded bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/50 transition-colors flex items-center gap-1 font-semibold"
              >
                <Diamond className="w-3 h-3 fill-current text-indigo-400" />
                Add Keyframe
              </button>

              <button
                onClick={() => onSplitLayer(selectedLayer.id, currentTime)}
                title="Split clip at playhead"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
              >
                <Scissors className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDuplicateLayer(selectedLayer.id)}
                title="Duplicate layer"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteLayer(selectedLayer.id)}
                title="Delete layer"
                className="p-1.5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Timeline Zoom Controls */}
        <div className="flex items-center gap-2 text-slate-400">
          <button
            onClick={() => setZoomLevel(Math.max(40, zoomLevel - 20))}
            className="p-1 hover:text-white transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono-nums text-[11px] w-12 text-center text-slate-400">
            {zoomLevel}%
          </span>
          <button
            onClick={() => setZoomLevel(Math.min(240, zoomLevel + 20))}
            className="p-1 hover:text-white transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Track Workspace (Headers left + Scrollable tracks right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Fixed Layer Headers */}
        <div className="w-56 shrink-0 border-r border-slate-800/80 bg-slate-950 flex flex-col z-20">
          {/* Header spacer aligned with ruler */}
          <div className="h-7 border-b border-slate-800/80 bg-slate-900/40 px-3 flex items-center text-[11px] font-semibold text-slate-400">
            Tracks ({layers.length})
          </div>

          <div className="flex-1 overflow-y-auto">
            {layers.map((layer) => {
              const isSelected = selectedLayerId === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer.id)}
                  className={`h-11 border-b border-slate-800/60 px-3 flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected ? 'bg-indigo-950/40 border-l-2 border-l-cyan-400' : 'hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate mr-2">
                    {getLayerIcon(layer.type)}
                    <span
                      className={`truncate text-xs ${
                        isSelected ? 'font-semibold text-white' : 'text-slate-300'
                      }`}
                    >
                      {layer.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-slate-500">
                    {/* Toggle Visibility */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateLayer({ ...layer, visible: !layer.visible });
                      }}
                      className="p-1 hover:text-slate-300 transition-colors"
                    >
                      {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-slate-600" />}
                    </button>

                    {/* Toggle Lock */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateLayer({ ...layer, locked: !layer.locked });
                      }}
                      className="p-1 hover:text-slate-300 transition-colors"
                    >
                      {layer.locked ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Audio Track Header */}
            <div className="h-10 border-b border-slate-800/60 px-3 flex items-center gap-2 bg-slate-900/30 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-medium truncate">Master Beat Track</span>
            </div>
          </div>
        </div>

        {/* Right: Scrollable Tracks & Timeline Ruler */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative bg-slate-950">
          <div style={{ width: `${totalWidth}px` }} className="relative min-h-full">
            {/* 1. Time Ruler */}
            <div
              ref={rulerRef}
              onMouseDown={handleRulerMouseDown}
              className="h-7 border-b border-slate-800/80 bg-slate-900/70 relative cursor-pointer sticky top-0 z-30"
            >
              {secondMarkers.map((sec) => (
                <div
                  key={sec}
                  style={{ left: `${sec * zoomLevel}px` }}
                  className="absolute top-0 bottom-0 flex flex-col justify-end"
                >
                  <div
                    className={`w-[1px] ${
                      sec % 1 === 0 ? 'h-3 bg-slate-600' : 'h-1.5 bg-slate-800'
                    }`}
                  />
                  {sec % 1 === 0 && (
                    <span className="text-[9px] font-mono-nums text-slate-400 select-none pl-1 pb-0.5">
                      {sec}s
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 2. Red Playhead Marker Line */}
            <div
              style={{ left: `${currentTime * zoomLevel}px` }}
              className="absolute top-0 bottom-0 w-[2px] bg-rose-500 pointer-events-none z-40 shadow-sm shadow-rose-500/50"
            >
              {/* Playhead Top Knob */}
              <div className="w-3 h-3 bg-rose-500 rounded-sm rotate-45 -translate-x-[5px] -translate-y-1.5 shadow" />
            </div>

            {/* 3. Layer Track Strips */}
            <div className="relative">
              {layers.map((layer) => {
                const isSelected = selectedLayerId === layer.id;
                const leftPos = layer.startTime * zoomLevel;
                const layerWidth = layer.duration * zoomLevel;

                return (
                  <div
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    className="h-11 border-b border-slate-800/50 relative py-1 px-1 flex items-center"
                  >
                    {/* Layer Block Clip */}
                    <div
                      style={{
                        left: `${leftPos}px`,
                        width: `${layerWidth}px`,
                      }}
                      className={`absolute top-1 bottom-1 rounded-md px-2 flex items-center justify-between text-[11px] cursor-pointer transition-all shadow-md overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white ring-1 ring-white/60'
                          : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      <span className="font-medium truncate drop-shadow-sm flex items-center gap-1.5">
                        {layer.name}
                      </span>

                      {/* Keyframe Diamond Markers on layer strip (Alight Motion hallmark) */}
                      {layer.keyframes &&
                        layer.keyframes.map((kf) => {
                          const kfOffset = (kf.time - layer.startTime) * zoomLevel;
                          return (
                            <button
                              key={kf.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSeek(kf.time);
                              }}
                              title={`Keyframe at ${kf.time.toFixed(2)}s (${kf.property}: ${kf.value})`}
                              style={{ left: `${kfOffset}px` }}
                              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-amber-400 hover:bg-amber-300 border border-amber-900 rounded-xs shadow-md transition-transform hover:scale-125 z-10"
                            />
                          );
                        })}

                      <span className="text-[9px] font-mono-nums text-white/60">
                        {layer.duration.toFixed(1)}s
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Master Audio Track Visualizer Bar */}
              <div className="h-10 border-b border-slate-800/50 relative flex items-center px-1 bg-indigo-950/15">
                <div
                  style={{ width: `${duration * zoomLevel}px` }}
                  className="h-6 rounded bg-slate-900/80 border border-indigo-900/40 flex items-center gap-0.5 px-2 overflow-hidden"
                >
                  {(audioTrackWaveform || [20, 60, 40, 80, 100, 70, 50, 90, 85, 40, 70, 95, 60]).map(
                    (val, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${(val / 100) * 18}px` }}
                        className="w-1.5 bg-indigo-500/60 rounded-full"
                      />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
