import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft,
  DollarSign, 
  ChevronRight, 
  Send,
  Sparkles,
  Info,
  Wallet
} from 'lucide-react';
import { Transaction, Contact, CurrencyRate, ViewType } from '../types';
import { CURRENCY_RATES } from '../data';

interface DashboardViewProps {
  language: 'it' | 'en';
  user: {
    name: string;
    email: string;
    mainBalance: number;
    currency: string;
  };
  transactions: Transaction[];
  contacts: Contact[];
  onQuickSend: (contactId: string) => void;
  setCurrentView: (view: ViewType) => void;
}

export default function DashboardView({
  language,
  user,
  transactions,
  contacts,
  onQuickSend,
  setCurrentView
}: DashboardViewProps) {
  // Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [sourceCurrency, setSourceCurrency] = useState<string>('EUR');
  const [targetCurrency, setTargetCurrency] = useState<string>('USD');

  // Chart hover state
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, value: number, month: string } | null>(null);

  // Filter out recent transactions (max 4)
  const recentTransactions = transactions.slice(0, 4);

  // Calculate statistics
  const totalInflow = transactions
    .filter(t => t.recipientEmail === user.email && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOutflow = transactions
    .filter(t => t.senderName === user.name && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Simple static data for SVG Chart representing monthly outbound transfers
  const monthlyData = [
    { month: 'Gen', value: 340 },
    { month: 'Feb', value: 510 },
    { month: 'Mar', value: 420 },
    { month: 'Apr', value: 780 },
    { month: 'Mag', value: 650 },
    { month: 'Giu', value: totalOutflow > 0 ? Math.round(totalOutflow) : 980 }
  ];

  const maxVal = Math.max(...monthlyData.map(d => d.value));
  const height = 140;
  const width = 500;
  const padding = 35;

  const getPoints = () => {
    return monthlyData.map((d, i) => {
      const x = padding + (i * (width - padding * 2) / (monthlyData.length - 1));
      const y = height - padding - (d.value / maxVal * (height - padding * 2));
      return { x, y, value: d.value, month: d.month };
    });
  };

  const points = getPoints();
  const pathData = points.reduce((acc, p, i) => {
    return acc + `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
  }, '');

  const areaData = pathData + ` L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  // Calculator logic
  const sourceRate = CURRENCY_RATES.find(c => c.code === sourceCurrency)?.rateToEur || 1;
  const targetRate = CURRENCY_RATES.find(c => c.code === targetCurrency)?.rateToEur || 1;
  
  // Convert calcAmount to EUR first, then to Target Currency
  const amountInEur = calcAmount / sourceRate;
  const convertedAmount = amountInEur * targetRate;
  const currentExchangeRate = targetRate / sourceRate;

  // Handler to swap calculator currencies
  const swapCurrencies = () => {
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
  };

  const formatCurrencyValue = (val: number, symbolCode: string) => {
    const rateItem = CURRENCY_RATES.find(c => c.code === symbolCode);
    const symbol = rateItem ? rateItem.symbol : '$';
    return `${symbol}${val.toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-950/10 border border-indigo-900/40">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="h-40 w-40 text-indigo-400 animate-pulse" />
        </div>
        <div className="relative z-10 max-w-xl">
          <span className="bg-indigo-500/25 text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-500/20 uppercase tracking-widest inline-block mb-3">
            {language === 'it' ? 'Piattaforma Attiva' : 'Platform Active'}
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            {language === 'it' ? `Bentornato, ${user.name}` : `Welcome back, ${user.name}`}
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {language === 'it' 
              ? 'Gestisci le tue rimesse internazionali, invia denaro a tassi vantaggiosi e monitora i tuoi pagamenti in tempo reale.' 
              : 'Manage your international remittances, transfer funds at competitive mid-market rates, and track your payments in real-time.'}
          </p>
          <button 
            onClick={() => setCurrentView('send')}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/25"
            id="welcome-cta-send"
          >
            <Send className="h-4 w-4" />
            {language === 'it' ? 'Effettua un Trasferimento' : 'Start a Transfer'}
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Available Balance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">
              {language === 'it' ? 'Saldo Principale' : 'Main Balance'}
            </span>
            <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight" id="dashboard-main-balance">
              {formatCurrencyValue(user.mainBalance, user.currency)}
            </h3>
            <span className="text-xs text-slate-400 mt-1 block">
              {language === 'it' ? 'Portafoglio primario attivo' : 'Primary active wallet'}
            </span>
          </div>
        </div>

        {/* Total Inflow */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">
              {language === 'it' ? 'Entrate Ricevute' : 'Total Received'}
            </span>
            <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <ArrowDownLeft className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrencyValue(totalInflow, user.currency)}
            </h3>
            <span className="text-xs text-slate-400 mt-1 block">
              {language === 'it' ? 'Ricariche e accrediti completati' : 'Completed deposits and inflows'}
            </span>
          </div>
        </div>

        {/* Total Outflow */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">
              {language === 'it' ? 'Denaro Inviato' : 'Total Sent'}
            </span>
            <div className="h-8 w-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
              <ArrowUpRight className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-rose-600 tracking-tight">
              {formatCurrencyValue(totalOutflow, user.currency)}
            </h3>
            <span className="text-xs text-slate-400 mt-1 block">
              {language === 'it' ? 'Totale rimesse andate a buon fine' : 'Successful transfers outbound'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle Layout Section: Chart & Quick Converter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Chart Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                {language === 'it' ? 'Volume Trasferimenti' : 'Transfer Volume Activity'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'it' ? 'Andamento del denaro inviato negli ultimi 6 mesi (EUR)' : 'Incurred outbound volume last 6 months (EUR)'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {language === 'it' ? 'Uscite' : 'Outflow'}
            </div>
          </div>

          {/* SVG Custom Area Chart */}
          <div className="flex-1 relative min-h-[140px] flex items-end">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={height - padding - (height - padding * 2) / 2} x2={width - padding} y2={height - padding - (height - padding * 2) / 2} stroke="#f8fafc" strokeWidth="1" />
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f8fafc" strokeWidth="1" />

              {/* Area */}
              <path d={areaData} fill="url(#chartGrad)" />

              {/* Path Line */}
              <path d={pathData} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data circles & hover overlays */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    fill="#ffffff" 
                    stroke="#4f46e5" 
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all hover:r-6"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Monthly Labels */}
                  <text 
                    x={p.x} 
                    y={height - 10} 
                    textAnchor="middle" 
                    className="text-[10px] font-medium fill-slate-400 font-sans"
                  >
                    {p.month}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip overlay */}
            {hoveredPoint && (
              <div 
                className="absolute bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs shadow-lg font-semibold pointer-events-none border border-slate-800 flex flex-col items-center"
                style={{ 
                  left: `calc(${(hoveredPoint.x / width) * 100}% - 40px)`, 
                  bottom: `calc(${((height - hoveredPoint.y) / height) * 100}% + 10px)` 
                }}
              >
                <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{hoveredPoint.month}</span>
                <span>€{hoveredPoint.value}</span>
              </div>
            )}
          </div>
        </div>

        {/* Currency Calculator */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">
              {language === 'it' ? 'Cambio Valutario' : 'Exchange Rate Calculator'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'it' ? 'Controlla i nostri tassi interbancari trasparenti' : 'Check our transparent interbank middle rates'}
            </p>
          </div>

          <div className="space-y-3">
            {/* Source input */}
            <div className="relative">
              <label className="absolute top-2 left-3 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {language === 'it' ? 'Tu Invii' : 'You Send'}
              </label>
              <input 
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 font-bold text-lg rounded-xl pt-6 pb-2.5 px-3 border border-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                id="calc-amount-input"
              />
              <select 
                value={sourceCurrency}
                onChange={(e) => setSourceCurrency(e.target.value)}
                className="absolute top-3.5 right-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                {CURRENCY_RATES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
            </div>

            {/* Swap Divider Button */}
            <div className="flex justify-center -my-1.5 relative z-10">
              <button 
                onClick={swapCurrencies}
                className="h-8 w-8 bg-white border border-slate-200 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 rounded-full flex items-center justify-center transition-all shadow-sm hover:rotate-180"
                title={language === 'it' ? 'Inverti valute' : 'Swap currencies'}
                id="calc-swap-currencies"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 rotate-90" />
              </button>
            </div>

            {/* Target output */}
            <div className="relative">
              <label className="absolute top-2 left-3 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {language === 'it' ? 'Il Destinatario Riceve' : 'Recipient Gets'}
              </label>
              <input 
                type="text"
                readOnly
                value={convertedAmount.toFixed(2)}
                className="w-full bg-indigo-50/30 text-indigo-900 font-extrabold text-lg rounded-xl pt-6 pb-2.5 px-3 border border-indigo-100/50 outline-none"
              />
              <select 
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="absolute top-3.5 right-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                {CURRENCY_RATES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rate Info & CTA */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 p-2 rounded-lg">
              <span className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-slate-400" />
                {language === 'it' ? 'Tasso di mercato' : 'Live mid-market rate'}
              </span>
              <span className="font-semibold text-slate-700">
                1 {sourceCurrency} = {currentExchangeRate.toFixed(4)} {targetCurrency}
              </span>
            </div>
            
            <button 
              onClick={() => setCurrentView('send')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              id="calc-cta-send"
            >
              {language === 'it' ? 'Invia Questo Importo' : 'Send This Amount'}
            </button>
          </div>
        </div>
      </div>

      {/* Lower Layout Section: Quick Contacts & Recent Remittances */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Send Recipient Contacts Bar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-1">
              {language === 'it' ? 'Invia Rapido' : 'Quick Send'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'it' ? 'Invia di nuovo ai contatti recenti' : 'Transfer immediately to regular recipients'}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 py-1">
            {contacts.slice(0, 3).map(contact => (
              <button 
                key={contact.id}
                onClick={() => onQuickSend(contact.id)}
                className="flex flex-col items-center group focus:outline-none"
                id={`quick-send-${contact.id}`}
              >
                <div className={`h-12 w-12 rounded-full bg-gradient-to-tr ${contact.color} flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform border-2 border-transparent group-hover:border-indigo-200`}>
                  {contact.avatar}
                </div>
                <span className="text-[10px] font-semibold text-slate-600 mt-2 truncate w-full text-center group-hover:text-indigo-600 transition-colors">
                  {contact.name.split(' ')[0]}
                </span>
              </button>
            ))}

            {/* View all contacts shortcut */}
            <button 
              onClick={() => setCurrentView('contacts')}
              className="flex flex-col items-center group focus:outline-none"
            >
              <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 border-dashed flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:border-slate-300 transition-colors group-hover:scale-105">
                +
              </div>
              <span className="text-[10px] font-semibold text-slate-500 mt-2">
                {language === 'it' ? 'Tutti' : 'View All'}
              </span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <button 
              onClick={() => setCurrentView('contacts')}
              className="text-xs text-indigo-600 hover:text-indigo-500 font-bold inline-flex items-center gap-1 transition-colors"
            >
              {language === 'it' ? 'Gestisci elenco contatti' : 'Manage your contact list'}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Recent Transactions Snapshot */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                {language === 'it' ? 'Transazioni Recenti' : 'Recent Transactions'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'it' ? 'Ultimi trasferimenti effettuati o ricevuti' : 'Latest transfer logs outbound & inbound'}
              </p>
            </div>
            
            <button 
              onClick={() => setCurrentView('activity')}
              className="text-xs text-indigo-600 hover:text-indigo-500 font-bold inline-flex items-center gap-1 transition-colors"
            >
              {language === 'it' ? 'Vedi Tutte' : 'View All Logs'}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const isInflow = tx.recipientEmail === user.email;
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isInflow 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : tx.status === 'failed' 
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}>
                      {isInflow ? '+' : '→'}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        {isInflow ? tx.senderName : tx.recipientName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {new Date(tx.timestamp).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        {tx.reference && ` • ${tx.reference}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-sm font-bold block ${
                      isInflow ? 'text-emerald-600' : 'text-slate-800'
                    }`}>
                      {isInflow ? '+' : '-'}{formatCurrencyValue(tx.amount, tx.currency)}
                    </span>
                    
                    {/* Status badge */}
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full mt-1 uppercase tracking-wide ${
                      tx.status === 'completed' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : tx.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {tx.status === 'completed' 
                        ? (language === 'it' ? 'Completato' : 'Completed')
                        : tx.status === 'pending'
                        ? (language === 'it' ? 'In corso' : 'Pending')
                        : (language === 'it' ? 'Fallito' : 'Failed')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
