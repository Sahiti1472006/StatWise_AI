import React, { useState, useMemo } from 'react';
import { Download, SlidersHorizontal, Info, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ParsedDataset } from '../utils/dataParser';
import { calculateDescriptiveStats, calculateCategoricalStats, DescriptiveStats } from '../utils/statistics';

interface DescriptiveStatsTableProps {
  dataset: ParsedDataset;
  onSelectColumnForVisuals?: (columnName: string) => void;
}

export const DescriptiveStatsTable: React.FC<DescriptiveStatsTableProps> = ({
  dataset,
  onSelectColumnForVisuals,
}) => {
  const [activeView, setActiveView] = useState<'numeric' | 'categorical'>('numeric');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(
    dataset.numericColumns[0] || null
  );

  // Compute stats for all numeric columns including Shapiro-Wilk test
  const numericStatsMap = useMemo(() => {
    const map = new Map<string, DescriptiveStats>();
    for (const col of dataset.numericColumns) {
      const values = dataset.rows.map(r => r[col]);
      map.set(col, calculateDescriptiveStats(values));
    }
    return map;
  }, [dataset]);

  // Compute stats for categorical columns
  const categoricalStatsMap = useMemo(() => {
    const map = new Map<string, any>();
    for (const col of dataset.categoricalColumns) {
      const values = dataset.rows.map(r => r[col]);
      map.set(col, calculateCategoricalStats(values));
    }
    return map;
  }, [dataset]);

  const activeStats = selectedColumn ? numericStatsMap.get(selectedColumn) : null;

  // Export descriptive statistics to CSV
  const exportStatsToCsv = () => {
    const headers = [
      'Variable',
      'Valid_N',
      'Missing_N',
      'Mean',
      'Std_Dev',
      'Median',
      'Mode',
      'Min',
      'Max',
      'IQR',
      'Skewness',
      'Kurtosis',
      'CI_95_Lower',
      'CI_95_Upper',
      'Outliers_IQR_Count',
      'Shapiro_Wilk_W',
      'Shapiro_Wilk_p',
      'Normality_Verdict'
    ];

    const rows: string[] = [headers.join(',')];

    numericStatsMap.forEach((s, col) => {
      rows.push([
        `"${col}"`,
        s.validCount,
        s.missingCount,
        s.mean.toFixed(4),
        s.stdDevSample.toFixed(4),
        s.median.toFixed(4),
        `"${s.modes.join('; ') || 'N/A'}"`,
        s.min.toFixed(4),
        s.max.toFixed(4),
        s.iqr.toFixed(4),
        s.skewness.toFixed(4),
        s.kurtosis.toFixed(4),
        s.ci95Lower.toFixed(4),
        s.ci95Upper.toFixed(4),
        s.outliersIqr.length,
        s.shapiroWilk.isValid ? s.shapiroWilk.statisticW.toFixed(4) : 'N/A',
        s.shapiroWilk.isValid ? (s.shapiroWilk.pValue < 0.0001 ? '<0.0001' : s.shapiroWilk.pValue.toFixed(4)) : 'N/A',
        `"${!s.shapiroWilk.isValid ? 'Underdetermined (N<3 or zero variance)' : s.shapiroWilk.isNormal ? 'Fail to Reject H0 (p >= 0.05)' : 'Reject H0: Non-Normal (p < 0.05)'}"`
      ].join(','));
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `descriptive_statistics_${dataset.filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* View Switcher and Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Descriptive & Inferential Parameters
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Parametric estimators, dispersion metrics, formal Shapiro-Wilk normality testing, and quartile bounds
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveView('numeric')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeView === 'numeric'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Numeric Variables ({dataset.numericColumns.length})
            </button>
            <button
              onClick={() => setActiveView('categorical')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeView === 'categorical'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Categorical Factors ({dataset.categoricalColumns.length})
            </button>
          </div>

          {activeView === 'numeric' && (
            <button
              onClick={exportStatsToCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {activeView === 'numeric' ? (
        <>
          {/* Main Comprehensive Statistical Grid with Shapiro-Wilk */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Variable</th>
                    <th className="py-2.5 px-3 text-right">Mean (μ)</th>
                    <th className="py-2.5 px-3 text-right">Std Dev (σ)</th>
                    <th className="py-2.5 px-3 text-right">Median</th>
                    <th className="py-2.5 px-3 text-right">Min</th>
                    <th className="py-2.5 px-3 text-right">Max</th>
                    <th className="py-2.5 px-3 text-right">IQR</th>
                    <th className="py-2.5 px-3 text-right">Skewness</th>
                    <th className="py-2.5 px-3 text-right">Shapiro-Wilk W</th>
                    <th className="py-2.5 px-3 text-right">p-value</th>
                    <th className="py-2.5 px-3 text-center">Normality (α=0.05)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-body">
                  {dataset.numericColumns.map((col) => {
                    const s = numericStatsMap.get(col);
                    if (!s) return null;
                    const isSelected = selectedColumn === col;

                    return (
                      <tr
                        key={col}
                        onClick={() => setSelectedColumn(col)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-950/40 text-white' : 'hover:bg-slate-850/60 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-200 whitespace-nowrap">
                          {col}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-white">
                          {s.mean.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-300">
                          {s.stdDevSample.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {s.median.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                          {s.min.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-400">
                          {s.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {s.iqr.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          <span className={Math.abs(s.skewness) > 1 ? 'text-amber-400' : 'text-slate-400'}>
                            {s.skewness.toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200 font-semibold">
                          {s.shapiroWilk.isValid ? s.shapiroWilk.statisticW.toFixed(4) : <span className="text-slate-500">N/A</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          {s.shapiroWilk.isValid ? (
                            <span className={s.shapiroWilk.pValue < 0.05 ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                              {s.shapiroWilk.pValue < 0.0001 ? '<0.0001' : s.shapiroWilk.pValue.toFixed(4)}
                            </span>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          {s.shapiroWilk.isValid ? (
                            <span className={`px-2 py-0.5 rounded text-2xs border ${
                              s.shapiroWilk.isNormal
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : 'bg-amber-950/80 text-amber-300 border-amber-800'
                            }`}>
                              {s.shapiroWilk.isNormal ? 'FAIL TO REJECT H₀' : 'REJECT H₀ (NON-NORMAL)'}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-2xs border bg-slate-800 text-slate-400 border-slate-700">
                              N &lt; 3
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Variable Deep-Dive Card */}
          {selectedColumn && activeStats && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-indigo-400 mb-0.5">Empirical Diagnostic Profile</div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Statistical Fingerprint: <span className="font-mono text-indigo-300">{selectedColumn}</span>
                  </h3>
                </div>

                {onSelectColumnForVisuals && (
                  <button
                    onClick={() => onSelectColumnForVisuals(selectedColumn)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap"
                  >
                    Plot Distribution in Lab
                  </button>
                )}
              </div>

              {/* Statistical KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <span className="text-2xs text-slate-400 uppercase tracking-wider block mb-1">Sample Size (N)</span>
                  <span className="text-sm font-mono tabular-nums text-white font-semibold">
                    {activeStats.validCount.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <span className="text-2xs text-slate-400 uppercase tracking-wider block mb-1">Standard Error (SEM)</span>
                  <span className="text-sm font-mono tabular-nums text-indigo-300 font-semibold">
                    {activeStats.standardErrorMean.toFixed(4)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <span className="text-2xs text-slate-400 uppercase tracking-wider block mb-1">Sample Variance (s²)</span>
                  <span className="text-sm font-mono tabular-nums text-white font-semibold">
                    {activeStats.varianceSample.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <span className="text-2xs text-slate-400 uppercase tracking-wider block mb-1">Quartiles (Q1 · Q2 · Q3)</span>
                  <span className="text-2xs font-mono tabular-nums text-slate-200 block truncate">
                    {activeStats.q1.toFixed(1)} · {activeStats.q2.toFixed(1)} · {activeStats.q3.toFixed(1)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <span className="text-2xs text-slate-400 uppercase tracking-wider block mb-1">Excess Kurtosis</span>
                  <span className="text-sm font-mono tabular-nums text-white font-semibold">
                    {activeStats.kurtosis.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <span className="text-2xs text-slate-400 uppercase tracking-wider block mb-1">IQR Outliers</span>
                  <span className={`text-sm font-mono tabular-nums font-semibold ${activeStats.outliersIqr.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {activeStats.outliersIqr.length} points
                  </span>
                </div>
              </div>

              {/* Shapiro-Wilk Normality Callout */}
              <div className="p-4 rounded-lg bg-slate-850 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Formal Shapiro-Wilk Normality Test (AS R94 Algorithm)</span>
                  </div>
                  <span className="text-xs font-mono text-indigo-300">
                    {activeStats.shapiroWilk.isValid
                      ? `W = ${activeStats.shapiroWilk.statisticW.toFixed(4)}, p = ${activeStats.shapiroWilk.pValue < 0.0001 ? '<0.0001' : activeStats.shapiroWilk.pValue.toFixed(4)}`
                      : 'Underdetermined (N < 3 or constant)'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-body">
                  <strong>Empirical Decision:</strong> {activeStats.shapiroWilk.interpretation}
                </p>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-2xs text-slate-400 leading-relaxed space-y-1">
                  <div>
                    <strong className="text-amber-300">Methodological Rule:</strong> Failure to reject the null hypothesis (p ≥ 0.05) does <em>not</em> prove normality; it merely indicates insufficient sample evidence to conclude deviation from a Gaussian distribution.
                  </div>
                  <div>
                    <strong className="text-slate-300">Sample Sensitivity:</strong> {activeStats.shapiroWilk.limitations} Skewness and kurtosis describe moment asymmetry, but formal hypothesis testing requires comparing the empirical order statistics to expected Gaussian covariances.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Categorical Factors Table */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dataset.categoricalColumns.map((col) => {
            const cat = categoricalStatsMap.get(col);
            if (!cat) return null;
            return (
              <div key={col} className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">{col}</h3>
                    <p className="text-xs text-slate-400">
                      {cat.uniqueCount} distinct levels · {cat.totalCount - cat.missingCount} valid records
                    </p>
                  </div>
                  <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
                    Top: {cat.topValue}
                  </span>
                </div>

                <div className="space-y-2 mt-4">
                  {cat.frequencies.slice(0, 6).map((item: any) => (
                    <div key={item.value} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate max-w-[200px]">{item.value}</span>
                        <span className="font-mono tabular-nums text-slate-400">
                          {item.count} ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, item.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
