const Analytics = () => {
  const { transactions } = useApp();
  const [period, setPeriod] = React.useState('6'); // months back

  const now = new Date();
  
  const filteredTx = React.useMemo(() => {
    const cutoff = new Date(now.getFullYear(), now.getMonth() - parseInt(period) + 1, 1);
    return transactions.filter(t => new Date(t.date) >= cutoff);
  }, [transactions, period]);

  // Area Chart (Savings Rate Trend)
  const savingsData = [];
  const pInt = parseInt(period);
  for(let i=pInt-1; i>=0; i--) {
    let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    let m = d.getMonth(); let y = d.getFullYear();
    let label = d.toLocaleString('default', { month: 'short' });
    let inc = transactions.filter(t => t.type === 'income' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s,t) => s+t.amount, 0);
    let exp = transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s,t) => s+t.amount, 0);
    let rate = inc > 0 ? parseFloat(((inc-exp)/inc * 100).toFixed(1)) : 0;
    savingsData.push({ name: label, Rate: rate });
  }

  // Bar Chart (Income vs Expense)
  const barData = savingsData.map((s, idx) => {
    let d = new Date(now.getFullYear(), now.getMonth() - (pInt - 1 - idx), 1);
    let m = d.getMonth(); let y = d.getFullYear();
    let inc = transactions.filter(t => t.type === 'income' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s,t) => s+t.amount, 0);
    let exp = transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s,t) => s+t.amount, 0);
    return { name: s.name, Income: inc, Expense: exp };
  });

  // Pie Chart (Category Breakdown)
  const expensesByCategory = filteredTx.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  
  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key, value: expensesByCategory[key]
  })).sort((a,b) => b.value - a.value);

  const totalFilteredExpense = pieData.reduce((s, c) => s + c.value, 0);
  const COLORS = ['#1a56db', '#7e3af2', '#057a55', '#e02424', '#c27803', '#0369a1', '#be185d', '#0f766e', '#4338ca', '#86198f', '#b91c1c'];


  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text');
  const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--color-surface');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text">Analytics</h1>
        <Select 
           value={period} onChange={(e) => setPeriod(e.target.value)}
           options={[{label: 'Last 3 Months', value: '3'}, {label: 'Last 6 Months', value: '6'}, {label: 'Last 12 Months', value: '12'}]}
           className="w-48"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Savings Rate Trend</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7e3af2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#7e3af2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v)=>`${v}%`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip formatter={(v)=>`${v}%`} />
                <Area type="monotone" dataKey="Rate" stroke="#7e3af2" fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Income vs Expenses</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke={textColor} axisLine={false} tickLine={false} />
                <YAxis stroke={textColor} axisLine={false} tickLine={false} tickFormatter={(v)=>`₹${v/1000}k`} />
                <Tooltip formatter={(value) => formatINR(value)} contentStyle={{ backgroundColor: surfaceColor, borderColor: 'var(--color-border)', color: textColor }} />
                <Legend wrapperStyle={{ color: textColor }} />
                <Bar dataKey="Income" fill="#057a55" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#e02424" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col lg:flex-row gap-8">
         <div className="flex-1">
           <h3 className="font-semibold text-lg mb-4">Category Breakdown</h3>
           <div className="h-64 w-full relative">
             {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatINR(value)} />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <div className="flex h-full items-center justify-center text-textSecondary">No data for selected period</div>
             )}
             {pieData.length > 0 && <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-textSecondary text-sm">Total</span>
                <span className="text-xl font-bold">{formatINR(totalFilteredExpense)}</span>
             </div>}
           </div>
         </div>
         <div className="flex-1 overflow-y-auto max-h-80 pr-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-textSecondary">
                <tr>
                  <th className="py-2 px-3 font-medium">Category</th>
                  <th className="py-2 px-3 font-medium text-right">Amount</th>
                  <th className="py-2 px-3 font-medium text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pieData.map((d, i) => (
                  <tr key={d.name}>
                    <td className="py-3 px-3 flex items-center gap-2">
                       <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></span>
                       {d.name}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">{formatINR(d.value)}</td>
                    <td className="py-3 px-3 text-right text-textSecondary">{((d.value/totalFilteredExpense)*100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </Card>
    </div>
  );
};
