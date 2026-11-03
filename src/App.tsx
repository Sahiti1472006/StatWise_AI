/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  BarChart3,
  GitBranch,
  TrendingUp,
  LineChart,
  MessageSquare,
  Download,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Layers,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Header } from './components/Header';
import { DatasetUpload } from './components/DatasetUpload';
import { DatasetOverview } from './components/DatasetOverview';
import { DescriptiveStatsTable } from './components/DescriptiveStatsTable';
import { CorrelationView } from './components/CorrelationView';
import { RegressionStudio } from './components/RegressionStudio';
import { VisualizationLab } from './components/VisualizationLab';
import { DatasetChat } from './components/DatasetChat';
import { ReportModal } from './components/ReportModal';
import { MetaModelModal } from './components/MetaModelModal';
import { ParsedDataset, processRawRows } from './utils/dataParser';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { RegressionResult } from './utils/statistics';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dataset, setDataset] = useState<ParsedDataset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isMetaLive, setIsMetaLive] = useState<boolean>(false);

  // Cross-tab interaction states
  const [regressionVarX, setRegressionVarX] = useState<string | undefined>(undefined);
  const [regressionVarY, setRegressionVarY] = useState<string | undefined>(undefined);
  const [visualColumn, setVisualColumn] = useState<string | undefined>(undefined);
  const [chatPresetQuestion, setChatPresetQuestion] = useState<string | undefined>(undefined);

  // Initialize with the first sample dataset so user immediately has live data to interact with
  useEffect(() => {
    try {
      const defaultSample = SAMPLE_DATASETS[0];
      const parsed = processRawRows(defaultSample.name + '.csv', defaultSample.data);
      setDataset(parsed);
    } catch (e) {
      console.error('Failed to initialize default sample dataset:', e);
    }

    // Check Meta Model API Status from backend
    fetch('/api/model/status')
      .then((res) => res.json())
      .then((data) => {
        setIsMetaLive(Boolean(data.isLive));
      })
      .catch((err) => {
        console.warn('Backend status check error, defaulting to demo mode:', err);
        setIsMetaLive(false);
      });
  }, []);

  // Handler when correlation cell is clicked to fit regression
  const handleLaunchRegressionFromCorrelation = (varX: string, varY: string) => {
    setRegressionVarX(varX);
    setRegressionVarY(varY);
    setActiveTab('regression');
  };

  // Handler when deep-dive column is selected to view distribution
  const handleSelectColumnForVisuals = (columnName: string) => {
    setVisualColumn(columnName);
    setActiveTab('visualizations');
  };

  // Handler to ask Meta Muse Spark about a regression result
  const handleAskMuseAboutRegression = (reg: RegressionResult) => {
    setChatPresetQuestion(
      `Please interpret this OLS regression result: target variable is ${reg.dependentVar}, predictor is ${reg.independentVar}. The fitted equation is ${reg.equation} with R² = ${(reg.rSquared * 100).toFixed(1)}% and standard error = ${reg.standardError.toFixed(4)}. What is the statistical and practical interpretation of this slope?`
    );
    setActiveTab('chat');
  };

  const navItems = [
    { id: 'overview', label: 'Dataset Overview', icon: FileSpreadsheet },
    { id: 'stats', label: 'Descriptive Statistics', icon: BarChart3 },
    { id: 'correlation', label: 'Correlation Matrix', icon: GitBranch },
    { id: 'regression', label: 'Regression Studio', icon: TrendingUp },
    { id: 'visualizations', label: 'Visualization Lab', icon: LineChart },
    { id: 'chat', label: 'Meta Muse Spark Chat', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenMetaStatus={() => setIsMetaModalOpen(true)}
        isMetaLive={isMetaLive}
        hasDataset={Boolean(dataset)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        {/* Workspace Sidebar (Desktop) */}
        <aside className="w-full md:w-64 shrink-0 bg-slate-900/60 border-r border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            {/* Active Dataset Pill Card */}
            {dataset ? (
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                <div className="flex items-center justify-between text-2xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Database className="w-3 h-3 text-indigo-400" />
                    Dataset
                  </span>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Change
                  </button>
                </div>
                <div className="text-xs font-semibold text-white truncate font-mono">
                  {dataset.filename}
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-3xs font-mono text-slate-400">
                  <span>{dataset.rowCount} rows</span>
                  <span aria-hidden="true">·</span>
                  <span>{dataset.columnCount} cols</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-400">
                    {dataset.numericColumns.length} num
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/80 hover:bg-indigo-900/50 text-indigo-300 flex items-center justify-center gap-2 text-xs font-medium transition-colors"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Dataset</span>
              </button>
            )}

            {/* Navigation Links List */}
            <div className="space-y-1">
              <span className="text-3xs uppercase tracking-wider text-slate-500 font-mono px-2 block mb-1">
                Workspace Modules
              </span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Status Card in Sidebar */}
          <div className="pt-4 border-t border-slate-800/80">
            <div
              onClick={() => setIsMetaModalOpen(true)}
              className="group cursor-pointer p-3 rounded-lg bg-slate-850/60 hover:bg-slate-850 border border-slate-800 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-2xs font-mono text-slate-400">AI Model</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isMetaLive ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </div>
              <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                Meta Muse Spark 1.3
              </div>
              <div className="text-3xs text-slate-500 mt-0.5 font-mono">
                {isMetaLive ? 'Live Meta Model API' : 'Demo Mode (No Key)'}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {!dataset ? (
            <DatasetUpload
              onDatasetLoaded={(ds) => {
                setDataset(ds);
                setActiveTab('overview');
              }}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          ) : (
            <>
              {activeTab === 'overview' && (
                <DatasetOverview
                  dataset={dataset}
                  onNavigateTab={setActiveTab}
                  onOpenUploadNew={() => setIsUploadModalOpen(true)}
                />
              )}

              {activeTab === 'stats' && (
                <DescriptiveStatsTable
                  dataset={dataset}
                  onSelectColumnForVisuals={handleSelectColumnForVisuals}
                />
              )}

              {activeTab === 'correlation' && (
                <CorrelationView
                  dataset={dataset}
                  onLaunchRegression={handleLaunchRegressionFromCorrelation}
                />
              )}

              {activeTab === 'regression' && (
                <RegressionStudio
                  dataset={dataset}
                  initialVarX={regressionVarX}
                  initialVarY={regressionVarY}
                  onAskMuseAboutRegression={handleAskMuseAboutRegression}
                />
              )}

              {activeTab === 'visualizations' && (
                <VisualizationLab
                  dataset={dataset}
                  defaultColumn={visualColumn}
                />
              )}

              {activeTab === 'chat' && (
                <DatasetChat
                  dataset={dataset}
                  isMetaLive={isMetaLive}
                  onOpenMetaStatus={() => setIsMetaModalOpen(true)}
                  presetQuestion={chatPresetQuestion}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Upload Dataset Modal (when replacing current dataset) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <DatasetUpload
              onDatasetLoaded={(ds) => {
                setDataset(ds);
                setIsUploadModalOpen(false);
                setActiveTab('overview');
              }}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        </div>
      )}

      {/* Report Modal */}
      {dataset && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          dataset={dataset}
          isMetaLive={isMetaLive}
        />
      )}

      {/* Meta Model Status Modal */}
      <MetaModelModal
        isOpen={isMetaModalOpen}
        onClose={() => setIsMetaModalOpen(false)}
        isMetaLive={isMetaLive}
      />
    </div>
  );
}
