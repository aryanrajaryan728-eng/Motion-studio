import React from 'react';
import {
  Sparkles,
  Plus,
  Zap,
  CheckCircle,
  Bell,
  Radio,
  Flame,
  Award,
} from 'lucide-react';
import { MotionBannerConfig } from '../types/editor';

interface MotionBannersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBannerPreset: (config: MotionBannerConfig) => void;
}

export const MotionBannersDrawer: React.FC<MotionBannersDrawerProps> = ({
  isOpen,
  onClose,
  onAddBannerPreset,
}) => {
  if (!isOpen) return null;

  const presets: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
    config: MotionBannerConfig;
  }> = [
    {
      title: 'Neon Cyber Glow Banner',
      description: 'High-contrast glowing cyber frame for viral reels and hooks',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
      config: {
        preset: 'neon_cyber',
        primaryText: 'AI MOTION STUDIO',
        secondaryText: 'PRO LEVEL CREATOR PACK',
        badgeText: 'VIRAL',
        accentColor: '#06b6d4',
        backgroundColor: '#0d111d',
        textColor: '#ffffff',
        showGlow: true,
      },
    },
    {
      title: 'Verified Subscribe Pill',
      description: 'Personal brand follow & subscribe call-to-action with verified badge',
      icon: <CheckCircle className="w-4 h-4 text-emerald-400" />,
      config: {
        preset: 'subscribe_pill',
        primaryText: 'Raj Aryan',
        secondaryText: 'Tap to subscribe for motion tutorials',
        badgeText: 'FOLLOW',
        accentColor: '#10b981',
        backgroundColor: '#111827',
        textColor: '#ffffff',
        showGlow: true,
      },
    },
    {
      title: 'Minimal Luxe Lower Third',
      description: 'Clean typographic identification bar for tech and podcast videos',
      icon: <Award className="w-4 h-4 text-indigo-400" />,
      config: {
        preset: 'minimal_lower_third',
        primaryText: 'Raj Aryan',
        secondaryText: 'Motion Designer & Creator',
        badgeText: 'TECH',
        accentColor: '#6366f1',
        backgroundColor: '#121420',
        textColor: '#ffffff',
        showGlow: false,
      },
    },
    {
      title: 'Breaking Viral Hook Pill',
      description: 'Urgent eye-grabbing kinetic tag for the first 3 seconds of a reel',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      config: {
        preset: 'breaking_hook',
        primaryText: 'STOP SCROLLING 🚀',
        secondaryText: 'This secret changes everything',
        badgeText: 'HOT',
        accentColor: '#f43f5e',
        backgroundColor: '#1f131a',
        textColor: '#ffffff',
        showGlow: true,
      },
    },
    {
      title: 'Liquid Gradient Badge',
      description: 'Alight Motion-grade smooth organic color transition pill',
      icon: <Sparkles className="w-4 h-4 text-pink-400" />,
      config: {
        preset: 'liquid_gradient',
        primaryText: 'ALIGHT KINETIC PRO',
        secondaryText: 'Smooth Bezier 60FPS Easing',
        badgeText: 'SMOOTH',
        accentColor: '#ec4899',
        backgroundColor: '#1e1124',
        textColor: '#ffffff',
        showGlow: true,
      },
    },
    {
      title: 'Live Podcast Broadcast Tag',
      description: 'Simulated live broadcast tag with recording pulse dot',
      icon: <Radio className="w-4 h-4 text-amber-400" />,
      config: {
        preset: 'hologram_tag',
        primaryText: 'EPISODE #42: MOTION AI',
        secondaryText: 'Streaming Live in 4K',
        badgeText: 'LIVE',
        accentColor: '#f59e0b',
        backgroundColor: '#1a160d',
        textColor: '#ffffff',
        showGlow: true,
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-display">
                Alight Motion Banners &amp; Graphics Library
              </h3>
              <p className="text-[11px] text-slate-400">
                1-click kinetic motion graphic banners ready to customize
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Banners Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {presets.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between hover:border-indigo-500/50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1 rounded-md bg-slate-900 border border-slate-800">
                    {item.icon}
                  </span>
                  <span className="font-bold text-white text-xs">{item.title}</span>
                </div>

                {/* Banner Mini Preview */}
                <div
                  style={{
                    backgroundColor: item.config.backgroundColor,
                    borderColor: item.config.accentColor,
                    boxShadow: item.config.showGlow ? `0 0 15px ${item.config.accentColor}30` : 'none',
                  }}
                  className="p-2.5 rounded-xl border flex items-center gap-2 mb-2"
                >
                  {item.config.badgeText && (
                    <span
                      style={{ backgroundColor: item.config.accentColor }}
                      className="text-[9px] font-bold text-black px-1.5 py-0.5 rounded"
                    >
                      {item.config.badgeText}
                    </span>
                  )}
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-white truncate font-display">
                      {item.config.primaryText}
                    </div>
                    {item.config.secondaryText && (
                      <div className="text-[9px] text-slate-400 truncate">
                        {item.config.secondaryText}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">{item.description}</p>
              </div>

              <button
                onClick={() => {
                  onAddBannerPreset(item.config);
                  onClose();
                }}
                className="mt-3 w-full py-1.5 bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-800 hover:border-indigo-500 font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Timeline
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
