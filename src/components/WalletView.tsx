import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card } from '../types';

interface WalletViewProps {
  language: 'it' | 'en';
  cards: Card[];
  mainBalance: number;
  topUpBalance: (amount: number, cardId: string) => boolean;
  withdrawBalance: (amount: number, cardId: string) => boolean;
  onAddCard: (card: Card) => void;
  onRemoveCard: (id: string) => void;
}

export default function WalletView({
  language,
  cards,
  mainBalance,
  topUpBalance,
  withdrawBalance,
  onAddCard,
  onRemoveCard
}: WalletViewProps) {
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'cards' | 'topup' | 'addcard'>('cards');

  // New card Form State
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [newCardTheme, setNewCardTheme] = useState<'indigo' | 'emerald' | 'rose' | 'violet' | 'amber'>('indigo');
  const [showCardCvv, setShowCardCvv] = useState(false);

  // Topup State
  const [topUpAmount, setTopUpAmount] = useState<number>(50);
  const [selectedCardForTopup, setSelectedCardForTopup] = useState<string>(cards[0]?.id || '');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [selectedCardForWithdraw, setSelectedCardForWithdraw] = useState<string>(cards[0]?.id || '');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Auto-detect brand based on card number
  const detectCardType = (num: string) => {
    const clean = num.replace(/\D/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('5')) return 'mastercard';
    if (clean.startsWith('3')) return 'amex';
    return 'visa';
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardHolder || !newCardExpiry || !newCardCvc) {
      alert(language === 'it' ? 'Si prega di compilare tutti i campi.' : 'Please fill in all card details.');
      return;
    }

    // Mask card number for display
    const cleanNum = newCardNumber.replace(/\s+/g, '');
    const formattedMask = `•••• •••• •••• ${cleanNum.slice(-4)}`;

    const brand = detectCardType(newCardNumber);

    const newCard: Card = {
      id: `card-${Math.floor(Math.random() * 10000)}`,
      cardNumber: formattedMask,
      cardHolder: newCardHolder.toUpperCase(),
      expiryDate: newCardExpiry,
      cvc: newCardCvc,
      balance: 1500.00, // mock card initial balance
      currency: "EUR",
      type: brand,
      colorTheme: newCardTheme
    };

    onAddCard(newCard);
    
    // reset form
    setNewCardNumber('');
    setNewCardHolder('');
    setNewCardExpiry('');
    setNewCardCvc('');
    
    setActionSuccess(language === 'it' ? 'Nuova carta collegata correttamente!' : 'New payment card linked successfully!');
    setActiveTab('cards');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topUpAmount <= 0) return;

    const success = topUpBalance(topUpAmount, selectedCardForTopup);
    if (success) {
      setActionSuccess(language === 'it' ? `Ricarica di €${topUpAmount.toFixed(2)} effettuata con successo!` : `Deposit of €${topUpAmount.toFixed(2)} completed successfully!`);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      alert(language === 'it' ? 'Fondi insufficienti sulla carta selezionata!' : 'Insufficient funds on the selected debit card.');
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0) return;

    const success = withdrawBalance(withdrawAmount, selectedCardForWithdraw);
    if (success) {
      setActionSuccess(language === 'it' ? `Prelievo di €${withdrawAmount.toFixed(2)} caricato sulla carta!` : `Withdrawal of €${withdrawAmount.toFixed(2)} processed to card!`);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      alert(language === 'it' ? 'Fondi insufficienti nel portafoglio Wealink!' : 'Insufficient funds in your main Wealink balance.');
    }
  };

  // Card Theme Gradients mapping
  const gradients = {
    indigo: 'from-indigo-600 via-blue-700 to-indigo-900 shadow-indigo-200',
    emerald: 'from-emerald-500 via-teal-600 to-emerald-800 shadow-emerald-200',
    rose: 'from-rose-500 via-pink-600 to-rose-800 shadow-rose-200',
    violet: 'from-violet-600 via-purple-700 to-violet-900 shadow-violet-200',
    amber: 'from-amber-500 via-orange-600 to-amber-700 shadow-amber-200'
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-800 text-xl">
            {language === 'it' ? 'Gestione Portafoglio' : 'Wallet Management'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'it' ? 'Controlla il tuo saldo principale, collega carte ed esegui ricariche' : 'Manage your balances, link payment cards, and perform deposits'}
          </p>
        </div>

        <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cards' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {language === 'it' ? 'Le Mie Carte' : 'My Cards'}
          </button>
          <button
            onClick={() => setActiveTab('topup')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'topup' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="wallet-tab-topup"
          >
            {language === 'it' ? 'Ricarica / Prelievo' : 'Deposit / Cash-Out'}
          </button>
          <button
            onClick={() => setActiveTab('addcard')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'addcard' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="wallet-tab-addcard"
          >
            <span className="flex items-center justify-center gap-1">
              <Plus className="h-3.5 w-3.5" />
              {language === 'it' ? 'Collega Carta' : 'Link Card'}
            </span>
          </button>
        </div>
      </div>

      {/* Message feedback Banner */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-xs font-bold shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          {actionSuccess}
        </div>
      )}

      {/* VIEW: Le Mie Carte */}
      {activeTab === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Account Balance Display Card */}
          <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-lg relative flex flex-col justify-between min-h-[200px]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                  WEALINK WALLET
                </span>
                <h3 className="text-sm font-semibold text-slate-300 mt-1">
                  {language === 'it' ? 'Saldo Account Disponibile' : 'Available Account Balance'}
                </h3>
              </div>
              <div className="h-9 w-9 bg-indigo-500/10 border border-indigo-500/25 rounded-xl flex items-center justify-center text-indigo-400 font-bold text-sm">
                €
              </div>
            </div>

            <div className="my-4">
              <h1 className="text-3xl font-black tracking-tight" id="wallet-main-balance">
                €{mainBalance.toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { minimumFractionDigits: 2 })}
              </h1>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-indigo-400" />
                {language === 'it' ? 'Fondi protetti' : 'Assets fully protected'}
              </span>
              <span className="font-mono text-[10px]">EUR Account</span>
            </div>
          </div>

          {/* Individual Credit Cards mapped */}
          {cards.map(card => (
            <div 
              key={card.id} 
              className={`bg-gradient-to-tr ${gradients[card.colorTheme]} rounded-2xl p-6 text-white shadow-lg shadow-indigo-600/5 relative flex flex-col justify-between min-h-[200px] group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
              id={`linked-card-${card.id}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                    {card.type === 'visa' ? 'Visa Platinum' : card.type === 'mastercard' ? 'Mastercard Gold' : 'Amex Premium'}
                  </span>
                  <h3 className="text-sm font-medium opacity-90 mt-0.5">
                    {language === 'it' ? 'Saldo Carta' : 'Card Balance'}
                  </h3>
                </div>
                {/* Simulated Delete Card Button on Hover */}
                <button 
                  onClick={() => {
                    if (confirm(language === 'it' ? 'Sei sicuro di voler scollegare questa carta?' : 'Are you sure you want to unlink this card?')) {
                      onRemoveCard(card.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-opacity absolute top-4 right-4"
                  title={language === 'it' ? 'Rimuovi carta' : 'Remove card'}
                  id={`remove-card-${card.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="my-3">
                <h2 className="text-2xl font-bold tracking-wider font-mono">
                  {card.cardNumber}
                </h2>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-3 mt-1">
                <div>
                  <span className="text-[9px] opacity-60 uppercase block">{language === 'it' ? 'Titolare' : 'Holder'}</span>
                  <span className="text-xs font-bold font-mono tracking-wide">{card.cardHolder}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] opacity-60 uppercase block">{language === 'it' ? 'Scadenza' : 'Expiry'}</span>
                  <span className="text-xs font-bold font-mono">{card.expiryDate}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Mini Placeholder to add a new card */}
          <button
            onClick={() => setActiveTab('addcard')}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/10 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-500 hover:text-indigo-600 transition-all min-h-[200px]"
          >
            <div className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-600 mb-3">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-sm font-bold">{language === 'it' ? 'Collega una nuova carta' : 'Link New Card'}</span>
            <span className="text-xs text-slate-400 mt-1 text-center px-4">{language === 'it' ? 'Aggiungi Visa, Mastercard o American Express' : 'Associate Visa, Mastercard or American Express'}</span>
          </button>
        </div>
      )}

      {/* VIEW: Topup & Withdrawal Form panel */}
      {activeTab === 'topup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top-up Form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">
                {language === 'it' ? 'Deposita Fondi' : 'Deposit Money'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'it' ? 'Carica denaro nel portafoglio Wealink prelevando da una carta' : 'Load funds into your Wealink wallet instantly from a linked card'}
            </p>

            {cards.length > 0 ? (
              <form onSubmit={handleTopUpSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'it' ? 'Seleziona Carta di Origine' : 'Select Funding Card'}
                  </label>
                  <select 
                    value={selectedCardForTopup}
                    onChange={(e) => setSelectedCardForTopup(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
                    id="topup-card-select"
                  >
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.type.toUpperCase()} ({c.cardNumber.split(' ').pop()}) - Saldo: €{c.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'it' ? 'Importo Ricarica (EUR)' : 'Deposit Amount (EUR)'}
                  </label>
                  <input 
                    type="number"
                    min="5"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 font-bold rounded-xl border border-slate-100 text-sm text-slate-800 outline-none focus:border-indigo-500"
                    id="topup-amount-input"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  id="topup-submit-btn"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  {language === 'it' ? 'Ricarica Ora' : 'Deposit Funds'}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center py-8">
                <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-semibold">{language === 'it' ? 'Nessuna carta disponibile.' : 'No cards available.'}</p>
                <button 
                  onClick={() => setActiveTab('addcard')}
                  className="text-indigo-600 hover:text-indigo-500 text-xs font-bold mt-2"
                >
                  {language === 'it' ? 'Collega una carta' : 'Link a payment card'}
                </button>
              </div>
            )}
          </div>

          {/* Withdrawal Form */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">
                {language === 'it' ? 'Preleva Fondi' : 'Cash-Out Funds'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'it' ? 'Trasferisci fondi dal tuo saldo Wealink a una delle tue carte' : 'Transfer funds out from Wealink account back to a linked card'}
            </p>

            {cards.length > 0 ? (
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'it' ? 'Invia sulla Carta' : 'Cash-out to Card'}
                  </label>
                  <select 
                    value={selectedCardForWithdraw}
                    onChange={(e) => setSelectedCardForWithdraw(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500"
                    id="withdraw-card-select"
                  >
                    {cards.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.type.toUpperCase()} ({c.cardNumber.split(' ').pop()}) - Saldo: €{c.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'it' ? 'Importo Prelievo (EUR)' : 'Withdraw Amount (EUR)'}
                  </label>
                  <input 
                    type="number"
                    min="5"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 font-bold rounded-xl border border-slate-100 text-sm text-slate-800 outline-none focus:border-indigo-500"
                    id="withdraw-amount-input"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                  id="withdraw-submit-btn"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  {language === 'it' ? 'Preleva Ora' : 'Withdraw Funds'}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center py-8">
                <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-semibold">{language === 'it' ? 'Nessuna carta disponibile.' : 'No cards available.'}</p>
                <button 
                  onClick={() => setActiveTab('addcard')}
                  className="text-indigo-600 hover:text-indigo-500 text-xs font-bold mt-2"
                >
                  {language === 'it' ? 'Collega una carta' : 'Link a payment card'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: Add New Card Form */}
      {activeTab === 'addcard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          {/* Card interactive representation */}
          <div className="lg:col-span-5 flex flex-col justify-center items-center">
            {/* Real Credit Card graphic representation */}
            <div className={`w-full max-w-sm aspect-[1.586/1] rounded-2xl bg-gradient-to-tr ${gradients[newCardTheme]} text-white p-6 relative flex flex-col justify-between shadow-xl transition-all duration-500 transform preserve-3d ${showCardCvv ? '[transform:rotateY(180deg)]' : ''}`}>
              
              {/* CARD FRONT DESIGN */}
              {!showCardCvv ? (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold opacity-75 uppercase tracking-wider">
                        {language === 'it' ? 'CARTA DEBITO' : 'DEBIT CARD'}
                      </span>
                      <p className="text-xs font-bold tracking-tight text-white mt-1">Wealink Remit</p>
                    </div>
                    {/* Brand Badge graphic */}
                    <div className="h-7 w-12 bg-white/10 rounded px-2 py-1 flex items-center justify-center font-bold font-mono uppercase text-[10px] tracking-wide border border-white/10">
                      {newCardNumber ? detectCardType(newCardNumber).toUpperCase() : 'BRAND'}
                    </div>
                  </div>

                  {/* Microchip Graphic representation */}
                  <div className="w-10 h-7 bg-amber-400/80 rounded-lg relative overflow-hidden border border-amber-300 shadow-sm mt-3">
                    <div className="absolute inset-0 bg-chip-stripes"></div>
                  </div>

                  {/* Card Number */}
                  <div className="my-2">
                    <p className="text-xl font-bold tracking-widest font-mono text-center">
                      {newCardNumber || '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  {/* Card footer info */}
                  <div className="flex justify-between items-end border-t border-white/10 pt-2.5">
                    <div>
                      <span className="text-[9px] opacity-65 uppercase block">{language === 'it' ? 'Titolare' : 'Holder'}</span>
                      <span className="text-xs font-bold font-mono tracking-wide truncate block max-w-[150px]">
                        {newCardHolder.toUpperCase() || 'MARCO ROSSI'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] opacity-65 uppercase block">{language === 'it' ? 'Scadenza' : 'Expiry'}</span>
                      <span className="text-xs font-bold font-mono">
                        {newCardExpiry || 'MM/AA'}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* CARD BACK DESIGN */
                <div className="[transform:rotateY(180deg)] flex flex-col justify-between h-full py-1">
                  {/* Black magnetic strip */}
                  <div className="h-10 bg-slate-950 -mx-6 mb-2"></div>
                  
                  {/* Signature block with CVC */}
                  <div className="bg-slate-200 h-9 rounded flex items-center justify-between px-3 text-slate-800 font-mono text-sm">
                    <span className="italic text-[10px] text-slate-400">Wealink Authorized</span>
                    <span className="bg-white px-2 py-0.5 rounded font-bold tracking-widest text-xs">
                      CVC: {newCardCvc || '•••'}
                    </span>
                  </div>

                  <p className="text-[8px] opacity-60 leading-tight text-center mt-4">
                    {language === 'it' 
                      ? 'Questa carta è emessa in conformità ai termini di Wealink. L\'uso è soggetto all\'accordo del titolare.' 
                      : 'This card is associated in accordance with Wealink. Usage is strictly subject to security and compliance terms.'}
                  </p>
                </div>
              )}
            </div>

            {/* Toggle Card view side buttons */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCardCvv(false)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  !showCardCvv 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {language === 'it' ? 'Fronte' : 'Front View'}
              </button>
              <button
                type="button"
                onClick={() => setShowCardCvv(true)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  showCardCvv 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
                id="wallet-toggle-cvv"
              >
                CVC / {language === 'it' ? 'Retro' : 'Back View'}
              </button>
            </div>
          </div>

          {/* Form input details */}
          <div className="lg:col-span-7">
            <h3 className="font-bold text-slate-800 text-lg mb-1">
              {language === 'it' ? 'Collega Nuova Carta' : 'Link Credit/Debit Card'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {language === 'it' ? 'Aggiungi una nuova carta per ricariche istantanee e prelievi rapiti' : 'Connect a personal debit/credit card to easily top-up and withdraw money'}
            </p>

            <form onSubmit={handleAddCardSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'it' ? 'Numero Carta *' : 'Card Number *'}
                </label>
                <input 
                  type="text"
                  maxLength={19}
                  placeholder="e.g. 4000 1234 5678 9010"
                  value={newCardNumber}
                  onChange={(e) => {
                    // format card numbers as 4-digits block spaces
                    const val = e.target.value.replace(/\D/g, '');
                    const blocks = val.match(/.{1,4}/g);
                    setNewCardNumber(blocks ? blocks.join(' ') : '');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-indigo-500"
                  id="addcard-number-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'it' ? 'Intestatario Carta *' : 'Card Holder Name *'}
                </label>
                <input 
                  type="text"
                  placeholder="e.g. MARCO ROSSI"
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-indigo-500 uppercase"
                  id="addcard-holder-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'it' ? 'Scadenza *' : 'Expiry Date *'}
                  </label>
                  <input 
                    type="text"
                    maxLength={5}
                    placeholder="MM/AA"
                    value={newCardExpiry}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 2) {
                        setNewCardExpiry(val);
                      } else {
                        setNewCardExpiry(`${val.slice(0, 2)}/${val.slice(2, 4)}`);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-indigo-500"
                    id="addcard-expiry-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    CVC / CVV *
                  </label>
                  <input 
                    type="password"
                    maxLength={3}
                    placeholder="•••"
                    value={newCardCvc}
                    onChange={(e) => setNewCardCvc(e.target.value.replace(/\D/g, ''))}
                    onFocus={() => setShowCardCvv(true)}
                    onBlur={() => setShowCardCvv(false)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-indigo-500"
                    id="addcard-cvc-input"
                  />
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'it' ? 'Tema Colore Carta' : 'Card Color Theme'}
                </label>
                <div className="flex gap-2 pt-1">
                  {(['indigo', 'emerald', 'rose', 'violet', 'amber'] as const).map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCardTheme(color)}
                      className={`h-7 w-7 rounded-full border-2 transition-transform ${
                        newCardTheme === color ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                      } ${
                        color === 'indigo' ? 'bg-indigo-600' :
                        color === 'emerald' ? 'bg-emerald-500' :
                        color === 'rose' ? 'bg-rose-500' :
                        color === 'violet' ? 'bg-violet-600' : 'bg-amber-500'
                      }`}
                      id={`theme-select-${color}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4"
                id="addcard-submit-btn"
              >
                {language === 'it' ? 'Conferma e Collega Carta' : 'Confirm & Link Card'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
