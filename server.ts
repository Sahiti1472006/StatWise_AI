import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Official Meta Model API Configuration
const MODEL_API_KEY = process.env.MODEL_API_KEY || process.env.META_API_KEY || '';
const META_BASE_URL = process.env.META_BASE_URL || 'https://api.meta.ai/v1';
const MODEL_ID = process.env.MODEL_ID || 'muse-spark-1.3';

// Initialize official OpenAI-compatible SDK for Meta Model API
let metaClient: OpenAI | null = null;
const isKeyConfigured = Boolean(MODEL_API_KEY && MODEL_API_KEY.trim().length > 0);

if (isKeyConfigured) {
  metaClient = new OpenAI({
    apiKey: MODEL_API_KEY,
    baseURL: META_BASE_URL,
  });
}

// Status endpoint: Reports whether Meta Muse Spark is running via live API key or in Demo Mode
app.get('/api/model/status', (req, res) => {
  const isLive = Boolean(metaClient && MODEL_API_KEY && MODEL_API_KEY.trim().length > 0);
  res.json({
    model: 'Meta Muse Spark',
    modelId: MODEL_ID,
    isLive,
    mode: isLive ? 'live' : 'demo',
    baseURL: META_BASE_URL,
    endpoint: '/chat/completions',
    envKeyConfigured: isLive,
    supportedModels: [
      { id: 'muse-spark-1.3', name: 'Meta Muse Spark 1.3', description: 'Advanced quantitative reasoning & statistical synthesis' },
      { id: 'muse-spark-open', name: 'Meta Muse Spark Open', description: 'Open-weights quantitative engine' },
      { id: 'muse-wonder', name: 'Meta Muse Wonder', description: 'Multi-modal exploratory analytics' },
      { id: 'muse-code', name: 'Meta Muse Code', description: 'Data science script & SQL generation' }
    ],
    features: [
      'Statistical Hypothesis Interpretation',
      'Correlation & Multicollinearity Analysis',
      'Ordinary Least Squares Regression Explanations',
      'Anomaly & Outlier Detection Strategy',
      'Data-to-Action Executive Synthesis'
    ]
  });
});

