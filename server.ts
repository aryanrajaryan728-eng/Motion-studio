import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasKey: !!process.env.GEMINI_API_KEY });
});

/**
 * 1. AI Audio & Vibe Motion Graphics Analyzer
 * Analyzes audio tempo, speech sentiment, background music genre, and timing
 * to recommend exact kinetic typography, motion graphics banners, easing curves, and visual effects.
 */
app.post('/api/gemini/analyze-audio-vibe', async (req, res) => {
  try {
    const { audioVibe, audioBpm, transcript, videoTopic, brandTone, duration } = req.body;

    const prompt = `You are "Aura", an elite Alight Motion & After Effects Motion Graphics Director and AI Video Editor.
A creator is editing a video and asking for motion graphics and visual styling tailored to their audio and vibe.

Video Information:
- Audio Vibe / Music Style: ${audioVibe || 'Energetic Bass & Snappy Beats'}
- Audio BPM: ${audioBpm || 128}
- Transcript / Speech Hook: ${transcript || 'None provided'}
- Video Topic / Niche: ${videoTopic || 'Personal Brand & Tech Content'}
- Brand Tone: ${brandTone || 'Futuristic, High-Retention, Professional'}
- Clip Duration: ${duration || 5} seconds

Please provide an in-depth, professional motion graphics blueprint tailored to this audio.
Return ONLY valid JSON matching this structure:
{
  "recommendationTitle": "string (Punchy title of recommended style)",
  "hindiExplanation": "string (A friendly, clear 2-3 sentence explanation in conversational Hindi/Hinglish explaining why this motion graphic fits this audio beat and vibe)",
  "englishSummary": "string (Brief English overview for professional context)",
  "vibeScore": {
    "energyLevel": "High" | "Medium" | "Chill" | "Cinematic",
    "pacing": "Fast Cuts" | "Smooth Fluid" | "Rhythmic Punch",
    "recommendedBpmSync": number
  },
  "motionCurve": {
    "name": "string (e.g. Punchy Overshoot, Smooth Exponential, Snappy Elastic)",
    "bezier": "string (e.g. cubic-bezier(0.18, 0.89, 0.32, 1.28) or spring)",
    "stiffness": number (100 to 400),
    "damping": number (10 to 40)
  },
  "recommendedColorPalette": {
    "primary": "string (hex, e.g. #6366f1)",
    "accent": "string (hex, e.g. #06b6d4)",
    "glow": "string (hex, e.g. #38bdf8)",
    "background": "string (hex, e.g. #090a15)"
  },
  "vfxSettings": {
    "glow": number (0 to 100),
    "glitch": number (0 to 100),
    "rgbSplit": number (0 to 100),
    "cameraShake": number (0 to 100),
    "motionBlur": boolean
  },
  "suggestedLayers": [
    {
      "type": "text" | "banner" | "shape" | "visualizer" | "lower_third",
      "name": "string",
      "startTime": number,
      "duration": number,
      "text": "string (if text or banner)",
      "animation": "pop-in" | "elastic-slide" | "kinetic-glitch" | "wave-pulse" | "brand-badge-reveal",
      "easing": "string",
      "color": "string (hex)"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    const parsed = JSON.parse(responseText);
    res.json(parsed);
  } catch (error: any) {
    console.error('Audio vibe analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze audio vibe',
      details: error?.message || String(error),
    });
  }
});

/**
 * 2. Script to Kinetic Motion Graphics Generator
 * Turns a short script or hook into animated keyframe layers
 */
app.post('/api/gemini/generate-script-graphics', async (req, res) => {
  try {
    const { script, targetAspect, brandHandle } = req.body;

    const prompt = `You are an expert Kinetic Typography & Motion Graphics designer specializing in Alight Motion reels and viral hooks.
Turn this script into a sequence of high-impact kinetic typography motion graphic cards and banners:
Script: "${script}"
Target Aspect Ratio: ${targetAspect || '9:16'}
Creator Brand Handle: "${brandHandle || '@creator'}"

Break down the words into punchy 1-3 word animated cards synced to speech cadence.
Return ONLY valid JSON with this format:
{
  "themeName": "string",
  "totalDuration": number,
  "captionLayers": [
    {
      "text": "string",
      "highlightWord": "string",
      "startTime": number,
      "endTime": number,
      "style": "neon-glow" | "bold-strike" | "gradient-pill" | "cyber-cut" | "minimal-clean",
      "animationIn": "scale-bounce" | "slide-up" | "rotate-snap" | "letter-reveal",
      "accentColor": "string (hex)"
    }
  ],
  "soundEffectSuggestion": "string (e.g. Whoosh, Bass Drop, Camera Shutter, Pop)"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Script graphics error:', error);
    res.status(500).json({
      error: 'Failed to generate script graphics',
      details: error?.message || String(error),
    });
  }
});

/**
 * 3. AI Motion Agent Chat
 * Natural conversation in Hindi/Hinglish/English.
 * Supports asking questions about what motion graphic to add, how to make keyframe curves,
 * personal branding advice, and returns executable actions for the editor!
 */
app.post('/api/gemini/chat-agent', async (req, res) => {
  try {
    const { message, history, currentProjectState } = req.body;

    const systemInstruction = `You are "Aura", the resident AI Motion Graphics & Video Director in the AlightStudio app.
You speak fluent Hindi, Hinglish, and English in a motivating, expert creative tone.
The user wants to edit videos, create Alight Motion-grade motion graphics (keyframes, curves, shapes, visual effects), and build their personal brand without needing any other external app.

When the user asks questions like:
- "Iss audio me kaun sa motion graphics lagega?"
- "Mujhe animated lower third ya subscribe banner banana hai"
- "Speed ramp aur keyframe curves kaise set karun?"
- "Personal brand look kaisa hona chahiye?"

Give direct, helpful advice with clear creative direction.
If your recommendation can be directly applied to their timeline as a layer or preset, provide an "action" field in your JSON output.

Always return a JSON object with this exact shape:
{
  "reply": "string (Your rich, helpful conversational answer in Hindi/Hinglish or English matching the user's language preference. Use formatting and clear advice)",
  "suggestedAction": {
    "type": "ADD_MOTION_BANNER" | "ADD_LOWER_THIRD" | "APPLY_CURVE" | "ADD_AUDIO_WAVE" | "ADD_TEXT_LAYER" | "SET_COLOR_GRADE" | null,
    "payload": object or null,
    "actionLabel": "string (e.g. 'Timeline me Add Karein' or 'Apply 120fps Curve')"
  },
  "quickSuggestions": ["string (short follow-up question or idea)", "string", "string"]
}`;

    const userPrompt = `
User Question/Message: "${message}"
Current Project Context:
- Current Duration: ${currentProjectState?.duration || 10}s
- Current Playhead: ${currentProjectState?.currentTime || 0}s
- Existing Layers Count: ${currentProjectState?.layersCount || 0}
- Current Aspect Ratio: ${currentProjectState?.aspectRatio || '9:16'}
- Audio Track Present: ${currentProjectState?.hasAudio ? 'Yes' : 'No'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Chat agent error:', error);
    res.status(500).json({
      error: 'Failed to process chat with AI agent',
      details: error?.message || String(error),
    });
  }
});

/**
 * 4. AI Easing & Curve Recommender
 */
app.post('/api/gemini/suggest-easing', async (req, res) => {
  try {
    const { animationGoal, currentLayerType } = req.body;
    const prompt = `Recommend the perfect animation easing curve for: "${animationGoal || 'Punchy energetic pop'}" applied to a ${currentLayerType || 'text'} layer in Alight Motion style.
Return JSON:
{
  "name": "string",
  "bezierString": "string (e.g. cubic-bezier(0.34, 1.56, 0.64, 1))",
  "controlPoints": {
    "x1": number, "y1": number, "x2": number, "y2": number
  },
  "hindiTip": "string (1 line tip in Hindi)",
  "category": "Punchy" | "Smooth" | "Elastic" | "Dramatic"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AlightStudio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
