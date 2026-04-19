const AppContext = React.createContext();

const useApp = () => React.useContext(AppContext);

const AppProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [budgets, setBudgets] = React.useState([]);
  const [portfolio, setPortfolio] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [settings, setSettings] = React.useState({ 
    themeMode: 'light', 
    accentColor: 'blue', 
    currency: 'INR', 
    alertsEnabled: true,
    geminiKey: ''
  });
  
  const [metalPrices, setMetalPrices] = React.useState({
    gold: 9500, // per gram (95000 / 10g)
    silver: 95 // per gram
  });
  
  const [priceHistory, setPriceHistory] = React.useState({
    gold: [], silver: []
  });

  // Init from localStorage
  React.useEffect(() => {
    const savedUser = localStorage.getItem('fintrack_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      initData(JSON.parse(savedUser).email === 'demo@fintrack.in');
    }
  }, []);

  const initData = (isDemo = false) => {
    const st = localStorage.getItem('fintrack_transactions');
    if (!st && isDemo) {
      const demo = generateSampleData();
      setTransactions(demo.transactions);
      setBudgets(demo.budgets);
      setPortfolio(demo.portfolio);
      setNotifications(demo.notifications);
      saveAll(demo.transactions, demo.budgets, demo.portfolio, demo.notifications, settings);
    } else {
      if (st) setTransactions(JSON.parse(st));
      const sb = localStorage.getItem('fintrack_budgets');
      if (sb) setBudgets(JSON.parse(sb));
      const sp = localStorage.getItem('fintrack_portfolio');
      if (sp) setPortfolio(JSON.parse(sp));
      const sn = localStorage.getItem('fintrack_notifications');
      if (sn) setNotifications(JSON.parse(sn));
      const ss = localStorage.getItem('fintrack_settings');
      if (ss) {
        let parsed = JSON.parse(ss);
        if(!parsed.geminiKey) parsed.geminiKey = '';
        setSettings(parsed);
      }
    }
  };

  const saveAll = (t = transactions, b = budgets, p = portfolio, n = notifications, s = settings) => {
    localStorage.setItem('fintrack_transactions', JSON.stringify(t));
    localStorage.setItem('fintrack_budgets', JSON.stringify(b));
    localStorage.setItem('fintrack_portfolio', JSON.stringify(p));
    localStorage.setItem('fintrack_notifications', JSON.stringify(n));
    localStorage.setItem('fintrack_settings', JSON.stringify(s));
  };

  const login = (email, password) => {
    const nUser = { id: generateUUID(), name: email.split('@')[0], email, token: btoa(email+Date.now()) };
    setUser(nUser);
    localStorage.setItem('fintrack_user', JSON.stringify(nUser));
    initData(email === 'demo@fintrack.in');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fintrack_user');
    // We don't wipe data on logout so they can log back in and see it, 
    // but in a real app it would be scoped by user ID.
  };

  // Simulated live metal prices
  React.useEffect(() => {
    const simulateMetals = () => {
      setMetalPrices(prev => {
        // Drift ±0.15% max
        const goldDrift = 1 + (Math.random() * 0.003 - 0.0015);
        const silverDrift = 1 + (Math.random() * 0.003 - 0.0015);
        return {
          gold: parseFloat((prev.gold * goldDrift).toFixed(2)),
          silver: parseFloat((prev.silver * silverDrift).toFixed(2))
        };
      });
    };
    
    // Generate 30 days history
    const history = { gold: [], silver: [] };
    let curG = 9500; let curS = 95;
    const now = new Date();
    for(let i=30; i>=0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      history.gold.push({ date: dateStr, price: curG });
      history.silver.push({ date: dateStr, price: curS });
      curG = parseFloat((curG * (1 + (Math.random() * 0.02 - 0.01))).toFixed(2));
      curS = parseFloat((curS * (1 + (Math.random() * 0.02 - 0.01))).toFixed(2));
    }
    setPriceHistory(history);
    setMetalPrices({ gold: curG, silver: curS });

    const interval = setInterval(simulateMetals, 60000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const mode = settings.themeMode === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.themeMode;
    applyTheme(mode, settings.accentColor || 'blue');
  }, [settings.themeMode, settings.accentColor]);

  // Financial Context Builder
  const getFinancialContext = () => {
    const now = new Date();
    const thisMonth = transactions.filter(t =>
      new Date(t.date).getMonth() === now.getMonth() &&
      new Date(t.date).getFullYear() === now.getFullYear()
    );

    const totalIncome = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0;

    const byCategory = {};
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    const categoryText = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `  - ${cat}: ₹${amt.toLocaleString('en-IN')}`)
      .join('\n');

    const budgetText = budgets.map(b => {
      const spent = byCategory[b.category] || 0;
      const pct = ((spent / b.limit) * 100).toFixed(0);
      return `  - ${b.category}: ₹${spent.toLocaleString('en-IN')} / ₹${b.limit.toLocaleString('en-IN')} (${pct}%)`;
    }).join('\n');

    const portfolioText = portfolio.map(h => {
      const currentPrice = h.metal === 'Gold' ? metalPrices.gold : metalPrices.silver;
      const currentValue = h.quantity * currentPrice;
      const invested = h.quantity * h.buyPrice;
      const pnl = currentValue - invested;
      const pnlPct = ((pnl / invested) * 100).toFixed(2);
      return `  - ${h.metal}: ${h.quantity}g | Bought @ ₹${h.buyPrice}/g | Current @ ₹${currentPrice}/g | P&L: ₹${pnl.toFixed(0)} (${pnlPct}%)`;
    }).join('\n');

    return `
📅 Month: ${now.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
💰 Income: ₹${totalIncome.toLocaleString('en-IN')}
💸 Expenses: ₹${totalExpense.toLocaleString('en-IN')}
💹 Savings Rate: ${savingsRate}%

📊 SPENDING BY CATEGORY THIS MONTH:
${categoryText || '  No expenses recorded'}

🎯 BUDGET STATUS:
${budgetText || '  No budgets set'}

🥇 INVESTMENT PORTFOLIO:
${portfolioText || '  No holdings'}

📈 LIVE METAL PRICES:
  - Gold: ₹${(metalPrices.gold * 10).toLocaleString('en-IN')}/10g (₹${metalPrices.gold}/g)
  - Silver: ₹${metalPrices.silver}/g
`;
  };

  const clearAllData = () => {
    setTransactions([]);
    setBudgets([]);
    setPortfolio([]);
    setNotifications([]);
    saveAll([], [], [], [], settings);
  };

  const value = {
    user, login, logout,
    transactions, setTransactions,
    budgets, setBudgets,
    portfolio, setPortfolio,
    notifications, setNotifications,
    settings, setSettings,
    metalPrices, priceHistory,
    saveAll, getFinancialContext, clearAllData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
