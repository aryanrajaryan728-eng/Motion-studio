import React from 'react';
import {
  Sparkles,
  Check,
  Palette,
  ShieldCheck,
  User,
  AtSign,
} from 'lucide-react';
import { ProjectBrandKit } from '../types/editor';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandKit: ProjectBrandKit;
  onUpdateBrandKit: (updated: ProjectBrandKit) => void;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({
  isOpen,
  onClose,
  brandKit,
  onUpdateBrandKit,
}) => {
  if (!isOpen) return null;

  const avatarSeeds = ['RajAryan', 'CreatorPro', 'AuraMotion', 'ApexVfx', 'CyberTech'];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col gap-4 text-xs select-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-display">
                Personal Brand Studio
              </h3>
              <p className="text-[11px] text-slate-400">
                Setup your creator identity, watermark, and signature brand styling
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

        {/* Live Brand Card Preview */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={brandKit.avatarUrl}
              alt={brandKit.creatorName}
              className="w-12 h-12 rounded-full border-2 border-indigo-500 bg-slate-900 shadow-lg"
            />
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5 font-display">
                {brandKit.creatorName}
                <span className="w-4 h-4 rounded-full bg-cyan-500 text-black flex items-center justify-center text-[9px] font-black">
                  ✓
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">{brandKit.handle}</div>
              <div className="text-[10px] text-indigo-400 mt-0.5">{brandKit.tagline}</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div
              style={{ backgroundColor: brandKit.primaryColor }}
              className="w-5 h-5 rounded-full shadow"
              title="Primary Color"
            />
            <div
              style={{ backgroundColor: brandKit.accentColor }}
              className="w-5 h-5 rounded-full shadow"
              title="Accent Color"
            />
          </div>
        </div>

        {/* Identity Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Creator Name</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <User className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input
                type="text"
                value={brandKit.creatorName}
                onChange={(e) => onUpdateBrandKit({ ...brandKit, creatorName: e.target.value })}
                className="w-full bg-transparent text-white font-semibold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Handle</label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
              <AtSign className="w-3.5 h-3.5 text-slate-500 mr-2" />
              <input
                type="text"
                value={brandKit.handle}
                onChange={(e) => onUpdateBrandKit({ ...brandKit, handle: e.target.value })}
                className="w-full bg-transparent text-white font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Creator Tagline / Bio</label>
          <input
            type="text"
            value={brandKit.tagline}
            onChange={(e) => onUpdateBrandKit({ ...brandKit, tagline: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none"
          />
        </div>

        {/* Avatar Preset Picker */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1.5">Avatar Style</label>
          <div className="flex items-center gap-2">
            {avatarSeeds.map((seed) => {
              const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
              const isSelected = brandKit.avatarUrl === url;
              return (
                <button
                  key={seed}
                  onClick={() => onUpdateBrandKit({ ...brandKit, avatarUrl: url })}
                  className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform ${
                    isSelected ? 'border-cyan-400 scale-110' : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={seed} className="w-full h-full bg-slate-800" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Colors */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Primary Color</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1.5">
              <input
                type="color"
                value={brandKit.primaryColor}
                onChange={(e) => onUpdateBrandKit({ ...brandKit, primaryColor: e.target.value })}
                className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
              />
              <span className="font-mono text-slate-300">{brandKit.primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Accent Glow</label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg p-1.5">
              <input
                type="color"
                value={brandKit.accentColor}
                onChange={(e) => onUpdateBrandKit({ ...brandKit, accentColor: e.target.value })}
                className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
              />
              <span className="font-mono text-slate-300">{brandKit.accentColor}</span>
            </div>
          </div>
        </div>

        {/* Watermark Section */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-200">Video Signature Watermark</span>
            <input
              type="checkbox"
              checked={brandKit.showWatermark}
              onChange={(e) => onUpdateBrandKit({ ...brandKit, showWatermark: e.target.checked })}
              className="accent-indigo-500 rounded"
            />
          </div>

          {brandKit.showWatermark && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">Corner Position</label>
                <select
                  value={brandKit.watermarkPosition}
                  onChange={(e) =>
                    onUpdateBrandKit({
                      ...brandKit,
                      watermarkPosition: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200"
                >
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1">
                  Opacity ({(brandKit.watermarkOpacity * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={brandKit.watermarkOpacity}
                  onChange={(e) =>
                    onUpdateBrandKit({
                      ...brandKit,
                      watermarkOpacity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          Save Brand Kit
        </button>
      </div>
    </div>
  );
};
