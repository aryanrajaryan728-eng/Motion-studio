export type LayerType =
  | 'video'
  | 'kinetic_text'
  | 'motion_banner'
  | 'shape'
  | 'sound_visualizer'
  | 'brand_kit'
  | 'vfx_filter';

export type BlendMode =
  | 'normal'
  | 'screen'
  | 'multiply'
  | 'overlay'
  | 'difference'
  | 'color-dodge';

export type EasingType =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'overshoot'
  | 'bounce'
  | 'spring'
  | 'custom-bezier';

export interface BezierControlPoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Keyframe {
  id: string;
  time: number; // in seconds
  property: 'positionX' | 'positionY' | 'scale' | 'rotation' | 'opacity';
  value: number;
  easing?: EasingType;
  bezier?: BezierControlPoints;
}

export interface ShapeConfig {
  shapeType: 'rectangle' | 'circle' | 'star' | 'hexagon' | 'lightning' | 'blob' | 'badge';
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
  gradient?: {
    type: 'linear' | 'radial';
    colors: [string, string];
    angle: number;
  };
}

export interface MotionBannerConfig {
  preset:
    | 'neon_cyber'
    | 'subscribe_pill'
    | 'minimal_lower_third'
    | 'liquid_gradient'
    | 'hologram_tag'
    | 'breaking_hook'
    | 'creator_verified';
  primaryText: string;
  secondaryText?: string;
  icon?: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  badgeText?: string;
  showGlow: boolean;
}

export interface KineticTextConfig {
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  letterSpacing: number;
  strokeColor?: string;
  strokeWidth?: number;
  glowColor?: string;
  glowBlur?: number;
  backgroundBox?: boolean;
  boxColor?: string;
  animationStyle: 'pop' | 'typewriter' | 'glitch' | 'wave' | 'slide-up' | '3d-flip';
}

export interface VisualizerConfig {
  style: 'bars' | 'wave' | 'circle' | 'dots';
  barCount: number;
  color: string;
  secondaryColor?: string;
  sensitivity: number;
}

export interface VfxConfig {
  glow: number; // 0 - 100
  glitch: number; // 0 - 100
  rgbSplit: number; // 0 - 100
  cameraShake: number; // 0 - 100
  scanlines: boolean;
  vignette: number;
  lut: 'none' | 'teal_orange' | 'cyberpunk' | 'warm_vintage' | 'noir' | 'neon_matrix';
}

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  trackIndex: number; // Track 0 = top
  startTime: number; // seconds
  duration: number; // seconds
  visible: boolean;
  locked: boolean;
  blendMode: BlendMode;

  // Base transform properties
  positionX: number; // % of canvas (-50 to 50, 0 is center)
  positionY: number; // % of canvas (-50 to 50, 0 is center)
  scale: number; // 1 = 100%
  rotation: number; // degrees
  opacity: number; // 0 - 1

  // Keyframes for this layer
  keyframes: Keyframe[];

  // Type specific configurations
  shapeConfig?: ShapeConfig;
  bannerConfig?: MotionBannerConfig;
  textConfig?: KineticTextConfig;
  visualizerConfig?: VisualizerConfig;
  vfxConfig?: VfxConfig;

  // Video or image media source (for video/image layer)
  mediaSrc?: string;
  mediaType?: 'video' | 'image' | 'solid';
  solidColor?: string;
}

export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:5';

export interface ProjectBrandKit {
  creatorName: string;
  handle: string;
  tagline: string;
  avatarUrl: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  showWatermark: boolean;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  watermarkOpacity: number;
}

export interface Project {
  id: string;
  title: string;
  duration: number; // in seconds
  fps: number;
  aspectRatio: AspectRatio;
  backgroundColor: string;
  brandKit: ProjectBrandKit;
  layers: Layer[];
  audioTrack?: {
    id: string;
    title: string;
    genre: string;
    bpm: number;
    url?: string;
    volume: number;
    waveformPoints: number[];
  };
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'aura';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'ADD_MOTION_BANNER' | 'ADD_LOWER_THIRD' | 'APPLY_CURVE' | 'ADD_AUDIO_WAVE' | 'ADD_TEXT_LAYER' | 'SET_COLOR_GRADE' | null;
    payload?: any;
    actionLabel?: string;
  };
  quickSuggestions?: string[];
}

export interface AiAudioVibeRecommendation {
  recommendationTitle: string;
  hindiExplanation: string;
  englishSummary: string;
  vibeScore: {
    energyLevel: 'High' | 'Medium' | 'Chill' | 'Cinematic';
    pacing: string;
    recommendedBpmSync: number;
  };
  motionCurve: {
    name: string;
    bezier: string;
    stiffness: number;
    damping: number;
  };
  recommendedColorPalette: {
    primary: string;
    accent: string;
    glow: string;
    background: string;
  };
  vfxSettings: {
    glow: number;
    glitch: number;
    rgbSplit: number;
    cameraShake: number;
    motionBlur: boolean;
  };
  suggestedLayers: Array<{
    type: LayerType;
    name: string;
    startTime: number;
    duration: number;
    text?: string;
    animation: string;
    easing: string;
    color: string;
  }>;
}
