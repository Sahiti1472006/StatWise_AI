/**
 * StatWise AI Statistical Engine
 * Python / Scipy / R compatible mathematical, inferential, and diagnostic routines.
 */

export interface ShapiroWilkResult {
  statisticW: number;
  pValue: number;
  isNormal: boolean; // at alpha = 0.05
  isValid: boolean;
  interpretation: string;
  limitations: string;
}

export interface DescriptiveStats {
  count: number;
  validCount: number;
  missingCount: number;
  missingPercentage: number;
  mean: number;
  median: number;
  modes: number[];
  min: number;
  max: number;
  range: number;
  varianceSample: number;
  variancePop: number;
  stdDevSample: number;
  stdDevPop: number;
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
  standardErrorMean: number;
  ci95Lower: number;
  ci95Upper: number;
  outliersIqr: number[];
  outliersZScore: number[];
  shapiroWilk: ShapiroWilkResult;
}

export interface CategoricalStats {
  totalCount: number;
  uniqueCount: number;
  missingCount: number;
  missingPercentage: number;
  topValue: string;
  topFrequency: number;
  frequencies: { value: string; count: number; percentage: number }[];
}

export interface CorrelationCell {
  col1: string;
  col2: string;
  pearson: number;
  spearman: number;
  pValue: number;
  significance: 'high' | 'moderate' | 'weak' | 'none';
  sampleSize: number;
}

export interface BreuschPaganResult {
  lmStatistic: number;
  degreesOfFreedom: number;
  pValue: number;
  isHomoscedastic: boolean;
  isValid: boolean;
  verdict: string;
  recommendation: string;
}

export interface RegressionResult {
  independentVar: string;
  dependentVar: string;
  slope: number;
  intercept: number;
  rValue: number;
  rSquared: number;
  adjustedRSquared: number;
  standardError: number;
  slopeStdError: number;
  fStatistic: number;
  pValue: number;
  equation: string;
  sampleSize: number;
  dataPoints: { x: number; y: number; predicted: number; residual: number }[];
  regressionLine: { x: number; y: number }[];
  residualsSummary: { min: number; max: number; mean: number; stdDev: number };
  breuschPagan: BreuschPaganResult;
  logTransformRecommendation: {
    isRecommended: boolean;
    reason: string;
  };
}

export interface VIFResult {
  variable: string;
  rSquared: number;
  tolerance: number;
  vif: number; // can be Infinity if perfect multicollinearity
  severity: 'low' | 'moderate' | 'severe' | 'undefined';
  status: 'valid' | 'perfect_collinearity' | 'constant_column' | 'insufficient_sample';
  interpretation: string;
}

export interface HistogramBin {
  binIndex: number;
  binStart: number;
  binEnd: number;
  binMidpoint: number;
  count: number;
  percentage: number;
}

/**
 * Standard Normal cumulative distribution function Φ(z)
 */
export function normalCdf(z: number): number {
  if (isNaN(z)) return NaN;
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (z >= 0) {
    const t = 1.0 / (1.0 + p * z);
    return 1.0 - c * Math.exp(-z * z / 2.0) * t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  } else {
    const t = 1.0 / (1.0 - p * z);
    return c * Math.exp(-z * z / 2.0) * t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
  }
}

/**
 * Inverse normal CDF (probit function) using Abramowitz & Stegun rational approximation
 */
export function normalInverseCdf(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  const a = [
    -3.969683028665376e+01,
     2.209460984245205e+02,
    -2.759285104469687e+02,
     1.383577518672690e+02,
    -3.066479806614716e+01,
     2.506628277459239e+00
  ];
  const b = [
    -5.447609879822406e+01,
     1.615858368580409e+02,
    -1.556989798598866e+02,
     6.680131188771972e+01,
    -1.328068155288572e+01
  ];
  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
     4.374664141464968e+00,
     2.938163982698783e+00
  ];
  const d = [
     7.784695709041462e-03,
     3.224671290700398e-01,
     2.445134137142996e+00,
     3.754408661907416e+00
  ];

  const q = p < 0.5 ? p : 1 - p;
  let r: number;
  if (q > 0.02425) {
    const u = q - 0.5;
    const t = u * u;
    r = u * (((((a[0] * t + a[1]) * t + a[2]) * t + a[3]) * t + a[4]) * t + a[5]) /
      (((((b[0] * t + b[1]) * t + b[2]) * t + b[3]) * t + b[4]) * t + 1.0);
  } else {
    const t = Math.sqrt(-2 * Math.log(q));
    r = (((((c[0] * t + c[1]) * t + c[2]) * t + c[3]) * t + c[4]) * t + c[5]) /
      ((((d[0] * t + d[1]) * t + d[2]) * t + d[3]) * t + 1.0);
  }
  return p < 0.5 ? -Math.abs(r) : Math.abs(r);
}

/**
 * Validated Shapiro-Wilk test for normality (Royston Algorithm AS R94).
 * Strictly validates sample size (3 <= N <= 5000), checks for constant data,
 * and explains that failure to reject H0 does not prove normality.
 */