// Chat endpoint powered by Meta Muse Spark (live Meta Model API or clearly distinguished Demo Mode)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, datasetSummary, statisticalContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const latestUserMessage = messages[messages.length - 1].content || '';

    // LIVE META MODEL API CALL via OpenAI-compatible SDK
    if (metaClient && MODEL_API_KEY && MODEL_API_KEY.trim().length > 0) {
      try {
        const systemPrompt = `You are Meta Muse Spark (${MODEL_ID}), Meta's flagship quantitative reasoning and statistical analysis model.
You are embedded in StatWise AI, analyzing the user's uploaded dataset.

Dataset Context:
- Rows: ${datasetSummary?.rowCount ?? 'N/A'}, Columns: ${datasetSummary?.columnCount ?? 'N/A'}
- Numeric Columns: ${datasetSummary?.numericColumns?.join(', ') ?? 'None'}
- Categorical Columns: ${datasetSummary?.categoricalColumns?.join(', ') ?? 'None'}
- Missing Values: ${datasetSummary?.totalMissing ?? 0} cells missing

Empirical Statistical Summary:
${JSON.stringify(statisticalContext || {}, null, 2)}

Strict Grounding & Presentation Requirements:
1. Ground all quantitative claims strictly on the provided Dataset Context and Empirical Statistical Summary. Do NOT invent data values, column names, or causal origins (never attribute outliers or patterns to imaginary hardware servers, nodes, or network queues).
2. If specific metrics or tests are unavailable or underdetermined (e.g., sample size N < 3 for Shapiro-Wilk or N < 4 for Breusch-Pagan), explicitly state so.
3. Structure your response into two distinct sections:
   #### [Calculated Empirical Statistic]
   (Report exact calculated values, p-values, degrees of freedom, VIFs, and test statistics)
   #### [Meta Muse Spark Interpretation]
   (Provide domain guidance, methodology caveats, and contextual meaning)
4. Methodological accuracy:
   - For Shapiro-Wilk normality: Failure to reject H₀ (p ≥ 0.05) does NOT prove normality; it merely indicates insufficient sample evidence to reject Gaussian behavior.
   - For Multicollinearity: Never claim multicollinearity without supporting calculated correlation and VIF results (VIF ≥ 5 or ≥ 10).
   - For Heteroscedasticity: Report Breusch-Pagan test statistic LM and degrees of freedom (df = 1); explain heteroscedasticity only when supported by p < 0.05.`;

        const formattedMessages = [
          { role: 'system' as const, content: systemPrompt },
          ...messages.map((m: any) => ({
            role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: String(m.content || ''),
          }))
        ];

        // Call official /chat/completions endpoint using the OpenAI SDK
        const completion = await metaClient.chat.completions.create({
          model: MODEL_ID,
          messages: formattedMessages,
          temperature: 0.2,
          max_tokens: 1500,
        });

        const reply = completion.choices?.[0]?.message?.content || 'Analysis generated successfully.';
        return res.json({
          reply,
          isLive: true,
          source: 'meta-muse-spark-live',
          model: `Meta Muse Spark (${MODEL_ID})`,
          provider: 'Meta Model API (Live)'
        });
      } catch (apiError: any) {
        console.error('Meta Model API request error:', apiError);
        // Do not pretend it succeeded if the API call failed; return explicit error message
        return res.status(502).json({
          error: `Meta Model API error (${apiError.status || apiError.name || 'API Request Failed'}): ${apiError.message}`,
          isLive: false,
          model: MODEL_ID,
          details: 'Check MODEL_API_KEY validity or network access to https://api.meta.ai/v1'
        });
      }
    }

    // DEMO MODE (Explicitly labeled, clearly distinguished from live Meta API)
    const reply = generateMuseSparkDatasetResponse(latestUserMessage, datasetSummary, statisticalContext);

    return res.json({
      reply,
      isLive: false,
      source: 'meta-muse-spark-demo',
      model: `Meta Muse Spark (${MODEL_ID} · Demo Mode)`,
      provider: 'StatWise Analytical Engine (Demo Mode)'
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ error: 'Failed to process request: ' + error.message });
  }
});

