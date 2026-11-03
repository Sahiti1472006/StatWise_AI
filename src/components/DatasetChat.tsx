import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, HelpCircle, Bot, User, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { ParsedDataset } from '../utils/dataParser';
import {
  calculateCorrelationMatrix,
  calculateLinearRegression,
  calculateDescriptiveStats,
  calculateVIF
} from '../utils/statistics';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: string;
  model?: string;
}

interface DatasetChatProps {
  dataset: ParsedDataset;
  isMetaLive: boolean;
  onOpenMetaStatus: () => void;
  presetQuestion?: string;
}

export const DatasetChat: React.FC<DatasetChatProps> = ({
  dataset,
  isMetaLive,
  onOpenMetaStatus,
  presetQuestion,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompt pills
  const samplePrompts = [
    'Provide an executive summary of key statistical insights',
    dataset.numericColumns.length >= 2
      ? `Evaluate the correlation between ${dataset.numericColumns[0]} and ${dataset.numericColumns[1]}`
      : 'Analyze the variance structure of this dataset',
    'Detect anomalies and check distribution skewness',
    'What business or experimental recommendations follow from these numbers?'
  ];

  // Initialize welcoming message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `### Welcome to Meta Muse Spark 1.3 Assistant

I am loaded with your dataset **\`${dataset.filename}\`** containing **${dataset.rowCount.toLocaleString()}** observations across **${dataset.columnCount}** features (${dataset.numericColumns.length} continuous numeric, ${dataset.categoricalColumns.length} categorical).

**Current Engine Status:**
- **Mode:** ${isMetaLive ? '🟢 **Live Meta Model API** (Connected to `https://api.meta.ai/v1` with model `muse-spark-1.3`)' : '🟡 **Demo Mode** (No `MODEL_API_KEY` configured in server environment; executing local analytical logic)'}

You can ask me to:
- Interpret correlations and test multicollinearity
- Explain regression slope, intercept, and $R^2$ performance
- Audit distribution skewness and identify potential outliers
- Formulate hypothesis testing (T-tests, ANOVA, Chi-square)
- Summarize findings for executive or research reports

How can I assist your statistical analysis today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: isMetaLive ? 'meta-muse-spark-live' : 'meta-muse-spark-demo',
          model: isMetaLive ? 'Meta Muse Spark (muse-spark-1.3 · Live)' : 'Meta Muse Spark (muse-spark-1.3 · Demo Mode)'
        }
      ]);
    }
  }, [dataset.filename, isMetaLive]);

  // Handle preset question if passed from another tab
  useEffect(() => {
    if (presetQuestion && presetQuestion !== inputValue) {
      handleSendMessage(presetQuestion);
    }
  }, [presetQuestion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare rich empirical statistical context
      const correlations = calculateCorrelationMatrix(dataset.rows, dataset.numericColumns.slice(0, 8));
      
      let activeRegression = null;
      if (dataset.numericColumns.length >= 2) {
        activeRegression = calculateLinearRegression(dataset.rows, dataset.numericColumns[0], dataset.numericColumns[1]);
      }

      const vifResults = calculateVIF(dataset.rows, dataset.numericColumns);

      const shapiroWilkMap: Record<string, any> = {};
      const skewnessMap: Record<string, number> = {};
      const outliersMap: Record<string, number> = {};

      for (const col of dataset.numericColumns.slice(0, 10)) {
        const stats = calculateDescriptiveStats(dataset.rows.map(r => r[col]));
        shapiroWilkMap[col] = {
          statisticW: stats.shapiroWilk.statisticW,
          pValue: stats.shapiroWilk.pValue,
          isNormal: stats.shapiroWilk.isNormal,
          isValid: stats.shapiroWilk.isValid,
          interpretation: stats.shapiroWilk.interpretation
        };
        skewnessMap[col] = stats.skewness;
        outliersMap[col] = stats.outliersIqr.length;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          datasetSummary: {
            filename: dataset.filename,
            rowCount: dataset.rowCount,
            columnCount: dataset.columnCount,
            numericColumns: dataset.numericColumns,
            categoricalColumns: dataset.categoricalColumns,
            totalMissing: dataset.totalMissing
          },
          statisticalContext: {
            topCorrelations: correlations.topCorrelations.slice(0, 8),
            vifResults: vifResults.map(v => ({
              variable: v.variable,
              vif: isFinite(v.vif) ? v.vif : 'Infinity',
              rSquared: isNaN(v.rSquared) ? null : v.rSquared,
              tolerance: isNaN(v.tolerance) ? null : v.tolerance,
              severity: v.severity,
              status: v.status,
              interpretation: v.interpretation
            })),
            shapiroWilk: shapiroWilkMap,
            skewness: skewnessMap,
            outliers: outliersMap,
            activeRegression: activeRegression ? {
              independentVar: activeRegression.independentVar,
              dependentVar: activeRegression.dependentVar,
              equation: activeRegression.equation,
              slope: activeRegression.slope,
              intercept: activeRegression.intercept,
              slopeStdError: activeRegression.slopeStdError,
              rSquared: activeRegression.rSquared,
              adjustedRSquared: activeRegression.adjustedRSquared,
              standardError: activeRegression.standardError,
              breuschPagan: activeRegression.breuschPagan,
              logTransformRecommendation: activeRegression.logTransformRecommendation
            } : null
          }
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Meta Model API Error (${res.status})**\n\n${data.error || 'The Meta Model API request failed.'}\n\n*${data.details || 'Check your MODEL_API_KEY environment variable on the backend.'}*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'meta-muse-spark-error',
          model: 'muse-spark-1.3 (API Error)'
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response returned.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        model: data.model || (isMetaLive ? 'muse-spark-1.3 (Live)' : 'muse-spark-1.3 (Demo Mode)')
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Connection Error**: Failed to reach backend chat endpoint (${err.message}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'meta-muse-spark-error',
        model: 'muse-spark-1.3 (Offline)'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[750px] rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-850 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Meta Muse Spark
              </h3>
              <button
                onClick={onOpenMetaStatus}
                className={`text-2xs font-mono px-2 py-0.5 rounded border ${
                  isMetaLive
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800'
                }`}
              >
                {isMetaLive ? 'Meta Model API: Live' : 'Muse Spark: Demo Mode'}
              </button>
            </div>
            <p className="text-2xs text-slate-400">
              Quantitative Reasoning Engine · Grounded in <span className="font-mono text-slate-300">{dataset.filename}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs"
            title="Reset conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 text-xs font-bold">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-850 text-slate-200 border border-slate-800 rounded-tl-none space-y-2'
                }`}
              >
                {!isUser ? (
                  <div className="space-y-2 prose-invert text-xs">
                    {msg.content.split('\n\n').map((block, i) => {
                      if (block.startsWith('### ')) {
                        return (
                          <h4 key={i} className="text-sm font-bold text-white border-b border-slate-700/60 pb-1">
                            {block.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (block.startsWith('- ')) {
                        const items = block.split('\n- ');
                        return (
                          <ul key={i} className="list-disc pl-4 space-y-1 text-slate-300 font-body">
                            {items.map((item, j) => (
                              <li key={j} dangerouslySetInnerHTML={{
                                __html: item.replace(/^- /, '')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded font-mono text-indigo-300">$1</code>')
                              }} />
                            ))}
                          </ul>
                        );
                      }
                      return (
                        <p key={i} className="text-slate-300 font-body" dangerouslySetInnerHTML={{
                          __html: block
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded font-mono text-indigo-300">$1</code>')
                        }} />
                      );
                    })}
                  </div>
                ) : (
                  <p className="font-body text-white">{msg.content}</p>
                )}

                <div className={`flex items-center gap-2 pt-1 text-3xs ${
                  isUser ? 'text-indigo-200 justify-end' : 'text-slate-500 justify-between border-t border-slate-800/80 mt-2'
                }`}>
                  {!isUser && (
                    <span className="font-mono text-slate-400">
                      {msg.model || 'Meta Muse Spark 3.1'}
                    </span>
                  )}
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-850 border border-slate-800 rounded-xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>Meta Muse Spark is synthesizing statistical matrix...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-5 py-2 bg-slate-850/60 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto">
        <span className="text-3xs font-mono uppercase text-slate-500 whitespace-nowrap">Suggested:</span>
        {samplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 text-2xs bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 border border-slate-700 rounded-md whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-850 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Meta Muse Spark about correlations, regressions, outliers, or hypothesis tests..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