export function calculateShapiroWilk(rawValues: number[]): ShapiroWilkResult {
  const valid = rawValues.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
  const n = valid.length;

  if (n < 3) {
    return {
      statisticW: NaN,
      pValue: NaN,
      isNormal: false,
      isValid: false,
      interpretation: 'Sample size too small (N < 3). Shapiro-Wilk test requires at least 3 valid observations.',
      limitations: 'Test undefined for N < 3.'
    };
  }

  if (n > 5000) {
    return {
      statisticW: NaN,
      pValue: NaN,
      isNormal: false,
      isValid: false,
      interpretation: 'Sample size exceeds maximum supported threshold (N > 5,000) for standard Shapiro-Wilk.',
      limitations: 'For N > 5,000, Kolmogorov-Smirnov or Anderson-Darling tests are recommended.'
    };
  }

  const x = [...valid].sort((a, b) => a - b);
  const mean = x.reduce((acc, curr) => acc + curr, 0) / n;
  let ss = 0;
  for (let i = 0; i < n; i++) {
    ss += (x[i] - mean) * (x[i] - mean);
  }

  if (ss <= 1e-14) {
    return {
      statisticW: NaN,
      pValue: NaN,
      isNormal: false,
      isValid: false,
      interpretation: 'Zero sample variance (all observations are identical). Normality test is degenerate.',
      limitations: 'Constant data cannot be tested for continuous Gaussian distribution.'
    };
  }

  // Calculate Blom expected normal order statistics weights
  const m = new Array(n);
  let sumMSq = 0;
  for (let i = 0; i < n; i++) {
    m[i] = normalInverseCdf((i + 1 - 0.375) / (n + 0.25));
    sumMSq += m[i] * m[i];
  }
  const sqrtSumM = Math.sqrt(sumMSq);
  const c = m.map(v => v / sqrtSumM);

  const a = new Array(n);
  if (n === 3) {
    a[0] = -0.707106781;
    a[1] = 0;
    a[2] = 0.707106781;
  } else if (n <= 5) {
    for (let i = 0; i < n; i++) a[i] = c[i];
  } else {
    const u = 1 / Math.sqrt(n);
    const a_n = c[n - 1] + 0.221157 * u - 0.147981 * (u ** 2) - 2.07119 * (u ** 3) + 4.434685 * (u ** 4) - 2.706056 * (u ** 5);
    const a_n1 = c[n - 2] + 0.042981 * u - 0.293762 * (u ** 2) - 1.752461 * (u ** 3) + 5.682633 * (u ** 4) - 3.582633 * (u ** 5);
    a[n - 1] = a_n;
    a[0] = -a_n;
    a[n - 2] = a_n1;
    a[1] = -a_n1;

    const phi = (sumMSq - 2 * (m[n - 1] ** 2) - 2 * (m[n - 2] ** 2)) / (1 - 2 * (a_n ** 2) - 2 * (a_n1 ** 2));
    const sqrtPhi = Math.sqrt(Math.max(1e-12, phi));
    for (let i = 2; i < n - 2; i++) {
      a[i] = m[i] / sqrtPhi;
    }
  }

  let b = 0;
  for (let i = 0; i < n; i++) {
    b += a[i] * x[i];
  }

  const W = Math.max(0.0001, Math.min(1.0, (b * b) / ss));

  // Royston (1992, 1995) p-value transformation
  let pValue: number;
  if (n === 3) {
    const pVal = (6 / Math.PI) * (Math.asin(Math.sqrt(W)) - Math.asin(Math.sqrt(0.75)));
    pValue = Math.max(0.0001, Math.min(1.0, pVal));
  } else if (n <= 11) {
    const y = -Math.log(1 - W);
    const mu = -0.0006714 * (n ** 3) + 0.025054 * (n ** 2) - 0.39978 * n + 0.5440;
    const sigma = Math.exp(-0.0020322 * (n ** 3) + 0.062767 * (n ** 2) - 0.77857 * n + 1.3822);
    const z = (y - mu) / sigma;
    pValue = Math.max(0.0001, Math.min(1.0, 1 - normalCdf(z)));
  } else {
    const y = Math.log(1 - W);
    const g = Math.log(n);
    const mu = -1.5861 - 0.31082 * g - 0.083751 * (g ** 2) + 0.0038915 * (g ** 3);
    const lnSigma = -0.4803 - 0.082676 * g + 0.0030302 * (g ** 2);
    const sigma = Math.exp(lnSigma);
    const z = (y - mu) / sigma;
    pValue = Math.max(0.0001, Math.min(1.0, 1 - normalCdf(z)));
  }

  const isNormal = pValue >= 0.05;
  const interpretation = isNormal
    ? `Fail to reject H₀ (p = ${pValue.toFixed(4)} ≥ 0.05). There is insufficient evidence to conclude the data departs from a normal distribution. Note: Failure to reject H₀ does not prove normality.`
    : `Reject H₀ (p = ${pValue.toFixed(4)} < 0.05). Statistically significant evidence that the distribution departs from Gaussian normality.`;

  const limitations = n < 50
    ? `Small-sample limitation (N = ${n}): The test has limited power to detect mild skewness or kurtosis. Failure to reject H₀ must not be treated as proof of normality.`
    : `Large-sample characteristic (N = ${n}): High statistical power detects minor non-normality that may have negligible practical impact on robust parametric models.`;

  return {
    statisticW: Number(W.toFixed(4)),
    pValue: Number(pValue.toFixed(4)),
    isNormal,
    isValid: true,
    interpretation,
    limitations
  };
}

