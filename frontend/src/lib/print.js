export function printWindow(title, bodyHtml) {
  const win = window.open('', '_blank')
  win.document.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 16px; }
        h2 { text-align: center; font-size: 13px; margin-bottom: 2px; }
        h3 { text-align: center; font-size: 11px; font-weight: normal; margin-bottom: 12px; }
        .info { margin-bottom: 8px; }
        .info span { margin-right: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #000; padding: 4px 6px; text-align: left; vertical-align: middle; }
        th { background: #f0f0f0; font-weight: bold; text-align: center; }
        td.center { text-align: center; }
        .ttd { height: 40px; }
        @media print {
          body { padding: 0; }
          @page { margin: 12mm; }
        }
      </style>
    </head>
    <body>
      ${bodyHtml}
      <script>window.onload = () => { window.print(); }<\/script>
    </body>
    </html>
  `)
  win.document.close()
}
