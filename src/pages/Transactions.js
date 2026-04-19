const Transactions = () => {
  const { transactions, setTransactions, saveAll } = useApp();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 20;

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editId, setEditId] = React.useState(null);
  
  // Form State
  const [type, setType] = React.useState('expense');
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = React.useState('Miscellaneous');
  const [aiConfidence, setAiConfidence] = React.useState(0);
  const [isAiPred, setIsAiPred] = React.useState(false);

  // Filter
  const filtered = React.useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === 'all' || t.type === filterType;
      return matchSearch && matchType;
    });
  }, [transactions, searchTerm, filterType]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDescBlur = () => {
    if (description.length > 2 && !editId) {
      const { category: cat, confidence, isAI } = categorizeTransaction(description);
      setCategory(cat);
      setAiConfidence(confidence);
      setIsAiPred(isAI);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setType('expense'); setAmount(''); setDescription(''); setDate(new Date().toISOString().split('T')[0]);
    setCategory('Miscellaneous'); setAiConfidence(0); setIsAiPred(false);
    setIsModalOpen(true);
  };

  const openEdit = (t) => {
    setEditId(t.id);
    setType(t.type); setAmount(t.amount.toString()); setDescription(t.description);
    setDate(t.date); setCategory(t.category); setAiConfidence(0); setIsAiPred(t.isAI);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Delete this transaction?')) {
      const nt = transactions.filter(t => t.id !== id);
      setTransactions(nt);
      saveAll(nt);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newTx = {
      id: editId || generateUUID(),
      type, amount: parseFloat(amount), description, date, category, isAI: isAiPred && !editId
    };
    
    let nt;
    if (editId) {
      nt = transactions.map(t => t.id === editId ? newTx : t);
    } else {
      nt = [newTx, ...transactions];
    }
    // Sort
    nt.sort((a,b) => new Date(b.date) - new Date(a.date));
    setTransactions(nt);
    saveAll(nt);
    setIsModalOpen(false);
  };

  const triggerCSV = () => {
    document.getElementById('csv-upload').click();
  };

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        const parsed = results.data.filter(r => r.amount && r.date).map(r => {
           const isInc = (r.type || '').toLowerCase() === 'income';
           const amt = Math.abs(parseFloat(r.amount));
           const desc = r.description || 'Imported Transaction';
           const { category: cat, isAI } = categorizeTransaction(desc);
           return {
             id: generateUUID(),
             type: isInc ? 'income' : 'expense',
             amount: amt,
             description: desc,
             date: new Date(r.date).toISOString().split('T')[0],
             category: cat,
             isAI
           }
        });
        const nt = [...parsed, ...transactions].sort((a,b) => new Date(b.date) - new Date(a.date));
        setTransactions(nt);
        saveAll(nt);
        alert(`Imported ${parsed.length} transactions successfully!`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text">Transactions</h1>
        <div className="flex items-center gap-2">
          <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleCSV} />
          <Button variant="outline" onClick={triggerCSV}><lucide.Upload size={16}/> Import CSV</Button>
          <Button onClick={openAdd}><lucide.Plus size={16}/> Add New</Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 bg-bg/50">
          <div className="flex-1 relative">
            <lucide.Search className="absolute left-3 top-2.5 text-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search description..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select 
               value={filterType}
               onChange={e => setFilterType(e.target.value)}
               options={[
                 {label: 'All Types', value: 'all'},
                 {label: 'Income Only', value: 'income'},
                 {label: 'Expense Only', value: 'expense'}
               ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg border-b text-sm text-textSecondary">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.length > 0 ? paginated.map(t => (
                <tr key={t.id} className="hover:bg-bg/50 transition-colors">
                  <td className="p-4 text-sm text-textSecondary whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="p-4">
                    <div className="font-medium text-text flex items-center gap-2">
                       {t.description}
                       {t.isAI && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold" title="Auto-categorized by AI">AI</span>}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-textSecondary">{t.category}</td>
                  <td className={`p-4 text-right font-medium whitespace-nowrap ${t.type === 'income' ? 'text-success' : 'text-text'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatINR(t.amount)}
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button onClick={() => openEdit(t)} className="p-1.5 text-textSecondary hover:text-primary rounded-md hover:bg-blue-50"><lucide.Edit2 size={16}/></button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 text-textSecondary hover:text-danger rounded-md hover:bg-red-50"><lucide.Trash2 size={16}/></button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="5" className="p-8 text-center text-textSecondary">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between bg-bg/50">
            <span className="text-sm text-textSecondary">Showing {(page-1)*itemsPerPage + 1} to {Math.min(page*itemsPerPage, filtered.length)} of {filtered.length} entries</span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p=>p-1)} className="p-1.5 rounded-md border bg-surface disabled:opacity-50"><lucide.ChevronLeft size={16}/></button>
              <span className="px-3 text-sm font-medium">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p=>p+1)} className="p-1.5 rounded-md border bg-surface disabled:opacity-50"><lucide.ChevronRight size={16}/></button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Edit Transaction" : "Add Transaction"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-text block mb-1">Type</label>
              <div className="flex rounded-md shadow-sm">
                <button type="button" onClick={()=>setType('expense')} className={`flex-1 py-2 text-sm font-medium rounded-l-md border ${type === 'expense' ? 'bg-red-50 border-red-200 text-red-700 z-10' : 'bg-surface border-border text-text'}`}>Expense</button>
                <button type="button" onClick={()=>setType('income')} className={`flex-1 py-2 text-sm font-medium rounded-r-md border -ml-px ${type === 'income' ? 'bg-green-50 border-green-200 text-green-700 z-10' : 'bg-surface border-border text-text'}`}>Income</button>
              </div>
            </div>
            <Input 
              label="Amount (₹)" 
              type="number" 
              required 
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          
          <Input 
            label="Description" 
            type="text" 
            required 
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={handleDescBlur}
            placeholder="e.g. Swiggy Lunch"
          />

          <div className="flex gap-4">
            <Input 
              label="Date" 
              type="date" 
              required 
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            <div className="flex-1 relative">
              <Select 
                label="Category"
                value={category}
                onChange={e => {setCategory(e.target.value); setIsAiPred(false);}}
                options={[
                  "Food & Dining", "Transportation", "Entertainment", "Education", 
                  "Healthcare", "Shopping", "Utilities", "Rent", "Personal Care", 
                  "Travel", "Investment", "Income", "Miscellaneous"
                ]}
              />
              {aiConfidence > 0 && isAiPred && (
                 <div className="absolute top-0 right-0 text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-bl-md rounded-tr-md flex items-center gap-1">
                   <lucide.Sparkles size={10} /> AI Predicted ({Math.round(aiConfidence)}%)
                 </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t flex justify-end gap-3">
             <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
             <Button type="submit">{editId ? 'Update' : 'Save'} Transaction</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
