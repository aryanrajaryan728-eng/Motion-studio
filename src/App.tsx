import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Layers,
  Wand2,
  FolderOpen,
  Plus,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  Layer,
  LayerType,
  Project,
  AspectRatio,
  BezierControlPoints,
  EasingType,
  AiAudioVibeRecommendation,
  MotionBannerConfig,
} from './types/editor';
import { SAMPLE_PROJECTS, DEFAULT_BRAND_KIT } from './utils/defaultProjects';
import { CURVE_PRESETS } from './utils/easing';
import { audioEngine } from './utils/audioEngine';
import { Header } from './components/Header';
import { CanvasViewport } from './components/CanvasViewport';
import { Timeline } from './components/Timeline';
import { LayerInspector } from './components/LayerInspector';
import { KeyframeCurveEditor } from './components/KeyframeCurveEditor';
import { AiMotionAgent } from './components/AiMotionAgent';
import { MotionBannersDrawer } from './components/MotionBannersDrawer';
import { BrandKitModal } from './components/BrandKitModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [project, setProject] = useState<Project>(SAMPLE_PROJECTS[0]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    SAMPLE_PROJECTS[0].layers[2]?.id || null
  );

  // Active navigation view & modals
  const [activeView, setActiveView] = useState<'editor' | 'curves' | 'brand' | 'banners'>('editor');
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isBrandKitOpen, setIsBrandKitOpen] = useState<boolean>(false);
  const [isBannersDrawerOpen, setIsBannersDrawerOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isCurveEditorOpen, setIsCurveEditorOpen] = useState<boolean>(false);

  // Active keyframe being edited in curve editor
  const [activeKeyframeId, setActiveKeyframeId] = useState<string | null>(null);

  const lastFrameTimeRef = useRef<number>(performance.now());

  // Main 60FPS Playback Loop
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (isPlaying) {
        const delta = (now - lastFrameTimeRef.current) / 1000;
        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= project.duration) {
            return 0; // loop
          }
          return next;
        });
      }
      lastFrameTimeRef.current = now;
      animId = requestAnimationFrame(tick);
    };

    lastFrameTimeRef.current = performance.now();
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, project.duration]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);
    if (nextPlay) {
      audioEngine.startPlayback(project.audioTrack?.genre || 'trap', project.audioTrack?.bpm || 130);
    } else {
      audioEngine.stopPlayback();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((t) => Math.max(0, t - 0.1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((t) => Math.min(project.duration, t + 0.1));
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedLayerId) {
          handleDeleteLayer(selectedLayerId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, selectedLayerId, project.duration]);

  // Selected Layer
  const selectedLayer = project.layers.find((l) => l.id === selectedLayerId) || null;

  // Add Layer
  const handleAddLayer = (type: LayerType) => {
    const newId = `layer-${Date.now()}`;
    let newLayer: Layer;

    if (type === 'kinetic_text') {
      newLayer = {
        id: newId,
        name: 'Kinetic Text',
        type: 'kinetic_text',
        trackIndex: 0,
        startTime: currentTime,
        duration: Math.min(4, project.duration - currentTime || 4),
        visible: true,
        locked: false,
        blendMode: 'normal',
        positionX: 0,
        positionY: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        textConfig: {
          text: 'NEW KINETIC HOOK',
          fontSize: 32,
          fontFamily: 'Outfit',
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: 2,
          glowColor: '#6366f1',
          glowBlur: 20,
          backgroundBox: true,
          boxColor: '#1e1b4b',
          animationStyle: 'pop',
        },
        keyframes: [
          {
            id: `kf-${Date.now()}-1`,
            time: currentTime,
            property: 'scale',
            value: 0.2,
            easing: 'overshoot',
          },
          {
            id: `kf-${Date.now()}-2`,
            time: currentTime + 0.6,
            property: 'scale',
            value: 1.0,
            easing: 'overshoot',
          },
        ],
      };
    } else if (type === 'motion_banner') {
      newLayer = {
        id: newId,
        name: 'Motion Banner',
        type: 'motion_banner',
        trackIndex: 0,
        startTime: currentTime,
        duration: 4,
        visible: true,
        locked: false,
        blendMode: 'normal',
        positionX: 0,
        positionY: -20,
        scale: 1,
        rotation: 0,
        opacity: 1,
        bannerConfig: {
          preset: 'neon_cyber',
          primaryText: 'VIRAL HOOK',
          secondaryText: project.brandKit.handle,
          badgeText: 'NEW',
          accentColor: '#06b6d4',
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          showGlow: true,
        },
        keyframes: [],
      };
    } else if (type === 'shape') {
      newLayer = {
        id: newId,
        name: 'Motion Shape',
        type: 'shape',
        trackIndex: 0,
        startTime: currentTime,
        duration: 4,
        visible: true,
        locked: false,
        blendMode: 'normal',
        positionX: 0,
        positionY: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        shapeConfig: {
          shapeType: 'star',
          fillColor: '#8b5cf6',
          strokeColor: '#f43f5e',
          strokeWidth: 3,
          borderRadius: 16,
        },
        keyframes: [],
      };
    } else {
      newLayer = {
        id: newId,
        name: 'Sound Wave Spectrum',
        type: 'sound_visualizer',
        trackIndex: 0,
        startTime: 0,
        duration: project.duration,
        visible: true,
        locked: false,
        blendMode: 'screen',
        positionX: 0,
        positionY: 35,
        scale: 1,
        rotation: 0,
        opacity: 0.9,
        visualizerConfig: {
          style: 'bars',
          barCount: 24,
          color: '#6366f1',
          secondaryColor: '#06b6d4',
          sensitivity: 1.3,
        },
        keyframes: [],
      };
    }

    setProject((prev) => ({
      ...prev,
      layers: [newLayer, ...prev.layers],
    }));
    setSelectedLayerId(newId);
  };

  // Update Layer
  const handleUpdateLayer = (updated: Layer) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === updated.id ? updated : l)),
    }));
  };

  // Update Layer Transform from Gizmo
  const handleUpdateLayerTransform = (
    layerId: string,
    transform: { positionX?: number; positionY?: number; scale?: number; rotation?: number }
  ) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === layerId ? { ...l, ...transform } : l
      ),
    }));
  };

  // Delete Layer
  const handleDeleteLayer = (id: string) => {
    setProject((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== id),
    }));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };

  // Duplicate Layer
  const handleDuplicateLayer = (id: string) => {
    const target = project.layers.find((l) => l.id === id);
    if (!target) return;
    const dup: Layer = {
      ...target,
      id: `layer-${Date.now()}`,
      name: `${target.name} (Copy)`,
      positionY: target.positionY + 5,
    };
    setProject((prev) => ({
      ...prev,
      layers: [dup, ...prev.layers],
    }));
    setSelectedLayerId(dup.id);
  };

  // Split Layer
  const handleSplitLayer = (id: string, splitTime: number) => {
    const target = project.layers.find((l) => l.id === id);
    if (!target) return;
    if (splitTime <= target.startTime || splitTime >= target.startTime + target.duration) return;

    const firstDuration = splitTime - target.startTime;
    const secondDuration = target.duration - firstDuration;

    const part1: Layer = { ...target, duration: firstDuration };
    const part2: Layer = {
      ...target,
      id: `layer-${Date.now()}`,
      name: `${target.name} (Pt 2)`,
      startTime: splitTime,
      duration: secondDuration,
    };

    setProject((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === id ? part1 : l)).concat(part2),
    }));
  };

  // Add Keyframe at Playhead
  const handleAddKeyframeAtPlayhead = (layerId: string) => {
    const target = project.layers.find((l) => l.id === layerId);
    if (!target) return;

    const newKf = {
      id: `kf-${Date.now()}`,
      time: parseFloat(currentTime.toFixed(2)),
      property: 'scale' as const,
      value: target.scale,
      easing: 'overshoot' as EasingType,
      bezier: CURVE_PRESETS['overshoot'].points,
    };

    const updatedKeyframes = [...(target.keyframes || []), newKf];
    handleUpdateLayer({ ...target, keyframes: updatedKeyframes });
    setActiveKeyframeId(newKf.id);
    setIsCurveEditorOpen(true);
  };

  // Apply Easing Curve to Keyframes
  const handleApplyCurve = (bezier: BezierControlPoints, easingType: EasingType) => {
    if (!selectedLayer) return;
    const updatedKfs = (selectedLayer.keyframes || []).map((kf) => ({
      ...kf,
      easing: easingType,
      bezier,
    }));
    handleUpdateLayer({ ...selectedLayer, keyframes: updatedKfs });
    setIsCurveEditorOpen(false);
  };

  // Apply AI Recommendation
  const handleApplyAiRecommendation = (rec: AiAudioVibeRecommendation) => {
    // Add recommended layers
    const newLayers: Layer[] = rec.suggestedLayers.map((sug, i) => ({
      id: `ai-layer-${Date.now()}-${i}`,
      name: sug.name,
      type: sug.type,
      trackIndex: i,
      startTime: sug.startTime,
      duration: sug.duration,
      visible: true,
      locked: false,
      blendMode: 'normal',
      positionX: 0,
      positionY: i === 0 ? -10 : 25,
      scale: 1,
      rotation: 0,
      opacity: 1,
      textConfig:
        sug.type === 'kinetic_text'
          ? {
              text: sug.text || 'AI HOOK',
              fontSize: 34,
              fontFamily: 'Outfit',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: 2,
              glowColor: rec.recommendedColorPalette.glow,
              glowBlur: 24,
              backgroundBox: true,
              boxColor: '#121422',
              animationStyle: 'pop',
            }
          : undefined,
      bannerConfig:
        sug.type === 'motion_banner'
          ? {
              preset: 'neon_cyber',
              primaryText: sug.text || 'AI KINETIC REVEAL',
              badgeText: 'VIRAL',
              accentColor: rec.recommendedColorPalette.accent,
              backgroundColor: '#0c0e18',
              textColor: '#ffffff',
              showGlow: true,
            }
          : undefined,
      visualizerConfig:
        sug.type === 'sound_visualizer'
          ? {
              style: 'bars',
              barCount: 26,
              color: rec.recommendedColorPalette.primary,
              secondaryColor: rec.recommendedColorPalette.accent,
              sensitivity: 1.4,
            }
          : undefined,
      keyframes: [
        {
          id: `ai-kf-${i}-1`,
          time: sug.startTime,
          property: 'scale',
          value: 0.3,
          easing: 'overshoot',
        },
        {
          id: `ai-kf-${i}-2`,
          time: sug.startTime + 0.6,
          property: 'scale',
          value: 1.0,
          easing: 'overshoot',
        },
      ],
    }));

    setProject((prev) => ({
      ...prev,
      backgroundColor: rec.recommendedColorPalette.background || prev.backgroundColor,
      layers: [...newLayers, ...prev.layers],
    }));

    setIsAiDrawerOpen(false);
  };

  // Execute Aura Agent Action
  const handleExecuteAgentAction = (actionType: string, payload: any) => {
    if (actionType === 'ADD_LOWER_THIRD') {
      const ltLayer: Layer = {
        id: `lt-${Date.now()}`,
        name: 'Brand Lower Third',
        type: 'motion_banner',
        trackIndex: 0,
        startTime: currentTime,
        duration: 5,
        visible: true,
        locked: false,
        blendMode: 'normal',
        positionX: -15,
        positionY: 30,
        scale: 1,
        rotation: 0,
        opacity: 1,
        bannerConfig: {
          preset: 'creator_verified',
          primaryText: payload?.text || project.brandKit.creatorName,
          secondaryText: payload?.handle || project.brandKit.handle,
          badgeText: 'VERIFIED',
          accentColor: project.brandKit.accentColor,
          backgroundColor: '#0f172a',
          textColor: '#ffffff',
          showGlow: true,
        },
        keyframes: [
          {
            id: `kf-lt-1`,
            time: currentTime,
            property: 'positionX',
            value: -40,
            easing: 'ease-out',
          },
          {
            id: `kf-lt-2`,
            time: currentTime + 0.8,
            property: 'positionX',
            value: -15,
            easing: 'overshoot',
          },
        ],
      };
      setProject((p) => ({ ...p, layers: [ltLayer, ...p.layers] }));
      setSelectedLayerId(ltLayer.id);
    } else if (actionType === 'ADD_TEXT_LAYER') {
      handleAddLayer('kinetic_text');
    }
  };

  // Export Still PNG Frame
  const handleExportPngFrame = () => {
    const canvas = document.createElement('canvas');
    canvas.width = project.aspectRatio === '9:16' ? 1080 : 1920;
    canvas.height = project.aspectRatio === '9:16' ? 1920 : 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = project.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw branding watermark
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillText(`${project.brandKit.handle} · AlightStudio`, 60, canvas.height - 60);

    // Render snapshot
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_frame.png`;
    a.click();
  };

  // Export Project JSON
  const handleExportProjectJson = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.alight.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Project JSON
  const handleImportProjectJson = (jsonStr: string) => {
    try {
      const imported: Project = JSON.parse(jsonStr);
      if (imported.layers && imported.title) {
        setProject(imported);
        setCurrentTime(0);
        setSelectedLayerId(imported.layers[0]?.id || null);
      }
    } catch (err) {
      console.error('Invalid project file:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Header (Conforms to Top Bar Contract) */}
      <Header
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          if (v === 'curves') setIsCurveEditorOpen(true);
          if (v === 'brand') setIsBrandKitOpen(true);
          if (v === 'banners') setIsBannersDrawerOpen(true);
        }}
        aspectRatio={project.aspectRatio}
        setAspectRatio={(ar) => setProject((p) => ({ ...p, aspectRatio: ar }))}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenAiDrawer={() => setIsAiDrawerOpen(true)}
        projectTitle={project.title}
      />

      {/* Project Quick Selector Strip */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <FolderOpen className="w-3 h-3 text-cyan-400" />
            Projects:
          </span>
          {SAMPLE_PROJECTS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setProject(p);
                setCurrentTime(0);
                setSelectedLayerId(p.layers[0]?.id || null);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap ${
                project.id === p.id
                  ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Quick AI Trigger */}
        <button
          onClick={() => setIsAiDrawerOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-900/40 to-cyan-900/40 border border-indigo-500/30 text-indigo-300 hover:text-white transition-all text-[11px] font-semibold"
        >
          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>AI Audio &amp; Motion Copilot</span>
        </button>
      </div>

      {/* 2. Middle Row: Canvas Viewport + Layer Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas Viewport Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          <CanvasViewport
            layers={project.layers}
            currentTime={currentTime}
            duration={project.duration}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSeek={(t) => setCurrentTime(t)}
            aspectRatio={project.aspectRatio}
            selectedLayerId={selectedLayerId}
            onSelectLayer={(id) => setSelectedLayerId(id)}
            onUpdateLayerTransform={handleUpdateLayerTransform}
            brandKit={project.brandKit}
            backgroundColor={project.backgroundColor}
          />
        </div>

        {/* Right Sidebar: Layer Inspector */}
        <LayerInspector
          layer={selectedLayer}
          onUpdateLayer={handleUpdateLayer}
          onOpenCurveEditor={() => setIsCurveEditorOpen(true)}
          onAddKeyframe={() => {
            if (selectedLayerId) handleAddKeyframeAtPlayhead(selectedLayerId);
          }}
        />
      </div>

      {/* 3. Bottom Row: Multi-track Timeline with Keyframe Diamonds */}
      <Timeline
        layers={project.layers}
        currentTime={currentTime}
        duration={project.duration}
        onSeek={(t) => setCurrentTime(t)}
        selectedLayerId={selectedLayerId}
        onSelectLayer={(id) => setSelectedLayerId(id)}
        onUpdateLayer={handleUpdateLayer}
        onAddLayer={handleAddLayer}
        onDeleteLayer={handleDeleteLayer}
        onDuplicateLayer={handleDuplicateLayer}
        onSplitLayer={handleSplitLayer}
        onAddKeyframeAtPlayhead={handleAddKeyframeAtPlayhead}
        audioTrackWaveform={project.audioTrack?.waveformPoints}
      />

      {/* Modals & Slide-over Drawers */}

      {/* Aura AI Motion Agent Copilot */}
      <AiMotionAgent
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        project={project}
        onApplyRecommendation={handleApplyAiRecommendation}
        onExecuteAgentAction={handleExecuteAgentAction}
      />

      {/* Keyframe Bezier Curve Editor Modal */}
      {isCurveEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <KeyframeCurveEditor
            selectedKeyframe={
              selectedLayer?.keyframes?.find((k) => k.id === activeKeyframeId) ||
              selectedLayer?.keyframes?.[0] ||
              null
            }
            onApplyCurve={handleApplyCurve}
            onClose={() => setIsCurveEditorOpen(false)}
            activeLayerName={selectedLayer?.name}
          />
        </div>
      )}

      {/* Motion Banners Library Drawer */}
      <MotionBannersDrawer
        isOpen={isBannersDrawerOpen}
        onClose={() => setIsBannersDrawerOpen(false)}
        onAddBannerPreset={(cfg) => {
          const newId = `banner-${Date.now()}`;
          const newBannerLayer: Layer = {
            id: newId,
            name: cfg.primaryText,
            type: 'motion_banner',
            trackIndex: 0,
            startTime: currentTime,
            duration: 4.5,
            visible: true,
            locked: false,
            blendMode: 'normal',
            positionX: 0,
            positionY: -20,
            scale: 1,
            rotation: 0,
            opacity: 1,
            bannerConfig: cfg,
            keyframes: [
              {
                id: `kf-b-${Date.now()}-1`,
                time: currentTime,
                property: 'scale',
                value: 0.3,
                easing: 'overshoot',
              },
              {
                id: `kf-b-${Date.now()}-2`,
                time: currentTime + 0.6,
                property: 'scale',
                value: 1.0,
                easing: 'overshoot',
              },
            ],
          };
          setProject((p) => ({ ...p, layers: [newBannerLayer, ...p.layers] }));
          setSelectedLayerId(newId);
        }}
      />

      {/* Personal Brand Studio Modal */}
      <BrandKitModal
        isOpen={isBrandKitOpen}
        onClose={() => setIsBrandKitOpen(false)}
        brandKit={project.brandKit}
        onUpdateBrandKit={(bk) => setProject((p) => ({ ...p, brandKit: bk }))}
      />

      {/* Export & Render Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        onExportPngFrame={handleExportPngFrame}
        onExportProjectJson={handleExportProjectJson}
        onImportProjectJson={handleImportProjectJson}
      />
    </div>
  );
}
