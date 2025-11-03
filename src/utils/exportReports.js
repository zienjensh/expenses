import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// Format date for display
const formatDate = (dateString, language) => {
  const date = new Date(dateString);
  const monthNames = language === 'ar' 
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// Load logo as base64 (if available)
const loadLogo = async () => {
  try {
    const response = await fetch('/Logo.png');
    if (response.ok) {
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.warn('Could not load logo:', error);
  }
  return null;
};

// Export to CSV with BOM for Arabic support - matching PDF design
export const exportToCSV = (expenses, revenues, translations, currency, language, summary, fileName = null) => {
  // Helper to escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  // Build CSV data matching PDF structure
  const csvData = [
    // Header
    [translations.reportsTitle || 'Financial Report'],
    [translations.reportsDescription || 'Comprehensive Financial Analysis'],
    [`${translations.date || 'Date'}: ${formatDate(new Date().toISOString(), language)}`],
    [], // Empty row
    // Summary Section (matching PDF cards)
    [translations.summary || 'Summary'],
    [],
    [translations.totalExpenses || 'Total Expenses', `${summary.totalExpenses.toFixed(2)} ${currency}`],
    [translations.totalRevenues || 'Total Revenues', `${summary.totalRevenues.toFixed(2)} ${currency}`],
    [translations.netIncome || 'Net Income', `${summary.net.toFixed(2)} ${currency}`],
    [translations.expenseRatio || 'Expense Ratio', `${summary.expenseRatio.toFixed(1)}%`],
    [], // Empty row
    [], // Empty row
    // Transactions Section
    [language === 'ar' ? 'المعاملات' : 'Transactions'],
    [],
    // Table Headers
    [
      translations.type || 'Type',
      translations.amount || 'Amount',
      translations.currency || 'Currency',
      translations.category || 'Category',
      translations.description || 'Description',
      translations.date || 'Date'
    ],
    // Expenses rows
    ...expenses.map(e => [
      translations.expenseTransaction || 'Expense',
      (e.amount || 0).toFixed(2),
      currency,
      e.category || translations.other || 'أخرى',
      e.description || '',
      formatDate(e.date || e.createdAt, language)
    ]),
    // Revenues rows
    ...revenues.map(r => [
      translations.revenueTransaction || 'Revenue',
      (r.amount || 0).toFixed(2),
      currency,
      r.category || translations.other || 'أخرى',
      r.description || '',
      formatDate(r.date || r.createdAt, language)
    ]),
    [], // Empty row
    // Footer
    [language === 'ar' 
      ? `${translations.appName || 'فلوسي'} - ${translations.appNameEn || 'Falusy'}`
      : `${translations.appNameEn || 'Falusy'} - ${translations.appName || 'فلوسي'}`
    ],
    [language === 'ar' ? 'تم إنشاء هذا التقرير تلقائياً' : 'This report was generated automatically']
  ];
  
  // Use BOM for UTF-8 encoding to support Arabic
  const BOM = '\uFEFF';
  const csv = BOM + csvData.map(row => 
    row.map(cell => escapeCSV(cell)).join(',')
  ).join('\r\n');
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const defaultFileName = language === 'ar' 
    ? `تقرير-مالي-${new Date().toISOString().split('T')[0]}.csv`
    : `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
  link.download = fileName || defaultFileName;
  link.click();
};

// Export to Excel with full Arabic support - matching PDF design
export const exportToExcel = async (expenses, revenues, translations, currency, language, summary, fileName = null) => {
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Build main report sheet matching PDF structure
  const reportData = [
    // Header Section
    [translations.reportsTitle || 'Financial Report'],
    [translations.reportsDescription || 'Comprehensive Financial Analysis'],
    [`${translations.date || 'Date'}: ${formatDate(new Date().toISOString(), language)}`],
    [], // Empty row
    // Summary Section (matching PDF cards layout)
    [translations.summary || 'Summary'],
    [],
    [translations.totalExpenses || 'Total Expenses', `${summary.totalExpenses.toFixed(2)} ${currency}`],
    [translations.totalRevenues || 'Total Revenues', `${summary.totalRevenues.toFixed(2)} ${currency}`],
    [translations.netIncome || 'Net Income', `${summary.net.toFixed(2)} ${currency}`],
    [translations.expenseRatio || 'Expense Ratio', `${summary.expenseRatio.toFixed(1)}%`],
    [], // Empty row
    [], // Empty row
    // Transactions Section
    [language === 'ar' ? 'المعاملات' : 'Transactions'],
    [],
    // Table Headers
    [
      translations.type || 'Type',
      translations.amount || 'Amount',
      translations.currency || 'Currency',
      translations.category || 'Category',
      translations.description || 'Description',
      translations.date || 'Date'
    ],
    // Expenses rows
    ...expenses.map(e => [
      translations.expenseTransaction || 'Expense',
      parseFloat(e.amount || 0),
      currency,
      e.category || translations.other || 'أخرى',
      e.description || '',
      formatDate(e.date || e.createdAt, language)
    ]),
    // Revenues rows
    ...revenues.map(r => [
      translations.revenueTransaction || 'Revenue',
      parseFloat(r.amount || 0),
      currency,
      r.category || translations.other || 'أخرى',
      r.description || '',
      formatDate(r.date || r.createdAt, language)
    ]),
    [], // Empty row
    // Footer
    [language === 'ar' 
      ? `${translations.appName || 'فلوسي'} - ${translations.appNameEn || 'Falusy'}`
      : `${translations.appNameEn || 'Falusy'} - ${translations.appName || 'فلوسي'}`
    ],
    [language === 'ar' ? 'تم إنشاء هذا التقرير تلقائياً' : 'This report was generated automatically']
  ];
  
  // Create worksheet from data
  const reportSheet = XLSX.utils.aoa_to_sheet(reportData);
  
  // Set column widths
  reportSheet['!cols'] = [
    { wch: 18 }, // Type
    { wch: 20 }, // Amount
    { wch: 12 }, // Currency
    { wch: 22 }, // Category
    { wch: 35 }, // Description
    { wch: 22 }  // Date
  ];
  
  // Note: XLSX standard library doesn't support cell styling
  // The data structure matches PDF format for consistency
  
  // Add sheet to workbook
  XLSX.utils.book_append_sheet(workbook, reportSheet, language === 'ar' ? 'التقرير' : 'Report');
  
  // Write file (XLSX standard library - data structure matches PDF format)
  const defaultFileName = language === 'ar'
    ? `تقرير-مالي-${new Date().toISOString().split('T')[0]}.xlsx`
    : `financial-report-${new Date().toISOString().split('T')[0]}.xlsx`;
  
  XLSX.writeFile(workbook, fileName || defaultFileName);
};

// Export to PDF using HTML2Canvas for full Arabic support
export const exportToPDF = async (expenses, revenues, translations, currency, language, summary, fileName = null) => {
  const logoData = await loadLogo();
  
  // Create a temporary HTML element for the report - isolated from page layout
  const reportHTML = document.createElement('div');
  reportHTML.id = 'pdf-export-temp-container';
  reportHTML.className = 'pdf-report';
  reportHTML.style.cssText = `
    position: absolute;
    left: -999999px;
    top: -999999px;
    width: 210mm;
    min-height: 297mm;
    padding: 20mm;
    background: white;
    font-family: ${language === 'ar' ? "'Tajawal', 'Arial', 'Segoe UI', sans-serif" : "'Arial', 'Helvetica', sans-serif"};
    direction: ${language === 'ar' ? 'rtl' : 'ltr'};
    font-size: 12px;
    color: #000;
    box-sizing: border-box;
    line-height: 1.6;
    text-align: ${language === 'ar' ? 'right' : 'left'};
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
    z-index: -9999;
    isolation: isolate;
    contain: layout style paint;
  `;
  
  // Create isolated container to prevent CSS interference
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -999999px;
    top: -999999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
    visibility: hidden;
    pointer-events: none;
    z-index: -9999;
    isolation: isolate;
  `;
  container.appendChild(reportHTML);
  
  // Add font-face for Arabic support with scoped class
  const style = document.createElement('style');
  style.id = 'pdf-export-temp-style';
  style.textContent = `
    @font-face {
      font-family: 'Tajawal-PDF';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l_6gHrFpi5s.woff2) format('woff2');
      unicode-range: U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC;
    }
    @font-face {
      font-family: 'Tajawal-PDF';
      font-style: normal;
      font-weight: 700;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l_6gHrFpi5s.woff2) format('woff2');
      unicode-range: U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC;
    }
    #pdf-export-temp-container.pdf-report,
    #pdf-export-temp-container.pdf-report * { 
      font-family: ${language === 'ar' ? "'Tajawal-PDF', 'Tajawal', 'Arial', 'Segoe UI', sans-serif" : "'Arial', 'Helvetica', sans-serif"} !important; 
      direction: ${language === 'ar' ? 'rtl' : 'ltr'} !important;
      box-sizing: border-box !important;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(container);
  
  // Build HTML content
  const headerHTML = `
    <div style="margin-bottom: 30px; border-bottom: 3px solid #E50914; padding-bottom: 20px;">
      ${logoData ? `<img src="${logoData}" style="width: 60px; height: 60px; float: ${language === 'ar' ? 'right' : 'left'}; margin-${language === 'ar' ? 'left' : 'right'}: 20px;" />` : ''}
      <h1 style="color: #E50914; font-size: 32px; font-weight: bold; margin: 0 0 10px 0; text-align: center;">
        ${translations.reportsTitle || 'Financial Report'}
      </h1>
      <p style="color: #666; font-size: 14px; text-align: center; margin: 0 0 10px 0;">
        ${translations.reportsDescription || 'Comprehensive Financial Analysis'}
      </p>
      <p style="color: #999; font-size: 11px; text-align: ${language === 'ar' ? 'right' : 'left'}; margin: 0;">
        ${translations.date || 'Date'}: ${formatDate(new Date().toISOString(), language)}
      </p>
    </div>
  `;
  
  const summaryHTML = `
    <div style="margin-bottom: 30px;">
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px;">
        <div style="border: 2px solid #E50914; border-radius: 10px; padding: 15px; background: #FFE5E5;">
          <div style="color: #666; font-size: 11px; margin-bottom: 8px;">
            ${translations.totalExpenses || 'Total Expenses'}
          </div>
          <div style="color: #E50914; font-size: 20px; font-weight: bold;">
            ${summary.totalExpenses.toFixed(2)} ${currency}
          </div>
        </div>
        <div style="border: 2px solid #22c55e; border-radius: 10px; padding: 15px; background: #E5FFE5;">
          <div style="color: #666; font-size: 11px; margin-bottom: 8px;">
            ${translations.totalRevenues || 'Total Revenues'}
          </div>
          <div style="color: #22c55e; font-size: 20px; font-weight: bold;">
            ${summary.totalRevenues.toFixed(2)} ${currency}
          </div>
        </div>
        <div style="border: 2px solid ${summary.net >= 0 ? '#22c55e' : '#E50914'}; border-radius: 10px; padding: 15px; background: ${summary.net >= 0 ? '#E5FFE5' : '#FFE5E5'};">
          <div style="color: #666; font-size: 11px; margin-bottom: 8px;">
            ${translations.netIncome || 'Net Income'}
          </div>
          <div style="color: ${summary.net >= 0 ? '#22c55e' : '#E50914'}; font-size: 20px; font-weight: bold;">
            ${summary.net >= 0 ? '+' : ''}${summary.net.toFixed(2)} ${currency}
          </div>
        </div>
        <div style="border: 2px solid #f59e0b; border-radius: 10px; padding: 15px; background: #FFF4E5;">
          <div style="color: #666; font-size: 11px; margin-bottom: 8px;">
            ${translations.expenseRatio || 'Expense Ratio'}
          </div>
          <div style="color: #f59e0b; font-size: 20px; font-weight: bold;">
            ${summary.expenseRatio.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Build table rows
  const tableRows = [
    `
      <tr style="background: #E50914; color: white; font-weight: bold;">
        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">${translations.type || 'Type'}</th>
        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">${translations.amount || 'Amount'}</th>
        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">${translations.currency || 'Currency'}</th>
        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">${translations.category || 'Category'}</th>
        <th style="padding: 12px; text-align: ${language === 'ar' ? 'right' : 'left'}; border: 1px solid #ddd;">${translations.description || 'Description'}</th>
        <th style="padding: 12px; text-align: center; border: 1px solid #ddd;">${translations.date || 'Date'}</th>
      </tr>
    `,
    ...expenses.map(e => `
      <tr style="background: #FFE5E5;">
        <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold; color: #E50914;">
          ${translations.expenseTransaction || 'Expense'}
        </td>
        <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${(e.amount || 0).toFixed(2)}</td>
        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${currency}</td>
        <td style="padding: 10px; text-align: ${language === 'ar' ? 'right' : 'left'}; border: 1px solid #ddd;">${e.category || translations.other || 'أخرى'}</td>
        <td style="padding: 10px; text-align: ${language === 'ar' ? 'right' : 'left'}; border: 1px solid #ddd;">${(e.description || '').substring(0, 40) || '-'}</td>
        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${formatDate(e.date || e.createdAt, language)}</td>
      </tr>
    `),
    ...revenues.map(r => `
      <tr style="background: #E5FFE5;">
        <td style="padding: 10px; text-align: center; border: 1px solid #ddd; font-weight: bold; color: #22c55e;">
          ${translations.revenueTransaction || 'Revenue'}
        </td>
        <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${(r.amount || 0).toFixed(2)}</td>
        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${currency}</td>
        <td style="padding: 10px; text-align: ${language === 'ar' ? 'right' : 'left'}; border: 1px solid #ddd;">${r.category || translations.other || 'أخرى'}</td>
        <td style="padding: 10px; text-align: ${language === 'ar' ? 'right' : 'left'}; border: 1px solid #ddd;">${(r.description || '').substring(0, 40) || '-'}</td>
        <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${formatDate(r.date || r.createdAt, language)}</td>
      </tr>
    `)
  ];
  
  const tableHTML = `
    <div style="margin-bottom: 30px;">
      <h2 style="color: #E50914; font-size: 18px; font-weight: bold; margin-bottom: 15px; text-align: ${language === 'ar' ? 'right' : 'left'};">
        ${language === 'ar' ? 'المعاملات' : 'Transactions'}
      </h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; direction: ${language === 'ar' ? 'rtl' : 'ltr'};">
        ${tableRows.join('')}
      </table>
    </div>
  `;
  
  const footerHTML = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #E50914; text-align: center;">
      ${logoData ? `<img src="${logoData}" style="width: 40px; height: 40px; margin: 0 auto 10px; display: block;" />` : ''}
      <div style="color: #E50914; font-size: 14px; font-weight: bold; margin-bottom: 5px;">
        ${language === 'ar' 
          ? `${translations.appName || 'فلوسي'} - ${translations.appNameEn || 'Falusy'}`
          : `${translations.appNameEn || 'Falusy'} - ${translations.appName || 'فلوسي'}`
        }
      </div>
      <div style="color: #999; font-size: 10px;">
        ${language === 'ar' ? 'تم إنشاء هذا التقرير تلقائياً' : 'This report was generated automatically'}
      </div>
    </div>
  `;
  
  reportHTML.innerHTML = headerHTML + summaryHTML + tableHTML + footerHTML;
  
  try {
    // Make element visible temporarily for html2canvas
    reportHTML.style.visibility = 'visible';
    reportHTML.style.opacity = '1';
    container.style.visibility = 'visible';
    
    // Wait for fonts to load (especially for Arabic)
    if (language === 'ar') {
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Convert HTML to canvas with better settings
    const canvas = await html2canvas(reportHTML, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: reportHTML.scrollWidth,
      height: reportHTML.scrollHeight,
      windowWidth: reportHTML.scrollWidth,
      windowHeight: reportHTML.scrollHeight,
      allowTaint: true
    });
    
    // Hide again immediately after capture
    reportHTML.style.visibility = 'hidden';
    reportHTML.style.opacity = '0';
    container.style.visibility = 'hidden';
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    const doc = new jsPDF('p', 'mm', 'a4');
    let position = 0;
    
    // Add first page
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save PDF
    const defaultFileName = language === 'ar'
      ? `تقرير-مالي-${new Date().toISOString().split('T')[0]}.pdf`
      : `financial-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName || defaultFileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Clean up - remove container and style
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    // Remove style if exists
    const tempStyle = document.getElementById('pdf-export-temp-style');
    if (tempStyle && tempStyle.parentNode) {
      tempStyle.parentNode.removeChild(tempStyle);
    }
    // Force reflow to ensure layout is restored
    document.body.offsetHeight;
  }
};
