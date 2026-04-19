
const Sidebar = () => {
  const { user } = useApp();
  const location = useLocation();
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: lucide.Home },
    { path: '/transactions', label: 'Transactions', icon: lucide.List },
    { path: '/budget', label: 'Budget', icon: lucide.Target },
    { path: '/investments', label: 'Investments', icon: lucide.TrendingUp },
    { path: '/analytics', label: 'Analytics', icon: lucide.PieChart },
    { path: '/reports', label: 'Reports', icon: lucide.FileText },
    { path: '/settings', label: 'Settings', icon: lucide.Settings },
  ];

  return (
    <div className="w-64 bg-sidebar text-sidebarText flex flex-col h-full fixed left-0 top-0 hidden md:flex z-20 transition-colors">
      <div className="h-16 flex items-center px-6 border-b border-sidebarText/10 font-bold text-xl gap-3">
        <lucide.Wallet size={24} className="text-primary" />
        SpendIQ
      </div>
      <nav className="flex-1 py-6 flex flex-col gap-1 px-3">
        {navItems.map(item => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-primary text-white' : 'hover:bg-sidebarText/5'}`}>
              <item.icon size={18} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebarText/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-sidebarText truncate">{user?.name || 'User'}</span>
            <span className="text-xs text-sidebarText/70">Pro Account</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const { logout, notifications } = useApp();
  const unread = notifications.filter(n => !n.read).length;
  
  return (
    <header className="h-16 bg-surface border-b flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center md:hidden gap-3 font-bold text-xl">
        <lucide.Wallet size={24} className="text-primary" />
        SpendIQ
      </div>
      <div className="hidden md:flex flex-1"></div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-textSecondary hover:bg-gray-100 rounded-full">
          <lucide.Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white"></span>
          )}
        </button>
        <div className="h-8 w-px bg-gray-200 mx-1"></div>
        <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-textSecondary hover:text-text">
          <lucide.LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const { user } = useApp();
  if (!user) return <ReactRouterDOM.Navigate to="/login" replace />;
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 w-full">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Chatbot />
    </div>
  );
};
