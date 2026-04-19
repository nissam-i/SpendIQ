const Investments = () => {
  const { metalPrices, priceHistory, portfolio, setPortfolio, transactions, setTransactions, saveAll } = useApp();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalType, setModalType] = React.useState('buy'); // buy or sell
  
  // Trade Form State
  const [metal, setMetal] = React.useState('Gold');
  const [quantity, setQuantity] = React.useState('');
  const [selectedHoldingId, setSelectedHoldingId] = React.useState('');

  const handleBuy = (e) => {
    e.preventDefault();
    const qtyNum = parseFloat(quantity);
    if (!qtyNum || qtyNum <= 0) return alert("Invalid quantity");
    const pricePerGm = metal === 'Gold' ? metalPrices.gold : metalPrices.silver;
    const totalCost = qtyNum * pricePerGm;

    const newTx = {
      id: generateUUID(),
      type: 'expense', amount: totalCost, 
      description: `Bought ${qtyNum}g ${metal}`, 
      date: new Date().toISOString().split('T')[0], 
      category: 'Investment', isAI: false
    };

    const newPortfolio = [...portfolio, {
      id: generateUUID(), metal, quantity: qtyNum, buyPrice: pricePerGm, buyDate: new Date().toISOString().split('T')[0]
    }];

    setTransactions([newTx, ...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)));
    setPortfolio(newPortfolio);
    saveAll([newTx, ...transactions], undefined, newPortfolio);
    setIsModalOpen(false);
  };

  const handleSell = (e) => {
    e.preventDefault();
    const holding = portfolio.find(p => p.id === selectedHoldingId);
    if (!holding) return;
    const qtyNum = parseFloat(quantity);
    if (!qtyNum || qtyNum <= 0 || qtyNum > holding.quantity) return alert("Invalid quantity");
    
    const currentPrice = holding.metal === 'Gold' ? metalPrices.gold : metalPrices.silver;
    const proceeds = qtyNum * currentPrice;

    const newTx = {
      id: generateUUID(),
      type: 'income', amount: proceeds, 
      description: `Sold ${qtyNum}g ${holding.metal}`, 
      date: new Date().toISOString().split('T')[0], 
      category: 'Investment', isAI: false
    };

    const newPortfolio = portfolio.map(p => {
      if (p.id === holding.id) {
        return { ...p, quantity: p.quantity - qtyNum };
      }
      return p;
    }).filter(p => p.quantity > 0);

    setTransactions([newTx, ...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)));
    setPortfolio(newPortfolio);
    saveAll([newTx, ...transactions], undefined, newPortfolio);
    setIsModalOpen(false);
  };

  const openBuy = () => { setModalType('buy'); setMetal('Gold'); setQuantity(''); setIsModalOpen(true); };
  const openSell = (h) => { setModalType('sell'); setSelectedHoldingId(h.id); setQuantity(h.quantity); setIsModalOpen(true); };

  // Calculate stats
  let totalInvested = 0;
  let currentValue = 0;
  let goldVal = 0; let silverVal = 0;

  const holdingsDetail = portfolio.map(p => {
    const cPrice = p.metal === 'Gold' ? metalPrices.gold : metalPrices.silver;
    const inv = p.quantity * p.buyPrice;
    const cur = p.quantity * cPrice;
    const pnl = cur - inv;
    const pnlPct = (pnl / inv) * 100;
    
    totalInvested += inv;
    currentValue += cur;
    if (p.metal === 'Gold') goldVal += cur;
    else silverVal += cur;

    return { ...p, currentPrice: cPrice, currentValue: cur, pnl, pnlPct };
  });

  const totalPnl = currentValue - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;


  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--color-text');
  const surfaceColor = getComputedStyle(document.documentElement).getPropertyValue('--color-surface');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text">Gold & Silver Portfolio</h1>
        <Button onClick={openBuy} className="bg-amber-600 hover:bg-amber-700 text-white"><lucide.Plus size={16}/> Buy Metal</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
           <span className="text-sm font-medium text-textSecondary">Total Invested</span>
           <div className="text-xl font-bold text-text">{formatINR(totalInvested)}</div>
        </Card>
        <Card>
           <span className="text-sm font-medium text-textSecondary">Portfolio Value</span>
           <div className="text-xl font-bold text-text">{formatINR(currentValue)}</div>
        </Card>
        <Card>
           <span className="text-sm font-medium text-textSecondary">Total P&L</span>
           <div className={`text-xl font-bold ${totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
             {totalPnl >= 0 ? '+' : ''}{formatINR(totalPnl)}
           </div>
        </Card>
        <Card>
           <span className="text-sm font-medium text-textSecondary">Top Asset</span>
           <div className="text-xl font-bold text-text">
             {goldVal > silverVal ? 'Physical Gold' : silverVal > goldVal ? 'Physical Silver' : 'None'}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><lucide.TrendingUp size={18}/> Live Metal Spot Prices</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
             <div className="flex-1 bg-gradient-to-br from-yellow-50 to-amber-100 p-4 rounded-xl border border-amber-200">
               <div className="text-sm text-amber-800 font-medium mb-1">Gold 24K (99.9%)</div>
               <div className="text-2xl font-bold text-amber-900">{formatINR(metalPrices.gold * 10)} <span className="text-sm font-normal">/ 10g</span></div>
               <div className="text-sm text-success flex items-center gap-1"><lucide.ArrowUpRight size={14}/> 0.15% (Live Drift)</div>
             </div>
             <div className="flex-1 bg-gradient-to-br from-gray-50 to-slate-100 p-4 rounded-xl border border-border">
               <div className="text-sm text-slate-700 font-medium mb-1">Silver (99.9%)</div>
               <div className="text-2xl font-bold text-slate-800">{formatINR(metalPrices.silver)} <span className="text-sm font-normal">/ 1g</span></div>
               <div className="text-sm text-success flex items-center gap-1"><lucide.ArrowUpRight size={14}/> 0.12% (Live Drift)</div>
             </div>
          </div>
          <div className="h-64 w-full mt-auto">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={priceHistory.gold} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                 <XAxis dataKey="date" stroke={textColor} tickFormatter={(v)=>v.slice(5)} textAnchor="end" tick={false} axisLine={false} />
                 <YAxis domain={['auto', 'auto']} stroke={textColor} tickFormatter={(v) => `₹${v}`} axisLine={false} tickLine={false} />
                 <Tooltip contentStyle={{ backgroundColor: surfaceColor, borderColor: 'var(--color-border)', color: textColor }} formatter={(val) => formatINR(val)} />
                 <Legend wrapperStyle={{ color: textColor }} verticalAlign="top" height={36}/>
                 <Line type="monotone" name="Gold Price/g" dataKey="price" stroke="#d97706" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
               </LineChart>
             </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
             <h3 className="font-semibold text-lg">Your Holdings</h3>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-bg text-xs text-textSecondary">
                 <tr>
                   <th className="p-4 font-medium">Asset</th>
                   <th className="p-4 font-medium">Quantity</th>
                   <th className="p-4 font-medium">Avg Price</th>
                   <th className="p-4 font-medium text-right">Value</th>
                   <th className="p-4 font-medium text-right">P&L</th>
                   <th className="p-4 font-medium text-center">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 text-sm">
                 {holdingsDetail.length > 0 ? holdingsDetail.map(h => (
                   <tr key={h.id} className="hover:bg-bg/50">
                     <td className="p-4 font-medium flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${h.metal === 'Gold' ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                       {h.metal}
                     </td>
                     <td className="p-4">{h.quantity}g</td>
                     <td className="p-4 text-textSecondary">{formatINR(h.buyPrice)}/g</td>
                     <td className="p-4 text-right font-medium">{formatINR(h.currentValue)}</td>
                     <td className={`p-4 text-right font-medium ${h.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                       {h.pnl >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                     </td>
                     <td className="p-4 text-center">
                       <Button variant="outline" className="text-xs px-2 py-1" onClick={()=>openSell(h)}>Sell</Button>
                     </td>
                   </tr>
                 )) : (
                   <tr>
                     <td colSpan="6" className="p-8 text-center text-textSecondary">No active holdings. Buy gold or silver to start investing.</td>
                   </tr>
                 )}
               </tbody>
             </table>
          </div>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType === 'buy' ? "Buy Metal" : "Sell Metal"}>
        {modalType === 'buy' ? (
           <form onSubmit={handleBuy} className="space-y-4">
             <Select 
               label="Select Metal" required value={metal} onChange={e => setMetal(e.target.value)}
               options={["Gold", "Silver"]}
             />
             <Input 
               label="Quantity (Grams)" type="number" required min="0.1" step="0.1"
               value={quantity} onChange={e => setQuantity(e.target.value)}
             />
             {quantity && (
               <div className="bg-bg p-4 rounded-lg flex justify-between items-center text-sm">
                 <span className="text-textSecondary">Total Cost Estimate:</span>
                 <span className="font-bold text-lg">{formatINR(parseFloat(quantity) * (metal === 'Gold' ? metalPrices.gold : metalPrices.silver))}</span>
               </div>
             )}
             <div className="pt-4 border-t flex justify-end gap-3">
               <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
               <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Confirm Order</Button>
             </div>
           </form>
        ) : (
           <form onSubmit={handleSell} className="space-y-4">
             {(() => {
                const holding = portfolio.find(p => p.id === selectedHoldingId);
                if(!holding) return null;
                const cPrice = holding.metal === 'Gold' ? metalPrices.gold : metalPrices.silver;
                return (
                  <>
                    <div className="text-sm mb-4 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-200">
                      You own <strong>{holding.quantity}g</strong> of {holding.metal}. Current spot price is {formatINR(cPrice)}/g.
                    </div>
                    <Input 
                      label="Quantity to Sell (Grams)" type="number" required min="0.1" step="0.1" max={holding.quantity}
                      value={quantity} onChange={e => setQuantity(e.target.value)}
                    />
                    {quantity && (
                      <div className="bg-bg p-4 rounded-lg flex justify-between items-center text-sm">
                        <span className="text-textSecondary">Estimated Proceeds:</span>
                        <span className="font-bold text-lg text-success">{formatINR(parseFloat(quantity) * cPrice)}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t flex justify-end gap-3">
                      <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      <Button type="submit" variant="success">Execute Sell</Button>
                    </div>
                  </>
                )
             })()}
           </form>
        )}
      </Modal>
    </div>
  );
};