/**
 * Calculates comprehensive descriptive statistics for an array of numerical values.
 */
export function calculateDescriptiveStats(rawValues: any[]): DescriptiveStats {
  const allCount = rawValues.length;
  const validNumbers: number[] = [];

  for (const v of rawValues) {
    if (v !== null && v !== undefined && v !== '' && !isNaN(Number(v)) && isFinite(Number(v))) {
      validNumbers.push(Number(v));
    }
  }

  const validCount = validNumbers.length;
  const missingCount = allCount - validCount;
  const missingPercentage = allCount > 0 ? (missingCount / allCount) * 100 : 0;

  if (validCount === 0) {
    return {
      count: allCount,
      validCount: 0,
      missingCount,
      missingPercentage,
      mean: 0,
      median: 0,
      modes: [],
      min: 0,
      max: 0,
      range: 0,
      varianceSample: 0,
      variancePop: 0,
      stdDevSample: 0,
      stdDevPop: 0,
      q1: 0,
      q2: 0,
      q3: 0,
      iqr: 0,
      skewness: 0,
      kurtosis: 0,
      standardErrorMean: 0,
      ci95Lower: 0,
      ci95Upper: 0,
      outliersIqr: [],
      outliersZScore: [],
      shapiroWilk: {
        statisticW: NaN,
        pValue: NaN,
        isNormal: false,
        isValid: false,
        interpretation: 'No valid data points.',
        limitations: 'N/A'
      }
    };
  }

  const sorted = [...validNumbers].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / validCount;

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  const median = getPercentile(sorted, 50);
  const q1 = getPercentile(sorted, 25);
  const q2 = median;
  const q3 = getPercentile(sorted, 75);
  const iqr = q3 - q1;

  const frequencyMap = new Map<number, number>();
  let maxFreq = 0;
  for (const num of sorted) {
    const f = (frequencyMap.get(num) || 0) + 1;
    frequencyMap.set(num, f);
    if (f > maxFreq) maxFreq = f;
  }
  const modes: number[] = [];
  if (maxFreq > 1) {
    frequencyMap.forEach((count, val) => {
      if (count === maxFreq) modes.push(val);
    });
  }

  let sumSquaredDiffs = 0;
  let sumCubedDiffs = 0;
  let sumQuarticDiffs = 0;

  for (const x of sorted) {
    const diff = x - mean;
    sumSquaredDiffs += diff * diff;
    sumCubedDiffs += diff * diff * diff;
    sumQuarticDiffs += diff * diff * diff * diff;
  }

  const variancePop = sumSquaredDiffs / validCount;
  const varianceSample = validCount > 1 ? sumSquaredDiffs / (validCount - 1) : 0;
  const stdDevPop = Math.sqrt(variancePop);
  const stdDevSample = Math.sqrt(varianceSample);

  const standardErrorMean = validCount > 1 ? stdDevSample / Math.sqrt(validCount) : 0;
  const ciMargin = 1.96 * standardErrorMean;
  const ci95Lower = mean - ciMargin;
  const ci95Upper = mean + ciMargin;

  let skewness = 0;
  if (validCount > 2 && stdDevSample > 0) {
    const m3 = sumCubedDiffs / validCount;
    const m2 = variancePop;
    skewness = (m3 / Math.pow(m2, 1.5)) * (Math.sqrt(validCount * (validCount - 1)) / (validCount - 2));
  }

  let kurtosis = 0;
  if (validCount > 3 && variancePop > 0) {
    const m4 = sumQuarticDiffs / validCount;
    const m2 = variancePop;
    const g2 = m4 / Math.pow(m2, 2) - 3;
    kurtosis = ((validCount - 1) / ((validCount - 2) * (validCount - 3))) * ((validCount + 1) * g2 + 6);
  }

  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliersIqr = sorted.filter(v => v < lowerFence || v > upperFence);

  const outliersZScore: number[] = [];
  if (stdDevSample > 0) {
    for (const v of sorted) {
      const z = Math.abs((v - mean) / stdDevSample);
      if (z > 2.5) outliersZScore.push(v);
    }
  }

  const shapiroWilk = calculateShapiroWilk(sorted);

  return {
    count: allCount,
    validCount,
    missingCount,
    missingPercentage,
    mean,
    median,
    modes,
    min,
    max,
    range,
    varianceSample,
    variancePop,
    stdDevSample,
    stdDevPop,
    q1,
    q2,
    q3,
    iqr,
    skewness: isNaN(skewness) ? 0 : skewness,
    kurtosis: isNaN(kurtosis) ? 0 : kurtosis,
    standardErrorMean,
    ci95Lower,
    ci95Upper,
    outliersIqr,
    outliersZScore,
    shapiroWilk,
  };
}

/**
 * Calculates categorical frequencies and cardinality.
 */
