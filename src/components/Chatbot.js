const Chatbot = () => {
  const { settings, getFinancialContext } = useApp();
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const suggestPrompts = [
    "Where am I overspending this month?",
    "Is now a good time to buy gold?",
    "How is my investment portfolio performing?",
    "How can I improve my savings rate?",
    "Which budget am I closest to exceeding?"
  ];

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const newMsg = { role: 'user', content: text };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    if (!settings.anthropicKey) {
       setTimeout(() => {
         setMessages([...updatedMessages, { 
           role: 'assistant', 
           content: "Please add your Anthropic API key in Settings → AI Advisor to enable the chatbot."
         }]);
         setIsTyping(false);
       }, 800);
       return;
    }

    try {
      const systemPrompt = `You are FinAdvisor AI, a personal financial advisor embedded in SpendIQ — an AI-driven personal finance tracker for Indian users.

You have access to the user's complete financial data:

CURRENT FINANCIAL SNAPSHOT:
${getFinancialContext()}

Your role:
1. SPENDING ADVICE: Analyze spending patterns and suggest specific categories where the user can cut back. Reference actual numbers from their data.
2. GOLD & SILVER TIMING: Advise on the best time to buy/sell precious metals based on current simulated prices, historical trends, and general market principles (e.g., buy on dips, festive season demand in India typically pushes prices up around Oct-Nov).
3. P&L ANALYSIS: Explain investment performance clearly — which holdings are profitable, which are at a loss, and what actions to consider.
4. BUDGET COACHING: Warn about budgets near their limit and suggest reallocation strategies.
5. SAVINGS OPTIMIZATION: Calculate potential savings if spending is reduced in specific categories.

RULES:
- Always respond in a friendly, conversational tone
- Use Indian Rupee symbol ₹ for all amounts
- Use Indian numbering (lakhs, not millions)
- Keep responses concise (under 150 words unless complex analysis needed)
- Be specific — reference the user's actual data, not generic advice
- Add relevant emojis for readability
- Never make up data not provided in the context`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": settings.anthropicKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620", // using standard 3.5 sonnet
          max_tokens: 1000,
          system: systemPrompt,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "API Error");
      }

      const data = await response.json();
      setMessages([...updatedMessages, { role: 'assistant', content: data.content[0].text }]);

    } catch (error) {
      setMessages([...updatedMessages, { role: 'assistant', content: `⚠️ Error: ${error.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Panel */}
      {isOpen && (
        <div className="bg-surface border border-border rounded-2xl shadow-2xl w-[380px] h-[520px] mb-4 flex flex-col overflow-hidden animate-slide-up transform origin-bottom border-border">
          
          <div className="bg-primary p-4 text-white flex justify-between items-center">
             <div>
               <h3 className="font-bold font-lg flex items-center gap-2"><lucide.Bot size={20} /> 💰 FinAdvisor AI</h3>
               <p className="text-xs text-primary-light opacity-90">Powered by Claude</p>
             </div>
             <button onClick={() => setIsOpen(false)} className="hover:bg-primary-hover p-1.5 rounded-full transition-colors">
               <lucide.X size={18} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2 mt-2">
                 <p className="text-sm text-textSecondary text-center mb-2">How can I help you optimize your finances today?</p>
                 {suggestPrompts.map((p, i) => (
                   <button key={i} onClick={() => handleSend(p)} className="text-left text-sm bg-surface border border-border hover:border-primary text-text px-3 py-2 rounded-xl transition-colors shadow-sm">
                     {p}
                   </button>
                 ))}
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${m.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-surface border border-border text-text rounded-bl-none shadow-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex items-start">
                <div className="bg-surface border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border bg-surface">
            <form onSubmit={e => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your finances..." 
                disabled={isTyping}
                className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
                className="bg-primary text-white p-2 rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors"
               >
                <lucide.Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-hover hover:scale-105 transition-all relative"
      >
        {isOpen ? <lucide.X size={24} /> : <lucide.Bot size={28} />}
        {!isOpen && <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></span>}
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-up { animation: slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
};
