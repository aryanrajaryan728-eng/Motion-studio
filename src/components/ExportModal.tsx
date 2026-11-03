import React, { useState } from 'react';
import {
  Download,
  Film,
  Camera,
  FileJson,
  CheckCircle,
  Sparkles,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Project } from '../types/editor';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onExportPngFrame: () => void;
  onExportProjectJson: () => void;
  onImportProjectJson: (json: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onExportPngFrame,
  onExportProjectJson,
  onImportProjectJson,
}) => {
  const [resolution, setResolution] = useState<'1080p' | '4k' | '720p'>('1080p');
  const [format, setFormat] = useState<'mp4' | 'webm'>('mp4');
  const [fps, setFps] = useState<number>(60);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleStartRender = () => {
    setIsRendering(true);
    setRenderProgress(0);
    setIsDone(false);

    // Simulate high-fidelity frame-by-frame rendering
    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          setIsDone(true);
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDownloadRenderedFile = () => {
    // Generate dummy downloadable video file blob
    const dummyBlob = new Blob(
      [JSON.stringify(project, null, 2)],
      { type: 'video/mp4' }
    );
    const url = URL.createObjectURL(dummyBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${resolution}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportProjectJson(content);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 text-xs text-slate-300">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl flex flex-col gap-4 select-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-display">
                Export &amp; Render Project
              </h3>
              <p className="text-[11px] text-slate-400">
                Render 60FPS video, high-res frame stills, or backup project files
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

        {/* Video Render Configuration */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
          <span className="font-bold text-white text-xs flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            Master Video Render
          </span>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-semibold"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="4k">4K Ultra HD</option>
                <option value="720p">720p Fast Draft</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-semibold uppercase"
              >
                <option value="mp4">MP4 (H.264)</option>
                <option value="webm">WebM (Alpha)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-1">Frame Rate</label>
              <select
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 font-semibold"
              >
                <option value={60}>60 FPS (Alight Smooth)</option>
                <option value={30}>30 FPS Standard</option>
                <option value={24}>24 FPS Cinema</option>
              </select>
            </div>
          </div>

          {/* Render Progress Bar */}
          {isRendering && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-[11px]">
                <span className="text-cyan-400 font-semibold">Rendering Motion Keyframes...</span>
                <span className="font-mono-nums text-white font-bold">{renderProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <div
                  style={{ width: `${renderProgress}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-150"
                />
              </div>
            </div>
          )}

          {isDone ? (
            <button
              onClick={handleDownloadRenderedFile}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Download {resolution.toUpperCase()} Video ({format.toUpperCase()})
            </button>
          ) : (
            <button
              onClick={handleStartRender}
              disabled={isRendering}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {isRendering ? 'Rendering Video...' : 'Start Video Render'}
            </button>
          )}
        </div>

        {/* Alternate Quick Exports */}
        <div className="grid grid-cols-2 gap-3">
          {/* PNG Snapshot */}
          <button
            onClick={() => {
              onExportPngFrame();
              confetti({ particleCount: 30, spread: 50 });
            }}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col items-center text-center gap-1 transition-colors"
          >
            <Camera className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white text-xs">Capture Still PNG</span>
            <span className="text-[10px] text-slate-500">Download current frame at 100%</span>
          </button>

          {/* Project JSON Save */}
          <button
            onClick={onExportProjectJson}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col items-center text-center gap-1 transition-colors"
          >
            <FileJson className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white text-xs">Export Project (.json)</span>
            <span className="text-[10px] text-slate-500">Save full layers &amp; keyframes</span>
          </button>
        </div>

        {/* Import Project Option */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">Load existing project file:</span>
          <label className="cursor-pointer px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition-colors">
            Browse JSON
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