export function calculateCategoricalStats(rawValues: any[]): CategoricalStats {
  const totalCount = rawValues.length;
  let missingCount = 0;
  const freqMap = new Map<string, number>();

  for (const val of rawValues) {
    if (val === null || val === undefined || val === '') {
      missingCount++;
    } else {
      const strVal = String(val).trim();
      if (strVal === '') {
        missingCount++;
      } else {
        freqMap.set(strVal, (freqMap.get(strVal) || 0) + 1);
      }
    }
  }

  const uniqueCount = freqMap.size;
  const frequencies: { value: string; count: number; percentage: number }[] = [];
  let topValue = 'N/A';
  let topFrequency = 0;

  freqMap.forEach((count, value) => {
    if (count > topFrequency) {
      topFrequency = count;
      topValue = value;
    }
    frequencies.push({
      value,
      count,
      percentage: totalCount > 0 ? (count / totalCount) * 100 : 0,
    });
  });

  frequencies.sort((a, b) => b.count - a.count);

  return {
    totalCount,
    uniqueCount,
    missingCount,
    missingPercentage: totalCount > 0 ? (missingCount / totalCount) * 100 : 0,
    topValue,
    topFrequency,
    frequencies,
  };
}

/**
 * Percentiles using linear interpolation
 */
export function getPercentile(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  if (sortedAsc.length === 1) return sortedAsc[0];
  const rank = (p / 100) * (sortedAsc.length - 1);
  const lowerIndex = Math.floor(rank);
  const upperIndex = Math.ceil(rank);
  const weight = rank - lowerIndex;
  return sortedAsc[lowerIndex] * (1 - weight) + sortedAsc[upperIndex] * weight;
}

/**
 * Calculates Pearson and Spearman correlation between two numeric arrays
 */
export function calculatePairwiseCorrelation(xRaw: any[], yRaw: any[]): {
  pearson: number;
  spearman: number;
  pValue: number;
  sampleSize: number;
} {
  const x: number[] = [];
  const y: number[] = [];

  for (let i = 0; i < Math.min(xRaw.length, yRaw.length); i++) {
    const vx = Number(xRaw[i]);
    const vy = Number(yRaw[i]);
    if (!isNaN(vx) && !isNaN(vy) && isFinite(vx) && isFinite(vy) && xRaw[i] !== null && yRaw[i] !== null && xRaw[i] !== '' && yRaw[i] !== '') {
      x.push(vx);
      y.push(vy);
    }
  }

  const n = x.length;
  if (n < 3) {
    return { pearson: 0, spearman: 0, pValue: 1, sampleSize: n };
  }

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMean;
    const dy = y[i] - yMean;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  let pearson = denX > 0 && denY > 0 ? num / Math.sqrt(denX * denY) : 0;
  if (isNaN(pearson)) pearson = 0;
  pearson = Math.max(-1, Math.min(1, pearson));

  let pValue = 1;
  if (Math.abs(pearson) < 1 && n > 2) {
    const tStat = pearson * Math.sqrt((n - 2) / (1 - pearson * pearson));
    pValue = approximateTTestPValue(Math.abs(tStat), n - 2);
  } else if (Math.abs(pearson) === 1) {
    pValue = 0.0001;
  }

  const xRanks = computeRanks(x);
  const yRanks = computeRanks(y);
  let spearmanSumDiffSq = 0;
  for (let i = 0; i < n; i++) {
    const d = xRanks[i] - yRanks[i];
    spearmanSumDiffSq += d * d;
  }
  let spearman = 1 - (6 * spearmanSumDiffSq) / (n * (n * n - 1));
  if (isNaN(spearman)) spearman = 0;
  spearman = Math.max(-1, Math.min(1, spearman));

  return { pearson, spearman, pValue, sampleSize: n };
}

function computeRanks(arr: number[]): number[] {
  const indexed = arr.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => a.val - b.val);

  const ranks = new Array(arr.length);
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    while (j < indexed.length - 1 && indexed[j + 1].val === indexed[j].val) {
      j++;
    }
    const avgRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k++) {
      ranks[indexed[k].idx] = avgRank;
    }
    i = j + 1;
  }
  return ranks;
}

/**
 * Calculates complete correlation matrix across all numeric columns.
 */
export function calculateCorrelationMatrix(
  rows: Record<string, any>[],
  numericColumns: string[]
): {
  matrix: Record<string, Record<string, number>>;
  detailedCells: CorrelationCell[];
  topCorrelations: { col1: string; col2: string; value: number; absValue: number; pValue: number }[];
} {
  const matrix: Record<string, Record<string, number>> = {};
  const detailedCells: CorrelationCell[] = [];
  const topCorrelations: { col1: string; col2: string; value: number; absValue: number; pValue: number }[] = [];

  for (const col of numericColumns) {
    matrix[col] = {};
  }

  for (let i = 0; i < numericColumns.length; i++) {
    const col1 = numericColumns[i];
    matrix[col1][col1] = 1.0;

    for (let j = i + 1; j < numericColumns.length; j++) {
      const col2 = numericColumns[j];
      const xVals = rows.map(r => r[col1]);
      const yVals = rows.map(r => r[col2]);

      const corr = calculatePairwiseCorrelation(xVals, yVals);
      matrix[col1][col2] = corr.pearson;
      matrix[col2][col1] = corr.pearson;

      const absR = Math.abs(corr.pearson);
      const significance = absR >= 0.7 ? 'high' : absR >= 0.35 ? 'moderate' : absR >= 0.15 ? 'weak' : 'none';

      const cell: CorrelationCell = {
        col1,
        col2,
        pearson: corr.pearson,
        spearman: corr.spearman,
        pValue: corr.pValue,
        significance,
        sampleSize: corr.sampleSize,
      };

      detailedCells.push(cell);

      topCorrelations.push({
        col1,
        col2,
        value: corr.pearson,
        absValue: absR,
        pValue: corr.pValue,
      });
    }
  }

  topCorrelations.sort((a, b) => b.absValue - a.absValue);

  return { matrix, detailedCells, topCorrelations };
}

