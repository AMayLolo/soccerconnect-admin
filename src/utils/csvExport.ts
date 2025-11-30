// Utility functions for exporting data to CSV

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function escapeCSVField(field: any): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  // Escape double quotes by doubling them, and wrap in quotes if contains comma, newline, or quote
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function arrayToCSV(headers: string[], rows: any[][]): string {
  const headerRow = headers.map(escapeCSVField).join(',');
  const dataRows = rows.map(row => row.map(escapeCSVField).join(',')).join('\n');
  return `${headerRow}\n${dataRows}`;
}
