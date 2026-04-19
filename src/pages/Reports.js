const Reports = () => {
  const { transactions, user, metalPrices, portfolio } = useApp();
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear().toString());

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear()))).sort().reverse();
  if (years.length === 0) years.push(new Date().getFullYear());

  const generatePDF = () => {
    const doc = new window.jspdf.jsPDF();
    const periodName = `${months[parseInt(selectedMonth)]} ${selectedYear}`;
    
    // Filter TX for period
    const tMonth = parseInt(selectedMonth);
    const tYear = parseInt(selectedYear);
    const mTx = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === tMonth && d.getFullYear() === tYear;
    });

    const inc = mTx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const exp = mTx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);

    // Header
    doc.setFontSize(22);
    doc.setTextColor(26, 86, 219); // primary color
    doc.text("SpendIQ", 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(`Financial Report: ${periodName}`, 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated for: ${user.name} (${user.email})`, 14, 36);
    doc.text(`Date Generated: ${new Date().toLocaleDateString('en-IN')}`, 14, 42);

    // Summary Table
    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Amount']],
      body: [
        ['Total Income', formatINR(inc)],
        ['Total Expenses', formatINR(exp)],
        ['Net Savings', formatINR(inc - exp)],
        ['Savings Rate', inc > 0 ? `${((inc-exp)/inc*100).toFixed(1)}%` : '0%']
      ],
      theme: 'grid',
      headStyles: { fillColor: [26, 86, 219] },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
    });

    // Category Breakdown
    const catMap = mTx.filter(t=>t.type==='expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
    const catBody = Object.keys(catMap).map(k => [k, formatINR(catMap[k])]).sort((a,b) => parseFloat(b[1].replace(/[₹,]/g,'')) - parseFloat(a[1].replace(/[₹,]/g,'')));

    doc.text("Expense Breakdown", 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Category', 'Amount']],
      body: catBody.length ? catBody : [['No expenses', '-']],
      theme: 'grid',
      headStyles: { fillColor: [126, 58, 242] },
      columnStyles: { 1: { halign: 'right' } }
    });

    // Top Expenses
    const topExp = [...mTx.filter(t=>t.type==='expense')].sort((a,b)=>b.amount-a.amount).slice(0,5);
    const topBody = topExp.map(t => [formatDate(t.date), t.description, t.category, formatINR(t.amount)]);
    
    doc.text("Top 5 Expenses", 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: topBody.length ? topBody : [['-', 'No expenses', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [224, 36, 36] },
      columnStyles: { 3: { halign: 'right' } }
    });

    doc.save(`SpendIQ_Report_${months[parseInt(selectedMonth)]}_${selectedYear}.pdf`);
  };

  const exportCSV = () => {
    const csvData = transactions.map(t => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      Amount: t.amount,
      AutoCategorized: t.isAI ? 'Yes' : 'No'
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions_export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-text">Generate Reports</h1>
      
      <Card className="flex flex-col items-center py-10 text-center gap-6">
         <div className="bg-primary/10 p-4 rounded-full text-primary">
            <lucide.FileText size={48} />
         </div>
         <div>
           <h2 className="text-xl font-bold mb-2">Monthly Financial Statement</h2>
           <p className="text-textSecondary max-w-sm mx-auto">Generate a comprehensive, printable PDF report detailing your income, expenses, and investment breakdown.</p>
         </div>
         
         <div className="flex gap-4 items-center mt-4">
            <Select 
               value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
               options={months.map((m,i)=>({label: m, value: i.toString()}))}
               className="w-40"
            />
            <Select 
               value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
               options={years.map(y=>({label: y, value: y.toString()}))}
               className="w-32"
            />
         </div>

         <div className="flex gap-4 mt-2">
            <Button onClick={generatePDF} className="w-48"><lucide.Download size={18}/> Download PDF</Button>
         </div>
      </Card>

      <Card className="flex justify-between items-center py-6">
         <div>
           <h3 className="font-semibold text-lg">Raw Data Export</h3>
           <p className="text-sm text-textSecondary mt-1">Download all your transaction history as a CSV file to use in Excel or Sheets.</p>
         </div>
         <Button variant="outline" onClick={exportCSV} className="text-green-700 hover:bg-green-50 hover:text-green-800 border-green-200">
           <lucide.Table size={18}/> Export CSV
         </Button>
      </Card>
    </div>
  );
};
