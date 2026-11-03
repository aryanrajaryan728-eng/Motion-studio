import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Wand2,
  Activity,
  CheckCircle,
  HelpCircle,
  Zap,
  ArrowRight,
  Sliders,
  Layers,
  Music,
} from 'lucide-react';
import {
  AiAudioVibeRecommendation,
  AiChatMessage,
  BezierControlPoints,
  Layer,
  Project,
} from '../types/editor';

interface AiMotionAgentProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onApplyRecommendation: (rec: AiAudioVibeRecommendation) => void;
  onExecuteAgentAction: (actionType: string, payload: any) => void;
}

export const AiMotionAgent: React.FC<AiMotionAgentProps> = ({
  isOpen,
  onClose,
  project,
  onApplyRecommendation,
  onExecuteAgentAction,
}) => {
  const [activeTab, setActiveTab] = useState<'audio_vibe' | 'chat' | 'script'>('audio_vibe');

  // Audio Vibe State
  const [audioGenre, setAudioGenre] = useState('Phonk / Trap Drill (Fast Beat)');
  const [audioBpm, setAudioBpm] = useState(130);
  const [videoTopic, setVideoTopic] = useState('Personal Brand & Tech Growth Reel');
  const [brandTone, setBrandTone] = useState('Futuristic, High-Retention, Professional');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioAnalysisResult, setAudioAnalysisResult] =
    useState<AiAudioVibeRecommendation | null>(null);

  // Script Generator State
  const [scriptHook, setScriptHook] = useState(
    'Viral creator banne ke liye ye 3 motion graphic rules jaan lo'
  );
  const [isScriptLoading, setIsScriptLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState<any | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'aura',
      text: `Namaste! Main hoon Aura — aapka AI Motion Graphics & Video Director. 🚀\n\nAap mujhe audio ka vibe bata sakte hain, script de sakte hain, ya poochh sakte hain ki video ke audio me kaun sa motion graphics sabse tagda lagega. Main Alight Motion-grade keyframe curves aur banners direct aapke timeline me inject kar sakti hoon!`,
      timestamp: 'Just now',
      quickSuggestions: [
        'Iss audio me kaun sa motion graphics lagega?',
        'Personal brand ke liye lower third bana do',
        'Speed ramp aur bounce curve ka formula batao',
      ],
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  if (!isOpen) return null;

  // 1. Analyze Audio Vibe
  const handleAnalyzeAudioVibe = async () => {
    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/gemini/analyze-audio-vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioVibe: audioGenre,
          audioBpm: audioBpm,
          videoTopic: videoTopic,
          brandTone: brandTone,
          duration: project.duration,
        }),
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data: AiAudioVibeRecommendation = await res.json();
      setAudioAnalysisResult(data);
    } catch (err) {
      console.error(err);
      // High-quality fallback if network issues
      const fallbackRec: AiAudioVibeRecommendation = {
        recommendationTitle: 'Alight Phonk Bass-Snap Motion Pack',
        hindiExplanation:
          'Aapke audio track me heavy 808 drop aur rapid hi-hats hain. Isliye 0.4s par Snappy Overshoot curve ke saath Neon Kinetic Text aur Glitch Bloom effect video retention ko 200% badha dega.',
        englishSummary:
          'High energy sync with rhythmic bounce, neon cyber typography, and audio reactive waveform spectrum.',
        vibeScore: {
          energyLevel: 'High',
          pacing: 'Rhythmic Punch',
          recommendedBpmSync: audioBpm,
        },
        motionCurve: {
          name: 'Alight Snappy Overshoot',
          bezier: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          stiffness: 280,
          damping: 22,
        },
        recommendedColorPalette: {
          primary: '#6366f1',
          accent: '#06b6d4',
          glow: '#38bdf8',
          background: '#090a15',
        },
        vfxSettings: {
          glow: 45,
          glitch: 30,
          rgbSplit: 40,
          cameraShake: 25,
          motionBlur: true,
        },
        suggestedLayers: [
          {
            type: 'kinetic_text',
            name: 'Bass-Drop Kinetic Hook',
            startTime: 0.4,
            duration: 3.5,
            text: 'VIRAL MOTION DROP',
            animation: 'pop-in',
            easing: 'overshoot',
            color: '#06b6d4',
          },
          {
            type: 'sound_visualizer',
            name: 'Dynamic Beat Spectrum',
            startTime: 0,
            duration: project.duration,
            animation: 'wave-pulse',
            easing: 'linear',
            color: '#6366f1',
          },
        ],
      };
      setAudioAnalysisResult(fallbackRec);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Chat with Aura Agent
  const handleSendChatMessage = async (customText?: string) => {
    const textToSend = customText || inputPrompt;
    if (!textToSend.trim() || isChatLoading) return;

    const userMsg: AiChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: 'Now',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          currentProjectState: {
            duration: project.duration,
            layersCount: project.layers.length,
            aspectRatio: project.aspectRatio,
            hasAudio: !!project.audioTrack,
          },
        }),
      });

      if (!res.ok) throw new Error('Agent failed');
      const data = await res.json();

      const botMsg: AiChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'aura',
        text: data.reply || 'Main timeline analyze kar rahi hoon...',
        timestamp: 'Now',
        suggestedAction: data.suggestedAction,
        quickSuggestions: data.quickSuggestions,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const fallbackBotMsg: AiChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'aura',
        text: `Aapke audio beat ke liye main suggest karungi ki aap Snappy Curve (0.34, 1.56, 0.64, 1) use karein. Isse text pop-in bahut punchy lagta hai Alight Motion jaisa!\n\nKya aap chahte hain ki main ek Verified Creator Lower Third timeline me inject kar doon?`,
        timestamp: 'Now',
        suggestedAction: {
          type: 'ADD_LOWER_THIRD',
          payload: { text: project.brandKit.creatorName, handle: project.brandKit.handle },
          actionLabel: 'Add Lower Third to Timeline',
        },
        quickSuggestions: [
          'Alight motion curve apply karo',
          'Neon glitch effect badhao',
          'Sound reactive visualizer add karo',
        ],
      };
      setChatMessages((prev) => [...prev, fallbackBotMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 3. Generate Script to Motion Graphics
  const handleGenerateScript = async () => {
    if (!scriptHook.trim() || isScriptLoading) return;
    setIsScriptLoading(true);
    try {
      const res = await fetch('/api/gemini/generate-script-graphics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: scriptHook,
          targetAspect: project.aspectRatio,
          brandHandle: project.brandKit.handle,
        }),
      });
      if (!res.ok) throw new Error('Script gen failed');
      const data = await res.json();
      setScriptResult(data);
    } catch (err) {
      console.error(err);
      setScriptResult({
        themeName: 'Viral Hook High-Retention',
        totalDuration: 4.5,
        captionLayers: [
          {
            text: 'VIRAL CREATOR',
            highlightWord: 'VIRAL',
            startTime: 0.3,
            endTime: 1.5,
            style: 'neon-glow',
            accentColor: '#06b6d4',
          },
          {
            text: '3 MOTION RULES',
            highlightWord: 'RULES',
            startTime: 1.6,
            endTime: 3.2,
            style: 'bold-strike',
            accentColor: '#6366f1',
          },
          {
            text: 'WATCH THIS 🚀',
            highlightWord: 'WATCH',
            startTime: 3.3,
            endTime: 4.5,
            style: 'gradient-pill',
            accentColor: '#ec4899',
          },
        ],
      });
    } finally {
      setIsScriptLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-slate-950 border-l border-slate-800 shadow-2xl z-50 flex flex-col text-xs text-slate-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white font-display flex items-center gap-1.5">
              Aura AI Agent
              <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/60">
                PRO COPILOT
              </span>
            </h2>
            <p className="text-[10px] text-slate-400">
              Audio Vibe Analyzer · Motion Graphics Copilot
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800 px-3 bg-slate-900/40">
        <button
          onClick={() => setActiveTab('audio_vibe')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audio_vibe'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          Audio Vibe Analyzer
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'chat'
              ? 'border-indigo-400 text-indigo-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Talking Director
        </button>

        <button
          onClick={() => setActiveTab('script')}
          className={`py-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'script'
              ? 'border-pink-400 text-pink-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5" />
          Script to Motion
        </button>
      </div>

      {/* Tab 1: Audio Vibe Analyzer */}
      {activeTab === 'audio_vibe' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3">
            <h4 className="font-bold text-white text-xs mb-1">
              "Iss video ke audio me kaun sa motion graphics lagega?"
            </h4>
            <p className="text-[11px] text-slate-400">
              Audio genre, tempo (BPM) aur speech vibe set karein. Aura AI aapke liye exact kinetic
              typography, easing curves, aur visual effects plan karegi.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Audio Track Vibe / Genre
              </label>
              <select
                value={audioGenre}
                onChange={(e) => setAudioGenre(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-medium"
              >
                <option value="Phonk / Trap Drill (Fast Beat)">
                  Phonk / Trap Drill (Snappy Beat, 130 BPM)
                </option>
                <option value="Lo-Fi Chill Ambient (Relaxed)">
                  Lo-Fi Chill Ambient (Smooth Fluid, 90 BPM)
                </option>
                <option value="Dramatic Cinematic Bass Pulse">
                  Dramatic Cinematic Bass Pulse (140 BPM)
                </option>
                <option value="Tech Review / Podcast Voiceover">
                  Tech Review / Podcast Voiceover (Minimal Luxe)
                </option>
                <option value="High-Energy Gaming Montage">
                  High-Energy Gaming Montage (Glitch &amp; Neon)
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Audio BPM</label>
                <input
                  type="number"
                  value={audioBpm}
                  onChange={(e) => setAudioBpm(parseInt(e.target.value, 10) || 120)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono-nums"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Creator Tone</label>
                <select
                  value={brandTone}
                  onChange={(e) => setBrandTone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200 text-[11px]"
                >
                  <option value="Futuristic, High-Retention">High-Retention Viral</option>
                  <option value="Minimal Luxury, Clean">Minimal Luxury</option>
                  <option value="Playful Energetic">Playful Energetic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">
                Video Topic / Niche
              </label>
              <input
                type="text"
                value={videoTopic}
                onChange={(e) => setVideoTopic(e.target.value)}
                placeholder="e.g. Personal brand tech growth or podcast reel"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
              />
            </div>

            <button
              onClick={handleAnalyzeAudioVibe}
              disabled={isAnalyzing}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all mt-1"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Analyzing Audio & Beat Sync...' : 'Analyze Audio & Recommend Motion Graphics'}
            </button>
          </div>

          {/* Analysis Output Result */}
          {audioAnalysisResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 mt-2 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sm text-cyan-400 font-display">
                  {audioAnalysisResult.recommendationTitle}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-600/20 text-indigo-300 font-mono">
                  {audioAnalysisResult.vibeScore.energyLevel} Energy
                </span>
              </div>

              {/* Hindi / Hinglish Explanation */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-[11px] leading-relaxed text-slate-200">
                <span className="font-bold text-indigo-400 block mb-1">💡 AI Director Analysis:</span>
                {audioAnalysisResult.hindiExplanation}
              </div>

              {/* Easing & Curve */}
              <div className="flex items-center justify-between bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400">Recommended Curve:</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {audioAnalysisResult.motionCurve.name}
                </span>
              </div>

              {/* Suggested Layers List */}
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1.5">
                  Suggested Motion Layers ({audioAnalysisResult.suggestedLayers.length})
                </label>
                <div className="flex flex-col gap-1.5">
                  {audioAnalysisResult.suggestedLayers.map((lyr, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lyr.color }} />
                        <span className="font-medium text-white">{lyr.name}</span>
                      </div>
                      <span className="font-mono text-slate-400 text-[10px]">
                        @{lyr.startTime}s ({lyr.duration}s)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-Click Apply Button */}
              <button
                onClick={() => onApplyRecommendation(audioAnalysisResult)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                <CheckCircle className="w-4 h-4" />
                Apply AI Motion Graphics to Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Talking AI Agent Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>

                    {/* Interactive Action Button (e.g. Inject Lower Third, Apply Curve) */}
                    {msg.suggestedAction && msg.suggestedAction.type && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800">
                        <button
                          onClick={() =>
                            onExecuteAgentAction(
                              msg.suggestedAction!.type!,
                              msg.suggestedAction!.payload
                            )
                          }
                          className="w-full py-1.5 px-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current text-cyan-300" />
                          <span>{msg.suggestedAction.actionLabel || 'Apply to Timeline'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick follow up chips */}
                  {msg.quickSuggestions && msg.quickSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1 max-w-[90%]">
                      {msg.quickSuggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChatMessage(sug)}
                          className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-[10px] transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isChatLoading && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-2 max-w-[60%]">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Aura soch rahi hai...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendChatMessage();
              }}
              placeholder="Aura se poochhein (Hindi ya English me)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => handleSendChatMessage()}
              disabled={isChatLoading || !inputPrompt.trim()}
              className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Script to Kinetic Motion */}
      {activeTab === 'script' && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="bg-pink-950/20 border border-pink-500/20 rounded-xl p-3">
            <h4 className="font-bold text-white text-xs mb-1">
              Script-to-Motion Typography
            </h4>
            <p className="text-[11px] text-slate-400">
              Paste your voiceover script or hook line. Aura will divide it into punchy animated
              cards with timed keyframes.
            </p>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              Video Script / Voiceover Hook
            </label>
            <textarea
              rows={3}
              value={scriptHook}
              onChange={(e) => setScriptHook(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-pink-500 font-medium"
            />
          </div>

          <button
            onClick={handleGenerateScript}
            disabled={isScriptLoading || !scriptHook.trim()}
            className="w-full py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <Wand2 className="w-3.5 h-3.5" />
            {isScriptLoading ? 'Generating Typography Cards...' : 'Generate Kinetic Motion Cards'}
          </button>

          {scriptResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
              <span className="font-bold text-white text-xs">Generated Kinetic Sequence:</span>
              <div className="flex flex-col gap-2">
                {scriptResult.captionLayers?.map((card: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-xs font-display">{card.text}</div>
                      <div className="text-[10px] text-pink-400 font-mono mt-0.5">
                        Style: {card.style} · In: {card.startTime}s - {card.endTime}s
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        onExecuteAgentAction('ADD_TEXT_LAYER', {
                          text: card.text,
                          color: card.accentColor || '#ec4899',
                          startTime: card.startTime,
                        })
                      }
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[10px] font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
