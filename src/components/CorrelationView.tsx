import React, { useState, useMemo } from 'react';
import { ArrowRight, HelpCircle, Layers, Sliders, Sparkles, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ParsedDataset } from '../utils/dataParser';
import { calculateCorrelationMatrix, calculateVIF, CorrelationCell, VIFResult } from '../utils/statistics';

interface CorrelationViewProps {
  dataset: ParsedDataset;
  onLaunchRegression: (varX: string, varY: string) => void;
  onAskMuseAboutCorrelation?: (col1: string, col2: string, rVal: number) => void;
}

export const CorrelationView: React.FC<CorrelationViewProps> = ({
  dataset,
  onLaunchRegression,
  onAskMuseAboutCorrelation,
}) => {
  const [method, setMethod] = useState<'pearson' | 'spearman'>('pearson');
  const [minThreshold, setMinThreshold] = useState<number>(0.0);
  const [hoveredCell, setHoveredCell] = useState<CorrelationCell | null>(null);

  const numCols = dataset.numericColumns;

  const { matrix, detailedCells, topCorrelations } = useMemo(() => {
    return calculateCorrelationMatrix(dataset.rows, numCols);
  }, [dataset.rows, numCols]);

  // Calculate actual Variance Inflation Factors (VIF) for all numerical predictors
  const vifResults: VIFResult[] = useMemo(() => {
    return calculateVIF(dataset.rows, numCols);
  }, [dataset.rows, numCols]);

  if (numCols.length < 2) {
    return (
      <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center">
        <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-white mb-1">
          Insufficient Numeric Features for Correlation
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Correlation matrices require at least two continuous numerical columns. The uploaded dataset has {numCols.length} numeric columns.
        </p>
      </div>
    );
  }

  const filteredTop = topCorrelations.filter(c => c.absValue >= minThreshold);

  const getCellColor = (val: number) => {
    if (isNaN(val)) return 'bg-slate-800 text-slate-500';
    if (val === 1) return 'bg-indigo-600 text-white font-bold';

    if (val > 0) {
      if (val >= 0.75) return 'bg-indigo-600/90 text-white';
      if (val >= 0.5) return 'bg-indigo-700/70 text-indigo-100';
      if (val >= 0.25) return 'bg-indigo-900/50 text-indigo-200';
      return 'bg-slate-800/80 text-slate-300';
    }

    if (val <= -0.75) return 'bg-rose-700/90 text-white';
    if (val <= -0.5) return 'bg-rose-800/70 text-rose-100';
    if (val <= -0.25) return 'bg-rose-950/60 text-rose-200';
    return 'bg-slate-800/80 text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Correlation Matrix & Multicollinearity Audit
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bivariate covariance, pairwise Pearson/Spearman coefficients, and calculated Variance Inflation Factors (VIF)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Method Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700">
            <button
              onClick={() => setMethod('pearson')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                method === 'pearson'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pearson (Linear)
            </button>
            <button
              onClick={() => setMethod('spearman')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                method === 'spearman'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Spearman (Rank)
            </button>
          </div>

          {/* Threshold Filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Min |r|:</span>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.1"
              value={minThreshold}
              onChange={(e) => setMinThreshold(parseFloat(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
            <span className="font-mono tabular-nums text-indigo-400 w-7">
              ≥{minThreshold.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Grid (Spans 2 columns) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Bivariate Heatmap ({numCols.length} × {numCols.length})
            </h3>
            <div className="flex items-center gap-2 text-2xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-700 inline-block" /> -1.0 (Inverse)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 inline-block" /> 0.0 (Orthogonal)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" /> +1.0 (Direct)
              </span>
            </div>
          </div>

          <div className="inline-block min-w-full align-middle">
            <table className="border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left font-mono text-slate-500 text-2xs uppercase">Features</th>
                  {numCols.map((col) => (
                    <th
                      key={col}
                      className="p-2 text-center font-mono text-slate-300 text-2xs max-w-[90px] truncate"
                      title={col}
                    >
                      {col.length > 10 ? col.slice(0, 9) + '…' : col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {numCols.map((rowCol) => (
                  <tr key={rowCol}>
                    <td
                      className="p-2 font-mono text-slate-300 font-medium whitespace-nowrap text-2xs max-w-[120px] truncate"
                      title={rowCol}
                    >
                      {rowCol}
                    </td>
                    {numCols.map((colCol) => {
                      const rVal = matrix[rowCol]?.[colCol] ?? 0;
                      const isDiagonal = rowCol === colCol;

                      return (
                        <td
                          key={colCol}
                          onMouseEnter={() => {
                            if (!isDiagonal) {
                              const cell = detailedCells.find(
                                c => (c.col1 === rowCol && c.col2 === colCol) || (c.col1 === colCol && c.col2 === rowCol)
                              );
                              if (cell) setHoveredCell(cell);
                            }
                          }}
                          onClick={() => {
                            if (!isDiagonal) {
                              onLaunchRegression(rowCol, colCol);
                            }
                          }}
                          className={`p-2.5 text-center font-mono tabular-nums text-2xs transition-transform cursor-pointer border border-slate-900 ${getCellColor(
                            rVal
                          )} ${isDiagonal ? 'cursor-default opacity-85' : 'hover:scale-105 hover:z-10 shadow-sm'}`}
                          title={isDiagonal ? `${rowCol} (Self = 1.00)` : `${rowCol} vs ${colCol}: r = ${rVal.toFixed(3)}`}
                        >
                          {rVal.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hoveredCell && (
            <div className="mt-4 p-3 rounded-lg bg-slate-850 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono text-indigo-300 font-semibold">
                  {hoveredCell.col1} ↔ {hoveredCell.col2}
                </span>
                <span className="text-slate-400">
                  r = <span className="font-mono text-white font-semibold">{hoveredCell.pearson.toFixed(4)}</span>
                </span>
                <span className="text-slate-400">
                  R² = <span className="font-mono text-white">{(hoveredCell.pearson * hoveredCell.pearson).toFixed(3)}</span>
                </span>
                <span className="text-slate-400">
                  p ≈ <span className="font-mono text-white">{hoveredCell.pValue < 0.001 ? '<0.001' : hoveredCell.pValue.toFixed(3)}</span>
                </span>
              </div>
              <button
                onClick={() => onLaunchRegression(hoveredCell.col1, hoveredCell.col2)}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                Fit Regression <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Top Correlations List (1 column) */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Top Associated Pairs</h3>
              <span className="text-2xs font-mono text-slate-400">
                Sorted by |r|
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Pairs with highest empirical association. Click any pair to generate an OLS regression equation.
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredTop.slice(0, 8).map((pair) => {
                const isPos = pair.value >= 0;
                return (
                  <div
                    key={`${pair.col1}-${pair.col2}`}
                    onClick={() => onLaunchRegression(pair.col1, pair.col2)}
                    className="group cursor-pointer p-3 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs font-mono font-medium text-slate-200 group-hover:text-indigo-300 transition-colors truncate max-w-[180px]">
                        {pair.col1} · {pair.col2}
                      </div>
                      <span className={`font-mono text-xs tabular-nums font-bold ${
                        isPos ? 'text-indigo-400' : 'text-rose-400'
                      }`}>
                        {isPos ? '+' : ''}{pair.value.toFixed(3)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-2xs text-slate-400">
                      <span>R² = {(pair.value * pair.value).toFixed(2)}</span>
                      <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                        Regression <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredTop.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  No pairs exceed |r| ≥ {minThreshold}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-2xs text-slate-500 mt-4">
            <span className="font-semibold text-slate-400">Empirical Rule:</span> High correlation does not imply direct causation; consult the calculated VIF table below for multicollinearity diagnosis.
          </div>
        </div>
      </div>

      {/* Variance Inflation Factor (VIF) Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Calculated Variance Inflation Factors (VIF)</h3>
              <span className="text-2xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                Empirical Multicollinearity Diagnostic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calculated via auxiliary regressions X_j = f(X_other). VIF measures the factor by which estimated coefficient variances are inflated.
            </p>
          </div>
          <div className="flex items-center gap-3 text-2xs font-mono text-slate-400">
            <span className="text-emerald-400">VIF &lt; 5 (Acceptable)</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-400">5 ≤ VIF &lt; 10 (Moderate)</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-400">VIF ≥ 10 (Severe)</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Predictor Feature (Xⱼ)</th>
                <th className="py-2.5 px-3 text-right">Auxiliary R²</th>
                <th className="py-2.5 px-3 text-right">Tolerance (1 - R²)</th>
                <th className="py-2.5 px-3 text-right">Calculated VIF</th>
                <th className="py-2.5 px-3 text-center">Collinearity Level</th>
                <th className="py-2.5 px-3">Empirical Diagnostic & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-body">
              {vifResults.map((v) => {
                const isInf = !isFinite(v.vif) && v.vif > 0;
                const isNan = isNaN(v.vif);
                const isSevere = isInf || v.vif >= 10;
                const isMod = !isInf && !isNan && v.vif >= 5 && v.vif < 10;

                const displayVif = isInf
                  ? '∞ (Infinity)'
                  : isNan
                  ? 'Undefined'
                  : v.vif.toFixed(2);

                const displayR2 = isNan ? 'N/A' : v.rSquared.toFixed(4);
                const displayTol = isNan ? 'N/A' : (isInf ? '0.0000' : v.tolerance.toFixed(4));

                let badgeLabel = 'ACCEPTABLE';
                let badgeClass = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';

                if (v.status === 'constant_column') {
                  badgeLabel = 'ZERO VARIANCE';
                  badgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
                } else if (v.status === 'insufficient_sample') {
                  badgeLabel = 'N ≤ p';
                  badgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
                } else if (isInf || v.status === 'perfect_collinearity') {
                  badgeLabel = 'PERFECT (SINGULAR)';
                  badgeClass = 'bg-rose-950/80 text-rose-300 border-rose-800';
                } else if (v.severity === 'severe') {
                  badgeLabel = 'SEVERE';
                  badgeClass = 'bg-rose-950/80 text-rose-300 border-rose-800';
                } else if (v.severity === 'moderate') {
                  badgeLabel = 'MODERATE';
                  badgeClass = 'bg-amber-950/80 text-amber-300 border-amber-800';
                }

                return (
                  <tr key={v.variable} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                      {v.variable}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                      {displayR2}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                      {displayTol}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono tabular-nums font-bold ${
                      isSevere ? 'text-rose-400' : isMod ? 'text-amber-400' : isNan ? 'text-slate-500' : 'text-emerald-400'
                    }`}>
                      {displayVif}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-2xs border ${badgeClass}`}>
                        {badgeLabel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs text-slate-300">
                      {v.interpretation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