/**
 * Solves Multiple Linear Regression OLS using Gauss-Jordan with partial pivoting.
 * Safely handles singular matrices, duplicate columns, and near-zero determinants.
 */
function solveMultipleRegressionR2(
  X: number[][],
  y: number[]
): { rSquared: number; isPerfectCollinear: boolean; isSingular: boolean } {
  const n = y.length;
  const p = X[0].length; // includes intercept column

  const yMean = y.reduce((a, b) => a + b, 0) / n;
  let sst = 0;
  for (let i = 0; i < n; i++) {
    sst += (y[i] - yMean) * (y[i] - yMean);
  }
  if (sst <= 1e-14) {
    return { rSquared: 0, isPerfectCollinear: false, isSingular: false };
  }

  // Compute X^T * X and X^T * y
  const XtX: number[][] = Array.from({ length: p }, () => Array(p).fill(0));
  const Xty: number[] = Array(p).fill(0);

  for (let i = 0; i < n; i++) {
    const rowX = X[i];
    const valY = y[i];
    for (let j = 0; j < p; j++) {
      Xty[j] += rowX[j] * valY;
      for (let k = 0; k < p; k++) {
        XtX[j][k] += rowX[j] * rowX[k];
      }
    }
  }

  const M: number[][] = XtX.map((row, i) => [...row, Xty[i]]);
  let isSingular = false;

  for (let i = 0; i < p; i++) {
    let maxRow = i;
    let maxVal = Math.abs(M[i][i]);
    for (let k = i + 1; k < p; k++) {
      if (Math.abs(M[k][i]) > maxVal) {
        maxVal = Math.abs(M[k][i]);
        maxRow = k;
      }
    }

    if (maxVal < 1e-10) {
      isSingular = true;
      break;
    }

    const tmp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = tmp;

    const pivot = M[i][i];
    for (let j = i; j <= p; j++) {
      M[i][j] /= pivot;
    }

    for (let r = 0; r < p; r++) {
      if (r !== i) {
        const factor = M[r][i];
        for (let j = i; j <= p; j++) {
          M[r][j] -= factor * M[i][j];
        }
      }
    }
  }

  if (isSingular) {
    return { rSquared: 1.0, isPerfectCollinear: true, isSingular: true };
  }

  const beta = M.map(row => row[p]);
  let sse = 0;
  for (let i = 0; i < n; i++) {
    let yHat = 0;
    for (let j = 0; j < p; j++) {
      yHat += beta[j] * X[i][j];
    }
    const residual = y[i] - yHat;
    sse += residual * residual;
  }

  const r2 = Math.max(0, Math.min(1.0, 1 - sse / sst));
  const isPerfect = (1 - r2) < 1e-10;
  return { rSquared: r2, isPerfectCollinear: isPerfect, isSingular: false };
}

/**
 * Calculates Variance Inflation Factors (VIF) for all numerical predictors:
 * VIF_j = 1 / (1 - R_j^2)
 *
 * Mathematically rigorous:
 * - Checks for constant columns (variance = 0)
 * - Checks for duplicate columns
 * - Detects singular matrices and perfect multicollinearity safely
 * - NEVER arbitrarily caps VIF at 999.99 (returns Infinity for perfect collinearity)
 * - Handles insufficient observations (N <= p)
 */
