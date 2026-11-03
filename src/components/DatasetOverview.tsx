import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, FileText, BarChart3, Binary, AlertCircle, Sparkles } from 'lucide-react';
import { ParsedDataset } from '../utils/dataParser';

interface DatasetOverviewProps {
  dataset: ParsedDataset;
  onNavigateTab: (tab: string) => void;
  onOpenUploadNew: () => void;
}

export const DatasetOverview: React.FC<DatasetOverviewProps> = ({
  dataset,
  onNavigateTab,
  onOpenUploadNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filtered and sorted rows for preview
  const processedRows = useMemo(() => {
    let result = [...dataset.rows];

    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(val =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return sortDirection === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [dataset.rows, searchTerm, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / pageSize));
  const displayedRows = processedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (colName: string) => {
    if (sortColumn === colName) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
      }
    } else {
      setSortColumn(colName);
      setSortDirection('asc');
    }
  };

  const completenessPercentage = (
    ((dataset.rowCount * dataset.columnCount - dataset.totalMissing) /
      Math.max(1, dataset.rowCount * dataset.columnCount)) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Context */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Active Dataset</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{dataset.filename}</span>
            <span aria-hidden="true">·</span>
            <span>{completenessPercentage}% Complete</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Dataset Topology & Health Profile
          </h2>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => onNavigateTab('stats')}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Compute Stats
          </button>
          <button
            onClick={() => onNavigateTab('chat')}
            className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chat With Muse Spark</span>
          </button>
          <button
            onClick={onOpenUploadNew}
            className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Change Dataset
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Rows</div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {dataset.rowCount.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">observations</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Columns</div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {dataset.columnCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">attributes</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Numeric Continuous</div>
          <div className="text-xl font-bold font-mono tabular-nums text-indigo-400">
            {dataset.numericColumns.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">for regression & corr</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Categorical Factors</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400">
            {dataset.categoricalColumns.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">discrete categories</div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Missing Values</div>
          <div className="text-xl font-bold font-mono tabular-nums text-white">
            {dataset.totalMissing.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {dataset.totalMissing === 0 ? 'Zero missing cells' : 'Imputation candidate'}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Data Health</div>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
            {completenessPercentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1">matrix completeness</div>
        </div>
      </div>

      {/* Schema & Column Metadata Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Column Architecture & Data Types</h3>
            <p className="text-xs text-slate-400">Inferred data types, null percentage, and distinct unique cardinality</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {dataset.columns.length} columns detected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Inferred Type</th>
                <th className="py-2.5 px-3">Unique Values</th>
                <th className="py-2.5 px-3">Missing Values</th>
                <th className="py-2.5 px-3">Missing %</th>
                <th className="py-2.5 px-3">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-body">
              {dataset.columns.map((col) => {
                const isNumeric = col.type === 'numeric';
                const hasMissing = col.missingCount > 0;
                return (
                  <tr key={col.name} className="hover:bg-slate-850 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-200">
                      {col.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded text-2xs ${
                        isNumeric
                          ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800'
                          : col.type === 'categorical'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {col.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-300">
                      {col.distinctCount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-300">
                      {col.missingCount}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums">
                      <span className={hasMissing ? 'text-amber-400 font-medium' : 'text-slate-400'}>
                        {col.missingPercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-2xs truncate max-w-xs">
                      {col.sampleValues.map(v => String(v)).join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data Preview Grid */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Dataset Raw Records Preview</h3>
            <p className="text-xs text-slate-400">Click column headers to sort ascending / descending</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search values..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono tabular-nums whitespace-nowrap">
              {processedRows.length} matches
            </span>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-850 border-b border-slate-800 text-slate-300">
                <th className="py-2 px-3 text-slate-500 w-12 font-mono">#</th>
                {dataset.columns.map((col) => {
                  const isSorted = sortColumn === col.name;
                  return (
                    <th
                      key={col.name}
                      onClick={() => handleSort(col.name)}
                      className="py-2 px-3 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap font-mono"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{col.name}</span>
                        <ArrowUpDown className={`w-3 h-3 ${isSorted ? 'text-indigo-400' : 'text-slate-600'}`} />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-body">
              {displayedRows.length > 0 ? (
                displayedRows.map((row, idx) => {
                  const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-2 px-3 font-mono tabular-nums text-slate-600 text-2xs">
                        {rowNumber}
                      </td>
                      {dataset.columns.map((col) => {
                        const val = row[col.name];
                        const isNull = val === null || val === undefined || val === '';
                        const isNumeric = col.type === 'numeric';

                        return (
                          <td
                            key={col.name}
                            className={`py-2 px-3 whitespace-nowrap font-mono ${
                              isNull ? 'text-slate-600 italic text-2xs' : isNumeric ? 'tabular-nums text-slate-200' : 'text-slate-300'
                            }`}
                          >
                            {isNull ? 'null' : typeof val === 'number' ? val.toLocaleString() : String(val)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={dataset.columns.length + 1} className="py-8 text-center text-slate-500 text-xs">
                    No records found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <div className="font-mono tabular-nums">
            Showing {Math.min(processedRows.length, (currentPage - 1) * pageSize + 1)} - {Math.min(processedRows.length, currentPage * pageSize)} of {processedRows.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
