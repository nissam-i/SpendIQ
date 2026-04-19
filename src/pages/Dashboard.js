const Dashboard = () => {
  const { transactions, user, metalPrices, budgets } = useApp();
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const thisMonthTx = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = thisMonthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = thisMonthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // Chart data
  const expensesByCategory = thisMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  
  const COLORS = ['#1a56db', '#7e3af2', '#057a55', '#e02424', '#c27803', '#0369a1', '#be185d', '#0f766e'];
  const pieData = Object.keys(expensesByCategory).map(key => ({
    name: key, value: expensesByCategory[key]
  })).sort((a,b) => b.value - a.value);

  // 6 months bar chart
  const barData = [];
  for(let i=5; i>=0; i--) {
    let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    let m = d.getMonth(); let y = d.getFullYear();
    let label = d.toLocaleString('default', { month: 'short' });
    let inc = transactions.filter(t => t.type === 'income' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s,t) => s+t.amount, 0);
    let exp = transactions.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === m && new Date(t.date).getFullYear() === y).reduce((s,t) => s+t.amount, 0);
    barData.push({ name: label, Income: inc, Expense: exp });
  }


  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text');
  const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--color-surface');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Welcome back, {user?.name}</h1>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col gap-2">
          <span className="text-sm font-medium text-textSecondary">Total Income (This Month)</span>
          <span className="text-2xl font-bold text-success">{formatINR(totalIncome)}</span>
        </Card>
        <Card className="flex flex-col gap-2">
          <span className="text-sm font-medium text-textSecondary">Total Expenses (This Month)</span>
          <span className="text-2xl font-bold text-danger">{formatINR(totalExpense)}</span>
        </Card>
        <Card className="flex flex-col gap-2">
          <span className="text-sm font-medium text-textSecondary">Net Savings</span>
          <span className="text-2xl font-bold text-primary">{formatINR(netSavings)}</span>
        </Card>
        <Card className="flex flex-col gap-2">
          <span className="text-sm font-medium text-textSecondary">Savings Rate</span>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-secondary">{savingsRate}%</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
               <div className="bg-secondary h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <Card className="lg:col-span-2 flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Income vs Expense (6 Months)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} stroke={textColor} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} stroke={textColor} />
                <Tooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => formatINR(value)} contentStyle={{ backgroundColor: surfaceColor, borderColor: 'var(--color-border)', color: textColor }} />
                <Legend wrapperStyle={{ color: textColor }} />
                <Bar dataKey="Income" fill="#057a55" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#e02424" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Expenses by Category</h3>
          <div className="h-64 w-full relative">
             {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: surfaceColor, borderColor: 'var(--color-border)', color: textColor, borderRadius: '8px' }} itemStyle={{ color: textColor }} formatter={(value) => formatINR(value)} />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <div className="flex h-full items-center justify-center text-textSecondary">No expenses this month</div>
             )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Live Metal Prices */}
         <div className="col-span-1 space-y-4">
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border border-amber-200">
               <div className="flex items-center justify-between mb-2">
                 <span className="font-semibold text-amber-800 flex items-center gap-2"><lucide.Coins size={18} /> Gold Base</span>
                 <span className="text-xs text-amber-600 font-medium">Live</span>
               </div>
               <div className="text-2xl font-bold text-amber-900">{formatINR(metalPrices.gold * 10)} / 10g</div>
               <div className="text-sm text-green-600 flex items-center mt-1"><lucide.TrendingUp size={14} className="mr-1"/> +0.15% <span className="text-textSecondary ml-2">Simulated</span></div>
            </Card>
            <Card className="bg-gradient-to-br from-gray-50 to-slate-100 border border-border">
               <div className="flex items-center justify-between mb-2">
                 <span className="font-semibold text-slate-700 flex items-center gap-2"><lucide.Circle size={18} /> Silver Base</span>
                 <span className="text-xs text-slate-500 font-medium">Live</span>
               </div>
               <div className="text-2xl font-bold text-slate-800">{formatINR(metalPrices.silver)} / 1g</div>
               <div className="text-sm text-green-600 flex items-center mt-1"><lucide.TrendingUp size={14} className="mr-1"/> +0.12% <span className="text-textSecondary ml-2">Simulated</span></div>
            </Card>
            
            {/* Quick Budgets */}
            <Card className="flex flex-col gap-4">
               <h3 className="font-semibold text-lg">Budget Status</h3>
               {budgets.slice(0,3).map(b => {
                 const spent = thisMonthTx.filter(t => t.type === 'expense' && t.category === b.category).reduce((s,t)=>s+t.amount,0);
                 const pct = Math.min(100, Math.round((spent/b.limit)*100));
                 return (
                   <div key={b.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{b.category}</span>
                        <span className="text-textSecondary">{formatINR(spent)} / {formatINR(b.limit)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${pct > 90 ? 'bg-danger' : pct > 75 ? 'bg-warning' : 'bg-success'}`} style={{width: `${pct}%`}}></div>
                      </div>
                   </div>
                 )
               })}
            </Card>
         </div>

         {/* Recent Transactions */}
         <Card className="lg:col-span-2">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-lg">Recent Transactions</h3>
             <ReactRouterDOM.Link to="/transactions" className="text-sm text-primary hover:underline font-medium">View All</ReactRouterDOM.Link>
           </div>
           <div className="space-y-3">
              {transactions.slice(0, 7).map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 hover:bg-bg rounded-lg transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'income' ? <lucide.ArrowDownLeft size={20} /> : <lucide.ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <div className="font-medium text-text flex items-center gap-2">
                        {t.description}
                        {t.isAI && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">AI</span>}
                      </div>
                      <div className="text-xs text-textSecondary flex items-center gap-1"><lucide.Tag size={12}/> {t.category} • {formatDate(t.date)}</div>
                    </div>
                  </div>
                  <div className={`font-semibold ${t.type === 'income' ? 'text-success' : 'text-text'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                  </div>
                </div>
              ))}
           </div>
         </Card>
      </div>
    </div>
  );
};
