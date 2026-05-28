import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

/* ── Global Styles ─────────────────────────────────────────────── */
const style = document.createElement('style')
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    height: 100%;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background-color: #f0ede8;
    color: #121927;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Shared Page Layout ── */
  .page-root {
    width: 100%;
    max-width: 1240px;
    margin: 0;
    padding: 36px 40px;
    min-height: 100vh;
    background: #f0ede8;
    animation: pageFadeIn 0.3s ease both;
  }
  @keyframes pageFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 28px;
  }
  .page-title {
    font-family: 'Manrope', sans-serif;
    font-size: 26px;
    font-weight: 900;
    color: #121927;
    line-height: 1;
    margin: 0 0 6px;
  }
  .page-subtitle {
    font-size: 13px;
    color: #94a3b8;
    margin: 0;
  }

  /* ── Shared Card ── */
  .data-card {
    background: white;
    border-radius: 16px;
    padding: 22px 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  }
  .data-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }
  .data-card-title {
    font-family: 'Manrope', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #121927;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Shared Table ── */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .data-table thead tr th {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #94a3b8;
    padding-bottom: 12px;
    text-align: left;
    border-bottom: 1px solid #f1f5f9;
  }
  .data-table tbody tr td {
    padding: 14px 0;
    border-bottom: 1px solid #f8fafc;
    color: #334155;
  }
  .data-table tbody tr:last-child td { border-bottom: none; }
  .data-table tbody tr:hover td { background: #fafaf9; }
  .sku-cell    { font-weight: 700; color: #64748b; font-size: 12px; }
  .product-name-cell { font-weight: 700; color: #121927; }
  .category-cell { color: #818cf8; font-size: 12px; }
  .font-bold   { font-weight: 700; }
  .text-center { text-align: center; }

  /* ── Shared Buttons ── */
  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    background: linear-gradient(135deg, #735b18, #b1944c);
    border: none;
    border-radius: 12px;
    color: white;
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
    white-space: nowrap;
  }
  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(115,91,24,0.25);
  }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    background: #f1f5f9;
    border: none;
    border-radius: 12px;
    color: #64748b;
    font-family: 'Manrope', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn-secondary:hover { background: #e2e8f0; }

  /* ── Shared Form ── */
  .form-field { display: flex; flex-direction: column; gap: 7px; }
  .form-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #475569;
  }
  .form-input {
    padding: 11px 14px;
    background: #f8f7f4;
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 10px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    color: #121927;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    appearance: none;
  }
  .form-input:focus {
    border-bottom-color: #b1944c;
    box-shadow: 0 4px 12px rgba(177,148,76,0.08);
  }
  .form-input::placeholder { color: #94a3b8; }

  /* ── Shared Status Chips ── */
  .status-chip {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .status-green { background: #f0fdf4; color: #16a34a; }
  .status-amber { background: #fffbeb; color: #d97706; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #d0c5b4; border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: #b1944c; }
`
document.head.appendChild(style)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
