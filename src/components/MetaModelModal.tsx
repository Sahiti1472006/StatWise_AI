import React from 'react';
import { X, Cpu, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface MetaModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMetaLive: boolean;
}

export const MetaModelModal: React.FC<MetaModelModalProps> = ({
  isOpen,
  onClose,
  isMetaLive,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Meta Model API Architecture
              </h3>
              <p className="text-2xs text-slate-400">
                Official Meta Muse Spark series integration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Badge */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isMetaLive
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800 text-amber-200'
          }`}>
            {isMetaLive ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-sm mb-0.5">
                {isMetaLive
                  ? 'Live Meta Model API Connected (muse-spark-1.3)'
                  : 'Meta Muse Spark 1.3 · Demo Mode (No Key Detected)'}
              </div>
              <p className="text-2xs opacity-90 leading-relaxed">
                {isMetaLive
                  ? 'Authenticated requests are dispatched live to https://api.meta.ai/v1/chat/completions using the backend MODEL_API_KEY and the OpenAI-compatible SDK.'
                  : 'No valid MODEL_API_KEY is currently detected in backend environment variables. StatWise AI operates in a clearly marked Demo Mode, performing dataset-grounded statistical calculations without pretending an unauthenticated connection exists.'}
              </p>
            </div>
          </div>

          {/* Official Meta Model API Configuration Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Official Meta Model API Specification
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono text-2xs">
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-slate-500 block text-3xs uppercase">Base URL</span>
                <span className="text-indigo-300">https://api.meta.ai/v1</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-slate-500 block text-3xs uppercase">Model ID</span>
                <span className="text-indigo-300">muse-spark-1.3</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-slate-500 block text-3xs uppercase">Chat Endpoint</span>
                <span className="text-indigo-300">/chat/completions</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-slate-500 block text-3xs uppercase">Environment Variable</span>
                <span className="text-indigo-300">MODEL_API_KEY</span>
              </div>
            </div>
          </div>

          {/* Security & Backend Isolation */}
          <div className="p-3.5 rounded-lg bg-slate-850 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Backend-Only Key Isolation (Zero Client Leaks)</span>
            </div>
            <p className="text-2xs text-slate-400 leading-relaxed">
              The <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">MODEL_API_KEY</code> is kept exclusively on the Node.js Express backend server (<code className="text-slate-300">server.ts</code>). Frontend React code only interacts with the local server route <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">/api/chat</code>.
            </p>
          </div>

          {/* Setup Instructions */}
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-2xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-white">How to connect Live Meta Model API:</span> Configure <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">MODEL_API_KEY="your_meta_key"</code> in your server environment or <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded">.env</code> file. Upon restart, the OpenAI-compatible SDK initializes and switches StatWise AI to Live Mode.
          </div>
        </div>

        <div className="p-4 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
