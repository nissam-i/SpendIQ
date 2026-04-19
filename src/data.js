const generateSampleData = () => {
  const transactions = [];
  const now = new Date();
  
  // Monthly salary (income)
  for (let m = 0; m < 3; m++) {
    const date = new Date(now.getFullYear(), now.getMonth()-m, 1);
    transactions.push({
      id: generateUUID(), type: 'income', amount: 45000,
      description: 'Salary Credit - Company Pvt Ltd',
      category: 'Income', date: date.toISOString().split('T')[0],
      isAI: true
    });
  }
  
  const expenseTemplates = [
    { desc: 'Zomato Order', amt: [150,600], cat: 'Food & Dining', freq: 8 },
    { desc: 'Swiggy Delivery', amt: [200,500], cat: 'Food & Dining', freq: 6 },
    { desc: 'Uber Ride', amt: [80,300], cat: 'Transportation', freq: 12 },
    { desc: 'Metro Card Recharge', amt: [200,500], cat: 'Transportation', freq: 2 },
    { desc: 'Netflix Subscription', amt: [199,199], cat: 'Entertainment', freq: 1 },
    { desc: 'Airtel Postpaid Bill', amt: [599,599], cat: 'Utilities', freq: 1 },
    { desc: 'Electricity Bill BESCOM', amt: [800,2000], cat: 'Utilities', freq: 1 },
    { desc: 'Amazon Shopping', amt: [300,3000], cat: 'Shopping', freq: 4 },
    { desc: 'Pharmacy - Apollo', amt: [150,800], cat: 'Healthcare', freq: 2 },
    { desc: 'Gym Monthly Fee', amt: [1200,1200], cat: 'Personal Care', freq: 1 },
    { desc: 'House Rent', amt: [12000,12000], cat: 'Rent', freq: 1 },
    { desc: 'Udemy Course', amt: [399,599], cat: 'Education', freq: 1 },
  ];

  for (let m = 0; m < 3; m++) {
    const month = now.getMonth() - m;
    expenseTemplates.forEach(t => {
      for (let i = 0; i < t.freq; i++) {
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const date = new Date(now.getFullYear(), month, randomDay);
        if (date > now) continue;
        const amount = Math.floor(Math.random() * (t.amt[1] - t.amt[0] + 1)) + t.amt[0];
        transactions.push({
          id: generateUUID(), type: 'expense', amount,
          description: t.desc,
          category: t.cat, date: date.toISOString().split('T')[0],
          isAI: true
        });
      }
    });
  }
  
  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  const budgets = [
    { id: generateUUID(), category: 'Food & Dining', limit: 8000, alertThreshold: 80 },
    { id: generateUUID(), category: 'Transportation', limit: 3000, alertThreshold: 80 },
    { id: generateUUID(), category: 'Entertainment', limit: 2000, alertThreshold: 80 },
    { id: generateUUID(), category: 'Shopping', limit: 5000, alertThreshold: 80 },
    { id: generateUUID(), category: 'Utilities', limit: 3500, alertThreshold: 80 },
  ];

  const portfolio = [
    { id: generateUUID(), metal: 'Gold', quantity: 5, buyPrice: 9400, buyDate: new Date(now.getTime() - 30*24*60*60*1000).toISOString().split('T')[0] },
    { id: generateUUID(), metal: 'Silver', quantity: 50, buyPrice: 92, buyDate: new Date(now.getTime() - 15*24*60*60*1000).toISOString().split('T')[0] }
  ];
  
  const notifications = [
    { id: generateUUID(), message: 'Welcome to SpendIQ!', type: 'info', date: now.toISOString(), read: false }
  ];

  return { transactions, budgets, portfolio, notifications };
};
