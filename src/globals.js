const { HashRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } = ReactRouterDOM;
const { PieChart, Pie, Cell, Tooltip, BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } = window.Recharts;

// Polyfill lucide icons so we can use `<lucide.Home />` directly in our JSX
if (window.lucide && typeof window.lucide === 'object') {
  Object.keys(window.lucide).forEach(key => {
    const originalNode = window.lucide[key];
    if (Array.isArray(originalNode) && originalNode.length > 0) {
      window.lucide[key] = ({ size = 24, className = '', strokeWidth = 2, color = 'currentColor', ...props }) => {
        // Build SVG HTML string
        const attrs = {
           width: size, height: size, fill: 'none', stroke: color, 
           'stroke-width': strokeWidth, 'stroke-linecap': 'round', 
           'stroke-linejoin': 'round', class: `lucide lucide-${key.toLowerCase()} ${className}`
        };
        const attrsStr = Object.entries(attrs).map(([k,v]) => `${k}="${v}"`).join(' ');
        
        // Children tags (like <path>, <circle>)
        const childrenStr = originalNode.map(([tag, childAttrs]) => {
           const caStr = Object.entries(childAttrs).map(([k,v]) => `${k}="${v}"`).join(' ');
           return `<${tag} ${caStr}></${tag}>`;
        }).join('');
        
        const svgString = `<svg xmlns="http://www.w3.org/2000/svg" ${attrsStr} viewBox="0 0 24 24">${childrenStr}</svg>`;
        
        return React.createElement('span', {
           className: "inline-flex items-center justify-center cursor-pointer",
           dangerouslySetInnerHTML: { __html: svgString },
           ...props
        });
      };
    }
  });
}

