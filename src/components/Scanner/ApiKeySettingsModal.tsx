import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<{
    hasGeminiKey: boolean;
    hasOpenaiKey: boolean;
    activeProvider: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current server key status
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/vision-status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setMessage(null);
      setApiKey('');
    }
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/save-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setMessage({ type: 'success', text: `Successfully saved ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key!` });
        setApiKey('');
        await fetchStatus();
        if (onKeySaved) onKeySaved();
      } else {
        setMessage({ type: 'error', text: json.error || 'Failed to save API key.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error saving API key.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#222d3d] border border-slate-700/60 rounded-xl shadow-2xl p-5 text-slate-200 font-sans space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2 font-mono">
            <Key className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-sm text-white">AI Vision Configuration</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status */}
        <div className="p-3 rounded bg-[#1a2535] border border-slate-700/60 text-xs font-mono space-y-1.5">
          <div className="text-slate-400 font-semibold flex items-center justify-between">
            <span>Server Key Status:</span>
            <span className="text-[10px] text-slate-500">Stored in .env</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  status?.hasGeminiKey ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
              <span className={status?.hasGeminiKey ? 'text-emerald-300' : 'text-slate-400'}>
                Google Gemini: {status?.hasGeminiKey ? 'Configured' : 'Not Set'}
              </span>
            </span>

            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  status?.hasOpenaiKey ? 'bg-emerald-400' : 'bg-slate-600'
                }`}
              />
              <span className={status?.hasOpenaiKey ? 'text-emerald-300' : 'text-slate-400'}>
                OpenAI: {status?.hasOpenaiKey ? 'Configured' : 'Not Set'}
              </span>
            </span>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded border text-xs font-mono flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/40 border-rose-800 text-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-mono font-semibold mb-1">
              Select Provider:
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-2.5 rounded border text-left transition-colors ${
                  provider === 'gemini'
                    ? 'bg-indigo-950/70 border-indigo-600 text-indigo-200 font-semibold'
                    : 'bg-[#1a2535] border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>Google Gemini</div>
                <div className="text-[10px] text-slate-500 font-sans">Free tier available (Recommended)</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`p-2.5 rounded border text-left transition-colors ${
                  provider === 'openai'
                    ? 'bg-indigo-950/70 border-indigo-600 text-indigo-200 font-semibold'
                    : 'bg-[#1a2535] border-slate-700/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>OpenAI GPT-4o</div>
                <div className="text-[10px] text-slate-500 font-sans">OpenAI API Key</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-mono font-semibold mb-1">
              {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}:
            </label>
            <input
              type="password"
              placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full bg-[#1a2535] border border-slate-700 rounded px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="p-3 rounded bg-[#1a2535] border border-slate-700/60/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Your key is saved directly to your local <code className="text-slate-200">.env</code> file on the backend server. It is never exposed in client JavaScript code.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href={provider === 'gemini' ? 'https://aistudio.google.com/app/apikey' : 'https://platform.openai.com/api-keys'}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px] font-mono"
            >
              <span>Get {provider === 'gemini' ? 'Gemini' : 'OpenAI'} Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !apiKey.trim()}
                className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white font-mono text-xs font-semibold"
              >
                {loading ? 'Saving...' : 'Save Key'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