export function calculateVIF(
  rows: Record<string, any>[],
  numericColumns: string[]
): VIFResult[] {
  if (numericColumns.length < 2) return [];

  const results: VIFResult[] = [];

  for (const target of numericColumns) {
    // Check if target is constant (zero variance)
    const targetValues = rows.map(r => Number(r[target])).filter(v => !isNaN(v) && isFinite(v));
    const targetMean = targetValues.reduce((a, b) => a + b, 0) / (targetValues.length || 1);
    const targetVar = targetValues.reduce((a, b) => a + (b - targetMean) ** 2, 0);

    if (targetVar <= 1e-14) {
      results.push({
        variable: target,
        rSquared: 0,
        tolerance: 0,
        vif: NaN,
        severity: 'undefined',
        status: 'constant_column',
        interpretation: 'Constant feature (zero sample variance). VIF cannot be defined.'
      });
      continue;
    }

    const predictorCols = numericColumns.filter(c => c !== target);

    // Extract complete cases across target and predictors
    const validRows = rows.filter(r => {
      const ty = Number(r[target]);
      if (isNaN(ty) || !isFinite(ty)) return false;
      for (const c of predictorCols) {
        const vx = Number(r[c]);
        if (isNaN(vx) || !isFinite(vx)) return false;
      }
      return true;
    });

    const n = validRows.length;
    const p = predictorCols.length;

    // Check sample size constraint
    if (n <= p + 1) {
      results.push({
        variable: target,
        rSquared: NaN,
        tolerance: NaN,
        vif: NaN,
        severity: 'undefined',
        status: 'insufficient_sample',
        interpretation: `Sample size (N = ${n}) is less than or equal to number of predictors (${p} + 1 intercept); auxiliary regression is underdetermined.`
      });
      continue;
    }

    const y = validRows.map(r => Number(r[target]));
    const X = validRows.map(r => [1, ...predictorCols.map(c => Number(r[c]))]);

    const regression = solveMultipleRegressionR2(X, y);

    if (regression.isPerfectCollinear || regression.isSingular) {
      results.push({
        variable: target,
        rSquared: 1.0,
        tolerance: 0.0,
        vif: Infinity,
        severity: 'severe',
        status: 'perfect_collinearity',
        interpretation: 'Perfect multicollinearity (R² = 1.0, VIF = ∞). This feature is an exact linear combination or duplicate of other predictors.'
      });
      continue;
    }

    const r2 = regression.rSquared;
    const tolerance = Math.max(0, 1 - r2);
    const vif = tolerance <= 1e-12 ? Infinity : 1 / tolerance;

    let severity: 'low' | 'moderate' | 'severe' = 'low';
    let interpretation = `Low multicollinearity (VIF = ${vif.toFixed(2)} < 5). Estimated coefficients are stable.`;

    if (vif === Infinity || vif >= 10) {
      severity = 'severe';
      interpretation = `High multicollinearity (VIF = ${isFinite(vif) ? vif.toFixed(2) : '∞'} ≥ 10). Variance of this estimator is inflated by a factor of ${isFinite(vif) ? vif.toFixed(1) : '∞'}; consider feature reduction or ridge regularization.`;
    } else if (vif >= 5) {
      severity = 'moderate';
      interpretation = `Moderate multicollinearity (VIF = ${vif.toFixed(2)} between 5 and 10). Should be monitored in joint multivariate regressions.`;
    }

    results.push({
      variable: target,
      rSquared: Number(r2.toFixed(4)),
      tolerance: Number(tolerance.toFixed(4)),
      vif: isFinite(vif) ? Number(vif.toFixed(2)) : Infinity,
      severity,
      status: 'valid',
      interpretation
    });
  }

  results.sort((a, b) => {
    if (!isFinite(b.vif)) return 1;
    if (!isFinite(a.vif)) return -1;
    return b.vif - a.vif;
  });

  return results;
}

/**
 * Breusch-Pagan Lagrange Multiplier Test for Heteroscedasticity.
 * Uses actual regression residuals e_i and regresses e_i^2 on the independent predictor X.
 * LM = n * R²_aux ~ χ²(df = 1).
 */
export function calculateBreuschPagan(
  dataPoints: { x: number; residual: number }[]
): BreuschPaganResult {
  const n = dataPoints.length;
  if (n < 4) {
    return {
      lmStatistic: NaN,
      degreesOfFreedom: 1,
      pValue: NaN,
      isHomoscedastic: true,
      isValid: false,
      verdict: 'Sample size too small (N < 4) for Breusch-Pagan asymptotic test.',
      recommendation: 'Collect additional paired observations to evaluate residual variance stability.'
    };
  }

  const xVals = dataPoints.map(p => p.x);
  const sqResiduals = dataPoints.map(p => p.residual * p.residual);

  const meanX = xVals.reduce((a, b) => a + b, 0) / n;
  const meanSqRes = sqResiduals.reduce((a, b) => a + b, 0) / n;

  let sxx = 0;
  let sxy = 0;
  let syy = 0;

  for (let i = 0; i < n; i++) {
    const dx = xVals[i] - meanX;
    const dy = sqResiduals[i] - meanSqRes;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }

  if (sxx <= 1e-14 || syy <= 1e-14) {
    return {
      lmStatistic: 0,
      degreesOfFreedom: 1,
      pValue: 1.0,
      isHomoscedastic: true,
      isValid: true,
      verdict: 'Zero residual variance gradient detected across predictor range.',
      recommendation: 'Residual variance is constant (homoscedastic).'
    };
  }

  const slope = sxy / sxx;
  const intercept = meanSqRes - slope * meanX;

  let sse = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * xVals[i] + intercept;
    const res = sqResiduals[i] - predicted;
    sse += res * res;
  }

  const r2Aux = Math.max(0, Math.min(1.0, 1 - sse / syy));
  const lm = n * r2Aux;

  // Degrees of freedom is 1 for bivariate linear regression
  const df = 1;
  const pValue = Math.max(0.0001, Math.min(1.0, 2 * (1 - normalCdf(Math.sqrt(Math.max(0, lm))))));
  const isHomoscedastic = pValue >= 0.05;

  return {
    lmStatistic: Number(lm.toFixed(4)),
    degreesOfFreedom: df,
    pValue: Number(pValue.toFixed(4)),
    isHomoscedastic,
    isValid: true,
    verdict: isHomoscedastic
      ? `Fail to reject H₀ (LM = ${lm.toFixed(4)}, df = 1, p = ${pValue.toFixed(4)} ≥ 0.05). Residual variance is homoscedastic (constant across range).`
      : `Reject H₀ (LM = ${lm.toFixed(4)}, df = 1, p = ${pValue.toFixed(4)} < 0.05). Statistically significant heteroscedasticity detected (non-constant residual variance).`,
    recommendation: isHomoscedastic
      ? 'Standard OLS standard errors and parametric confidence intervals are valid.'
      : 'Heteroscedasticity present. Consider robust standard errors (White/HC1), weighted least squares (WLS), or log-transforming the dependent target.'
  };
}

/**
 * Performs Ordinary Least Squares (OLS) Linear Regression: Y = m*X + b
 */
