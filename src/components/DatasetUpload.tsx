import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Database, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { SAMPLE_DATASETS, SampleDataset } from '../data/sampleDatasets';
import { parseDatasetFile, processRawRows, ParsedDataset } from '../utils/dataParser';

interface DatasetUploadProps {
  onDatasetLoaded: (dataset: ParsedDataset) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const DatasetUpload: React.FC<DatasetUploadProps> = ({
  onDatasetLoaded,
  isLoading,
  setIsLoading,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validExtensions.includes(fileExt)) {
        throw new Error('Unsupported file format. Please upload a CSV (.csv) or Excel spreadsheet (.xlsx, .xls).');
      }

      const parsed = await parseDatasetFile(file);
      onDatasetLoaded(parsed);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to parse file. Please verify CSV or Excel structure.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleDataset = (sample: SampleDataset) => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const parsed = processRawRows(sample.name + '.csv', sample.data);
      onDatasetLoaded(parsed);
    } catch (err: any) {
      setErrorMessage('Failed to load sample dataset: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Statistical Data Analysis & Intelligence
        </h2>
        <p className="text-sm text-slate-400">
          Upload your tabular data or load a curated benchmark to compute descriptive statistics, correlation matrices, OLS regressions, and consult Meta Muse Spark.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold">Upload Error:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
          dragActive
            ? 'border-indigo-400 bg-indigo-950/40'
            : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-indigo-400">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-100 mb-1">
            {isLoading ? 'Processing dataset...' : 'Click to upload or drag and drop'}
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Supports CSV, Excel (.xlsx, .xls) files up to 25 MB
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Auto type detection</span>
            <span aria-hidden="true">·</span>
            <span>Missing value audit</span>
            <span aria-hidden="true">·</span>
            <span>Immediate statistical metrics</span>
          </div>
        </div>
      </div>

      {/* Preloaded Sample Datasets */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Or Explore Preloaded Real-World Benchmark Datasets</h3>
            <p className="text-xs text-slate-400">1-click test datasets calibrated for statistical exploration and Meta Muse Spark validation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_DATASETS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => loadSampleDataset(sample)}
              className="group cursor-pointer rounded-lg bg-slate-900 border border-slate-800 p-5 hover:border-indigo-500/50 hover:bg-slate-850 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-medium text-indigo-400 mb-1.5">
                  {sample.category}
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors mb-2">
                  {sample.name}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {sample.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                <span className="text-slate-500 font-mono tabular-nums">
                  {sample.rowCount} observations
                </span>
                <span className="text-indigo-400 font-medium inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Load dataset <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
