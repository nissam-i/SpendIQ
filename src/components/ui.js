const Card = ({ children, className = '' }) => (
  <div className={`custom-card bg-surface border-border border p-6 ${className}`}>{children}</div>
);

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-700",
    secondary: "bg-secondary text-white hover:bg-purple-700",
    outline: "border border-border text-text hover:bg-bg",
    danger: "bg-danger text-white hover:bg-red-700",
    success: "bg-success text-white hover:bg-green-700",
    ghost: "text-textSecondary hover:bg-gray-100"
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1 w-full relative">
    {label && <label className="text-sm font-medium text-text">{label}</label>}
    <input 
      ref={ref}
      className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${error ? 'border-danger' : 'border-border'} ${className}`} 
      {...props} 
    />
    {error && <span className="text-xs text-danger absolute -bottom-5 left-0">{error}</span>}
  </div>
));

const Select = ({ label, options, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1 w-full relative">
    {label && <label className="text-sm font-medium text-text">{label}</label>}
    <select 
      className={`border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface ${error ? 'border-danger' : 'border-border'} ${className}`} 
      {...props}
    >
      <option value="" disabled>Select an option</option>
      {options.map(o => (
        <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
      ))}
    </select>
    {error && <span className="text-xs text-danger absolute -bottom-5 left-0">{error}</span>}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-textSecondary">
            <lucide.X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
