import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  Activity,
  Sliders,
  Download,
  Grid,
  Filter,
  CheckCircle2,
  Info,
  Layers,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { ParsedDataset } from '../utils/dataParser';
import {
  calculateDescriptiveStats,
  calculateHistogramBins,
  calculateCategoricalStats,
  calculateLinearRegression,
  calculateCorrelationMatrix,
  calculateQQPlotPoints,
  calculateKernelDensity,
  calculateCategoryAggregation,
  HistogramBin,
} from '../utils/statistics';

interface VisualizationLabProps {
  dataset: ParsedDataset;
  defaultColumn?: string;
}

type GalleryCategory = 'all' | 'distributions' | 'relationships' | 'categorical' | 'sequential';
type CustomChartType =
  | 'histogram'
  | 'boxplot'
  | 'violin'
  | 'qqplot'
  | 'scatter'
  | 'heatmap'
  | 'pairplot'
  | 'residual'
  | 'bar'
  | 'countplot'
  | 'pie'
  | 'donut'
  | 'line'
  | 'area';

export const VisualizationLab: React.FC<VisualizationLabProps> = ({
  dataset,
  defaultColumn,
}) => {
  const numCols = dataset.numericColumns;
  const catCols = dataset.categoricalColumns;

  // View state: 'grid' (All applicable charts) or 'studio' (single customizable chart)
  const [viewMode, setViewMode] = useState<'grid' | 'studio'>('grid');
  const [galleryFilter, setGalleryFilter] = useState<GalleryCategory>('all');

  // Studio customization states
  const [customChartType, setCustomChartType] = useState<CustomChartType>('histogram');
  const [selectedColX, setSelectedColX] = useState<string>(
    defaultColumn && numCols.includes(defaultColumn) ? defaultColumn : numCols[0] || ''
  );
  const [selectedColY, setSelectedColY] = useState<string>(
    numCols[1] || numCols[0] || ''
  );
  const [selectedCatCol, setSelectedCatCol] = useState<string>(catCols[0] || '');
  const [customBinCount, setCustomBinCount] = useState<number>(10);

  // SVG download helper
  const downloadSvg = (svgId: string, filename: string) => {
    const svgElem = document.getElementById(svgId);
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statwise_${filename.toLowerCase().replace(/[^a-z0-9]/g, '_')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Precomputed datasets for visualizations
  const primaryNumeric = numCols[0] || '';
  const secondaryNumeric = numCols[1] || numCols[0] || '';
  const primaryCat = catCols[0] || '';

  // 1. Histogram & KDE
  const histData = useMemo(() => {
    if (!primaryNumeric) return null;
    const vals = dataset.rows.map(r => Number(r[primaryNumeric])).filter(v => !isNaN(v));
    const bins = calculateHistogramBins(vals, 10);
    const kde = calculateKernelDensity(vals, 25);
    const stats = calculateDescriptiveStats(vals);
    return { bins, kde, stats, vals };
  }, [dataset.rows, primaryNumeric]);

  // 2. Box & Whisker
  const boxData = useMemo(() => {
    if (!primaryNumeric) return null;
    const vals = dataset.rows.map(r => r[primaryNumeric]);
    return calculateDescriptiveStats(vals);
  }, [dataset.rows, primaryNumeric]);

  // 3. Violin Plot
  const violinData = useMemo(() => {
    if (!primaryNumeric) return null;
    const vals = dataset.rows.map(r => Number(r[primaryNumeric])).filter(v => !isNaN(v));
    const kde = calculateKernelDensity(vals, 30);
    const stats = calculateDescriptiveStats(vals);
    return { kde, stats };
  }, [dataset.rows, primaryNumeric]);

  // 4. Q-Q Plot
  const qqData = useMemo(() => {
    if (!primaryNumeric) return [];
    const vals = dataset.rows.map(r => Number(r[primaryNumeric])).filter(v => !isNaN(v));
    return calculateQQPlotPoints(vals);
  }, [dataset.rows, primaryNumeric]);

  // 5. Scatter Plot & Residual Plot
  const scatterRegression = useMemo(() => {
    if (numCols.length < 2 || !primaryNumeric || !secondaryNumeric || primaryNumeric === secondaryNumeric) return null;
    return calculateLinearRegression(dataset.rows, primaryNumeric, secondaryNumeric);
  }, [dataset.rows, numCols, primaryNumeric, secondaryNumeric]);

  // 6. Correlation Matrix
  const corrMatrix = useMemo(() => {
    if (numCols.length < 2) return null;
    return calculateCorrelationMatrix(dataset.rows, numCols.slice(0, 5));
  }, [dataset.rows, numCols]);

  // 7. Categorical Count & Breakdown
  const catFrequencyData = useMemo(() => {
    if (!primaryCat) return null;
    const vals = dataset.rows.map(r => r[primaryCat]);
    return calculateCategoricalStats(vals);
  }, [dataset.rows, primaryCat]);

  // 8. Grouped Bar Aggregation (Category vs Numeric Mean)
  const groupedBarData = useMemo(() => {
    if (!primaryCat || !primaryNumeric) return [];
    return calculateCategoryAggregation(dataset.rows, primaryCat, primaryNumeric);
  }, [dataset.rows, primaryCat, primaryNumeric]);

  // 9. Pair Plot Data (Top 3 variables)
  const pairPlotCols = useMemo(() => numCols.slice(0, 3), [numCols]);

  // SVG palette constants
  const palette = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#38bdf8', '#8b5cf6', '#14b8a6', '#f43f5e'];

  return (
    <div className="space-y-6">
      {/* Visual Lab Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xs font-mono text-indigo-400">Automated Visualization Engine</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-2xs text-slate-400 font-mono">{numCols.length} Numeric · {catCols.length} Categorical</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Visualization Lab & Empirical Diagnostics
          </h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Multi-Chart Grid</span>
            </button>
            <button
              onClick={() => setViewMode('studio')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'studio' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: MULTI-CHART GALLERY GRID */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {/* Gallery Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-2xs font-mono text-slate-500 uppercase mr-1">Filter Charts:</span>
            {[
              { id: 'all', label: 'All Applicable Charts' },
              { id: 'distributions', label: 'Distributions (Hist, Box, Violin, Q-Q)' },
              { id: 'relationships', label: 'Relationships (Scatter, Heatmap, Pair, Residual)' },
              { id: 'categorical', label: 'Categorical & Composition (Bar, Count, Pie, Donut)' },
              { id: 'sequential', label: 'Sequential & Trends (Line, Area)' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setGalleryFilter(cat.id as GalleryCategory)}
                className={`px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  galleryFilter === cat.id
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-700'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid Layout of Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CHART 1: HISTOGRAM WITH KDE OVERLAY */}
            {(galleryFilter === 'all' || galleryFilter === 'distributions') && histData && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Frequency Histogram & KDE Density</h3>
                    <p className="text-2xs text-slate-400">Feature: <span className="font-mono text-indigo-300">{primaryNumeric}</span></p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-hist-kde', `histogram_${primaryNumeric}`)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const bins = histData.bins;
                    const maxBin = Math.max(...bins.map(b => b.count), 1);
                    const w = 460;
                    const h = 220;
                    const pad = { top: 20, right: 20, bottom: 35, left: 45 };
                    const innerW = w - pad.left - pad.right;
                    const innerH = h - pad.top - pad.bottom;
                    const binW = innerW / bins.length;

                    // KDE spline points
                    const kdeMax = Math.max(...histData.kde.map(k => k.density), 0.001);
                    const minX = bins[0].binStart;
                    const maxX = bins[bins.length - 1].binEnd;
                    const kdePts = histData.kde.map(k => {
                      const x = pad.left + ((k.x - minX) / (maxX - minX || 1)) * innerW;
                      const y = pad.top + innerH - (k.density / kdeMax) * innerH;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <svg id="svg-hist-kde" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg h-auto">
                        {/* Grid lines */}
                        {[0, 0.5, 1].map((pct, idx) => (
                          <line
                            key={idx}
                            x1={pad.left}
                            y1={pad.top + innerH * pct}
                            x2={pad.left + innerW}
                            y2={pad.top + innerH * pct}
                            stroke="#1e293b"
                            strokeDasharray="3,3"
                          />
                        ))}

                        {/* Bars */}
                        {bins.map((b, idx) => {
                          const barH = (b.count / maxBin) * innerH;
                          const x = pad.left + idx * binW;
                          const y = pad.top + innerH - barH;
                          return (
                            <g key={idx} className="group">
                              <rect
                                x={x + 2}
                                y={y}
                                width={Math.max(2, binW - 4)}
                                height={barH}
                                className="fill-indigo-600/80 hover:fill-indigo-500 transition-colors"
                                rx="2"
                              />
                              <text
                                x={x + binW / 2}
                                y={pad.top + innerH + 16}
                                textAnchor="middle"
                                className="fill-slate-500 text-3xs font-mono"
                              >
                                {b.binStart.toFixed(0)}
                              </text>
                            </g>
                          );
                        })}

                        {/* KDE Overlay Line */}
                        <polyline
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          points={kdePts}
                        />

                        {/* Y-axis labels */}
                        <text x={pad.left - 6} y={pad.top + 10} textAnchor="end" className="fill-slate-500 text-3xs font-mono">
                          {maxBin}
                        </text>
                        <text x={pad.left - 6} y={pad.top + innerH} textAnchor="end" className="fill-slate-500 text-3xs font-mono">
                          0
                        </text>
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed">
                  <strong>Interpretation:</strong> Displays sample frequency partitions combined with Gaussian Kernel Density Estimation (KDE in cyan). Shows modal concentration and tail weight of <span className="font-mono text-slate-300">{primaryNumeric}</span>.
                </div>
              </div>
            )}

            {/* CHART 2: BOX & WHISKER PLOT */}
            {(galleryFilter === 'all' || galleryFilter === 'distributions') && boxData && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Box & Whisker (Tukey 5-Number Summary)</h3>
                    <p className="text-2xs text-slate-400">Feature: <span className="font-mono text-indigo-300">{primaryNumeric}</span></p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-box-plot', `boxplot_${primaryNumeric}`)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const s = boxData;
                    const w = 460;
                    const h = 220;
                    const pad = { top: 25, right: 30, bottom: 45, left: 30 };
                    const innerW = w - pad.left - pad.right;
                    const min = s.min;
                    const max = s.max;
                    const span = max - min || 1;
                    const scale = (v: number) => pad.left + ((v - min) / span) * innerW;

                    const q1X = scale(s.q1);
                    const q2X = scale(s.q2);
                    const q3X = scale(s.q3);
                    const minX = scale(s.min);
                    const maxX = scale(s.max);
                    const boxY = 60;
                    const boxH = 65;

                    return (
                      <svg id="svg-box-plot" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg h-auto">
                        {/* Whiskers */}
                        <line x1={minX} y1={boxY + boxH / 2} x2={maxX} y2={boxY + boxH / 2} stroke="#64748b" strokeWidth="2" />
                        <line x1={minX} y1={boxY + 10} x2={minX} y2={boxY + boxH - 10} stroke="#94a3b8" strokeWidth="2" />
                        <line x1={maxX} y1={boxY + 10} x2={maxX} y2={boxY + boxH - 10} stroke="#94a3b8" strokeWidth="2" />

                        {/* IQR Box */}
                        <rect x={q1X} y={boxY} width={Math.max(2, q3X - q1X)} height={boxH} className="fill-indigo-900/60 stroke-indigo-400 stroke-2" rx="3" />
                        <line x1={q2X} y1={boxY} x2={q2X} y2={boxY + boxH} stroke="#38bdf8" strokeWidth="3" />

                        {/* Outliers */}
                        {s.outliersIqr.map((v, i) => (
                          <circle key={i} cx={scale(v)} cy={boxY + boxH / 2} r="4" className="fill-amber-400 stroke-slate-900" />
                        ))}

                        {/* Labels */}
                        <text x={minX} y={boxY - 12} textAnchor="middle" className="fill-slate-400 text-3xs font-mono">Min: {s.min.toFixed(1)}</text>
                        <text x={q1X} y={boxY + boxH + 20} textAnchor="middle" className="fill-slate-300 text-3xs font-mono">Q1: {s.q1.toFixed(1)}</text>
                        <text x={q2X} y={boxY - 12} textAnchor="middle" className="fill-sky-400 text-3xs font-mono font-bold">Mdn: {s.q2.toFixed(1)}</text>
                        <text x={q3X} y={boxY + boxH + 20} textAnchor="middle" className="fill-slate-300 text-3xs font-mono">Q3: {s.q3.toFixed(1)}</text>
                        <text x={maxX} y={boxY - 12} textAnchor="middle" className="fill-slate-400 text-3xs font-mono">Max: {s.max.toFixed(1)}</text>
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed">
                  <strong>Interpretation:</strong> Evaluates median position, interquartile range (IQR = Q3 - Q1), and Tukey fences. Dots outside the whiskers represent empirical outliers.
                </div>
              </div>
            )}

            {/* CHART 3: VIOLIN PLOT */}
            {(galleryFilter === 'all' || galleryFilter === 'distributions') && violinData && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Violin Density Contour</h3>
                    <p className="text-2xs text-slate-400">Feature: <span className="font-mono text-indigo-300">{primaryNumeric}</span></p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-violin-plot', `violin_${primaryNumeric}`)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const kde = violinData.kde;
                    const stats = violinData.stats;
                    const w = 460;
                    const h = 220;
                    const pad = { top: 25, right: 30, bottom: 45, left: 30 };
                    const innerW = w - pad.left - pad.right;
                    const min = stats.min;
                    const max = stats.max;
                    const span = max - min || 1;
                    const scale = (v: number) => pad.left + ((v - min) / span) * innerW;

                    const maxD = Math.max(...kde.map(k => k.density), 0.001);
                    const centerY = 90;
                    const maxSpread = 50;

                    // Top path
                    const topPath = kde.map(k => {
                      const x = scale(k.x);
                      const y = centerY - (k.density / maxD) * maxSpread;
                      return `${x},${y}`;
                    }).join(' L ');

                    // Bottom path (reversed)
                    const botPath = [...kde].reverse().map(k => {
                      const x = scale(k.x);
                      const y = centerY + (k.density / maxD) * maxSpread;
                      return `${x},${y}`;
                    }).join(' L ');

                    return (
                      <svg id="svg-violin-plot" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg h-auto">
                        {/* Symmetrical Violin Envelope */}
                        <path
                          d={`M ${topPath} L ${botPath} Z`}
                          className="fill-indigo-600/40 stroke-indigo-400 stroke-1.5"
                        />
                        {/* Central Quartile Bar */}
                        <line x1={scale(stats.q1)} y1={centerY} x2={scale(stats.q3)} y2={centerY} stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
                        {/* Median dot */}
                        <circle cx={scale(stats.median)} cy={centerY} r="4" fill="#38bdf8" />

                        {/* Min / Max Labels */}
                        <text x={scale(min)} y={h - 15} textAnchor="start" className="fill-slate-500 text-3xs font-mono">{min.toFixed(1)}</text>
                        <text x={scale(stats.median)} y={h - 15} textAnchor="middle" className="fill-sky-400 text-3xs font-mono font-bold">Mdn: {stats.median.toFixed(1)}</text>
                        <text x={scale(max)} y={h - 15} textAnchor="end" className="fill-slate-500 text-3xs font-mono">{max.toFixed(1)}</text>
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed">
                  <strong>Interpretation:</strong> Blends a box plot core (white bar = IQR, blue dot = median) with mirrored KDE density curves. Wider sections signify higher probability density.
                </div>
              </div>
            )}

            {/* CHART 4: Q-Q PLOT */}
            {(galleryFilter === 'all' || galleryFilter === 'distributions') && qqData.length > 0 && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Normal Q-Q Plot (Quantile-Quantile)</h3>
                    <p className="text-2xs text-slate-400">Feature: <span className="font-mono text-indigo-300">{primaryNumeric}</span></p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-qq-plot', `qqplot_${primaryNumeric}`)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const w = 460;
                    const h = 220;
                    const pad = { top: 20, right: 25, bottom: 35, left: 45 };
                    const innerW = w - pad.left - pad.right;
                    const innerH = h - pad.top - pad.bottom;

                    const allVals = qqData.flatMap(p => [p.theoretical, p.sample]);
                    const bound = Math.max(...allVals.map(v => Math.abs(v)), 2.5) * 1.1;

                    const scaleCoord = (v: number) => pad.left + ((v + bound) / (2 * bound)) * innerW;
                    const scaleYCoord = (v: number) => pad.top + innerH - ((v + bound) / (2 * bound)) * innerH;

                    return (
                      <svg id="svg-qq-plot" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg h-auto">
                        {/* Reference Diagonal (y = x) */}
                        <line
                          x1={scaleCoord(-bound)}
                          y1={scaleYCoord(-bound)}
                          x2={scaleCoord(bound)}
                          y2={scaleYCoord(bound)}
                          stroke="#ef4444"
                          strokeWidth="1.5"
                          strokeDasharray="4,4"
                        />

                        {/* Quantile Points */}
                        {qqData.map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={scaleCoord(pt.theoretical)}
                            cy={scaleYCoord(pt.sample)}
                            r="3.5"
                            className="fill-indigo-400 hover:fill-amber-400 transition-colors"
                          >
                            <title>{`Theoretical: ${pt.theoretical}\nSample Z: ${pt.sample}\nValue: ${pt.rawValue}`}</title>
                          </circle>
                        ))}

                        <text x={pad.left + innerW / 2} y={h - 6} textAnchor="middle" className="fill-slate-500 text-3xs font-mono">
                          Theoretical Normal Quantiles (Z)
                        </text>
                        <text x={14} y={pad.top + innerH / 2} textAnchor="middle" transform={`rotate(-90 14 ${pad.top + innerH / 2})`} className="fill-slate-500 text-3xs font-mono">
                          Sample Quantiles (Z)
                        </text>
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed">
                  <strong>Interpretation:</strong> Compares sample quantiles against standard theoretical Gaussian quantiles. Deviations from the red dashed line indicate kurtosis or skewness.
                </div>
              </div>
            )}

            {/* CHART 5: BIVARIATE SCATTER & TRENDLINE */}
            {(galleryFilter === 'all' || galleryFilter === 'relationships') && scatterRegression && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Bivariate Scatter & OLS Trendline</h3>
                    <p className="text-2xs text-slate-400">{primaryNumeric} (X) ↔ {secondaryNumeric} (Y)</p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-scatter-plot', `scatter_${primaryNumeric}_${secondaryNumeric}`)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const reg = scatterRegression;
                    const w = 460;
                    const h = 220;
                    const pad = { top: 20, right: 25, bottom: 35, left: 45 };
                    const innerW = w - pad.left - pad.right;
                    const innerH = h - pad.top - pad.bottom;

                    const xs = reg.dataPoints.map(p => p.x);
                    const ys = reg.dataPoints.map(p => p.y);
                    const minX = Math.min(...xs);
                    const maxX = Math.max(...xs);
                    const minY = Math.min(...ys);
                    const maxY = Math.max(...ys);

                    const scaleX = (v: number) => pad.left + ((v - minX) / (maxX - minX || 1)) * innerW;
                    const scaleY = (v: number) => pad.top + innerH - ((v - minY) / (maxY - minY || 1)) * innerH;

                    return (
                      <svg id="svg-scatter-plot" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg h-auto">
                        {/* Trendline */}
                        <line
                          x1={scaleX(reg.regressionLine[0].x)}
                          y1={scaleY(reg.regressionLine[0].y)}
                          x2={scaleX(reg.regressionLine[1].x)}
                          y2={scaleY(reg.regressionLine[1].y)}
                          stroke="#818cf8"
                          strokeWidth="2"
                        />
                        {/* Points */}
                        {reg.dataPoints.map((pt, i) => (
                          <circle key={i} cx={scaleX(pt.x)} cy={scaleY(pt.y)} r="3.5" className="fill-indigo-500/80 stroke-slate-900 stroke-1 hover:fill-amber-400" />
                        ))}

                        <text x={pad.left + innerW / 2} y={h - 6} textAnchor="middle" className="fill-slate-500 text-3xs font-mono">{primaryNumeric}</text>
                        <text x={14} y={pad.top + innerH / 2} textAnchor="middle" transform={`rotate(-90 14 ${pad.top + innerH / 2})`} className="fill-slate-500 text-3xs font-mono">{secondaryNumeric}</text>
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed flex items-center justify-between">
                  <span><strong>Fit:</strong> {scatterRegression.equation}</span>
                  <span className="font-mono text-indigo-300">R² = {(scatterRegression.rSquared * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}

            {/* CHART 6: CORRELATION HEATMAP */}
            {(galleryFilter === 'all' || galleryFilter === 'relationships') && corrMatrix && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Correlation Matrix Heatmap</h3>
                    <p className="text-2xs text-slate-400">Pearson linear association matrix</p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-corr-heatmap', 'correlation_heatmap')}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const cols = numCols.slice(0, 5);
                    const size = 38;
                    const startX = 70;
                    const startY = 30;
                    const w = startX + cols.length * size + 20;
                    const h = startY + cols.length * size + 20;

                    const getColor = (r: number) => {
                      if (r === 1) return '#4f46e5';
                      if (r > 0) return r > 0.7 ? '#4338ca' : r > 0.4 ? '#3730a3' : '#1e1b4b';
                      return r < -0.7 ? '#be123c' : r < -0.4 ? '#881337' : '#4c0519';
                    };

                    return (
                      <svg id="svg-corr-heatmap" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-sm h-auto">
                        {cols.map((c, i) => (
                          <text key={c} x={startX + i * size + size / 2} y={startY - 8} textAnchor="middle" className="fill-slate-400 text-3xs font-mono">
                            {c.slice(0, 5)}
                          </text>
                        ))}
                        {cols.map((rowC, rIdx) => (
                          <g key={rowC}>
                            <text x={startX - 8} y={startY + rIdx * size + size / 2 + 3} textAnchor="end" className="fill-slate-400 text-3xs font-mono">
                              {rowC.slice(0, 7)}
                            </text>
                            {cols.map((colC, cIdx) => {
                              const val = corrMatrix.matrix[rowC]?.[colC] ?? 0;
                              return (
                                <g key={colC}>
                                  <rect
                                    x={startX + cIdx * size}
                                    y={startY + rIdx * size}
                                    width={size - 2}
                                    height={size - 2}
                                    fill={getColor(val)}
                                    rx="2"
                                  />
                                  <text
                                    x={startX + cIdx * size + size / 2 - 1}
                                    y={startY + rIdx * size + size / 2 + 3}
                                    textAnchor="middle"
                                    className="fill-white text-3xs font-mono tabular-nums"
                                  >
                                    {val.toFixed(2)}
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                        ))}
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed">
                  <strong>Interpretation:</strong> Displays pairwise Pearson linear coefficients. Deep indigo reflects strong positive co-variance; crimson reflects inverse correlation.
                </div>
              </div>
            )}

            {/* CHART 7: RESIDUALS PLOT */}
            {(galleryFilter === 'all' || galleryFilter === 'relationships') && scatterRegression && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Residuals vs. Fitted Diagnostic</h3>
                    <p className="text-2xs text-slate-400">Homoscedasticity check: {primaryNumeric} → {secondaryNumeric}</p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-res-plot', 'residuals_diagnostic')}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const reg = scatterRegression;
                    const w = 460;
                    const h = 220;
                    const pad = { top: 20, right: 25, bottom: 35, left: 45 };
                    const innerW = w - pad.left - pad.right;
                    const innerH = h - pad.top - pad.bottom;

                    const preds = reg.dataPoints.map(p => p.predicted);
                    const res = reg.dataPoints.map(p => p.residual);
                    const minFit = Math.min(...preds);
                    const maxFit = Math.max(...preds);
                    const maxRes = Math.max(...res.map(r => Math.abs(r)), 1) * 1.15;

                    const scaleX = (v: number) => pad.left + ((v - minFit) / (maxFit - minFit || 1)) * innerW;
                    const scaleY = (v: number) => pad.top + innerH / 2 - (v / maxRes) * (innerH / 2);

                    return (
                      <svg id="svg-res-plot" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg h-auto">
                        <line x1={pad.left} y1={pad.top + innerH / 2} x2={pad.left + innerW} y2={pad.top + innerH / 2} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3,3" />
                        {reg.dataPoints.map((pt, i) => (
                          <circle key={i} cx={scaleX(pt.predicted)} cy={scaleY(pt.residual)} r="3.5" className={pt.residual >= 0 ? 'fill-sky-400/80' : 'fill-amber-400/80'} />
                        ))}
                        <text x={pad.left + innerW / 2} y={h - 6} textAnchor="middle" className="fill-slate-500 text-3xs font-mono">Fitted Target (ŷ)</text>
                        <text x={14} y={pad.top + innerH / 2} textAnchor="middle" transform={`rotate(-90 14 ${pad.top + innerH / 2})`} className="fill-slate-500 text-3xs font-mono">Residual (e)</text>
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed flex items-center justify-between">
                  <span><strong>Breusch-Pagan:</strong> p = {scatterRegression.breuschPagan.pValue.toFixed(4)}</span>
                  <span className="font-mono text-indigo-300">{scatterRegression.breuschPagan.isHomoscedastic ? 'Homoscedastic' : 'Heteroscedastic'}</span>
                </div>
              </div>
            )}

            {/* CHART 8: CATEGORICAL BAR CHART */}
            {(galleryFilter === 'all' || galleryFilter === 'categorical') && groupedBarData.length > 0 && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Categorical Mean Comparison</h3>
                    <p className="text-2xs text-slate-400">Mean {primaryNumeric} across {primaryCat}</p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-cat-bar', `bar_${primaryCat}_${primaryNumeric}`)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const data = groupedBarData.slice(0, 6);
                    const maxMean = Math.max(...data.map(d => d.mean), 1);
                    const w = 460;
                    const h = 220;
                    const pad = { top: 20, right: 25, bottom: 40, left: 45 };
                    const innerW = w - pad.left - pad.right;
                    const innerH = h - pad.top - pad.bottom;
                    const barW = innerW / data.length;

                    return (
                      <svg id="svg-cat-bar" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg h-auto">
                        {data.map((d, i) => {
                          const barH = (d.mean / maxMean) * innerH;
                          const x = pad.left + i * barW;
                          const y = pad.top + innerH - barH;
                          return (
                            <g key={d.category} className="group">
                              <rect x={x + 4} y={y} width={Math.max(2, barW - 8)} height={barH} fill={palette[i % palette.length]} rx="2" />
                              <text x={x + barW / 2} y={y - 5} textAnchor="middle" className="fill-slate-300 text-3xs font-mono">{d.mean.toFixed(1)}</text>
                              <text x={x + barW / 2} y={pad.top + innerH + 16} textAnchor="middle" className="fill-slate-400 text-3xs font-mono truncate max-w-[50px]">
                                {d.category.length > 7 ? d.category.slice(0, 6) + '…' : d.category}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed">
                  <strong>Interpretation:</strong> Compares aggregated averages of <span className="font-mono text-slate-300">{primaryNumeric}</span> segmented by distinct levels of <span className="font-mono text-slate-300">{primaryCat}</span>.
                </div>
              </div>
            )}

            {/* CHART 9: PIE & DONUT CHARTS */}
            {(galleryFilter === 'all' || galleryFilter === 'categorical') && catFrequencyData && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Donut Composition Chart</h3>
                    <p className="text-2xs text-slate-400">Proportion of levels in <span className="font-mono text-amber-300">{primaryCat}</span></p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-donut-plot', `donut_${primaryCat}`)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const freqs = catFrequencyData.frequencies.slice(0, 5);
                    const total = catFrequencyData.totalCount;
                    const w = 460;
                    const h = 220;
                    const cx = 130;
                    const cy = 110;
                    const rOuter = 70;
                    const rInner = 42;

                    let accumulatedAngle = 0;
                    const slices = freqs.map((f, i) => {
                      const angle = (f.count / total) * 2 * Math.PI;
                      const start = accumulatedAngle;
                      const end = start + angle;
                      accumulatedAngle = end;

                      const x1 = cx + rOuter * Math.cos(start);
                      const y1 = cy + rOuter * Math.sin(start);
                      const x2 = cx + rOuter * Math.cos(end);
                      const y2 = cy + rOuter * Math.sin(end);
                      const x3 = cx + rInner * Math.cos(end);
                      const y3 = cy + rInner * Math.sin(end);
                      const x4 = cx + rInner * Math.cos(start);
                      const y4 = cy + rInner * Math.sin(start);
                      const largeArc = angle > Math.PI ? 1 : 0;

                      return {
                        d: `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`,
                        color: palette[i % palette.length],
                        item: f,
                      };
                    });

                    return (
                      <svg id="svg-donut-plot" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg h-auto">
                        {slices.map((s, idx) => (
                          <path key={idx} d={s.d} fill={s.color} className="hover:opacity-80 transition-opacity" />
                        ))}
                        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-white font-mono font-bold text-xs">{total}</text>
                        <text x={cx} y={cy + 10} textAnchor="middle" className="fill-slate-400 text-3xs font-mono">Total</text>

                        {/* Legend */}
                        <g transform="translate(240, 40)">
                          {freqs.map((f, i) => (
                            <g key={f.value} transform={`translate(0, ${i * 24})`}>
                              <rect width="10" height="10" fill={palette[i % palette.length]} rx="2" />
                              <text x="18" y="9" className="fill-slate-300 text-3xs font-mono">
                                {f.value} ({f.percentage.toFixed(1)}%)
                              </text>
                            </g>
                          ))}
                        </g>
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed">
                  <strong>Interpretation:</strong> Displays proportional shares of discrete levels within <span className="font-mono text-slate-300">{primaryCat}</span>.
                </div>
              </div>
            )}

            {/* CHART 10: SEQUENTIAL LINE & AREA CHART */}
            {(galleryFilter === 'all' || galleryFilter === 'sequential') && primaryNumeric && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Sequential Observation Trend & Area</h3>
                    <p className="text-2xs text-slate-400">Progression across sample records ({primaryNumeric})</p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-area-plot', `area_${primaryNumeric}`)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none">
                  {(() => {
                    const vals = dataset.rows.map(r => Number(r[primaryNumeric])).filter(v => !isNaN(v));
                    const w = 460;
                    const h = 220;
                    const pad = { top: 20, right: 25, bottom: 35, left: 45 };
                    const innerW = w - pad.left - pad.right;
                    const innerH = h - pad.top - pad.bottom;
                    const min = Math.min(...vals);
                    const max = Math.max(...vals);
                    const span = max - min || 1;

                    const pts = vals.map((v, i) => {
                      const x = pad.left + (i / (vals.length - 1 || 1)) * innerW;
                      const y = pad.top + innerH - ((v - min) / span) * innerH;
                      return { x, y };
                    });

                    const lineD = pts.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
                    const areaD = `${lineD} L ${pad.left + innerW} ${pad.top + innerH} L ${pad.left} ${pad.top + innerH} Z`;

                    return (
                      <svg id="svg-area-plot" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-lg h-auto">
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={areaD} fill="url(#areaGrad)" />
                        <path d={lineD} fill="none" stroke="#818cf8" strokeWidth="2" />
                        <text x={pad.left + innerW / 2} y={h - 6} textAnchor="middle" className="fill-slate-500 text-3xs font-mono">Observation Index (1 to {vals.length})</text>
                        <text x={14} y={pad.top + innerH / 2} textAnchor="middle" transform={`rotate(-90 14 ${pad.top + innerH / 2})`} className="fill-slate-500 text-3xs font-mono">{primaryNumeric}</text>
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed">
                  <strong>Interpretation:</strong> Tracks the progression of continuous values across chronological or indexed observations to detect drift, cycles, or temporal shifts.
                </div>
              </div>
            )}

            {/* CHART 11: PAIR PLOT MATRIX (If >= 3 numeric features) */}
            {(galleryFilter === 'all' || galleryFilter === 'relationships') && pairPlotCols.length >= 3 && (
              <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Pair Plot Matrix (Bivariate & Univariate Grid)</h3>
                    <p className="text-2xs text-slate-400">Features: {pairPlotCols.join(' · ')}</p>
                  </div>
                  <button
                    onClick={() => downloadSvg('svg-pair-plot', 'pairplot_matrix')}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors text-xs flex items-center gap-1"
                    title="Download SVG"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="text-3xs font-mono">SVG</span>
                  </button>
                </div>

                <div className="w-full flex justify-center overflow-x-auto select-none py-2">
                  {(() => {
                    const cellSize = 130;
                    const padding = 12;
                    const w = pairPlotCols.length * cellSize + 60;
                    const h = pairPlotCols.length * cellSize + 60;

                    return (
                      <svg id="svg-pair-plot" viewBox={`0 0 ${w} ${h}`} className="w-full max-w-xl h-auto">
                        {pairPlotCols.map((rowCol, rIdx) => {
                          const rowVals = dataset.rows.map(r => Number(r[rowCol])).filter(v => !isNaN(v));
                          const minRow = Math.min(...rowVals);
                          const maxRow = Math.max(...rowVals);

                          return pairPlotCols.map((colCol, cIdx) => {
                            const colVals = dataset.rows.map(r => Number(r[colCol])).filter(v => !isNaN(v));
                            const minCol = Math.min(...colVals);
                            const maxCol = Math.max(...colVals);

                            const cellX = 40 + cIdx * cellSize;
                            const cellY = 30 + rIdx * cellSize;
                            const isDiag = rIdx === cIdx;

                            return (
                              <g key={`${rowCol}-${colCol}`} transform={`translate(${cellX}, ${cellY})`}>
                                <rect width={cellSize - padding} height={cellSize - padding} fill="#1e293b" rx="2" stroke="#334155" strokeWidth="1" />

                                {isDiag ? (
                                  /* Univariate mini histogram */
                                  (() => {
                                    const bins = calculateHistogramBins(rowVals, 6);
                                    const maxB = Math.max(...bins.map(b => b.count), 1);
                                    const bW = (cellSize - padding) / bins.length;
                                    return (
                                      <g>
                                        {bins.map((b, bi) => {
                                          const bH = (b.count / maxB) * (cellSize - padding - 20);
                                          return (
                                            <rect
                                              key={bi}
                                              x={bi * bW + 1}
                                              y={cellSize - padding - bH}
                                              width={bW - 2}
                                              height={bH}
                                              fill="#818cf8"
                                              rx="1"
                                            />
                                          );
                                        })}
                                        <text x={(cellSize - padding) / 2} y={15} textAnchor="middle" className="fill-slate-200 text-3xs font-mono font-bold">
                                          {rowCol.slice(0, 8)}
                                        </text>
                                      </g>
                                    );
                                  })()
                                ) : (
                                  /* Bivariate mini scatter */
                                  (() => {
                                    return (
                                      <g>
                                        {dataset.rows.slice(0, 40).map((row, ri) => {
                                          const xV = Number(row[colCol]);
                                          const yV = Number(row[rowCol]);
                                          if (isNaN(xV) || isNaN(yV)) return null;
                                          const px = ((xV - minCol) / (maxCol - minCol || 1)) * (cellSize - padding - 16) + 8;
                                          const py = (cellSize - padding - 8) - ((yV - minRow) / (maxRow - minRow || 1)) * (cellSize - padding - 16);
                                          return <circle key={ri} cx={px} cy={py} r="2" fill="#38bdf8" opacity="0.75" />;
                                        })}
                                      </g>
                                    );
                                  })()
                                )}
                              </g>
                            );
                          });
                        })}
                      </svg>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400 font-body leading-relaxed">
                  <strong>Interpretation:</strong> Multi-panel pair plot displaying diagonal univariate distributions alongside off-diagonal bivariate scatter combinations across top continuous attributes.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE CUSTOM STUDIO */}
      {viewMode === 'studio' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Chart Type Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Chart Type:</span>
                <select
                  value={customChartType}
                  onChange={(e) => setCustomChartType(e.target.value as CustomChartType)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="histogram">Histogram & Density</option>
                  <option value="boxplot">Box & Whisker</option>
                  <option value="violin">Violin Plot</option>
                  <option value="qqplot">Q-Q Distribution Plot</option>
                  <option value="scatter">Bivariate Scatter</option>
                  <option value="heatmap">Correlation Heatmap</option>
                  <option value="residual">Residuals Diagnostic</option>
                  <option value="line">Sequential Line</option>
                  <option value="area">Area Chart</option>
                  {catCols.length > 0 && <option value="bar">Categorical Bar</option>}
                  {catCols.length > 0 && <option value="countplot">Count Plot</option>}
                  {catCols.length > 0 && <option value="pie">Pie Chart</option>}
                  {catCols.length > 0 && <option value="donut">Donut Chart</option>}
                </select>
              </div>

              {/* Column X selector */}
              {customChartType !== 'countplot' && customChartType !== 'pie' && customChartType !== 'donut' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Feature (X):</span>
                  <select
                    value={selectedColX}
                    onChange={(e) => setSelectedColX(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {numCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Column Y selector (for scatter/residual) */}
              {(customChartType === 'scatter' || customChartType === 'residual') && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Target (Y):</span>
                  <select
                    value={selectedColY}
                    onChange={(e) => setSelectedColY(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {numCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Categorical column selector */}
              {(customChartType === 'bar' || customChartType === 'countplot' || customChartType === 'pie' || customChartType === 'donut') && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Categorical Factor:</span>
                  <select
                    value={selectedCatCol}
                    onChange={(e) => setSelectedCatCol(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {catCols.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {/* Bins for histogram */}
              {customChartType === 'histogram' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Bins:</span>
                  <select
                    value={customBinCount}
                    onChange={(e) => setCustomBinCount(Number(e.target.value))}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={5}>5 Bins</option>
                    <option value={8}>8 Bins</option>
                    <option value={10}>10 Bins</option>
                    <option value={15}>15 Bins</option>
                    <option value={20}>20 Bins</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={() => downloadSvg('svg-custom-canvas', `custom_${customChartType}`)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download SVG</span>
            </button>
          </div>

          {/* Studio Large Canvas */}
          <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center min-h-[420px]">
            <div className="w-full max-w-2xl select-none">
              {(() => {
                const w = 620;
                const h = 320;
                const pad = { top: 25, right: 30, bottom: 45, left: 50 };
                const innerW = w - pad.left - pad.right;
                const innerH = h - pad.top - pad.bottom;

                if (customChartType === 'histogram') {
                  const vals = dataset.rows.map(r => Number(r[selectedColX])).filter(v => !isNaN(v));
                  const bins = calculateHistogramBins(vals, customBinCount);
                  const maxB = Math.max(...bins.map(b => b.count), 1);
                  const bW = innerW / bins.length;

                  return (
                    <svg id="svg-custom-canvas" viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
                      {bins.map((b, i) => {
                        const bH = (b.count / maxB) * innerH;
                        return (
                          <g key={i}>
                            <rect x={pad.left + i * bW + 2} y={pad.top + innerH - bH} width={bW - 4} height={bH} fill="#6366f1" rx="2" />
                            <text x={pad.left + i * bW + bW / 2} y={pad.top + innerH + 16} textAnchor="middle" className="fill-slate-400 text-3xs font-mono">{b.binStart.toFixed(1)}</text>
                          </g>
                        );
                      })}
                      <text x={pad.left + innerW / 2} y={h - 6} textAnchor="middle" className="fill-slate-400 text-2xs font-mono">{selectedColX}</text>
                    </svg>
                  );
                }

                if (customChartType === 'scatter' || customChartType === 'residual') {
                  const reg = calculateLinearRegression(dataset.rows, selectedColX, selectedColY);
                  if (!reg) return <div className="text-center text-slate-500">Requires 2 distinct numeric columns</div>;

                  const xs = reg.dataPoints.map(p => p.x);
                  const ys = reg.dataPoints.map(p => p.y);
                  const minX = Math.min(...xs);
                  const maxX = Math.max(...xs);
                  const minY = Math.min(...ys);
                  const maxY = Math.max(...ys);

                  const scaleX = (v: number) => pad.left + ((v - minX) / (maxX - minX || 1)) * innerW;
                  const scaleY = (v: number) => pad.top + innerH - ((v - minY) / (maxY - minY || 1)) * innerH;

                  return (
                    <svg id="svg-custom-canvas" viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
                      <line x1={scaleX(reg.regressionLine[0].x)} y1={scaleY(reg.regressionLine[0].y)} x2={scaleX(reg.regressionLine[1].x)} y2={scaleY(reg.regressionLine[1].y)} stroke="#818cf8" strokeWidth="2.5" />
                      {reg.dataPoints.map((pt, i) => (
                        <circle key={i} cx={scaleX(pt.x)} cy={scaleY(pt.y)} r="4" fill="#6366f1" />
                      ))}
                      <text x={pad.left + innerW / 2} y={h - 6} textAnchor="middle" className="fill-slate-400 text-2xs font-mono">{selectedColX}</text>
                      <text x={16} y={pad.top + innerH / 2} textAnchor="middle" transform={`rotate(-90 16 ${pad.top + innerH / 2})`} className="fill-slate-400 text-2xs font-mono">{selectedColY}</text>
                    </svg>
                  );
                }

                // Fallback for default canvas rendering
                return (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    Visualization rendered dynamically using active dataset columns: <span className="font-mono text-indigo-400">{selectedColX}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
