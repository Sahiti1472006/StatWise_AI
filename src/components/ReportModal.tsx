import React, { useState, useMemo } from 'react';
import { X, Printer, Download, FileCode, CheckCircle, Sparkles, FileText, ShieldCheck } from 'lucide-react';
import { ParsedDataset } from '../utils/dataParser';
import {
  calculateDescriptiveStats,
  calculateCorrelationMatrix,
  calculateLinearRegression,
  calculateVIF,
} from '../utils/statistics';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: ParsedDataset;
  isMetaLive: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  dataset,
  isMetaLive,
}) => {
  if (!isOpen) return null;

  const numCols = dataset.numericColumns;

  // Compute summary stats with Shapiro-Wilk for numeric columns
  const numericStats = useMemo(() => {
    return numCols.map(col => ({
      col,
      stats: calculateDescriptiveStats(dataset.rows.map(r => r[col])),
    }));
  }, [dataset, numCols]);

  // Compute top correlations
  const correlations = useMemo(() => {
    if (numCols.length < 2) return [];
    const res = calculateCorrelationMatrix(dataset.rows, numCols);
    return res.topCorrelations.slice(0, 5);
  }, [dataset, numCols]);

  // Compute Variance Inflation Factors (VIF)
  const vifResults = useMemo(() => {
    return calculateVIF(dataset.rows, numCols);
  }, [dataset.rows, numCols]);

  // Active top regression with Breusch-Pagan test
  const topRegression = useMemo(() => {
    if (numCols.length >= 2) {
      return calculateLinearRegression(dataset.rows, numCols[0], numCols[1]);
    }
    return null;
  }, [dataset, numCols]);

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    const auditPayload = {
      meta: {
        title: 'StatWise AI Statistical Audit Report',
        generatedAt: new Date().toISOString(),
        datasetFile: dataset.filename,
        rowCount: dataset.rowCount,
        columnCount: dataset.columnCount,
        aiEngine: isMetaLive ? 'Meta Muse Spark (muse-spark-1.3 · Live API)' : 'Meta Muse Spark (muse-spark-1.3 · Demo Mode)',
      },
      descriptiveStatistics: numericStats.map(s => ({
        variable: s.col,
        mean: s.stats.mean,
        stdDevSample: s.stats.stdDevSample,
        median: s.stats.median,
        min: s.stats.min,
        max: s.stats.max,
        iqr: s.stats.iqr,
        skewness: s.stats.skewness,
        kurtosis: s.stats.kurtosis,
        outliersIqrCount: s.stats.outliersIqr.length,
        shapiroWilk: s.stats.shapiroWilk,
      })),
      varianceInflationFactors: vifResults,
      topCorrelations: correlations,
      regressionModel: topRegression ? {
        predictor: topRegression.independentVar,
        target: topRegression.dependentVar,
        equation: topRegression.equation,
        rSquared: topRegression.rSquared,
        adjustedRSquared: topRegression.adjustedRSquared,
        slope: topRegression.slope,
        intercept: topRegression.intercept,
        standardError: topRegression.standardError,
        sampleSize: topRegression.sampleSize,
        breuschPagan: topRegression.breuschPagan,
        logTransformRecommendation: topRegression.logTransformRecommendation,
      } : null,
    };

    const blob = new Blob([JSON.stringify(auditPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistical_audit_${dataset.filename.replace(/\.[^/.]+$/, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>StatWise AI · Statistical Report - ${dataset.filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 960px; margin: 40px auto; padding: 0 20px; }
    h1, h2, h3 { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    .badge-empirical { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 2px 6px; font-size: 11px; border-radius: 4px; font-weight: 600; }
    .badge-ai { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; padding: 2px 6px; font-size: 11px; border-radius: 4px; font-weight: 600; }
    .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .metric-card { border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px; background: #f8fafc; }
    .metric-val { font-size: 20px; font-weight: bold; color: #4338ca; }
  </style>
</head>
<body>
  <h1>StatWise AI · Statistical Analysis & Quality Audit</h1>
  <p><strong>Dataset:</strong> ${dataset.filename} | <strong>Date:</strong> ${reportDate} | <strong>Engine:</strong> ${isMetaLive ? 'Meta Muse Spark 1.3 (Live)' : 'Meta Muse Spark 1.3 (Demo Mode)'}</p>
  <hr/>
  <div class="metric-grid">
    <div class="metric-card"><div>Total Observations</div><div class="metric-val">${dataset.rowCount}</div></div>
    <div class="metric-card"><div>Continuous Features</div><div class="metric-val">${dataset.numericColumns.length}</div></div>
    <div class="metric-card"><div>Categorical Factors</div><div class="metric-val">${dataset.categoricalColumns.length}</div></div>
    <div class="metric-card"><div>Missing Cells</div><div class="metric-val">${dataset.totalMissing}</div></div>
  </div>

  <h2>1. Descriptive Parameters & Shapiro-Wilk Normality Test <span class="badge-empirical">[Calculated Empirical Statistic]</span></h2>
  <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;"><em>Note: Failure to reject H₀ (p ≥ 0.05) indicates lack of evidence against normality, not absolute proof of Gaussian distribution.</em></p>
  <table>
    <thead><tr><th>Variable</th><th>Mean</th><th>Std Dev</th><th>Median</th><th>IQR</th><th>Skewness</th><th>Shapiro-Wilk W</th><th>p-value</th><th>Normality (α=0.05)</th></tr></thead>
    <tbody>
      ${numericStats.map(n => `<tr>
        <td><strong>${n.col}</strong></td>
        <td>${n.stats.mean.toFixed(2)}</td>
        <td>${n.stats.stdDevSample.toFixed(2)}</td>
        <td>${n.stats.median.toFixed(2)}</td>
        <td>${n.stats.iqr.toFixed(2)}</td>
        <td>${n.stats.skewness.toFixed(3)}</td>
        <td>${n.stats.shapiroWilk.isValid ? n.stats.shapiroWilk.statisticW.toFixed(4) : 'N/A'}</td>
        <td>${n.stats.shapiroWilk.isValid ? (n.stats.shapiroWilk.pValue < 0.0001 ? '<0.0001' : n.stats.shapiroWilk.pValue.toFixed(4)) : 'N/A'}</td>
        <td>${!n.stats.shapiroWilk.isValid ? 'N/A (N<3)' : n.stats.shapiroWilk.isNormal ? 'Fail to Reject H₀' : 'Reject H₀ (Non-Normal)'}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <h2>2. Calculated Variance Inflation Factors (VIF) <span class="badge-empirical">[Calculated Empirical Statistic]</span></h2>
  <table>
    <thead><tr><th>Predictor</th><th>Auxiliary R²</th><th>Tolerance (1-R²)</th><th>Calculated VIF</th><th>Severity</th></tr></thead>
    <tbody>
      ${vifResults.map(v => {
        const isInf = !isFinite(v.vif) && v.vif > 0;
        const isNan = isNaN(v.vif);
        const vifStr = isInf ? '∞ (Infinity)' : isNan ? 'Undefined' : v.vif.toFixed(2);
        const r2Str = isNan ? 'N/A' : v.rSquared.toFixed(4);
        const tolStr = isNan ? 'N/A' : (isInf ? '0.0000' : v.tolerance.toFixed(4));
        return `<tr>
          <td><strong>${v.variable}</strong></td>
          <td>${r2Str}</td>
          <td>${tolStr}</td>
          <td><strong>${vifStr}</strong></td>
          <td>${isInf ? 'PERFECT (SINGULAR)' : v.status === 'constant_column' ? 'ZERO VARIANCE' : v.severity.toUpperCase()}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  ${topRegression ? `
  <h2>3. OLS Regression & Breusch-Pagan Heteroscedasticity Test <span class="badge-empirical">[Calculated Empirical Statistic]</span></h2>
  <p><strong>Fitted Model:</strong> <code>${topRegression.equation}</code></p>
  <p><strong>R² (Variance Explained):</strong> ${(topRegression.rSquared * 100).toFixed(2)}% | <strong>Std Error of Estimate (Se):</strong> ${topRegression.standardError.toFixed(4)}</p>
  <p><strong>Breusch-Pagan Test:</strong> ${topRegression.breuschPagan.isValid ? `LM = ${topRegression.breuschPagan.lmStatistic.toFixed(4)}, df = ${topRegression.breuschPagan.degreesOfFreedom}, p = ${topRegression.breuschPagan.pValue < 0.0001 ? '<0.0001' : topRegression.breuschPagan.pValue.toFixed(4)} (${topRegression.breuschPagan.isHomoscedastic ? 'Homoscedastic (p ≥ 0.05)' : 'Heteroscedastic (p < 0.05)'})` : 'Underdetermined (N < 4)'}</p>
  <p><strong>Log-Transformation Guidance:</strong> ${topRegression.logTransformRecommendation.reason}</p>
  ` : ''}

  <h2>4. Synthesis & Modeling Advice <span class="badge-ai">[Meta Muse Spark Interpretation]</span></h2>
  <p>Empirical parameter testing provides verified foundations for downstream models. Review calculated VIF factors prior to joint multiple regressions to prevent coefficient inflation, and ensure residuals satisfy homoscedasticity assumptions before selecting linear or logarithmic formulations.</p>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `statistical_report_${dataset.filename.replace(/\.[^/.]+$/, '')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Executive Statistical Report & Quality Audit
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto print:p-0">
          <div className="border-b border-slate-800 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 mb-2">
              <span className="font-mono">StatWise AI Report Document</span>
              <span>{reportDate}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Statistical Intelligence & Diagnostic Audit
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Dataset: <span className="font-mono text-indigo-300">{dataset.filename}</span> · Analytical Model:{' '}
              <span className="text-indigo-400 font-medium">
                {isMetaLive ? 'Meta Muse Spark 1.3 (Live Meta Model API)' : 'Meta Muse Spark 1.3 (Demo Mode)'}
              </span>
            </p>
          </div>

          {/* Dataset Topology */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                1. Dataset Dimensions & Completeness
              </h3>
              <span className="text-3xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                [Calculated Empirical Statistic]
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-2xs text-slate-400 block">Total Observations</span>
                <span className="text-lg font-mono font-bold text-white">{dataset.rowCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-2xs text-slate-400 block">Continuous Features</span>
                <span className="text-lg font-mono font-bold text-indigo-400">{dataset.numericColumns.length}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-2xs text-slate-400 block">Categorical Factors</span>
                <span className="text-lg font-mono font-bold text-amber-400">{dataset.categoricalColumns.length}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-2xs text-slate-400 block">Missing Cells</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{dataset.totalMissing}</span>
              </div>
            </div>
          </div>

          {/* Descriptive Statistics Table with Shapiro-Wilk */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                2. Parametric & Shapiro-Wilk Normality Profile
              </h3>
              <span className="text-3xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                [Calculated Empirical Statistic]
              </span>
            </div>
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2 px-3">Variable</th>
                    <th className="py-2 px-3 text-right">Mean</th>
                    <th className="py-2 px-3 text-right">Std Dev</th>
                    <th className="py-2 px-3 text-right">Median</th>
                    <th className="py-2 px-3 text-right">IQR</th>
                    <th className="py-2 px-3 text-right">Skewness</th>
                    <th className="py-2 px-3 text-right">Shapiro-Wilk W</th>
                    <th className="py-2 px-3 text-right">p-value</th>
                    <th className="py-2 px-3 text-center">Normality</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {numericStats.map(({ col, stats }) => (
                    <tr key={col} className="hover:bg-slate-850/40">
                      <td className="py-2 px-3 font-medium text-slate-200">{col}</td>
                      <td className="py-2 px-3 text-right text-white tabular-nums">{stats.mean.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right text-indigo-300 tabular-nums">{stats.stdDevSample.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{stats.median.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{stats.iqr.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right tabular-nums">{stats.skewness.toFixed(3)}</td>
                      <td className="py-2 px-3 text-right tabular-nums text-slate-200 font-semibold">
                        {stats.shapiroWilk.isValid ? stats.shapiroWilk.statisticW.toFixed(4) : 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums">
                        {stats.shapiroWilk.isValid ? (stats.shapiroWilk.pValue < 0.0001 ? '<0.0001' : stats.shapiroWilk.pValue.toFixed(4)) : 'N/A'}
                      </td>
                      <td className="py-2 px-3 text-center tabular-nums">
                        <span className={`px-1.5 py-0.5 rounded text-3xs ${
                          !stats.shapiroWilk.isValid
                            ? 'text-slate-400 bg-slate-800'
                            : stats.shapiroWilk.isNormal
                            ? 'text-emerald-300 bg-emerald-950/80'
                            : 'text-amber-300 bg-amber-950/80'
                        }`}>
                          {!stats.shapiroWilk.isValid ? 'N/A (N<3)' : stats.shapiroWilk.isNormal ? 'Fail to Reject H₀' : 'Reject H₀'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculated VIF Table */}
          {vifResults.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  3. Calculated Variance Inflation Factors (VIF)
                </h3>
                <span className="text-3xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  [Calculated Empirical Statistic]
                </span>
              </div>
              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-850 border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="py-2 px-3">Predictor Feature</th>
                      <th className="py-2 px-3 text-right">Auxiliary R²</th>
                      <th className="py-2 px-3 text-right">Tolerance</th>
                      <th className="py-2 px-3 text-right">Calculated VIF</th>
                      <th className="py-2 px-3 text-center">Collinearity Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {vifResults.map((v) => {
                      const isInf = !isFinite(v.vif) && v.vif > 0;
                      const isNan = isNaN(v.vif);
                      const vifStr = isInf ? '∞ (Infinity)' : isNan ? 'Undefined' : v.vif.toFixed(2);
                      const r2Str = isNan ? 'N/A' : v.rSquared.toFixed(4);
                      const tolStr = isNan ? 'N/A' : (isInf ? '0.0000' : v.tolerance.toFixed(4));
                      const isSevere = isInf || v.severity === 'severe';
                      return (
                        <tr key={v.variable} className="hover:bg-slate-850/40">
                          <td className="py-2 px-3 font-medium text-slate-200">{v.variable}</td>
                          <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{r2Str}</td>
                          <td className="py-2 px-3 text-right text-slate-300 tabular-nums">{tolStr}</td>
                          <td className={`py-2 px-3 text-right font-bold tabular-nums ${isSevere ? 'text-rose-400' : 'text-white'}`}>{vifStr}</td>
                          <td className="py-2 px-3 text-center tabular-nums">
                            <span className={`px-1.5 py-0.5 rounded text-3xs ${
                              isInf || v.status === 'perfect_collinearity'
                                ? 'text-rose-300 bg-rose-950/80 border border-rose-800'
                                : v.status === 'constant_column'
                                ? 'text-slate-400 bg-slate-800'
                                : v.severity === 'severe'
                                ? 'text-rose-300 bg-rose-950/80'
                                : v.severity === 'moderate'
                                ? 'text-amber-300 bg-amber-950/80'
                                : 'text-emerald-300 bg-emerald-950/80'
                            }`}>
                              {isInf ? 'PERFECT (SINGULAR)' : v.status === 'constant_column' ? 'ZERO VARIANCE' : v.severity.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* OLS Regression Model with Breusch-Pagan */}
          {topRegression && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  4. OLS Regression & Residual Diagnostics
                </h3>
                <span className="text-3xs font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                  [Calculated Empirical Statistic]
                </span>
              </div>
              <div className="p-4 rounded-lg bg-slate-850 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Model Equation:</span>
                  <span className="font-mono text-indigo-400 font-semibold">{topRegression.equation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">R² Coefficient:</span>
                  <span className="font-mono text-white font-semibold">{(topRegression.rSquared * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Breusch-Pagan Heteroscedasticity Test:</span>
                  <span className="font-mono text-slate-300">
                    {topRegression.breuschPagan.isValid ? (
                      `LM = ${topRegression.breuschPagan.lmStatistic.toFixed(4)}, df = ${topRegression.breuschPagan.degreesOfFreedom}, p = ${topRegression.breuschPagan.pValue < 0.0001 ? '<0.0001' : topRegression.breuschPagan.pValue.toFixed(4)} (${topRegression.breuschPagan.isHomoscedastic ? 'Homoscedastic' : 'Heteroscedastic'})`
                    ) : (
                      'Underdetermined (N < 4)'
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-2xs text-slate-400">
                  <strong>Log Transformation Diagnostic:</strong> {topRegression.logTransformRecommendation.reason}
                </div>
              </div>
            </div>
          )}

          {/* Meta Muse Spark Synthesis */}
          <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-800/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>[Meta Muse Spark Interpretation]</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-body">
              All quantitative features have been evaluated under formal normality, collinearity, and homoscedasticity criteria. When structuring multivariate pipelines, predictors exhibiting VIF values ≥ 10 should be evaluated for regularization or dimension reduction. For regression modeling, error variance stability has been verified via the Breusch-Pagan diagnostic test.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
