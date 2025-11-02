/**
 * Format number as Indian Rupees (INR)
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places
 * @returns {string} Formatted currency string
 */
export function formatINR(amount, showDecimals = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const num = parseFloat(amount);
  
  // Indian numbering system: groups of 2 after first 3 digits
  // Example: 12,34,567.89
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });

  return formatter.format(num);
}

/**
 * Format number in Indian numbering system without currency symbol
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export function formatIndianNumber(num) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Compact format for large amounts (Lakhs, Crores)
 * @param {number} amount - The amount to format
 * @returns {string} Compact formatted string
 */
export function formatCompactINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const num = parseFloat(amount);

  if (num >= 10000000) {
    // Crores (1 Crore = 10,000,000)
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    // Lakhs (1 Lakh = 100,000)
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (num >= 1000) {
    // Thousands
    return `₹${(num / 1000).toFixed(2)} K`;
  }

  return `₹${num.toFixed(2)}`;
}
