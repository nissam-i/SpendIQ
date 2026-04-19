
const Login = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const { login, user } = useApp();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && password) {
      login(email, password);
    }
  };

  const handleDemo = () => {
    setEmail('demo@fintrack.in');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-10">
        <div>
          <div className="flex justify-center text-primary mb-4">
            <lucide.Wallet size={48} />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-text">
            Sign in to SpendIQ
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" 
            />
            <Input 
              label="Password" 
              type="password" 
              required 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-border rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text">
                Remember me
              </label>
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full">Sign in</Button>
          </div>
          
          <div className="mt-4 text-center">
            <button type="button" onClick={handleDemo} className="text-sm font-medium text-primary hover:text-blue-500">
              Use Demo Account
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};


