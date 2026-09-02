import React, { useState } from 'react';
import { X, Settings, Key, Cpu, Volume2, CheckCircle2, Shield, Sparkles } from 'lucide-react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  apiKey, 
  onSaveApiKey, 
  provider, 
  onSaveProvider 
}) {
  const [tempKey, setTempKey] = useState(apiKey || '');
  const [tempProvider, setTempProvider] = useState(provider || 'builtin');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(tempKey);
    onSaveProvider(tempProvider);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/15 p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Outfit']">WeatherGPT Platform Settings</h3>
              <p className="text-xs text-slate-400">Model Inference & Meteorological Connectors</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Engine Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Reasoning & Meteorological Model Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTempProvider('builtin')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  tempProvider === 'builtin'
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Autonomous Engine
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Zero latency, built-in WMO physics heuristics & sector rules
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTempProvider('gemini')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  tempProvider === 'gemini'
                    ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-purple-400" />
                  Google Gemini 1.5
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  External LLM reasoning (requires Gemini API Key)
                </div>
              </button>
            </div>
          </div>

          {/* Gemini API Key */}
          {tempProvider === 'gemini' && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                Google Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 focus:border-purple-500/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
              />
              <p className="text-[10px] text-slate-400">
                Your API key is stored locally in browser session and never sent to third parties.
              </p>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
