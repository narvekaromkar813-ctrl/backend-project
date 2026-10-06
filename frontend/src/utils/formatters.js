/**
 * Utility formatters for Indian Rupee currency, energy, power, percentages, and dates
 */

export const formatCurrency = (amount, decimals = 0) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(num);
};

export const formatEnergy = (kWh, decimals = 2) => {
  if (kWh === undefined || kWh === null || isNaN(Number(kWh))) {
    return '0.00 kWh';
  }
  return `${Number(kWh).toFixed(decimals)} kWh`;
};

export const formatPower = (kW, decimals = 2) => {
  if (kW === undefined || kW === null || isNaN(Number(kW))) {
    return '0.00 kW';
  }
  return `${Number(kW).toFixed(decimals)} kW`;
};

export const formatPercentage = (val, decimals = 1) => {
  if (val === undefined || val === null || isNaN(Number(val))) {
    return '0%';
  }
  return `${Number(val).toFixed(decimals)}%`;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '—';
  }
};

export const formatDateTime = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
};

export const formatTime = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '—';
  }
};
