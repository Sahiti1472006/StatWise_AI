import React, { useState, useMemo } from 'react';
import { ArrowRight, Calculator, Sparkles, TrendingUp, Info, Activity, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ParsedDataset } from '../utils/dataParser';
import { calculateLinearRegression, RegressionResult } from '../utils/statistics';

interface RegressionStudioProps {
  dataset: ParsedDataset;
  initialVarX?: string;
  initialVarY?: string;
  onAskMuseAboutRegression?: (regression: RegressionResult) => void;
}

export const RegressionStudio: React.FC<RegressionStudioProps> = ({
  dataset,
  initialVarX,
  initialVarY,
  onAskMuseAboutRegression,
}) => {
  const numCols = dataset.numericColumns;

  const [varX, setVarX] = useState<string>(
    initialVarX && numCols.includes(initialVarX)
      ? initialVarX
      : numCols[0] || ''
  );
  const [varY, setVarY] = useState<string>(
    initialVarY && numCols.includes(initialVarY)
      ? initialVarY
      : numCols[1] || numCols[0] || ''
  );

  const [activePlotTab, setActivePlotTab] = useState<'fit' | 'residuals'>('fit');
  const [predictionInput, setPredictionInput] = useState<string>('');

  const regression: RegressionResult | null = useMemo(() => {
    if (!varX || !varY || varX === varY) return null;
    return calculateLinearRegression(dataset.rows, varX, varY);
  }, [dataset.rows, varX, varY]);

  React.useEffect(() => {
    if (regression && regression.dataPoints.length > 0 && !predictionInput) {
      const avgX = regression.dataPoints.reduce((acc, p) => acc + p.x, 0) / regression.dataPoints.length;
      setPredictionInput(avgX.toFixed(1));
    }
  }, [regression]);

  const predictedOutput = useMemo(() => {
    if (!regression) return null;
    const num = parseFloat(predictionInput);
    if (isNaN(num)) return null;
    const yHat = regression.slope * num + regression.intercept;
    const margin = 1.96 * regression.standardError;
    return {
      prediction: yHat,
      lower: yHat - margin,
      upper: yHat + margin,
    };
  }, [regression, predictionInput]);

  if (numCols.length < 2) {
    return (
      <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center">
        <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-white mb-1">
          At Least Two Continuous Variables Required
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Ordinary Least Squares regression requires both an independent predictor (X) and a continuous dependent target (Y).
        </p>
      </div>
    );
  }

  // Scatter plot SVG dimensions
  const svgWidth = 560;
  const svgHeight = 320;
  const padding = { top: 24, right: 30, bottom: 44, left: 60 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  let minX = 0, maxX = 1, minY = 0, maxY = 1;
  let minRes = -1, maxRes = 1, minFit = 0, maxFit = 1;

  if (regression && regression.dataPoints.length > 0) {
    const xs = regression.dataPoints.map(p => p.x);
    const ys = regression.dataPoints.map(p => p.y);
    const res = regression.dataPoints.map(p => p.residual);
    const preds = regression.dataPoints.map(p => p.predicted);

    minX = Math.min(...xs);
    maxX = Math.max(...xs);
    minY = Math.min(...ys);
    maxY = Math.max(...ys);

    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    minX -= spanX * 0.08;
    maxX += spanX * 0.08;
    minY -= spanY * 0.08;
    maxY += spanY * 0.08;

    minFit = Math.min(...preds);
    maxFit = Math.max(...preds);
    const maxAbsRes = Math.max(...res.map(r => Math.abs(r)), 1) * 1.15;
    minRes = -maxAbsRes;
    maxRes = maxAbsRes;
  }

  const scaleX = (val: number) => padding.left + ((val - minX) / (maxX - minX || 1)) * innerWidth;
  const scaleY = (val: number) => padding.top + innerHeight - ((val - minY) / (maxY - minY || 1)) * innerHeight;

  const scaleFitX = (val: number) => padding.left + ((val - minFit) / (maxFit - minFit || 1)) * innerWidth;
  const scaleResY = (val: number) => padding.top + innerHeight - ((val - minRes) / (maxRes - minRes || 1)) * innerHeight;

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            OLS Regression & Residual Diagnostics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Parametric linear estimation, Breusch-Pagan heteroscedasticity test, and residual variance diagnostics
          </p>
        </div>

        {/* Feature Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Predictor (X):</span>
            <select
              value={varX}
              onChange={(e) => setVarX(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {numCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Target (Y):</span>
            <select
              value={varY}
              onChange={(e) => setVarY(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {numCols.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {varX === varY ? (
        <div className="p-6 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs">
          Please select two different variables for Predictor (X) and Target (Y). Currently both are set to "{varX}".
        </div>
      ) : regression ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scatter Plot / Residual Plot (7 cols) */}
          <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {activePlotTab === 'fit' ? 'Bivariate Scatter & Fitted Line' : 'Residuals vs. Fitted Values'}
                </h3>
                <p className="text-2xs text-slate-400">
                  {activePlotTab === 'fit'
                    ? `${regression.sampleSize} valid paired observations`
                    : 'Check homoscedasticity: residuals should scatter randomly around 0'}
                </p>
              </div>

              {/* Plot Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700 text-xs">
                <button
                  onClick={() => setActivePlotTab('fit')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    activePlotTab === 'fit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fitted Line
                </button>
                <button
                  onClick={() => setActivePlotTab('residuals')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    activePlotTab === 'residuals' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Residuals Plot
                </button>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="w-full flex justify-center overflow-x-auto">
              {activePlotTab === 'fit' ? (
                /* 1. Fitted Line Plot */
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full max-w-xl h-auto select-none"
                >
                  {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                    const y = padding.top + innerHeight * pct;
                    const x = padding.left + innerWidth * pct;
                    return (
                      <g key={idx}>
                        <line
                          x1={padding.left}
                          y1={y}
                          x2={padding.left + innerWidth}
                          y2={y}
                          stroke="#1e293b"
                          strokeDasharray="3,3"
                        />
                        <line
                          x1={x}
                          y1={padding.top}
                          x2={x}
                          y2={padding.top + innerHeight}
                          stroke="#1e293b"
                          strokeDasharray="3,3"
                        />
                      </g>
                    );
                  })}

                  {/* Regression Line */}
                  {regression.regressionLine.length === 2 && (
                    <line
                      x1={scaleX(regression.regressionLine[0].x)}
                      y1={scaleY(regression.regressionLine[0].y)}
                      x2={scaleX(regression.regressionLine[1].x)}
                      y2={scaleY(regression.regressionLine[1].y)}
                      stroke="#818cf8"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Data Points */}
                  {regression.dataPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={scaleX(pt.x)}
                      cy={scaleY(pt.y)}
                      r="4"
                      className="fill-indigo-500/80 stroke-slate-900 stroke-1 hover:fill-amber-400 hover:r-6 transition-all cursor-pointer"
                    >
                      <title>{`X (${varX}): ${pt.x}\nY (${varY}): ${pt.y}\nResidual: ${pt.residual.toFixed(3)}`}</title>
                    </circle>
                  ))}

                  <text
                    x={padding.left + innerWidth / 2}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="fill-slate-400 text-2xs font-mono"
                  >
                    Predictor (X): {varX}
                  </text>
                  <text
                    x={16}
                    y={padding.top + innerHeight / 2}
                    textAnchor="middle"
                    transform={`rotate(-90 16 ${padding.top + innerHeight / 2})`}
                    className="fill-slate-400 text-2xs font-mono"
                  >
                    Target (Y): {varY}
                  </text>
                </svg>
              ) : (
                /* 2. Residuals vs. Fitted Plot */
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full max-w-xl h-auto select-none"
                >
                  {/* Zero reference line */}
                  <line
                    x1={padding.left}
                    y1={scaleResY(0)}
                    x2={padding.left + innerWidth}
                    y2={scaleResY(0)}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={padding.left - 6}
                    y={scaleResY(0) + 3}
                    textAnchor="end"
                    className="fill-rose-400 text-3xs font-mono"
                  >
                    0
                  </text>

                  {/* Points */}
                  {regression.dataPoints.map((pt, idx) => (
                    <circle
                      key={idx}
                      cx={scaleFitX(pt.predicted)}
                      cy={scaleResY(pt.residual)}
                      r="4"
                      className={`stroke-slate-900 stroke-1 hover:r-6 transition-all cursor-pointer ${
                        pt.residual >= 0 ? 'fill-sky-400/80' : 'fill-amber-400/80'
                      }`}
                    >
                      <title>{`Fitted (ŷ): ${pt.predicted.toFixed(2)}\nResidual (e): ${pt.residual.toFixed(3)}`}</title>
                    </circle>
                  ))}

                  <text
                    x={padding.left + innerWidth / 2}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    className="fill-slate-400 text-2xs font-mono"
                  >
                    Fitted Values (ŷ)
                  </text>
                  <text
                    x={16}
                    y={padding.top + innerHeight / 2}
                    textAnchor="middle"
                    transform={`rotate(-90 16 ${padding.top + innerHeight / 2})`}
                    className="fill-slate-400 text-2xs font-mono"
                  >
                    Residuals (e = y - ŷ)
                  </text>
                </svg>
              )}
            </div>

            {/* Breusch-Pagan Test Callout Card */}
            <div className="p-4 rounded-xl bg-slate-850 border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Breusch-Pagan Heteroscedasticity Test (Koenker LM)</span>
                  <span className="text-3xs font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                    [Calculated Empirical Statistic]
                  </span>
                </div>
                <div className="text-2xs font-mono text-indigo-300">
                  {regression.breuschPagan.isValid ? (
                    <>LM = {regression.breuschPagan.lmStatistic.toFixed(4)}, df = {regression.breuschPagan.degreesOfFreedom}, p = {regression.breuschPagan.pValue < 0.0001 ? '<0.0001' : regression.breuschPagan.pValue.toFixed(4)}</>
                  ) : (
                    <span className="text-slate-500">Underdetermined (N &lt; 4 required)</span>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-300 font-body">
                <strong>Verdict:</strong> {regression.breuschPagan.verdict}
              </div>
              <div className="text-2xs text-slate-400 font-body">
                <strong>Empirical Diagnostic:</strong> {regression.breuschPagan.recommendation}
              </div>
            </div>
          </div>

          {/* Model Statistics & Predictor Simulator (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Model Metrics Card */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">OLS Model Parameters</h3>
                  <span className="text-3xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">
                    [Calculated Empirical Statistic]
                  </span>
                </div>
                <span className="text-2xs font-mono text-indigo-300 font-semibold">{regression.equation}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <div className="text-2xs text-slate-400 uppercase">R² (Variance Explained)</div>
                  <div className="text-lg font-bold font-mono text-indigo-400 tabular-nums">
                    {(regression.rSquared * 100).toFixed(2)}%
                  </div>
                  <div className="text-3xs text-slate-500 font-mono">
                    Adj R²: {(regression.adjustedRSquared * 100).toFixed(2)}%
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <div className="text-2xs text-slate-400 uppercase">Slope (m)</div>
                  <div className="text-lg font-bold font-mono text-white tabular-nums">
                    {regression.slope.toFixed(4)}
                  </div>
                  <div className="text-3xs text-slate-500 font-mono">
                    SE: ±{regression.slopeStdError.toFixed(4)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <div className="text-2xs text-slate-400 uppercase">Intercept (b)</div>
                  <div className="text-base font-bold font-mono text-white tabular-nums">
                    {regression.intercept.toFixed(4)}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-850 border border-slate-800">
                  <div className="text-2xs text-slate-400 uppercase">Standard Error (Se)</div>
                  <div className="text-base font-bold font-mono text-indigo-300 tabular-nums">
                    {regression.standardError.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Log-Transformation Diagnostic Card */}
              <div className={`p-3 rounded-lg border text-xs space-y-1 ${
                regression.logTransformRecommendation.isRecommended
                  ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                  : 'bg-slate-850 border-slate-800 text-slate-300'
              }`}>
                <div className="font-semibold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Log-Transformation Assessment (Model & Distribution Grounded)</span>
                </div>
                <p className="text-2xs opacity-90 leading-relaxed font-body">
                  {regression.logTransformRecommendation.reason}
                </p>
              </div>

              {/* AI-Generated Interpretation Notice */}
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/60 space-y-1.5">
                <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-2xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>[Meta Muse Spark Interpretation]</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-body">
                  For every 1.0 unit increment in <span className="font-mono text-white">{varX}</span>, the target <span className="font-mono text-white">{varY}</span> is predicted to change by <span className="font-mono text-indigo-300 font-semibold">{regression.slope >= 0 ? '+' : ''}{regression.slope.toFixed(4)}</span> units with an explanatory power of <span className="font-mono text-white">{(regression.rSquared * 100).toFixed(1)}%</span>.
                </p>
              </div>

              {onAskMuseAboutRegression && (
                <button
                  onClick={() => onAskMuseAboutRegression(regression)}
                  className="w-full py-2 px-3 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Consult Meta Muse Spark on Regression</span>
                </button>
              )}
            </div>

            {/* Interactive Prediction Simulator */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Live Prediction Simulator</h3>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                Input any test value for <span className="font-mono text-slate-300">{varX}</span> to compute ŷ.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-2xs text-slate-400 mb-1">
                    Enter {varX} Value:
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={predictionInput}
                    onChange={(e) => setPredictionInput(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {predictedOutput && (
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/80">
                    <div className="text-2xs text-indigo-300 uppercase">Predicted {varY} (ŷ)</div>
                    <div className="text-xl font-bold font-mono text-white tabular-nums my-0.5">
                      {predictedOutput.prediction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                    </div>
                    <div className="text-2xs text-slate-400 font-mono tabular-nums">
                      95% Prediction Interval: [{predictedOutput.lower.toFixed(2)}, {predictedOutput.upper.toFixed(2)}]
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