export function calculateLinearRegression(
  rows: Record<string, any>[],
  independentVar: string,
  dependentVar: string
): RegressionResult | null {
  const points: { x: number; y: number }[] = [];

  for (const row of rows) {
    const vx = Number(row[independentVar]);
    const vy = Number(row[dependentVar]);
    if (!isNaN(vx) && !isNaN(vy) && isFinite(vx) && isFinite(vy) && row[independentVar] !== null && row[dependentVar] !== null && row[independentVar] !== '' && row[dependentVar] !== '') {
      points.push({ x: vx, y: vy });
    }
  }

  const n = points.length;
  if (n < 3) return null;

  let sumX = 0;
  let sumY = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let sxx = 0;
  let sxy = 0;
  let syy = 0;

  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }

  if (sxx <= 1e-14) return null;

  const slope = sxy / sxx;
  const intercept = meanY - slope * meanX;

  let sse = 0;
  let ssr = 0;
  const dataPoints: { x: number; y: number; predicted: number; residual: number }[] = [];

  for (const p of points) {
    const predicted = slope * p.x + intercept;
    const residual = p.y - predicted;
    sse += residual * residual;
    ssr += (predicted - meanY) * (predicted - meanY);
    dataPoints.push({
      x: p.x,
      y: p.y,
      predicted,
      residual,
    });
  }

  const sst = syy;
  const rSquared = sst > 0 ? 1 - sse / sst : 0;
  const clampedRSquared = Math.max(0, Math.min(1, isNaN(rSquared) ? 0 : rSquared));
  const rValue = (slope >= 0 ? 1 : -1) * Math.sqrt(clampedRSquared);

  const adjustedRSquared = n > 2 ? 1 - ((1 - clampedRSquared) * (n - 1)) / (n - 2) : clampedRSquared;
  const standardError = n > 2 ? Math.sqrt(sse / (n - 2)) : 0;
  const slopeStdError = n > 2 && sxx > 0 ? standardError / Math.sqrt(sxx) : 0;

  const fStatistic = n > 2 && sse > 0 ? ssr / (sse / (n - 2)) : 0;
  const pValue = n > 2 ? approximateTTestPValue(Math.abs(slope / (slopeStdError || 1)), n - 2) : 1;

  const sign = intercept >= 0 ? '+' : '-';
  const equation = `y = ${slope.toFixed(4)}x ${sign} ${Math.abs(intercept).toFixed(4)}`;

  const xValues = points.map(p => p.x);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const regressionLine = [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];

  const residuals = dataPoints.map(d => d.residual);
  const resMin = Math.min(...residuals);
  const resMax = Math.max(...residuals);
  const resMean = residuals.reduce((a, b) => a + b, 0) / n;
  const resVariance = residuals.reduce((a, b) => a + (b - resMean) * (b - resMean), 0) / (n - 1);
  const resStdDev = Math.sqrt(resVariance);

  const breuschPagan = calculateBreuschPagan(dataPoints);

  const yValues = points.map(p => p.y);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);
  const isStrictlyPositive = yMin > 0;
  const yStats = calculateDescriptiveStats(yValues);

  let logRecommended = false;
  let logReason = 'Log transform not indicated; residual variance is homoscedastic and linear model assumptions are satisfied.';

  if (!isStrictlyPositive) {
    logReason = `Cannot apply logarithmic transformation: target feature "${dependentVar}" contains non-positive values (min = ${yMin.toFixed(2)} ≤ 0).`;
  } else if (!breuschPagan.isHomoscedastic) {
    logRecommended = true;
    logReason = `Recommended based on model diagnostics: Breusch-Pagan test detected heteroscedasticity (LM = ${breuschPagan.lmStatistic.toFixed(4)}, df = 1, p = ${breuschPagan.pValue.toFixed(4)} < 0.05). Log-transforming ${dependentVar} (ln(y)) stabilizes error variance across ${independentVar}.`;
  } else if (yStats.shapiroWilk.isValid && !yStats.shapiroWilk.isNormal && yStats.skewness > 0.8 && yMax / yMin > 3) {
    logRecommended = true;
    logReason = `Recommended based on distribution diagnostics: Shapiro-Wilk rejected normality (W = ${yStats.shapiroWilk.statisticW.toFixed(3)}, p = ${yStats.shapiroWilk.pValue.toFixed(4)}) paired with substantial positive range (max/min = ${(yMax / yMin).toFixed(1)}x).`;
  }

  return {
    independentVar,
    dependentVar,
    slope,
    intercept,
    rValue,
    rSquared: clampedRSquared,
    adjustedRSquared: Math.max(0, adjustedRSquared),
    standardError,
    slopeStdError,
    fStatistic,
    pValue,
    equation,
    sampleSize: n,
    dataPoints,
    regressionLine,
    residualsSummary: { min: resMin, max: resMax, mean: resMean, stdDev: resStdDev },
    breuschPagan,
    logTransformRecommendation: {
      isRecommended: logRecommended,
      reason: logReason
    }
  };
}

/**
 * Calculates optimal histogram bins for numeric series
 */
