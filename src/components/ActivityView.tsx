import React, { useState } from 'react';
import { 
  Search, 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  X, 
  ChevronDown, 
  ChevronUp,
  Download,
  Calendar,
  Layers,
  Filter
} from 'lucide-react';
import { Transaction } from '../types';

interface ActivityViewProps {
  language: 'it' | 'en';
  transactions: Transaction[];
  userEmail: string;
}

export default function ActivityView({
  language,
  transactions,
  userEmail
}: ActivityViewProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Track expanded transaction IDs
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedTxId === id) {
      setExpandedTxId(null);
    } else {
      setExpandedTxId(id);
    }
  };

  // Unique categories for filtering
  const categories = ['all', 'Transfer', 'Bill', 'Refund', 'Subscription', 'Top-up'];
  const statuses = ['all', 'completed', 'pending', 'failed'];

  const filteredTransactions = transactions.filter(tx => {
    const isReceived = tx.recipientEmail === userEmail;
    const nameToSearch = isReceived ? tx.senderName : tx.recipientName;
    
    const matchesSearch = 
      nameToSearch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate stats for filtered transactions
  const totalCompleted = filteredTransactions.filter(t => t.status === 'completed').length;
  const totalPending = filteredTransactions.filter(t => t.status === 'pending').length;
  const totalFailed = filteredTransactions.filter(t => t.status === 'failed').length;

  const getCategoryLabel = (cat: string) => {
    if (language === 'en') return cat;
    switch (cat) {
      case 'all': return 'Tutte';
      case 'Transfer': return 'Trasferimento';
      case 'Bill': return 'Bolletta/Fattura';
      case 'Refund': return 'Rimborso';
      case 'Subscription': return 'Abbonamento';
      case 'Top-up': return 'Ricarica';
      default: return cat;
    }
  };

  const getStatusLabel = (stat: string) => {
    if (language === 'en') return stat;
    switch (stat) {
      case 'all': return 'Tutti';
      case 'completed': return 'Completati';
      case 'pending': return 'In corso';
      case 'failed': return 'Falliti';
      default: return stat;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header with mini counters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-800 text-xl">
            {language === 'it' ? 'Cronologia Attività' : 'Activity History'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'it' ? 'Esplora tutti i pagamenti inviati, le ricariche e i rimborsi' : 'Audit and filter all previously completed or pending global transactions'}
          </p>
        </div>

        {/* Counter blocks */}
        <div className="flex gap-2 text-xs font-bold">
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100">
            {totalCompleted} {language === 'it' ? 'Fatti' : 'Done'}
          </div>
          {totalPending > 0 && (
            <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-100">
              {totalPending} {language === 'it' ? 'In corso' : 'Pending'}
            </div>
          )}
          {totalFailed > 0 && (
            <div className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg border border-rose-100">
              {totalFailed} {language === 'it' ? 'Falliti' : 'Failed'}
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Text Search */}
          <div className="md:col-span-6 relative flex items-center">
            <Search className="absolute left-3.5 text-slate-400 h-4 w-4" />
            <input 
              type="text"
              placeholder={language === 'it' ? 'Cerca per destinatario, causale o ID...' : 'Search by contact, description, or transaction ID...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs text-slate-700 rounded-xl border border-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
              id="activity-search-field"
            />
          </div>

          {/* Category Dropdown Filter */}
          <div className="md:col-span-3 space-y-1">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 text-xs font-semibold rounded-xl text-slate-600 focus:border-indigo-500 outline-none cursor-pointer"
              id="activity-category-filter"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {language === 'it' ? 'Categoria: ' : 'Category: '} {getCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown Filter */}
          <div className="md:col-span-3 space-y-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 text-xs font-semibold rounded-xl text-slate-600 focus:border-indigo-500 outline-none cursor-pointer"
              id="activity-status-filter"
            >
              {statuses.map(s => (
                <option key={s} value={s}>
                  {language === 'it' ? 'Stato: ' : 'Status: '} {getStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map(tx => {
              const isReceived = tx.recipientEmail === userEmail;
              const isExpanded = expandedTxId === tx.id;
              
              return (
                <div 
                  key={tx.id} 
                  className={`transition-colors ${isExpanded ? 'bg-slate-50/50' : 'hover:bg-slate-50/20'}`}
                  id={`tx-row-${tx.id}`}
                >
                  {/* Primary row */}
                  <div 
                    onClick={() => toggleExpand(tx.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Direction Icon block */}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isReceived 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : tx.status === 'failed'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {isReceived ? <ArrowDownLeft className="h-4.5 w-4.5" /> : <ArrowUpRight className="h-4.5 w-4.5" />}
                      </div>

                      {/* Name, Category, Date/Reference */}
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">
                          {isReceived ? tx.senderName : tx.recipientName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {getCategoryLabel(tx.category)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {new Date(tx.timestamp).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          {tx.reference && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-[11px] text-slate-500 truncate max-w-[120px] sm:max-w-xs">{tx.reference}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cost amount, status, expand arrow */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className={`text-sm font-extrabold block ${
                          isReceived ? 'text-emerald-600' : 'text-slate-800'
                        }`}>
                          {isReceived ? '+' : '-'}€{tx.amount.toFixed(2)}
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 uppercase tracking-wider ${
                          tx.status === 'completed' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : tx.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.status === 'completed' 
                            ? (language === 'it' ? 'Completato' : 'Completed')
                            : tx.status === 'pending'
                            ? (language === 'it' ? 'In corso' : 'Pending')
                            : (language === 'it' ? 'Fallito' : 'Failed')}
                        </span>
                      </div>

                      {/* Expand Chevron */}
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable detailed drawer panel */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 text-xs text-slate-500 font-medium grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                      {/* Left: General Transaction details */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                          {language === 'it' ? 'Dettagli Generali' : 'General Coordinates'}
                        </h5>
                        <div className="space-y-1">
                          <p><span className="text-slate-400">ID Transazione:</span> <span className="font-mono text-slate-700">{tx.id}</span></p>
                          <p><span className="text-slate-400">Orario:</span> <span className="text-slate-700">{new Date(tx.timestamp).toLocaleTimeString(language === 'it' ? 'it-IT' : 'en-US')}</span></p>
                          <p><span className="text-slate-400">Categoria:</span> <span className="text-slate-700">{getCategoryLabel(tx.category)}</span></p>
                        </div>
                      </div>

                      {/* Middle: Remittance Exchange calculations */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                          {language === 'it' ? 'Dettagli Conversione' : 'Financial Conversion'}
                        </h5>
                        <div className="space-y-1">
                          <p><span className="text-slate-400">{language === 'it' ? 'Importo Originario:' : 'Amount Sent:'}</span> <span className="text-slate-700">€{tx.amount.toFixed(2)} EUR</span></p>
                          <p><span className="text-slate-400">{language === 'it' ? 'Commissioni Wealink:' : 'Wealink Fee:'}</span> <span className="text-slate-700">€{tx.fee.toFixed(2)} EUR</span></p>
                          <p><span className="text-slate-400">{language === 'it' ? 'Tasso Applicato:' : 'Exchange Rate:'}</span> <span className="text-slate-700">1 EUR = {tx.exchangeRate.toFixed(4)} {tx.targetCurrency}</span></p>
                          <p className="font-semibold text-indigo-600"><span className="text-slate-400">{language === 'it' ? 'Valore Ricevuto:' : 'Total Received:'}</span> {tx.targetAmount.toFixed(2)} {tx.targetCurrency}</p>
                        </div>
                      </div>

                      {/* Right: Security & Signature Seal */}
                      <div className="space-y-2">
                        <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                          {language === 'it' ? 'Certificazione di Sicurezza' : 'Regulatory & Seal'}
                        </h5>
                        <div className="space-y-1">
                          <p><span className="text-slate-400">Stato:</span> <span className="font-bold text-slate-700 capitalize">{tx.status}</span></p>
                          <p><span className="text-slate-400">Email Destinatario:</span> <span className="text-slate-700">{tx.recipientEmail}</span></p>
                          <p><span className="text-slate-400">Canale d'Invio:</span> <span className="text-slate-700">Swift / SEPA Instant Pay</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold">
              {language === 'it' ? 'Nessuna transazione registrata corrisponde ai filtri.' : 'No transactions matching your active filter criteria.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
