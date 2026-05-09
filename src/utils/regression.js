/**
 * Simple Linear Regression Algorithm
 * Implementation for predicting future values based on historical data points.
 * 
 * Formula: y = mx + b
 * m (slope) = (n*Σxy - Σx*Σy) / (n*Σx^2 - (Σx)^2)
 * b (intercept) = (Σy - m*Σx) / n
 */

export const calculateLinearRegression = (data) => {
  // data should be an array of { x: number, y: number }
  const n = data.length;
  if (n < 2) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += data[i].x;
    sumY += data[i].y;
    sumXY += data[i].x * data[i].y;
    sumX2 += data[i].x * data[i].x;
  }

  const denominator = (n * sumX2 - (sumX * sumX));
  if (denominator === 0) return null;

  const slope = (n * sumXY - (sumX * sumY)) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return {
    slope,
    intercept,
    predict: (x) => slope * x + intercept,
    // R-squared value to indicate goodness of fit
    rSquared: calculateRSquared(data, slope, intercept)
  };
};

const calculateRSquared = (data, slope, intercept) => {
  const n = data.length;
  const meanY = data.reduce((sum, p) => sum + p.y, 0) / n;
  
  const ssRes = data.reduce((sum, p) => {
    const prediction = slope * p.x + intercept;
    return sum + Math.pow(p.y - prediction, 2);
  }, 0);
  
  const ssTot = data.reduce((sum, p) => {
    return sum + Math.pow(p.y - meanY, 2);
  }, 0);

  return 1 - (ssRes / ssTot);
};
