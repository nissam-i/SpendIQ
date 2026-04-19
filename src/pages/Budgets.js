const Budgets = () => {
  const { budgets, setBudgets, transactions, saveAll } = useApp();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editId, setEditId] = React.useState(null);
  
  const [category, setCategory] = React.useState('Miscellaneous');
  const [limit, setLimit] = React.useState('');
  const [alertThreshold, setAlertThreshold] = React.useState('80');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const getDayOfMonth = () => Math.max(1, new Date().getDate());
  const getDaysInMonth = () => new Date(currentYear, currentMonth + 1, 0).getDate();

  const openAdd = () => {
    setEditId(null);
    setCategory('Miscellaneous'); setLimit(''); setAlertThreshold('80');
    setIsModalOpen(true);
  };
  
  const openEdit = (b) => {
    setEditId(b.id);
    setCategory(b.category); setLimit(b.limit.toString()); setAlertThreshold(b.alertThreshold.toString());
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this budget?')) {
      const nb = budgets.filter(b => b.id !== id);
      setBudgets(nb);
      saveAll(transactions, nb);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const nb = {
      id: editId || generateUUID(),
      category, limit: parseFloat(limit), alertThreshold: parseFloat(alertThreshold)
    };
    let newBudgets;
    if (editId) {
      newBudgets = budgets.map(b => b.id === editId ? nb : b);
    } else {
      newBudgets = [...budgets, nb];
    }
    setBudgets(newBudgets);
    saveAll(transactions, newBudgets);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-text">Monthly Budgets</h1>
        <Button onClick={openAdd}><lucide.Plus size={16}/> Add Budget</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.length === 0 ? (
           <Card className="col-span-full py-12 flex flex-col items-center justify-center text-textSecondary">
             <lucide.Target size={48} className="text-gray-300 mb-4" />
             <p>No budgets set up yet.</p>
             <Button variant="outline" className="mt-4" onClick={openAdd}>Create your first budget</Button>
           </Card>
        ) : budgets.map(b => {
          const spent = thisMonthExpenses.filter(t => t.category === b.category).reduce((s,t)=>s+t.amount, 0);
          const remaining = Math.max(0, b.limit - spent);
          const pct = Math.min(100, Math.round((spent/b.limit)*100));
          const colorClass = pct >= 90 ? 'bg-danger text-danger' : pct >= b.alertThreshold ? 'bg-warning text-warning' : 'bg-success text-success';
          const bgClass = colorClass.split(' ')[0];
          const textClass = colorClass.split(' ')[1];
          
          const dailyRate = spent / getDayOfMonth();
          const projected = Math.round(dailyRate * getDaysInMonth());

          return (
            <Card key={b.id} className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    {b.category}
                    {pct >= b.alertThreshold && <lucide.AlertTriangle size={16} className="text-warning" title={`Over ${b.alertThreshold}% limit`} />}
                  </div>
                  <div className="text-sm text-textSecondary mt-1">Projection: {formatINR(projected)} by month end</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>openEdit(b)} className="text-textSecondary hover:text-primary"><lucide.Edit2 size={16}/></button>
                  <button onClick={()=>handleDelete(b.id)} className="text-textSecondary hover:text-danger"><lucide.Trash2 size={16}/></button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <span className={`text-2xl font-bold ${textClass}`}>{formatINR(spent)}</span>
                  <span className="text-sm text-textSecondary font-medium">of {formatINR(b.limit)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={`${bgClass} h-2.5 rounded-full`} style={{width: `${pct}%`}}></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-textSecondary border border-border px-2 py-1 rounded bg-bg">Rem: {formatINR(remaining)}</span>
                <span className="font-medium">{pct}% Used</span>
              </div>
            </Card>
          )
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Budget" : "Add Budget"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Select 
            label="Category"
            required
            value={category}
            onChange={e => setCategory(e.target.value)}
            options={[
              "Food & Dining", "Transportation", "Entertainment", "Education", 
              "Healthcare", "Shopping", "Utilities", "Rent", "Personal Care", 
              "Travel", "Investment", "Miscellaneous"
            ]}
          />
          <Input 
            label="Monthly Limit (₹)" 
            type="number" 
            required 
            min="1"
            value={limit}
            onChange={e => setLimit(e.target.value)}
          />
          <Input 
            label="Alert Threshold (%)" 
            type="number" 
            required 
            min="1"
            max="100"
            value={alertThreshold}
            onChange={e => setAlertThreshold(e.target.value)}
          />
          <p className="text-xs text-textSecondary">You will be alerted when spending reaches {alertThreshold}% of the limit.</p>
          <div className="pt-4 border-t flex justify-end gap-3">
             <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit">{editId ? 'Update' : 'Save'} Budget</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
