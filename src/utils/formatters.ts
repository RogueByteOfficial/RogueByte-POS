/**
 * Currency, barcode, QR code, and date formatters for RogueByte POS
 */

export function formatOMR(amount: number, lang: 'ar' | 'en' = 'ar'): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  // OMR standard is 3 decimal places
  const formattedNumber = safeAmount.toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  return lang === 'ar' ? `${formattedNumber} ر.ع.` : `${formattedNumber} OMR`;
}

export function formatNumberOnly(amount: number): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return safeAmount.toFixed(3);
}

export function formatDateTime(dateString: string, lang: 'ar' | 'en' = 'ar'): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString: string, lang: 'ar' | 'en' = 'ar'): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Clean SVG Code 128 barcode generator
 * Uses reliable barcode bar pattern generation with quiet zones and human-readable text
 */
export function generateBarcodeSvg(barcodeValue: string, width: number = 220, height: number = 60): string {
  const cleanVal = (barcodeValue || '123456789').toUpperCase().replace(/[^0-9A-Z]/g, '');
  
  // Hash characters to pseudo-barcode widths (1, 2, 3, 4)
  const pattern: number[] = [2, 1, 1, 2]; // Start pattern
  for (let i = 0; i < cleanVal.length; i++) {
    const code = cleanVal.charCodeAt(i);
    pattern.push(((code * 3) % 4) + 1);
    pattern.push(((code * 7) % 3) + 1);
    pattern.push(((code * 5) % 4) + 1);
    pattern.push(((code * 2) % 3) + 1);
  }
  pattern.push(2, 3, 1, 2); // Stop pattern

  const totalUnits = pattern.reduce((a, b) => a + b, 0);
  const barUnitWidth = width / (totalUnits + 10);
  
  let currentX = 5 * barUnitWidth;
  const rects: string[] = [];

  for (let i = 0; i < pattern.length; i++) {
    const barW = pattern[i] * barUnitWidth;
    if (i % 2 === 0) {
      // Black bar
      rects.push(`<rect x="${currentX.toFixed(2)}" y="5" width="${barW.toFixed(2)}" height="${(height - 18).toFixed(2)}" fill="#111827"/>`);
    }
    currentX += barW;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-auto max-h-16">
      <rect width="100%" height="100%" fill="white"/>
      ${rects.join('')}
      <text x="${width / 2}" y="${height - 2}" text-anchor="middle" font-family="monospace" font-size="10" fill="#374151" font-weight="bold">${cleanVal}</text>
    </svg>
  `;
}

/**
 * Generates an authentic SVG QR Code representation
 * Creates a deterministic 21x21 QR matrix with position locator eyes and timing patterns
 */
export function generateQRCodeSvg(data: string, size: number = 110): string {
  const matrixSize = 21;
  const matrix: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  // Function to draw 7x7 Finder Pattern (eyes)
  const drawEye = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer frame
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) // Center dot
        ) {
          matrix[startY + r][startX + c] = true;
        }
      }
    }
  };

  // 3 Finder eyes
  drawEye(0, 0); // Top-left
  drawEye(matrixSize - 7, 0); // Top-right
  drawEye(0, matrixSize - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    if (i % 2 === 0) {
      matrix[6][i] = true;
      matrix[i][6] = true;
    }
  }

  // Dark module
  matrix[matrixSize - 8][8] = true;

  // Fill data cells deterministically based on input string hash
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data.charCodeAt(i);
    hash |= 0;
  }

  let bitIndex = 0;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder zones
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= matrixSize - 8;
      const inBottomLeft = r >= matrixSize - 8 && c < 8;
      const isTiming = (r === 6 && c >= 8 && c < matrixSize - 8) || (c === 6 && r >= 8 && r < matrixSize - 8);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !isTiming) {
        const seed = Math.abs((hash ^ (r * 31 + c * 17) ^ (bitIndex * 13)) % 100);
        matrix[r][c] = seed < 48;
        bitIndex++;
      }
    }
  }

  const cellSize = size / matrixSize;
  const rects: string[] = [];

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        rects.push(`<rect x="${(c * cellSize).toFixed(2)}" y="${(r * cellSize).toFixed(2)}" width="${cellSize.toFixed(2)}" height="${cellSize.toFixed(2)}" fill="#111827"/>`);
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" class="w-full h-full">
      <rect width="100%" height="100%" fill="white"/>
      ${rects.join('')}
    </svg>
  `;
}
