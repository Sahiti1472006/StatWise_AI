/**
 * StatWise AI Preloaded Datasets
 * Real-world domain datasets for immediate testing and statistical exploration.
 */

export interface SampleDataset {
  id: string;
  name: string;
  category: string;
  description: string;
  rowCount: number;
  data: Record<string, any>[];
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'hardware-telemetry',
    name: 'Server Hardware & Energy Telemetry',
    category: 'Push the Frontier · Systems & Energy',
    description: 'High-frequency telemetry tracking CPU load, thermal profiles, power draw (watts), and I/O latency across enterprise cluster nodes.',
    rowCount: 35,
    data: [
      { Node_ID: 'node-01', CPU_Load_Pct: 24.5, Memory_GB: 16.2, Temp_Celsius: 48.2, Power_Watts: 145.0, IOPS: 12400, Latency_ms: 1.45, Status: 'Nominal' },
      { Node_ID: 'node-02', CPU_Load_Pct: 35.1, Memory_GB: 22.8, Temp_Celsius: 52.1, Power_Watts: 172.5, IOPS: 18900, Latency_ms: 1.62, Status: 'Nominal' },
      { Node_ID: 'node-03', CPU_Load_Pct: 78.4, Memory_GB: 54.1, Temp_Celsius: 69.8, Power_Watts: 285.0, IOPS: 42100, Latency_ms: 3.12, Status: 'Stressed' },
      { Node_ID: 'node-04', CPU_Load_Pct: 82.1, Memory_GB: 58.7, Temp_Celsius: 72.4, Power_Watts: 298.4, IOPS: 46200, Latency_ms: 3.45, Status: 'Stressed' },
      { Node_ID: 'node-05', CPU_Load_Pct: 15.2, Memory_GB: 12.0, Temp_Celsius: 43.5, Power_Watts: 128.0, IOPS: 8400, Latency_ms: 1.18, Status: 'Nominal' },
      { Node_ID: 'node-06', CPU_Load_Pct: 62.3, Memory_GB: 41.5, Temp_Celsius: 63.2, Power_Watts: 242.0, IOPS: 34500, Latency_ms: 2.34, Status: 'Nominal' },
      { Node_ID: 'node-07', CPU_Load_Pct: 91.5, Memory_GB: 61.2, Temp_Celsius: 79.1, Power_Watts: 334.8, IOPS: 51200, Latency_ms: 4.88, Status: 'High-Load' },
      { Node_ID: 'node-08', CPU_Load_Pct: 45.6, Memory_GB: 28.4, Temp_Celsius: 56.4, Power_Watts: 198.2, IOPS: 24100, Latency_ms: 1.85, Status: 'Nominal' },
      { Node_ID: 'node-09', CPU_Load_Pct: 53.0, Memory_GB: 34.0, Temp_Celsius: 59.5, Power_Watts: 215.6, IOPS: 28900, Latency_ms: 2.05, Status: 'Nominal' },
      { Node_ID: 'node-10', CPU_Load_Pct: 88.2, Memory_GB: 59.8, Temp_Celsius: 76.5, Power_Watts: 320.1, IOPS: 49500, Latency_ms: 4.12, Status: 'High-Load' },
      { Node_ID: 'node-11', CPU_Load_Pct: 29.8, Memory_GB: 18.5, Temp_Celsius: 50.3, Power_Watts: 158.0, IOPS: 15200, Latency_ms: 1.50, Status: 'Nominal' },
      { Node_ID: 'node-12', CPU_Load_Pct: 18.4, Memory_GB: 14.1, Temp_Celsius: 45.1, Power_Watts: 135.2, IOPS: 9800, Latency_ms: 1.25, Status: 'Nominal' },
      { Node_ID: 'node-13', CPU_Load_Pct: 71.0, Memory_GB: 47.3, Temp_Celsius: 67.0, Power_Watts: 268.0, IOPS: 38700, Latency_ms: 2.75, Status: 'Nominal' },
      { Node_ID: 'node-14', CPU_Load_Pct: 95.2, Memory_GB: 63.5, Temp_Celsius: 82.5, Power_Watts: 352.0, IOPS: 53800, Latency_ms: 5.40, Status: 'High-Load' },
      { Node_ID: 'node-15', CPU_Load_Pct: 41.2, Memory_GB: 26.0, Temp_Celsius: 54.8, Power_Watts: 188.5, IOPS: 22000, Latency_ms: 1.74, Status: 'Nominal' },
      { Node_ID: 'node-16', CPU_Load_Pct: 66.8, Memory_GB: 44.2, Temp_Celsius: 65.4, Power_Watts: 254.0, IOPS: 36100, Latency_ms: 2.50, Status: 'Nominal' },
      { Node_ID: 'node-17', CPU_Load_Pct: 32.0, Memory_GB: 20.1, Temp_Celsius: 51.0, Power_Watts: 164.0, IOPS: 16800, Latency_ms: 1.55, Status: 'Nominal' },
      { Node_ID: 'node-18', CPU_Load_Pct: 84.7, Memory_GB: 57.0, Temp_Celsius: 74.2, Power_Watts: 308.2, IOPS: 47500, Latency_ms: 3.75, Status: 'Stressed' },
      { Node_ID: 'node-19', CPU_Load_Pct: 22.1, Memory_GB: 15.3, Temp_Celsius: 47.0, Power_Watts: 142.0, IOPS: 11500, Latency_ms: 1.35, Status: 'Nominal' },
      { Node_ID: 'node-20', CPU_Load_Pct: 58.4, Memory_GB: 38.6, Temp_Celsius: 61.8, Power_Watts: 230.5, IOPS: 31800, Latency_ms: 2.18, Status: 'Nominal' },
      { Node_ID: 'node-21', CPU_Load_Pct: 76.5, Memory_GB: 51.8, Temp_Celsius: 68.9, Power_Watts: 280.0, IOPS: 41000, Latency_ms: 2.95, Status: 'Stressed' },
      { Node_ID: 'node-22', CPU_Load_Pct: 12.8, Memory_GB: 10.4, Temp_Celsius: 42.0, Power_Watts: 122.5, IOPS: 7200, Latency_ms: 1.10, Status: 'Nominal' },
      { Node_ID: 'node-23', CPU_Load_Pct: 48.9, Memory_GB: 31.2, Temp_Celsius: 57.8, Power_Watts: 205.0, IOPS: 26400, Latency_ms: 1.92, Status: 'Nominal' },
      { Node_ID: 'node-24', CPU_Load_Pct: 89.4, Memory_GB: 60.1, Temp_Celsius: 77.8, Power_Watts: 326.5, IOPS: 50100, Latency_ms: 4.30, Status: 'High-Load' },
      { Node_ID: 'node-25', CPU_Load_Pct: 64.0, Memory_GB: 42.8, Temp_Celsius: 64.2, Power_Watts: 248.0, IOPS: 35200, Latency_ms: 2.42, Status: 'Nominal' },
      { Node_ID: 'node-26', CPU_Load_Pct: 38.5, Memory_GB: 24.5, Temp_Celsius: 53.6, Power_Watts: 181.0, IOPS: 20500, Latency_ms: 1.68, Status: 'Nominal' },
      { Node_ID: 'node-27', CPU_Load_Pct: 73.2, Memory_GB: 49.0, Temp_Celsius: 67.9, Power_Watts: 274.0, IOPS: 39800, Latency_ms: 2.84, Status: 'Nominal' },
      { Node_ID: 'node-28', CPU_Load_Pct: 27.4, Memory_GB: 17.2, Temp_Celsius: 49.4, Power_Watts: 152.0, IOPS: 13900, Latency_ms: 1.42, Status: 'Nominal' },
      { Node_ID: 'node-29', CPU_Load_Pct: 80.6, Memory_GB: 55.4, Temp_Celsius: 71.5, Power_Watts: 294.0, IOPS: 44900, Latency_ms: 3.30, Status: 'Stressed' },
      { Node_ID: 'node-30', CPU_Load_Pct: 51.5, Memory_GB: 33.1, Temp_Celsius: 58.7, Power_Watts: 211.0, IOPS: 27800, Latency_ms: 2.01, Status: 'Nominal' },
      { Node_ID: 'node-31', CPU_Load_Pct: 19.8, Memory_GB: 14.8, Temp_Celsius: 46.2, Power_Watts: 138.0, IOPS: 10400, Latency_ms: 1.28, Status: 'Nominal' },
      { Node_ID: 'node-32', CPU_Load_Pct: 68.2, Memory_GB: 45.6, Temp_Celsius: 66.1, Power_Watts: 260.0, IOPS: 37200, Latency_ms: 2.60, Status: 'Nominal' },
      { Node_ID: 'node-33', CPU_Load_Pct: 93.8, Memory_GB: 62.4, Temp_Celsius: 80.6, Power_Watts: 344.0, IOPS: 52600, Latency_ms: 5.12, Status: 'High-Load' },
      { Node_ID: 'node-34', CPU_Load_Pct: 43.7, Memory_GB: 27.5, Temp_Celsius: 55.6, Power_Watts: 193.0, IOPS: 23200, Latency_ms: 1.80, Status: 'Nominal' },
      { Node_ID: 'node-35', CPU_Load_Pct: 86.5, Memory_GB: 58.2, Temp_Celsius: 75.3, Power_Watts: 314.0, IOPS: 48600, Latency_ms: 3.95, Status: 'Stressed' }
    ]
  },
  {
    id: 'enterprise-sales',
    name: 'Enterprise Commerce & Profit Analytics',
    category: 'Build for Your World · Revenue Strategy',
    description: 'Transaction-level multi-region data evaluating sales volume, gross profit, discount elasticity, and logistics costs.',
    rowCount: 30,
    data: [
      { Order_ID: 'ORD-101', Region: 'North America', Category: 'Technology', Sales: 1850.0, Profit: 420.5, Discount_Pct: 0.05, Units: 4, Shipping_Cost: 45.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-102', Region: 'Europe', Category: 'Office Supplies', Sales: 320.0, Profit: 85.0, Discount_Pct: 0.00, Units: 8, Shipping_Cost: 18.5, Segment: 'Consumer' },
      { Order_ID: 'ORD-103', Region: 'Asia Pacific', Category: 'Technology', Sales: 2400.0, Profit: 580.0, Discount_Pct: 0.10, Units: 6, Shipping_Cost: 65.0, Segment: 'Corporate' },
      { Order_ID: 'ORD-104', Region: 'Latin America', Category: 'Furniture', Sales: 950.0, Profit: -45.0, Discount_Pct: 0.35, Units: 2, Shipping_Cost: 55.0, Segment: 'Consumer' },
      { Order_ID: 'ORD-105', Region: 'North America', Category: 'Furniture', Sales: 1420.0, Profit: 210.0, Discount_Pct: 0.15, Units: 3, Shipping_Cost: 70.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-106', Region: 'Europe', Category: 'Technology', Sales: 3100.0, Profit: 790.0, Discount_Pct: 0.05, Units: 5, Shipping_Cost: 80.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-107', Region: 'North America', Category: 'Office Supplies', Sales: 180.0, Profit: 52.0, Discount_Pct: 0.00, Units: 12, Shipping_Cost: 12.0, Segment: 'Consumer' },
      { Order_ID: 'ORD-108', Region: 'Asia Pacific', Category: 'Furniture', Sales: 1650.0, Profit: 140.0, Discount_Pct: 0.20, Units: 4, Shipping_Cost: 85.0, Segment: 'Corporate' },
      { Order_ID: 'ORD-109', Region: 'Latin America', Category: 'Technology', Sales: 1200.0, Profit: 180.0, Discount_Pct: 0.15, Units: 2, Shipping_Cost: 40.0, Segment: 'Consumer' },
      { Order_ID: 'ORD-110', Region: 'Europe', Category: 'Furniture', Sales: 880.0, Profit: -30.0, Discount_Pct: 0.30, Units: 2, Shipping_Cost: 60.0, Segment: 'Corporate' },
      { Order_ID: 'ORD-111', Region: 'North America', Category: 'Technology', Sales: 4200.0, Profit: 1150.0, Discount_Pct: 0.00, Units: 7, Shipping_Cost: 95.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-112', Region: 'Asia Pacific', Category: 'Office Supplies', Sales: 450.0, Profit: 110.0, Discount_Pct: 0.05, Units: 15, Shipping_Cost: 22.0, Segment: 'Consumer' },
      { Order_ID: 'ORD-113', Region: 'North America', Category: 'Office Supplies', Sales: 290.0, Profit: 75.0, Discount_Pct: 0.00, Units: 10, Shipping_Cost: 15.0, Segment: 'Corporate' },
      { Order_ID: 'ORD-114', Region: 'Europe', Category: 'Technology', Sales: 2150.0, Profit: 510.0, Discount_Pct: 0.08, Units: 4, Shipping_Cost: 50.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-115', Region: 'Latin America', Category: 'Office Supplies', Sales: 140.0, Profit: 30.0, Discount_Pct: 0.10, Units: 6, Shipping_Cost: 14.0, Segment: 'Consumer' },
      { Order_ID: 'ORD-116', Region: 'North America', Category: 'Furniture', Sales: 2100.0, Profit: 320.0, Discount_Pct: 0.12, Units: 5, Shipping_Cost: 90.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-117', Region: 'Asia Pacific', Category: 'Technology', Sales: 3600.0, Profit: 890.0, Discount_Pct: 0.05, Units: 8, Shipping_Cost: 88.0, Segment: 'Corporate' },
      { Order_ID: 'ORD-118', Region: 'Europe', Category: 'Furniture', Sales: 1250.0, Profit: 160.0, Discount_Pct: 0.18, Units: 3, Shipping_Cost: 68.0, Segment: 'Consumer' },
      { Order_ID: 'ORD-119', Region: 'North America', Category: 'Technology', Sales: 2800.0, Profit: 690.0, Discount_Pct: 0.05, Units: 5, Shipping_Cost: 62.0, Segment: 'Corporate' },
      { Order_ID: 'ORD-120', Region: 'Latin America', Category: 'Furniture', Sales: 780.0, Profit: -60.0, Discount_Pct: 0.40, Units: 1, Shipping_Cost: 48.0, Segment: 'Corporate' },
      { Order_ID: 'ORD-121', Region: 'Europe', Category: 'Office Supplies', Sales: 520.0, Profit: 135.0, Discount_Pct: 0.00, Units: 14, Shipping_Cost: 26.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-122', Region: 'North America', Category: 'Technology', Sales: 1950.0, Profit: 460.0, Discount_Pct: 0.05, Units: 3, Shipping_Cost: 42.0, Segment: 'Consumer' },
      { Order_ID: 'ORD-123', Region: 'Asia Pacific', Category: 'Furniture', Sales: 1890.0, Profit: 240.0, Discount_Pct: 0.15, Units: 4, Shipping_Cost: 82.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-124', Region: 'Europe', Category: 'Technology', Sales: 2750.0, Profit: 670.0, Discount_Pct: 0.06, Units: 6, Shipping_Cost: 72.0, Segment: 'Corporate' },
      { Order_ID: 'ORD-125', Region: 'North America', Category: 'Office Supplies', Sales: 380.0, Profit: 98.0, Discount_Pct: 0.00, Units: 11, Shipping_Cost: 19.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-126', Region: 'Latin America', Category: 'Technology', Sales: 1550.0, Profit: 290.0, Discount_Pct: 0.10, Units: 3, Shipping_Cost: 48.0, Segment: 'Corporate' },
      { Order_ID: 'ORD-127', Region: 'Asia Pacific', Category: 'Office Supplies', Sales: 220.0, Profit: 58.0, Discount_Pct: 0.05, Units: 7, Shipping_Cost: 16.0, Segment: 'Consumer' },
      { Order_ID: 'ORD-128', Region: 'Europe', Category: 'Furniture', Sales: 1450.0, Profit: 180.0, Discount_Pct: 0.20, Units: 3, Shipping_Cost: 75.0, Segment: 'Enterprise' },
      { Order_ID: 'ORD-129', Region: 'North America', Category: 'Technology', Sales: 3300.0, Profit: 840.0, Discount_Pct: 0.04, Units: 6, Shipping_Cost: 78.0, Segment: 'Consumer' },
      { Order_ID: 'ORD-130', Region: 'Latin America', Category: 'Office Supplies', Sales: 190.0, Profit: 42.0, Discount_Pct: 0.08, Units: 8, Shipping_Cost: 17.0, Segment: 'Corporate' }
    ]
  },
  {
    id: 'biomarkers-health',
    name: 'Clinical Biomarkers & Cardiology Risk',
    category: 'Build for Your World · Healthcare Science',
    description: 'Patient biometric parameters investigating cardiovascular risks against metabolic health indicators, blood pressure, and activity levels.',
    rowCount: 25,
    data: [
      { Patient_ID: 'P-101', Age: 52, Systolic_BP: 138, Cholesterol_mgdl: 225, Glucose_mgdl: 104, BMI: 28.4, Heart_Rate_BPM: 72, Exercise_Hours_Wk: 2.5, Risk_Score: 42 },
      { Patient_ID: 'P-102', Age: 41, Systolic_BP: 118, Cholesterol_mgdl: 185, Glucose_mgdl: 88, BMI: 23.1, Heart_Rate_BPM: 64, Exercise_Hours_Wk: 5.0, Risk_Score: 18 },
      { Patient_ID: 'P-103', Age: 64, Systolic_BP: 155, Cholesterol_mgdl: 260, Glucose_mgdl: 132, BMI: 31.8, Heart_Rate_BPM: 80, Exercise_Hours_Wk: 1.0, Risk_Score: 68 },
      { Patient_ID: 'P-104', Age: 36, Systolic_BP: 115, Cholesterol_mgdl: 170, Glucose_mgdl: 84, BMI: 22.0, Heart_Rate_BPM: 60, Exercise_Hours_Wk: 6.5, Risk_Score: 12 },
      { Patient_ID: 'P-105', Age: 58, Systolic_BP: 142, Cholesterol_mgdl: 240, Glucose_mgdl: 115, BMI: 29.5, Heart_Rate_BPM: 75, Exercise_Hours_Wk: 2.0, Risk_Score: 51 },
      { Patient_ID: 'P-106', Age: 47, Systolic_BP: 128, Cholesterol_mgdl: 205, Glucose_mgdl: 96, BMI: 25.8, Heart_Rate_BPM: 68, Exercise_Hours_Wk: 3.5, Risk_Score: 30 },
      { Patient_ID: 'P-107', Age: 68, Systolic_BP: 162, Cholesterol_mgdl: 275, Glucose_mgdl: 145, BMI: 33.2, Heart_Rate_BPM: 84, Exercise_Hours_Wk: 0.5, Risk_Score: 78 },
      { Patient_ID: 'P-108', Age: 33, Systolic_BP: 112, Cholesterol_mgdl: 165, Glucose_mgdl: 82, BMI: 21.5, Heart_Rate_BPM: 58, Exercise_Hours_Wk: 7.0, Risk_Score: 9 },
      { Patient_ID: 'P-109', Age: 55, Systolic_BP: 139, Cholesterol_mgdl: 230, Glucose_mgdl: 108, BMI: 28.9, Heart_Rate_BPM: 73, Exercise_Hours_Wk: 2.2, Risk_Score: 46 },
      { Patient_ID: 'P-110', Age: 61, Systolic_BP: 148, Cholesterol_mgdl: 252, Glucose_mgdl: 124, BMI: 30.6, Heart_Rate_BPM: 78, Exercise_Hours_Wk: 1.5, Risk_Score: 62 },
      { Patient_ID: 'P-111', Age: 44, Systolic_BP: 122, Cholesterol_mgdl: 195, Glucose_mgdl: 92, BMI: 24.6, Heart_Rate_BPM: 66, Exercise_Hours_Wk: 4.0, Risk_Score: 24 },
      { Patient_ID: 'P-112', Age: 39, Systolic_BP: 116, Cholesterol_mgdl: 178, Glucose_mgdl: 86, BMI: 22.8, Heart_Rate_BPM: 62, Exercise_Hours_Wk: 5.5, Risk_Score: 15 },
      { Patient_ID: 'P-113', Age: 72, Systolic_BP: 168, Cholesterol_mgdl: 290, Glucose_mgdl: 155, BMI: 34.5, Heart_Rate_BPM: 88, Exercise_Hours_Wk: 0.2, Risk_Score: 85 },
      { Patient_ID: 'P-114', Age: 50, Systolic_BP: 134, Cholesterol_mgdl: 215, Glucose_mgdl: 100, BMI: 27.2, Heart_Rate_BPM: 70, Exercise_Hours_Wk: 3.0, Risk_Score: 38 },
      { Patient_ID: 'P-115', Age: 57, Systolic_BP: 144, Cholesterol_mgdl: 238, Glucose_mgdl: 112, BMI: 29.1, Heart_Rate_BPM: 74, Exercise_Hours_Wk: 2.0, Risk_Score: 49 },
      { Patient_ID: 'P-116', Age: 46, Systolic_BP: 126, Cholesterol_mgdl: 200, Glucose_mgdl: 94, BMI: 25.2, Heart_Rate_BPM: 67, Exercise_Hours_Wk: 3.8, Risk_Score: 28 },
      { Patient_ID: 'P-117', Age: 66, Systolic_BP: 158, Cholesterol_mgdl: 268, Glucose_mgdl: 138, BMI: 32.4, Heart_Rate_BPM: 82, Exercise_Hours_Wk: 0.8, Risk_Score: 72 },
      { Patient_ID: 'P-118', Age: 35, Systolic_BP: 114, Cholesterol_mgdl: 172, Glucose_mgdl: 85, BMI: 22.2, Heart_Rate_BPM: 61, Exercise_Hours_Wk: 6.0, Risk_Score: 11 },
      { Patient_ID: 'P-119', Age: 53, Systolic_BP: 136, Cholesterol_mgdl: 222, Glucose_mgdl: 102, BMI: 28.0, Heart_Rate_BPM: 71, Exercise_Hours_Wk: 2.8, Risk_Score: 40 },
      { Patient_ID: 'P-120', Age: 60, Systolic_BP: 146, Cholesterol_mgdl: 248, Glucose_mgdl: 120, BMI: 30.1, Heart_Rate_BPM: 76, Exercise_Hours_Wk: 1.8, Risk_Score: 57 },
      { Patient_ID: 'P-121', Age: 43, Systolic_BP: 120, Cholesterol_mgdl: 190, Glucose_mgdl: 90, BMI: 24.0, Heart_Rate_BPM: 65, Exercise_Hours_Wk: 4.5, Risk_Score: 22 },
      { Patient_ID: 'P-122', Age: 70, Systolic_BP: 165, Cholesterol_mgdl: 282, Glucose_mgdl: 148, BMI: 33.8, Heart_Rate_BPM: 86, Exercise_Hours_Wk: 0.4, Risk_Score: 81 },
      { Patient_ID: 'P-123', Age: 48, Systolic_BP: 130, Cholesterol_mgdl: 210, Glucose_mgdl: 98, BMI: 26.5, Heart_Rate_BPM: 69, Exercise_Hours_Wk: 3.2, Risk_Score: 34 },
      { Patient_ID: 'P-124', Age: 38, Systolic_BP: 115, Cholesterol_mgdl: 175, Glucose_mgdl: 86, BMI: 22.5, Heart_Rate_BPM: 60, Exercise_Hours_Wk: 5.8, Risk_Score: 14 },
      { Patient_ID: 'P-125', Age: 62, Systolic_BP: 150, Cholesterol_mgdl: 255, Glucose_mgdl: 128, BMI: 31.0, Heart_Rate_BPM: 79, Exercise_Hours_Wk: 1.2, Risk_Score: 65 }
    ]
  }
];
