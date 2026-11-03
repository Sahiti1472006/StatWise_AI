import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type ColumnDataType = 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'text';

export interface ColumnMetadata {
  name: string;
  type: ColumnDataType;
  missingCount: number;
  missingPercentage: number;
  distinctCount: number;
  sampleValues: any[];
}

export interface ParsedDataset {
  filename: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnMetadata[];
  numericColumns: string[];
  categoricalColumns: string[];
  rows: Record<string, any>[];
  totalMissing: number;
}

/**
 * Parses raw file (CSV or Excel) into normalized structured dataset
 */
export async function parseDatasetFile(file: File): Promise<ParsedDataset> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  } else {
    return parseCsvFile(file);
  }
}

/**
 * Parses CSV file with PapaParse
 */
export function parseCsvFile(file: File): Promise<ParsedDataset> {
  return new Promise((resolve, reject) => {
    const seenHeaders: Record<string, number> = {};
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      transformHeader: (header: string, index: number) => {
        let clean = (header || '').trim();
        if (!clean) {
          clean = `Column_${index + 1}`;
        }
        if (seenHeaders[clean] !== undefined) {
          seenHeaders[clean] += 1;
          return `${clean}_${seenHeaders[clean]}`;
        } else {
          seenHeaders[clean] = 0;
          return clean;
        }
      },
      complete: (results) => {
        try {
          const rows = results.data as Record<string, any>[];
          if (!rows || rows.length === 0) {
            throw new Error('The uploaded CSV file contains no data rows or could not be parsed.');
          }
          const dataset = processRawRows(file.name, rows);
          resolve(dataset);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(new Error(`Failed to parse CSV file: ${err.message}`));
      },
    });
  });
}

/**
 * Parses Excel (.xlsx/.xls) file using SheetJS
 */
export async function parseExcelFile(file: File): Promise<ParsedDataset> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('Excel workbook contains no sheets.');
  }

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });

  if (!rows || rows.length === 0) {
    throw new Error(`The sheet "${firstSheetName}" is empty.`);
  }

  return processRawRows(file.name, rows);
}

/**
 * Processes raw rows to detect schema, infer data types, and identify missing values
 */
export function processRawRows(filename: string, rawRows: Record<string, any>[]): ParsedDataset {
  if (rawRows.length === 0) {
    return {
      filename,
      rowCount: 0,
      columnCount: 0,
      columns: [],
      numericColumns: [],
      categoricalColumns: [],
      rows: [],
      totalMissing: 0,
    };
  }

  // Find all unique column headers across all rows
  const columnSet = new Set<string>();
  for (const row of rawRows) {
    for (const key of Object.keys(row)) {
      if (key && key.trim() !== '') {
        columnSet.add(key.trim());
      }
    }
  }

  const columnNames = Array.from(columnSet);
  const totalRows = rawRows.length;
  let totalMissing = 0;

  const columns: ColumnMetadata[] = [];
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];

  for (const col of columnNames) {
    let missingCount = 0;
    const values: any[] = [];
    let numericCount = 0;
    let booleanCount = 0;
    let dateCount = 0;
    const uniqueValues = new Set<any>();

    for (const row of rawRows) {
      const val = row[col];
      if (val === null || val === undefined || val === '' || (typeof val === 'number' && isNaN(val))) {
        missingCount++;
        totalMissing++;
      } else {
        values.push(val);
        uniqueValues.add(val);

        if (typeof val === 'number') {
          numericCount++;
        } else if (typeof val === 'boolean') {
          booleanCount++;
        } else if (typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed.toLowerCase() === 'true' || trimmed.toLowerCase() === 'false') {
            booleanCount++;
          } else if (!isNaN(Number(trimmed))) {
            numericCount++;
          } else if (isValidDate(trimmed)) {
            dateCount++;
          }
        }
      }
    }

    const validCount = values.length;
    let inferredType: ColumnDataType = 'text';

    if (validCount > 0) {
      if (numericCount / validCount >= 0.75) {
        inferredType = 'numeric';
        numericColumns.push(col);
      } else if (booleanCount / validCount >= 0.8) {
        inferredType = 'boolean';
        categoricalColumns.push(col);
      } else if (dateCount / validCount >= 0.8) {
        inferredType = 'datetime';
      } else if (uniqueValues.size <= Math.min(25, Math.ceil(validCount * 0.4))) {
        inferredType = 'categorical';
        categoricalColumns.push(col);
      } else {
        inferredType = 'text';
      }
    }

    columns.push({
      name: col,
      type: inferredType,
      missingCount,
      missingPercentage: (missingCount / totalRows) * 100,
      distinctCount: uniqueValues.size,
      sampleValues: Array.from(uniqueValues).slice(0, 5),
    });
  }

  // Normalize numeric column values in rows to actual numbers
  const normalizedRows = rawRows.map(row => {
    const newRow: Record<string, any> = {};
    for (const col of columnNames) {
      const v = row[col];
      if (numericColumns.includes(col)) {
        if (v === null || v === undefined || v === '') {
          newRow[col] = null;
        } else {
          const num = Number(v);
          newRow[col] = isNaN(num) ? null : num;
        }
      } else {
        newRow[col] = v;
      }
    }
    return newRow;
  });

  return {
    filename,
    rowCount: totalRows,
    columnCount: columnNames.length,
    columns,
    numericColumns,
    categoricalColumns,
    rows: normalizedRows,
    totalMissing,
  };
}

function isValidDate(str: string): boolean {
  if (!str || str.length < 6 || !isNaN(Number(str))) return false;
  const parsed = Date.parse(str);
  return !isNaN(parsed);
}