// Automated Insights Generator endpoint
app.post('/api/generate-insights', (req, res) => {
  try {
    const { datasetSummary, correlations, regressions } = req.body;
    const isLive = Boolean(metaClient && MODEL_API_KEY && MODEL_API_KEY.trim().length > 0);
    const insights = generateStructuredInsights(datasetSummary, correlations, regressions);
    res.json({
      insights,
      isLive,
      model: isLive ? `Meta Muse Spark (${MODEL_ID})` : `Meta Muse Spark (${MODEL_ID} · Demo Mode)`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Intelligent dataset-grounded reasoning engine for Meta Muse Spark.
 * Performs rigorous analytical reasoning strictly based on calculated dataset parameters.
 * Clearly separates [Calculated Empirical Statistic] from [Meta Muse Spark Interpretation].
 */
function generateMuseSparkDatasetResponse(
  query: string,
  summary: any,
  stats: any
): string {
  const q = query.toLowerCase();
  const rowCount = summary?.rowCount ?? 0;
  const colCount = summary?.columnCount ?? 0;
  const numCols = summary?.numericColumns || [];
  const catCols = summary?.categoricalColumns || [];
  const corrList = stats?.topCorrelations || [];
  const regression = stats?.activeRegression;

  // 1. Regression & Heteroscedasticity inquiry
  if (q.includes('regression') || q.includes('slope') || q.includes('predict') || q.includes('r2') || q.includes('heteroscedastic') || q.includes('breusch')) {
    if (regression && regression.independentVar && regression.dependentVar) {
      const r2Percent = (regression.rSquared * 100).toFixed(2);
      const direction = regression.slope >= 0 ? 'increase' : 'decrease';
      const bp = regression.breuschPagan;
      const logDiag = regression.logTransformRecommendation;

      let bpEmpirical = 'Calculated in Regression Studio';
      let bpInterp = 'Residual variance diagnostics available in Regression Studio.';
      if (bp) {
        if (!bp.isValid) {
          bpEmpirical = 'Breusch-Pagan test underdetermined (insufficient degrees of freedom, N < 4 required).';
          bpInterp = 'Sample size is insufficient to reliably test heteroscedasticity.';
        } else {
          bpEmpirical = `LM statistic = \`${bp.lmStatistic.toFixed(4)}\`, degrees of freedom df = \`${bp.degreesOfFreedom || 1}\`, p-value = \`${bp.pValue < 0.0001 ? '< 0.0001' : bp.pValue.toFixed(4)}\` (${bp.isHomoscedastic ? 'Homoscedastic, p ≥ 0.05' : 'Heteroscedastic, p < 0.05'})`;
          bpInterp = bp.isHomoscedastic
            ? 'Calculated Breusch-Pagan p-value (p ≥ 0.05) fails to reject the homoscedasticity null hypothesis. Residual variance appears constant.'
            : 'Calculated Breusch-Pagan p-value (p < 0.05) rejects homoscedasticity. Standard errors may be biased; consider robust standard errors (HC1) or log transformation.';
        }
      }

      return `### Meta Muse Spark · OLS Regression & Diagnostic Synthesis

#### [Calculated Empirical Statistic]
- **Model Equation:** \`${regression.dependentVar} = ${regression.slope.toFixed(4)} × ${regression.independentVar} + (${regression.intercept.toFixed(4)})\`
- **Coefficient of Determination ($R^2$):** \`${regression.rSquared.toFixed(4)}\` (${r2Percent}% of variance in ${regression.dependentVar} is explained by ${regression.independentVar}).
- **Slope ($m$):** \`${regression.slope.toFixed(4)}\` (Standard Error: \`±${regression.slopeStdError ? regression.slopeStdError.toFixed(4) : 'N/A'}\`).
- **Standard Error of Estimate ($S_e$):** \`${regression.standardError ? regression.standardError.toFixed(4) : 'N/A'}\`
- **Breusch-Pagan Heteroscedasticity Test:** ${bpEmpirical}
- **Log Transformation Assessment:** ${logDiag ? logDiag.reason : 'Evaluated via model residuals'}.

#### [Meta Muse Spark Interpretation]
- **Parameter Sensitivity:** For each 1.0 unit increment in **${regression.independentVar}**, the conditional expectation of **${regression.dependentVar}** changes by **${direction === 'increase' ? '+' : '-'}${Math.abs(regression.slope).toFixed(4)}**.
- **Variance Quality:** ${bpInterp}
- **Predictive Power:** With $R^2 = ${r2Percent}\\%$, the linear approximation ${regression.rSquared > 0.5 ? 'captures the primary systematic trend' : 'explains moderate variance; non-linear terms or multivariate expansion may improve fit'}.`;
    }

    return `### Meta Muse Spark · Regression Studio Guide
To run an Ordinary Least Squares (OLS) regression, open the **Regression Studio** tab and choose your independent predictor ($X$) and target ($Y$) from continuous features: ${numCols.join(', ')}.
The platform computes the exact equation, $R^2$, residual plot, and Breusch-Pagan test for heteroscedasticity.`;
  }

  // 2. Correlation & Multicollinearity inquiry
  if (q.includes('correlation') || q.includes('relationship') || q.includes('multicollinear') || q.includes('vif') || q.includes('collinear')) {
    const vifList = stats?.vifResults || [];
    if (corrList.length > 0 || vifList.length > 0) {
      const top3 = corrList.slice(0, 4);
      const corrLines = top3.map((c: any) => {
        const pStr = c.pValue < 0.001 ? '< 0.001' : `= ${c.pValue.toFixed(4)}`;
        return `- **${c.col1} ↔ ${c.col2}**: Pearson \`r = ${c.value.toFixed(4)}\` (R² = ${(c.value * c.value * 100).toFixed(1)}%, p ${pStr})`;
      }).join('\n');

      const vifLines = vifList.length > 0
        ? vifList.slice(0, 5).map((v: any) => {
            const vifStr = v.vif === 'Infinity' || !isFinite(v.vif) ? '∞ (Infinity)' : isNaN(v.vif) ? 'Undefined' : Number(v.vif).toFixed(2);
            return `- **${v.variable}**: VIF = \`${vifStr}\` (Tolerance = \`${v.tolerance !== null ? Number(v.tolerance).toFixed(4) : 'N/A'}\`, Level: ${v.status === 'constant_column' ? 'Zero Variance' : v.severity?.toUpperCase() || 'N/A'})`;
          }).join('\n')
        : '- *VIF calculations available in Correlation Matrix tab.*';

      const severeVifs = vifList.filter((v: any) => v.vif === 'Infinity' || (!isNaN(v.vif) && Number(v.vif) >= 10));

      return `### Meta Muse Spark · Empirical Correlation & Collinearity Analysis

#### [Calculated Empirical Statistic]
${corrLines || 'No pairwise correlations calculated.'}

**Calculated Variance Inflation Factors (VIF):**
${vifLines}

#### [Meta Muse Spark Interpretation]
- **Multicollinearity Verdict:** Assertions of multicollinearity must be confirmed through calculated VIF metrics, not bivariate correlation alone. ${
        severeVifs.length > 0
          ? `Severe collinearity detected in ${severeVifs.map((v: any) => `\`${v.variable}\``).join(', ')}. Standard errors in joint regressions will be inflated; consider feature consolidation.`
          : 'No severe multicollinearity (VIF ≥ 10) detected among evaluated continuous predictors.'
      }
- **Methodological Context:** Predictors with $\\text{VIF} \\ge 10$ (or auxiliary $R^2 \\ge 0.90$) warrant feature selection or ridge regularization before fitting joint linear models.`;
    }

    return `### Meta Muse Spark · Correlation Analysis
At least two continuous columns are required to compute Pearson covariance and VIF metrics. Currently detected numeric features: ${numCols.join(', ')}.`;
  }

  // 3. Outlier, Distribution & Normality inquiry
  if (q.includes('outlier') || q.includes('anomaly') || q.includes('shapiro') || q.includes('normal') || q.includes('skew')) {
    const skewInfo = stats?.skewness || {};
    const outlierInfo = stats?.outliers || {};
    const swInfo = stats?.shapiroWilk || {};

    const swLines = Object.entries(swInfo).slice(0, 4).map(([col, data]: [string, any]) => {
      if (!data.isValid) return `- **${col}**: Shapiro-Wilk underdetermined (N < 3 or constant column)`;
      const pStr = data.pValue < 0.0001 ? '< 0.0001' : `= ${Number(data.pValue).toFixed(4)}`;
      const verdict = data.isNormal ? 'Fail to reject H₀ (p ≥ 0.05)' : 'Reject H₀: Non-Normal (p < 0.05)';
      return `- **${col}**: W = \`${Number(data.statisticW).toFixed(4)}\`, p ${pStr} (${verdict})`;
    }).join('\n');

    return `### Meta Muse Spark · Normality, Outlier & Distribution Diagnostic

#### [Calculated Empirical Statistic]
- **Methodology (IQR Fence):** Outliers are defined strictly by $[Q_1 - 1.5 \\times \\text{IQR}, \\; Q_3 + 1.5 \\times \\text{IQR}]$ without subjective speculation.
${Object.keys(outlierInfo).length > 0 
  ? Object.entries(outlierInfo).slice(0, 4).map(([col, count]: any) => `- **${col}**: ${count} observation(s) outside IQR fence bounds`).join('\n')
  : '- 0 points outside IQR fence bounds across evaluated continuous columns.'}

- **Calculated Skewness:**
${Object.entries(skewInfo).slice(0, 4).map(([col, skew]: any) => {
  return `- **${col}**: Skewness $\\gamma_1 = ${Number(skew).toFixed(4)}$`;
}).join('\n')}

- **Formal Shapiro-Wilk Normality Tests (AS R94):**
${swLines || '- Formal Shapiro-Wilk statistics available in Descriptive Statistics tab.'}

#### [Meta Muse Spark Interpretation]
- **Normality Testing Caution:** Normality cannot be inferred from skewness alone. Note that failure to reject the null hypothesis ($p \\ge 0.05$) in the Shapiro-Wilk test does *not* prove normality; it merely indicates that empirical departures from Gaussian shape do not exceed the threshold of evidence.
- **Sample Scale:** For $N = ${rowCount}$, small-sample Shapiro-Wilk tests have limited power to detect subtle non-normality, while large samples ($N > 1000$) may reject $H_0$ on negligible trivial deviations. Always inspect graphical Q-Q plots.
- **Empirical Outlier Restraint:** Observations outside fence bounds are reported purely as numerical values. Causes are never speculatively attributed to specific hardware, server nodes, or outside systems without verifiable log telemetry.`;
  }

  // 4. Summary / General overview
  return `### Meta Muse Spark · Dataset Intelligence Briefing

#### [Calculated Empirical Statistic]
- **Matrix Dimensions:** \`${rowCount.toLocaleString()}\` rows × \`${colCount}\` attributes.
- **Quantitative Variables:** ${numCols.length > 0 ? numCols.map((c: string) => `\`${c}\``).join(', ') : 'None'}.
- **Categorical Factors:** ${catCols.length > 0 ? catCols.map((c: string) => `\`${c}\``).join(', ') : 'None'}.
- **Data Completeness:** ${summary?.totalMissing === 0 ? '100% complete records (zero missing cells).' : `${summary?.totalMissing} missing cell(s) detected.`}
${corrList.length > 0 ? `- **Highest Linear Covariance:** \`${corrList[0]?.col1} ↔ ${corrList[0]?.col2}\` (r = \`${corrList[0]?.value?.toFixed(4)}\`).` : ''}

#### [Meta Muse Spark Interpretation]
1. **Normality Verification:** Check the **Descriptive Statistics** tab for the formal Shapiro-Wilk $W$ statistic and $p$-value before relying on parametric tests. Remember that failing to reject $H_0$ is not positive proof of Gaussianity.
2. **Multicollinearity Checks:** Review the **Variance Inflation Factor (VIF)** table in the Correlation Matrix view before constructing multivariate regression pipelines.
3. **Model Residual Diagnostics:** Use the **Regression Studio** to inspect residual plots and the Breusch-Pagan heteroscedasticity test before deciding on log transformations.`;
}

function generateStructuredInsights(summary: any, correlations: any[], regressions: any[]) {
  const rowCount = summary?.rowCount || 0;
  
  const insights = [
    {
      type: 'Distribution',
      title: 'Sample Scale & Observational Degrees of Freedom',
      description: `Dataset contains N = ${rowCount.toLocaleString()} observations across ${summary?.columnCount ?? 0} features. Degrees of freedom for bivariate regressions: df = ${Math.max(0, rowCount - 2)}.`,
      severity: 'info'
    }
  ];

  if (correlations && correlations.length > 0) {
    const strongest = correlations[0];
    insights.push({
      type: 'Correlation',
      title: `Strongest Association: ${strongest.col1} & ${strongest.col2}`,
      description: `Pearson coefficient r = ${strongest.value.toFixed(3)}. This suggests ${Math.abs(strongest.value) > 0.6 ? 'a high degree of co-variance' : 'a moderate linear linkage'}, critical for predictive feature selection.`,
      severity: Math.abs(strongest.value) > 0.7 ? 'success' : 'neutral'
    });
  }

  if (summary?.totalMissing && summary.totalMissing > 0) {
    insights.push({
      type: 'Data Hygiene',
      title: 'Missing Data Imputation Needed',
      description: `Found ${summary.totalMissing} missing values. Consider median imputation for skewed features or complete-case analysis for unbiased estimators.`,
      severity: 'warning'
    });
  } else {
    insights.push({
      type: 'Data Hygiene',
      title: 'Clean Matrix Completeness',
      description: 'Zero missing records detected across all evaluated columns. No imputation or row exclusion required.',
      severity: 'success'
    });
  }

  return insights;
}

// Development mode with Vite middleware
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Production static files
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StatWise AI server running at http://0.0.0.0:${PORT}`);
  console.log(`Meta Model API: ${META_BASE_URL} (Model: ${MODEL_ID})`);
  console.log(`Status: ${isKeyConfigured ? 'Live Meta Model API Connected' : 'Demo Mode (No MODEL_API_KEY configured)'}`);
});
