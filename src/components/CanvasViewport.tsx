import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Grid,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Layer, AspectRatio, ProjectBrandKit } from '../types/editor';
import { getEasingValue } from '../utils/easing';
import { audioEngine } from '../utils/audioEngine';

interface CanvasViewportProps {
  layers: Layer[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  aspectRatio: AspectRatio;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayerTransform: (
    layerId: string,
    transform: { positionX?: number; positionY?: number; scale?: number; rotation?: number }
  ) => void;
  brandKit: ProjectBrandKit;
  backgroundColor: string;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  layers,
  currentTime,
  duration,
  isPlaying,
  onTogglePlay,
  onSeek,
  aspectRatio,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayerTransform,
  brandKit,
  backgroundColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasStageRef = useRef<HTMLDivElement>(null);
  const [showSafeGuides, setShowSafeGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(32).fill(0));

  // Dragging gizmo state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [initialTransform, setInitialTransform] = useState({ posX: 0, posY: 0 });

  // Real-time audio frequency loop
  useEffect(() => {
    let animId: number;
    const updateFreq = () => {
      if (isPlaying) {
        setFrequencyData(audioEngine.getFrequencyData());
      }
      animId = requestAnimationFrame(updateFreq);
    };
    animId = requestAnimationFrame(updateFreq);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Handle Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setVolume(nextMute ? 0 : 0.8);
  };

  // Compute interpolated layer transform at currentTime
  const getInterpolatedLayer = (layer: Layer) => {
    let posX = layer.positionX;
    let posY = layer.positionY;
    let scale = layer.scale;
    let rot = layer.rotation;
    let op = layer.opacity;

    // Check keyframes
    const kfs = layer.keyframes;
    if (kfs && kfs.length > 0) {
      const props: Array<'positionX' | 'positionY' | 'scale' | 'rotation' | 'opacity'> = [
        'positionX',
        'positionY',
        'scale',
        'rotation',
        'opacity',
      ];

      props.forEach((prop) => {
        const propKfs = kfs
          .filter((k) => k.property === prop)
          .sort((a, b) => a.time - b.time);

        if (propKfs.length === 1) {
          if (currentTime >= propKfs[0].time) {
            if (prop === 'positionX') posX = propKfs[0].value;
            if (prop === 'positionY') posY = propKfs[0].value;
            if (prop === 'scale') scale = propKfs[0].value;
            if (prop === 'rotation') rot = propKfs[0].value;
            if (prop === 'opacity') op = propKfs[0].value;
          }
        } else if (propKfs.length > 1) {
          if (currentTime <= propKfs[0].time) {
            if (prop === 'positionX') posX = propKfs[0].value;
            if (prop === 'positionY') posY = propKfs[0].value;
            if (prop === 'scale') scale = propKfs[0].value;
            if (prop === 'rotation') rot = propKfs[0].value;
            if (prop === 'opacity') op = propKfs[0].value;
          } else if (currentTime >= propKfs[propKfs.length - 1].time) {
            const last = propKfs[propKfs.length - 1];
            if (prop === 'positionX') posX = last.value;
            if (prop === 'positionY') posY = last.value;
            if (prop === 'scale') scale = last.value;
            if (prop === 'rotation') rot = last.value;
            if (prop === 'opacity') op = last.value;
          } else {
            // Find bounding pair
            for (let i = 0; i < propKfs.length - 1; i++) {
              const kfA = propKfs[i];
              const kfB = propKfs[i + 1];
              if (currentTime >= kfA.time && currentTime <= kfB.time) {
                const span = kfB.time - kfA.time;
                const rawProgress = span > 0 ? (currentTime - kfA.time) / span : 1;
                const easedProgress = getEasingValue(rawProgress, kfA.easing || 'ease-out', kfA.bezier);
                const val = kfA.value + (kfB.value - kfA.value) * easedProgress;

                if (prop === 'positionX') posX = val;
                if (prop === 'positionY') posY = val;
                if (prop === 'scale') scale = val;
                if (prop === 'rotation') rot = val;
                if (prop === 'opacity') op = Math.max(0, Math.min(1, val));
                break;
              }
            }
          }
        }
      });
    }

    return { posX, posY, scale, rot, op };
  };

  // Dimensions based on Aspect Ratio
  const getAspectDimensions = () => {
    switch (aspectRatio) {
      case '9:16':
        return { width: '330px', height: '586px', ratio: '9 / 16' };
      case '16:9':
        return { width: '600px', height: '338px', ratio: '16 / 9' };
      case '1:1':
        return { width: '420px', height: '420px', ratio: '1 / 1' };
      case '4:5':
        return { width: '380px', height: '475px', ratio: '4 / 5' };
    }
  };

  const aspectDim = getAspectDimensions();

  // Mouse move handler for bounding box dragging
  const handleMouseDownOnLayer = (e: React.MouseEvent, layer: Layer) => {
    e.stopPropagation();
    onSelectLayer(layer.id);
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setInitialTransform({ posX: layer.positionX, posY: layer.positionY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedLayerId || !canvasStageRef.current) return;
    const stageRect = canvasStageRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStartPos.x) / stageRect.width) * 100;
    const deltaY = ((e.clientY - dragStartPos.y) / stageRect.height) * 100;

    onUpdateLayerTransform(selectedLayerId, {
      positionX: Math.round(initialTransform.posX + deltaX),
      positionY: Math.round(initialTransform.posY + deltaY),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Format timecode
  const formatTimecode = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  // Check if any VFX adjustment layer is active
  const activeVfx = layers.find((l) => l.type === 'vfx_filter' && l.visible);
  const vfxGlitch = activeVfx?.vfxConfig?.glitch || 0;
  const vfxRgb = activeVfx?.vfxConfig?.rgbSplit || 0;
  const vfxLut = activeVfx?.vfxConfig?.lut || 'none';

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative flex flex-col items-center justify-between bg-slate-950 p-4 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 p-6' : 'h-[64vh]'
      }`}
    >
      {/* Top Controls Overlay */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2 px-2 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="font-mono-nums bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-200">
            {formatTimecode(currentTime)} / {formatTimecode(duration)}
          </span>
          <span className="text-slate-500 hidden sm:inline-flex items-center gap-1 font-mono-nums">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            60 FPS Realtime
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Safe Guides Toggle */}
          <button
            onClick={() => setShowSafeGuides(!showSafeGuides)}
            title="Toggle Reels/Shorts Safe Guides"
            className={`p-1.5 rounded transition-colors ${
              showSafeGuides ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'hover:bg-slate-900 text-slate-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Canvas Grid"
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'hover:bg-slate-900 text-slate-400'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Mute Audio */}
          <button
            onClick={handleToggleMute}
            title={isMuted ? 'Unmute Beat' : 'Mute Beat'}
            className="p-1.5 hover:bg-slate-900 rounded text-slate-400 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle Fullscreen"
            className="p-1.5 hover:bg-slate-900 rounded text-slate-400 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Preview Screen Stage */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden min-h-0 relative">
        <div
          ref={canvasStageRef}
          onClick={() => onSelectLayer(null)}
          style={{
            width: aspectDim.width,
            height: aspectDim.height,
            backgroundColor: backgroundColor,
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          }}
          className={`relative rounded-xl overflow-hidden transition-all duration-200 cursor-default ${
            vfxLut === 'cyberpunk' ? 'contrast-125 saturate-150' : ''
          } ${vfxLut === 'teal_orange' ? 'hue-rotate-15 contrast-110' : ''}`}
        >
          {/* Optional Canvas Grid */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] z-10" />
          )}

          {/* Instagram / TikTok Safe Guide Overlay */}
          {showSafeGuides && aspectRatio === '9:16' && (
            <div className="absolute inset-0 pointer-events-none z-30 border border-dashed border-cyan-500/30 m-4 rounded-lg">
              {/* Top safe zone label */}
              <div className="absolute top-2 left-2 text-[9px] text-cyan-400/60 font-mono tracking-wider">
                SAFE ZONE (REELS / SHORTS)
              </div>
              {/* Right side engagement buttons shadow safe zone */}
              <div className="absolute right-1 bottom-12 w-10 h-36 border border-dashed border-rose-500/20 bg-rose-500/5 rounded text-[8px] text-rose-400/50 flex items-center justify-center text-center p-1">
                UI Safe
              </div>
              {/* Bottom caption safe zone */}
              <div className="absolute bottom-1 left-2 right-12 h-14 border border-dashed border-amber-500/20 bg-amber-500/5 rounded text-[8px] text-amber-400/50 flex items-center justify-center">
                Bottom UI &amp; Caption Area
              </div>
            </div>
          )}

          {/* Glitch & Scanline Simulation */}
          {vfxGlitch > 0 && isPlaying && (
            <div
              style={{ opacity: vfxGlitch / 150 }}
              className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent animate-pulse"
            />
          )}

          {/* Layers Stack (rendered bottom to top) */}
          {[...layers]
            .sort((a, b) => b.trackIndex - a.trackIndex)
            .map((layer) => {
              if (!layer.visible) return null;
              const isLayerActive =
                currentTime >= layer.startTime && currentTime <= layer.startTime + layer.duration;
              if (!isLayerActive) return null;

              const isSelected = selectedLayerId === layer.id;
              const { posX, posY, scale, rot, op } = getInterpolatedLayer(layer);

              return (
                <div
                  key={layer.id}
                  onClick={(e) => handleMouseDownOnLayer(e, layer)}
                  style={{
                    transform: `translate(${posX * 3}px, ${posY * 3}px) scale(${scale}) rotate(${rot}deg)`,
                    opacity: op,
                    mixBlendMode: layer.blendMode,
                    zIndex: 20 - layer.trackIndex,
                  }}
                  className={`absolute inset-0 flex items-center justify-center transition-transform duration-75 origin-center ${
                    isSelected ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black/50' : ''
                  }`}
                >
                  {/* Selected Bounding Box Gizmo */}
                  {isSelected && (
                    <div className="absolute inset-0 pointer-events-none border border-cyan-400 border-dashed">
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-cyan-400 rounded-sm" />
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-cyan-400 rounded-sm" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-cyan-400 rounded-sm" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-cyan-400 rounded-sm" />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-cyan-500 text-black text-[9px] font-bold rounded">
                        {layer.name} ({Math.round(posX)}, {Math.round(posY)})
                      </div>
                    </div>
                  )}

                  {/* 1. Kinetic Text Layer */}
                  {layer.type === 'kinetic_text' && layer.textConfig && (
                    <div
                      style={{
                        fontFamily: layer.textConfig.fontFamily || 'Outfit',
                        fontSize: `${layer.textConfig.fontSize}px`,
                        fontWeight: layer.textConfig.fontWeight,
                        color: layer.textConfig.color,
                        letterSpacing: `${layer.textConfig.letterSpacing}px`,
                        textShadow: layer.textConfig.glowColor
                          ? `0 0 ${layer.textConfig.glowBlur || 15}px ${layer.textConfig.glowColor}`
                          : undefined,
                        WebkitTextStroke: layer.textConfig.strokeColor
                          ? `${layer.textConfig.strokeWidth || 1}px ${layer.textConfig.strokeColor}`
                          : undefined,
                      }}
                      className={`text-center font-display select-none px-4 py-2 ${
                        layer.textConfig.backgroundBox ? 'rounded-xl shadow-2xl backdrop-blur-md' : ''
                      }`}
                    >
                      {layer.textConfig.text}
                    </div>
                  )}

                  {/* 2. Motion Banner Layer */}
                  {layer.type === 'motion_banner' && layer.bannerConfig && (
                    <div
                      style={{
                        backgroundColor: layer.bannerConfig.backgroundColor,
                        borderColor: layer.bannerConfig.accentColor,
                        boxShadow: layer.bannerConfig.showGlow
                          ? `0 0 30px -5px ${layer.bannerConfig.accentColor}50`
                          : 'none',
                      }}
                      className="px-5 py-3 rounded-2xl border flex items-center gap-3 backdrop-blur-xl shadow-xl max-w-[85%]"
                    >
                      {layer.bannerConfig.badgeText && (
                        <span
                          style={{
                            backgroundColor: layer.bannerConfig.accentColor,
                          }}
                          className="text-[10px] uppercase font-bold text-black px-2 py-0.5 rounded-md font-mono"
                        >
                          {layer.bannerConfig.badgeText}
                        </span>
                      )}
                      <div className="text-left">
                        <div
                          style={{ color: layer.bannerConfig.textColor }}
                          className="font-bold text-sm leading-tight tracking-wide font-display"
                        >
                          {layer.bannerConfig.primaryText}
                        </div>
                        {layer.bannerConfig.secondaryText && (
                          <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                            {layer.bannerConfig.secondaryText}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. Shape Layer */}
                  {layer.type === 'shape' && layer.shapeConfig && (
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: layer.shapeConfig.fillColor,
                        borderColor: layer.shapeConfig.strokeColor,
                        borderWidth: `${layer.shapeConfig.strokeWidth}px`,
                        borderRadius:
                          layer.shapeConfig.shapeType === 'circle'
                            ? '50%'
                            : `${layer.shapeConfig.borderRadius || 16}px`,
                        background: layer.shapeConfig.gradient
                          ? `linear-gradient(${layer.shapeConfig.gradient.angle}deg, ${layer.shapeConfig.gradient.colors[0]}, ${layer.shapeConfig.gradient.colors[1]})`
                          : layer.shapeConfig.fillColor,
                        boxShadow: `0 0 25px ${layer.shapeConfig.strokeColor}40`,
                      }}
                      className="flex items-center justify-center"
                    >
                      {layer.shapeConfig.shapeType === 'star' && (
                        <svg viewBox="0 0 24 24" className="w-16 h-16 fill-white drop-shadow-md">
                          <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* 4. Sound Reactive Visualizer */}
                  {layer.type === 'sound_visualizer' && layer.visualizerConfig && (
                    <div className="flex items-end gap-1.5 h-16 px-4">
                      {Array.from({ length: layer.visualizerConfig.barCount || 24 }).map((_, idx) => {
                        const freqVal = frequencyData[idx % frequencyData.length] || 15;
                        const barHeight = Math.max(6, (freqVal / 255) * 60 * (layer.visualizerConfig?.sensitivity || 1.2));
                        return (
                          <div
                            key={idx}
                            style={{
                              height: `${barHeight}px`,
                              backgroundColor:
                                idx % 2 === 0
                                  ? layer.visualizerConfig?.color
                                  : layer.visualizerConfig?.secondaryColor || layer.visualizerConfig?.color,
                              boxShadow: `0 0 12px ${layer.visualizerConfig?.color}60`,
                            }}
                            className="w-1.5 rounded-full transition-all duration-75"
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* 5. Personal Brand Kit Overlay */}
                  {layer.type === 'brand_kit' && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/90 border border-slate-700/60 rounded-full shadow-2xl backdrop-blur-xl">
                      <img
                        src={brandKit.avatarUrl}
                        alt={brandKit.creatorName}
                        className="w-8 h-8 rounded-full border border-indigo-400 bg-slate-800"
                      />
                      <div className="text-left">
                        <div className="text-xs font-bold text-white flex items-center gap-1 font-display">
                          {brandKit.creatorName}
                          <span className="w-3.5 h-3.5 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[8px] font-extrabold">
                            ✓
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{brandKit.handle}</div>
                      </div>
                      <button className="text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 rounded-full shadow-md shadow-indigo-600/30">
                        Follow
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Personal Brand Watermark (if enabled) */}
          {brandKit.showWatermark && (
            <div
              style={{ opacity: brandKit.watermarkOpacity }}
              className={`absolute z-30 pointer-events-none flex items-center gap-1.5 text-xs font-bold text-white/80 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm m-3 ${
                brandKit.watermarkPosition === 'top-left' ? 'top-0 left-0' : ''
              } ${brandKit.watermarkPosition === 'top-right' ? 'top-0 right-0' : ''} ${
                brandKit.watermarkPosition === 'bottom-left' ? 'bottom-0 left-0' : ''
              } ${brandKit.watermarkPosition === 'bottom-right' ? 'bottom-0 right-0' : ''}`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>{brandKit.handle}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Transport Controls Bar */}
      <div className="w-full flex items-center justify-center gap-4 pt-3 shrink-0 z-20">
        <button
          onClick={() => onSeek(0)}
          title="Rewind to start"
          className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSeek(Math.max(0, currentTime - 0.5))}
          title="Step back 0.5s"
          className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Big Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          className="w-11 h-11 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        <button
          onClick={() => onSeek(Math.min(duration, currentTime + 0.5))}
          title="Step forward 0.5s"
          className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
