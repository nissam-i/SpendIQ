const Settings = () => {
  const { user, settings, setSettings, clearAllData } = useApp();
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);

  const colors = [
    { id: 'blue', label: 'Ocean Blue', bg: 'bg-blue-600' },
    { id: 'purple', label: 'Royal Purple', bg: 'bg-purple-600' },
    { id: 'green', label: 'Emerald Green', bg: 'bg-green-600' },
    { id: 'red', label: 'Crimson Red', bg: 'bg-red-600' },
    { id: 'orange', label: 'Sunset Orange', bg: 'bg-orange-500' },
    { id: 'midnight', label: 'Midnight', bg: 'bg-slate-700' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-text">Settings</h1>
      
      <Card title="Profile">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-bold text-xl text-text">{user?.name}</h3>
            <p className="text-textSecondary">{user?.email}</p>
          </div>
        </div>
      </Card>

      <Card title="Appearance">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text mb-3">Theme Mode</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', icon: lucide.Sun, label: 'Light' },
                { id: 'dark', icon: lucide.Moon, label: 'Dark' },
                { id: 'system', icon: lucide.Monitor, label: 'System' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setSettings({...settings, themeMode: mode.id})}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    settings.themeMode === mode.id 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-border bg-surface text-textSecondary hover:border-border'
                  }`}
                >
                  <mode.icon size={24} />
                  <span className="text-sm font-medium">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text mb-3">Accent Color</label>
            <div className="flex flex-wrap gap-4">
              {colors.map(c => (
                <button 
                  key={c.id}
                  onClick={() => setSettings({...settings, accentColor: c.id})}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${c.bg} ${settings.accentColor === c.id ? 'ring-4 ring-offset-2 ring-primary ring-offset-bg' : ''}`}
                  title={c.label}
                >
                  {settings.accentColor === c.id && <lucide.Check size={20} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 border border-border rounded-xl bg-surface flex items-center gap-4">
             <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
               <lucide.Wallet size={24} />
             </div>
             <div>
               <p className="text-sm font-bold text-text">Mini Preview Card</p>
               <p className="text-xs text-textSecondary">Your selected theme applied instantly.</p>
             </div>
             <button className="ml-auto bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg text-sm transition-colors">
               Button
             </button>
          </div>
        </div>
      </Card>

      <Card title="AI Advisor">
        <div className="space-y-4">
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-text mb-1">
              Anthropic API Key
              {settings.anthropicKey 
                ? <span className="text-green-500 flex items-center gap-1 text-xs"><lucide.CircleCheck size={12}/> Connected</span>
                : <span className="text-red-500 flex items-center gap-1 text-xs"><lucide.CircleX size={12}/> Not configured</span>
              }
            </label>
            <div className="relative">
              <Input 
                type={showKey ? "text" : "password"}
                placeholder="sk-ant-..."
                value={settings.anthropicKey || ''}
                onChange={(e) => setSettings({...settings, anthropicKey: e.target.value})}
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-textSecondary hover:text-textSecondary"
              >
                {showKey ? <lucide.EyeOff size={18} /> : <lucide.Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-textSecondary mt-2">Get your free API key at <a href="https://console.anthropic.com/" target="_blank" className="text-primary hover:underline">console.anthropic.com</a>. Stored locally in your browser.</p>
          </div>
        </div>
      </Card>

      <Card title="Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Currency Format</p>
              <p className="text-sm text-textSecondary">Used for all calculations and displays</p>
            </div>
            <Select 
              value={settings.currency} 
              onChange={e => setSettings({...settings, currency: e.target.value})}
              options={[{value: 'INR', label: 'Indian Rupee (₹)'}, {value: 'USD', label: 'US Dollar ($)'}]}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Budget Alerts</p>
              <p className="text-sm text-textSecondary">Notify me when nearing budget limits</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.alertsEnabled} onChange={() => setSettings({...settings, alertsEnabled: !settings.alertsEnabled})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </Card>

      <Card title="Danger Zone">
        <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">Reset All Data</h3>
          <p className="text-sm text-red-600 mb-4">This will permanently delete all your transactions, budgets, investments, and settings. This cannot be undone.</p>
          
          {showClearConfirm ? (
            <div className="flex gap-3">
              <Button onClick={() => { clearAllData(); setShowClearConfirm(false); }} className="bg-red-600 hover:bg-red-700 text-white">Yes, Delete Everything</Button>
              <Button onClick={() => setShowClearConfirm(false)} className="bg-gray-200 text-text hover:bg-gray-300">Cancel</Button>
            </div>
          ) : (
            <Button onClick={() => setShowClearConfirm(true)} className="bg-red-600 hover:bg-red-700 text-white">Erase Workspace</Button>
          )}
        </div>
      </Card>

      <div className="text-center text-sm text-textSecondary mt-10">
         SpendIQ v1.0.0<br/>Single-file React SPA using built-in NLP.
      </div>
    </div>
  );
};
