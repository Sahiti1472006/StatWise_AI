import React from 'react';
import { FileSpreadsheet, Sparkles, Download, UploadCloud } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenReport: () => void;
  onOpenMetaStatus: () => void;
  isMetaLive: boolean;
  hasDataset: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenReport,
  onOpenMetaStatus,
  isMetaLive,
  hasDataset,
}) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('overview');
        }}
        className="text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0"
      >
        StatWise AI
      </a>

      {/* Zone 2: 4-5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('overview')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'overview' ? 'text-indigo-400 border-indigo-400' : 'border-transparent text-slate-400'
          }`}
        >
          Dataset Overview
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'stats' ? 'text-indigo-400 border-indigo-400' : 'border-transparent text-slate-400'
          }`}
        >
          Descriptive Statistics
        </button>
        <button
          onClick={() => setActiveTab('correlation')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'correlation' ? 'text-indigo-400 border-indigo-400' : 'border-transparent text-slate-400'
          }`}
        >
          Correlation Matrix
        </button>
        <button
          onClick={() => setActiveTab('regression')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'regression' ? 'text-indigo-400 border-indigo-400' : 'border-transparent text-slate-400'
          }`}
        >
          Regression Studio
        </button>
        <button
          onClick={() => setActiveTab('visualizations')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
            activeTab === 'visualizations' ? 'text-indigo-400 border-indigo-400' : 'border-transparent text-slate-400'
          }`}
        >
          Visualizations
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 flex items-center gap-1.5 ${
            activeTab === 'chat' ? 'text-indigo-400 border-indigo-400' : 'border-transparent text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Muse Spark Chat</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenMetaStatus}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors whitespace-nowrap shrink-0"
          title="Meta Muse Spark Model Status"
        >
          <span className={`w-2 h-2 rounded-full ${isMetaLive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          <span>{isMetaLive ? 'Muse Spark 1.3 (Live)' : 'Muse Spark 1.3 (Demo)'}</span>
        </button>

        {hasDataset ? (
          <button
            onClick={onOpenReport}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        ) : (
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Dataset</span>
          </button>
        )}
      </div>
    </header>
  );
};
