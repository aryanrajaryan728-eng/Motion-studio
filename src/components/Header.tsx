import React from 'react';
import { Download, Sparkles, Wand2, Layers, Cpu } from 'lucide-react';
import { AspectRatio } from '../types/editor';

interface HeaderProps {
  activeView: 'editor' | 'curves' | 'brand' | 'banners';
  setActiveView: (view: 'editor' | 'curves' | 'brand' | 'banners') => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  onOpenExport: () => void;
  onOpenAiDrawer: () => void;
  projectTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  aspectRatio,
  setAspectRatio,
  onOpenExport,
  onOpenAiDrawer,
  projectTitle,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 h-14">
      {/* Zone 1: Single Brand Wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('editor');
          }}
          className="text-lg font-bold tracking-tight text-white font-display flex items-center gap-2 whitespace-nowrap shrink-0"
        >
          <span className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </span>
          <span>AlightStudio</span>
        </a>
        <span className="text-xs text-slate-500 hidden sm:inline-block font-medium truncate max-w-[160px]">
          {projectTitle}
        </span>
      </div>

      {/* Zone 2: 4-5 single-line clean navigation tabs */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveView('editor')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeView === 'editor' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Editor
        </button>

        <button
          onClick={() => setActiveView('curves')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeView === 'curves' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Keyframe Curves
        </button>

        <button
          onClick={() => setActiveView('banners')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeView === 'banners' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Motion Banners
        </button>

        <button
          onClick={() => setActiveView('brand')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'brand' ? 'text-cyan-400 font-semibold' : ''
          }`}
        >
          Brand Kit
        </button>

        <button
          onClick={onOpenAiDrawer}
          className="hover:text-indigo-400 text-indigo-400/90 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 font-semibold"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
          Aura AI Agent
        </button>
      </nav>

      {/* Zone 3: 1 primary action CTA + Quick Aspect Ratio */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Aspect Ratio Selector */}
        <div className="hidden lg:flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono-nums">
          {(['9:16', '16:9', '1:1', '4:5'] as AspectRatio[]).map((ar) => (
            <button
              key={ar}
              onClick={() => setAspectRatio(ar)}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                aspectRatio === ar
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {ar}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenExport}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