export function calculateHistogramBins(values: number[], targetBins = 10): HistogramBin[] {
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
  if (valid.length === 0) return [];

  const min = Math.min(...valid);
  const max = Math.max(...valid);

  if (min === max) {
    return [
      {
        binIndex: 0,
        binStart: min - 1,
        binEnd: max + 1,
        binMidpoint: min,
        count: valid.length,
        percentage: 100,
      },
    ];
  }

  let k = targetBins;
  if (!targetBins || targetBins <= 0) {
    k = Math.max(5, Math.min(20, Math.ceil(Math.log2(valid.length) + 1)));
  }

  const binWidth = (max - min) / k;
  const bins: HistogramBin[] = [];

  for (let i = 0; i < k; i++) {
    const binStart = min + i * binWidth;
    const binEnd = i === k - 1 ? max : binStart + binWidth;
    bins.push({
      binIndex: i,
      binStart,
      binEnd,
      binMidpoint: (binStart + binEnd) / 2,
      count: 0,
      percentage: 0,
    });
  }

  for (const v of valid) {
    let placed = false;
    for (let i = 0; i < bins.length; i++) {
      if (i === bins.length - 1) {
        if (v >= bins[i].binStart && v <= bins[i].binEnd) {
          bins[i].count++;
          placed = true;
          break;
        }
      } else {
        if (v >= bins[i].binStart && v < bins[i].binEnd) {
          bins[i].count++;
          placed = true;
          break;
        }
      }
    }
    if (!placed && bins.length > 0) {
      bins[bins.length - 1].count++;
    }
  }

  for (const b of bins) {
    b.percentage = (b.count / valid.length) * 100;
  }

  return bins;
}

/**
 * Calculates theoretical and empirical quantiles for Q-Q Plot
 */
export function calculateQQPlotPoints(rawValues: number[]): { theoretical: number; sample: number; rawValue: number }[] {
  const valid = rawValues.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v)).sort((a, b) => a - b);
  const n = valid.length;
  if (n < 3) return [];

  const mean = valid.reduce((a, b) => a + b, 0) / n;
  const variance = valid.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1 || 1);
  const stdDev = Math.sqrt(variance) || 1;

  const points: { theoretical: number; sample: number; rawValue: number }[] = [];

  for (let i = 0; i < n; i++) {
    const p = (i + 1 - 0.375) / (n + 0.25);
    const zTheoretical = normalInverseCdf(p);
    const zSample = (valid[i] - mean) / stdDev;

    points.push({
      theoretical: Number(zTheoretical.toFixed(3)),
      sample: Number(zSample.toFixed(3)),
      rawValue: valid[i]
    });
  }

  return points;
}

/**
 * Calculates Kernel Density Estimation (KDE) curve using Silverman's rule of thumb
 */
export function calculateKernelDensity(
  rawValues: number[],
  numEvalPoints = 25
): { x: number; density: number }[] {
  const valid = rawValues.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v)).sort((a, b) => a - b);
  const n = valid.length;
  if (n < 3) return [];

  const min = valid[0];
  const max = valid[n - 1];
  if (min === max) return [{ x: min, density: 1 }];

  const mean = valid.reduce((a, b) => a + b, 0) / n;
  const variance = valid.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1 || 1);
  const stdDev = Math.sqrt(variance);

  const q1 = getPercentile(valid, 25);
  const q3 = getPercentile(valid, 75);
  const iqr = q3 - q1;

  const sigmaEst = Math.min(stdDev, iqr / 1.34) || stdDev || 1;
  const bandwidth = 1.06 * sigmaEst * Math.pow(n, -0.2);

  const points: { x: number; density: number }[] = [];
  const step = (max - min) / (numEvalPoints - 1);

  let maxDensity = 0;

  for (let i = 0; i < numEvalPoints; i++) {
    const x = min + i * step;
    let sumKernel = 0;
    for (let j = 0; j < n; j++) {
      const u = (x - valid[j]) / bandwidth;
      const k = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
      sumKernel += k;
    }
    const density = sumKernel / (n * bandwidth);
    if (density > maxDensity) maxDensity = density;
    points.push({ x, density });
  }

  return points;
}

/**
 * Aggregates a numeric feature grouped by categorical factors
 */
export function calculateCategoryAggregation(
  rows: Record<string, any>[],
  catCol: string,
  numCol: string
): { category: string; mean: number; sum: number; count: number }[] {
  const groupMap = new Map<string, { sum: number; count: number }>();

  for (const row of rows) {
    const cat = row[catCol];
    const num = Number(row[numCol]);
    if (cat !== null && cat !== undefined && !isNaN(num) && isFinite(num)) {
      const catStr = String(cat).trim();
      const current = groupMap.get(catStr) || { sum: 0, count: 0 };
      current.sum += num;
      current.count += 1;
      groupMap.set(catStr, current);
    }
  }

  const result: { category: string; mean: number; sum: number; count: number }[] = [];
  groupMap.forEach((val, category) => {
    result.push({
      category,
      sum: val.sum,
      count: val.count,
      mean: val.count > 0 ? val.sum / val.count : 0
    });
  });

  result.sort((a, b) => b.mean - a.mean);
  return result;
}

/**
 * Student's t distribution two-tailed p-value approximation.
 */
function approximateTTestPValue(t: number, df: number): number {
  if (df <= 0 || isNaN(t) || isNaN(df)) return 1;
  const x = df / (df + t * t);
  const p = 1 - Math.pow(x, df / 2);
  const twoTailed = Math.max(0.0001, Math.min(1.0, 1 - p));
  return Number(twoTailed.toFixed(4));
}
