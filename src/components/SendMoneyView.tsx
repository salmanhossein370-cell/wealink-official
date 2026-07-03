import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  CreditCard, 
  DollarSign, 
  Sparkles,
  ChevronLeft,
  X,
  AlertCircle,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { Contact, Card, Transaction } from '../types';
import { CURRENCY_RATES } from '../data';

interface SendMoneyViewProps {
  language: 'it' | 'en';
  user: {
    name: string;
    email: string;
    mainBalance: number;
    currency: string;
  };
  contacts: Contact[];
  cards: Card[];
  onAddTransaction: (tx: Transaction) => void;
  deductBalance: (amount: number, fundingSource: 'balance' | string) => boolean;
  preSelectedContactId: string | null;
  clearPreSelectedContact: () => void;
  setCurrentView: (view: string) => void;
}

type StepType = 'recipient' | 'amount' | 'funding' | 'verify' | 'receipt';

export default function SendMoneyView({
  language,
  user,
  contacts,
  cards,
  onAddTransaction,
  deductBalance,
  preSelectedContactId,
  clearPreSelectedContact,
  setCurrentView
}: SendMoneyViewProps) {
  
  // Wizards steps & active status
  const [step, setStep] = useState<StepType>('recipient');
  
  // Form values
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [customContact, setCustomContact] = useState({
    name: '',
    email: '',
    bankName: '',
    accountNumber: ''
  });
  const [isCustomRecipient, setIsCustomRecipient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sendAmount, setSendAmount] = useState<number>(100);
  const [sourceCurrency, setSourceCurrency] = useState<string>('EUR');
  const [targetCurrency, setTargetCurrency] = useState<string>('USD');
  const [reference, setReference] = useState('');
  
  const [selectedFunding, setSelectedFunding] = useState<'balance' | string>('balance'); // 'balance' or card ID
  const [securityPin, setSecurityPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Loading animations
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestTx, setLatestTx] = useState<Transaction | null>(null);

  // Fee calculation (fixed 1.5% fee, min 1.00 EUR)
  const calculatedFee = Math.max(1.00, parseFloat((sendAmount * 0.015).toFixed(2)));
  const totalCost = sendAmount + calculatedFee;

  // Real-time exchange rate
  const sRate = CURRENCY_RATES.find(c => c.code === sourceCurrency)?.rateToEur || 1;
  const tRate = CURRENCY_RATES.find(c => c.code === targetCurrency)?.rateToEur || 1;
  const convertedAmount = (sendAmount / sRate) * tRate;
  const exchangeRate = tRate / sRate;

  // Handle pre-selected contact from Dashboard "Quick Send"
  useEffect(() => {
    if (preSelectedContactId) {
      const contact = contacts.find(c => c.id === preSelectedContactId);
      if (contact) {
        setSelectedContact(contact);
        setIsCustomRecipient(false);
        setStep('amount');
        // Preset suitable target currency
        if (contact.walletAddress.includes('DUM')) setTargetCurrency('RON');
        else if (contact.walletAddress.includes('AMR')) setTargetCurrency('MAD');
        else if (contact.walletAddress.includes('SMI')) setTargetCurrency('USD');
        else if (contact.walletAddress.includes('DUB')) setTargetCurrency('EUR');
        else if (contact.walletAddress.includes('BIA')) setTargetCurrency('EUR');
      }
      clearPreSelectedContact();
    }
  }, [preSelectedContactId, contacts, clearPreSelectedContact]);

  // Filters contacts
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsCustomRecipient(false);
    setStep('amount');
    
    // Auto-select currency based on contact wallet hints
    if (contact.walletAddress.includes('DUM')) setTargetCurrency('RON');
    else if (contact.walletAddress.includes('AMR')) setTargetCurrency('MAD');
    else if (contact.walletAddress.includes('SMI')) setTargetCurrency('USD');
    else if (contact.walletAddress.includes('DUB')) setTargetCurrency('EUR');
    else if (contact.walletAddress.includes('BIA')) setTargetCurrency('EUR');
  };

  const handleNextToFunding = () => {
    if (isCustomRecipient) {
      if (!customContact.name || !customContact.email || !customContact.accountNumber) {
        alert(language === 'it' ? 'Si prega di inserire tutti i campi obbligatori per il destinatario.' : 'Please enter all required recipient fields.');
        return;
      }
    } else {
      if (!selectedContact) {
        alert(language === 'it' ? 'Seleziona un destinatario prima di continuare.' : 'Select a recipient first.');
        return;
      }
    }

    if (sendAmount <= 0) {
      alert(language === 'it' ? "Inserisci un importo valido superiore a 0." : "Enter a valid amount greater than 0.");
      return;
    }

    setStep('funding');
  };

  const handleNextToVerify = () => {
    // Check if enough funds
    if (selectedFunding === 'balance') {
      if (user.mainBalance < totalCost) {
        alert(language === 'it' 
          ? `Fondi insufficienti sul saldo principale. Costo totale: €${totalCost.toFixed(2)}, il tuo saldo: €${user.mainBalance.toFixed(2)}` 
          : `Insufficient funds in main balance. Total: €${totalCost.toFixed(2)}, available: €${user.mainBalance.toFixed(2)}`);
        return;
      }
    } else {
      const card = cards.find(c => c.id === selectedFunding);
      if (card && card.balance < totalCost) {
        alert(language === 'it' 
          ? `Fondi insufficienti sulla carta selezionata. Disponibile: €${card.balance.toFixed(2)}` 
          : `Insufficient funds on selected card. Available: €${card.balance.toFixed(2)}`);
        return;
      }
    }
    setStep('verify');
    setSecurityPin('');
    setPinError('');
  };

  // Perform simulated transaction transfer
  const handleVerifyAndSubmit = () => {
    if (securityPin !== '1234') {
      setPinError(language === 'it' ? 'PIN Errato. Utilizza il PIN predefinito "1234" per la demo.' : 'Invalid PIN. Use default simulation PIN "1234" to test.');
      return;
    }

    setIsProcessing(true);
    setPinError('');

    // Simulate network delay for security authorization
    setTimeout(() => {
      // Deduct funds
      const deductSuccess = deductBalance(totalCost, selectedFunding);

      if (deductSuccess) {
        const txId = `tx-${Math.floor(100000 + Math.random() * 900000)}`;
        const recipientName = isCustomRecipient ? customContact.name : selectedContact!.name;
        const recipientEmail = isCustomRecipient ? customContact.email : selectedContact!.email;
        const recipientAvatar = isCustomRecipient ? customContact.name.substring(0,2).toUpperCase() : selectedContact!.avatar;

        const newTx: Transaction = {
          id: txId,
          amount: sendAmount,
          currency: sourceCurrency,
          fee: calculatedFee,
          exchangeRate: exchangeRate,
          targetAmount: convertedAmount,
          targetCurrency: targetCurrency,
          senderName: user.name,
          recipientName,
          recipientEmail,
          recipientAvatar,
          status: 'completed',
          category: 'Transfer',
          timestamp: new Date().toISOString(),
          reference: reference || (language === 'it' ? 'Trasferimento Wealink' : 'Wealink Transfer')
        };

        onAddTransaction(newTx);
        setLatestTx(newTx);
        setIsProcessing(false);
        setStep('receipt');
      } else {
        setIsProcessing(false);
        alert(language === 'it' ? 'Errore durante la deduzione del saldo.' : 'Error deducting balance.');
      }
    }, 2000);
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleReset = () => {
    setStep('recipient');
    setSelectedContact(null);
    setCustomContact({ name: '', email: '', bankName: '', accountNumber: '' });
    setIsCustomRecipient(false);
    setSendAmount(100);
    setReference('');
    setSelectedFunding('balance');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Wizard Step Progress Tracker */}
      <div className="mb-8 flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
        {[
          { id: 'recipient', label_it: 'Destinatario', label_en: 'Recipient' },
          { id: 'amount', label_it: 'Importo', label_en: 'Amount' },
          { id: 'funding', label_it: 'Metodo', label_en: 'Funding' },
          { id: 'verify', label_it: 'Verifica', label_en: 'Verify' },
          { id: 'receipt', label_it: 'Ricevuta', label_en: 'Receipt' }
        ].map((s, index) => {
          const stepIndex = ['recipient', 'amount', 'funding', 'verify', 'receipt'].indexOf(step);
          const currentIndex = ['recipient', 'amount', 'funding', 'verify', 'receipt'].indexOf(s.id as StepType);
          const isCompleted = currentIndex < stepIndex;
          const isActive = s.id === step;

          return (
            <React.Fragment key={s.id}>
              {index > 0 && (
                <div className={`h-0.5 flex-1 min-w-[20px] mx-2 ${
                  currentIndex <= stepIndex ? 'bg-indigo-600' : 'bg-slate-100'
                }`} />
              )}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive 
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-50' 
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                }`}>
                  {language === 'it' ? s.label_it : s.label_en}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* STEP 1: Select Recipient */}
      {step === 'recipient' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {language === 'it' ? 'Chi riceverà il denaro?' : 'Who are you sending to?'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'it' ? 'Seleziona un contatto esistente o inserisci le coordinate bancarie manualmente.' : 'Select a contact or enter banking coordinates manually.'}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-2">
            <button
              onClick={() => setIsCustomRecipient(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isCustomRecipient 
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {language === 'it' ? 'I Miei Contatti' : 'My Contacts'}
            </button>
            <button
              onClick={() => setIsCustomRecipient(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isCustomRecipient 
                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              id="send-toggle-custom"
            >
              {language === 'it' ? 'Nuovo Destinatario (IBAN)' : 'New Recipient (IBAN)'}
            </button>
          </div>

          {/* Contacts Directory Tab */}
          {!isCustomRecipient ? (
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                <input 
                  type="text"
                  placeholder={language === 'it' ? 'Cerca contatti...' : 'Search contacts...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-700 rounded-xl border border-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  id="contact-search-input"
                />
              </div>

              {filteredContacts.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => handleSelectContact(contact)}
                      className="w-full p-3 bg-white hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-100 rounded-xl flex items-center justify-between transition-all group"
                      id={`recipient-select-${contact.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-tr ${contact.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                          {contact.avatar}
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{contact.name}</h4>
                          <p className="text-[11px] text-slate-400">{contact.bankName} • {contact.accountNumber.substring(0,8)}...</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  {language === 'it' ? 'Nessun contatto trovato.' : 'No contacts found.'}
                </div>
              )}
            </div>
          ) : (
            /* Manual Form Tab */
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'it' ? 'Nome Completo *' : 'Full Name *'}
                </label>
                <input 
                  type="text"
                  placeholder="e.g. John Doe"
                  value={customContact.name}
                  onChange={(e) => setCustomContact({ ...customContact, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  id="custom-recipient-name"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {language === 'it' ? 'Email di Contatto *' : 'Contact Email *'}
                </label>
                <input 
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={customContact.email}
                  onChange={(e) => setCustomContact({ ...customContact, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  id="custom-recipient-email"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'it' ? 'Nome Banca (Opzionale)' : 'Bank Name (Optional)'}
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. Intesa Sanpaolo"
                    value={customContact.bankName}
                    onChange={(e) => setCustomContact({ ...customContact, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'it' ? 'Numero di Conto / IBAN *' : 'Account Number / IBAN *'}
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. IT30A..."
                    value={customContact.accountNumber}
                    onChange={(e) => setCustomContact({ ...customContact, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                    id="custom-recipient-iban"
                  />
                </div>
              </div>

              <button
                onClick={() => setStep('amount')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md mt-4"
                id="custom-recipient-submit"
              >
                {language === 'it' ? 'Procedi con l\'importo' : 'Proceed to Amount'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Amount & Currency Rate */}
      {step === 'amount' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <button 
              onClick={() => setStep('recipient')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {language === 'it' ? 'Importo del Trasferimento' : 'Transfer Amount'}
            </h2>
            <div className="w-5" /> {/* spacer */}
          </div>

          {/* Recipient Profile Header summary */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="h-10 w-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
              {isCustomRecipient ? customContact.name.substring(0,2).toUpperCase() : selectedContact?.avatar}
            </div>
            <div>
              <p className="text-xs text-slate-400">{language === 'it' ? 'Inviando denaro a' : 'Sending funds to'}</p>
              <h4 className="text-sm font-bold text-slate-800">
                {isCustomRecipient ? customContact.name : selectedContact?.name}
              </h4>
            </div>
          </div>

          <div className="space-y-4">
            {/* Source amount input */}
            <div className="relative">
              <label className="absolute top-2 left-3 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {language === 'it' ? 'Tu invii (EUR)' : 'You Send (EUR)'}
              </label>
              <input 
                type="number"
                value={sendAmount}
                onChange={(e) => setSendAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 font-extrabold text-2xl rounded-xl pt-6 pb-2.5 px-3.5 border border-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                id="transfer-amount-input"
              />
              <span className="absolute top-4.5 right-4 bg-white border border-slate-200 rounded-lg text-xs font-bold px-3 py-1 text-slate-700">
                🇪🇺 EUR
              </span>
            </div>

            {/* Live translation visual details */}
            <div className="space-y-2 pl-3 border-l-2 border-indigo-500 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'it' ? 'Tasso di cambio garantito' : 'Guaranteed Exchange Rate'}</span>
                <span className="font-bold text-slate-700">
                  1 EUR = {exchangeRate.toFixed(4)} {targetCurrency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{language === 'it' ? 'Commissione Wealink (1.5%)' : 'Wealink Remit Fee (1.5%)'}</span>
                <span className="font-semibold text-slate-700">€{calculatedFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                <span className="text-slate-500">{language === 'it' ? 'Costo complessivo' : 'Total Cost Outflow'}</span>
                <span className="text-indigo-600">€{totalCost.toFixed(2)}</span>
              </div>
            </div>

            {/* Target output */}
            <div className="relative">
              <label className="absolute top-2 left-3 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {language === 'it' ? 'Il Destinatario riceve' : 'Recipient gets'}
              </label>
              <input 
                type="text"
                readOnly
                value={`${CURRENCY_RATES.find(c => c.code === targetCurrency)?.symbol || ''}${convertedAmount.toFixed(2)}`}
                className="w-full bg-indigo-50/20 text-indigo-900 font-extrabold text-2xl rounded-xl pt-6 pb-2.5 px-3.5 border border-indigo-100/35 outline-none"
              />
              <select 
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="absolute top-4 right-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold px-2 py-1.5 focus:outline-none cursor-pointer"
              >
                {CURRENCY_RATES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                ))}
              </select>
            </div>

            {/* Transfer Reference input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'it' ? 'Causale / Riferimento' : 'Reference / Description'}
              </label>
              <input 
                type="text"
                placeholder={language === 'it' ? 'e.g. Regalo compleanno' : 'e.g. Birthday support'}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm rounded-xl border border-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                id="transfer-reference-input"
              />
            </div>
          </div>

          <button
            onClick={handleNextToFunding}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            id="amount-step-submit"
          >
            {language === 'it' ? 'Seleziona Metodo di Pagamento' : 'Select Funding Source'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 3: Funding Source selection */}
      {step === 'funding' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <button 
              onClick={() => setStep('amount')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {language === 'it' ? 'Sorgente Fondi' : 'Funding Source'}
            </h2>
            <div className="w-5" /> {/* spacer */}
          </div>

          <div className="space-y-4">
            {/* Funding options */}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {language === 'it' ? 'Scegli come finanziare questo invio' : 'Choose how to finance this transfer'}
            </p>

            {/* Wealink Balance funding */}
            <label className={`block border p-4 rounded-xl cursor-pointer transition-all ${
              selectedFunding === 'balance' 
                ? 'border-indigo-500 bg-indigo-50/20 shadow-sm' 
                : 'border-slate-100 hover:bg-slate-50/50'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="funding_source"
                    checked={selectedFunding === 'balance'}
                    onChange={() => setSelectedFunding('balance')}
                    className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {language === 'it' ? 'Saldo Principale Wealink' : 'Wealink Main Account Balance'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {language === 'it' ? 'Usa il denaro ricaricato nel portafoglio' : 'Use pre-loaded wallet balances'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-800">
                    €{user.mainBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </label>

            {/* Linked Cards Funding */}
            {cards.map(card => (
              <label 
                key={card.id}
                className={`block border p-4 rounded-xl cursor-pointer transition-all ${
                  selectedFunding === card.id 
                    ? 'border-indigo-500 bg-indigo-50/20 shadow-sm' 
                    : 'border-slate-100 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="funding_source"
                      checked={selectedFunding === card.id}
                      onChange={() => setSelectedFunding(card.id)}
                      className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      id={`funding-card-${card.id}`}
                    />
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-slate-500" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 uppercase">
                          {card.type} {card.cardNumber.split(' ').pop()}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          {language === 'it' ? 'Saldo carta collegata' : 'Linked card balance'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-800">
                      €{card.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="p-3 bg-indigo-50 text-indigo-900 rounded-xl text-xs space-y-1">
            <div className="flex justify-between font-medium">
              <span>{language === 'it' ? 'Importo da inviare:' : 'Amount to transfer:'}</span>
              <span>€{sendAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>{language === 'it' ? 'Commissione applicata:' : 'Remit fee:'}</span>
              <span>€{calculatedFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm border-t border-indigo-100 pt-1 mt-1 text-indigo-700">
              <span>{language === 'it' ? 'Totale addebitato:' : 'Total deducted:'}</span>
              <span>€{totalCost.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleNextToVerify}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            id="funding-step-submit"
          >
            {language === 'it' ? 'Continua con la Verifica' : 'Proceed to Security Check'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 4: Security verification */}
      {step === 'verify' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 space-y-6 text-center">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <button 
              onClick={() => setStep('funding')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {language === 'it' ? 'Verifica di Sicurezza' : 'Security Verification'}
            </h2>
            <div className="w-5" /> {/* spacer */}
          </div>

          <div className="max-w-xs mx-auto py-4 space-y-4">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                {language === 'it' ? 'Inserisci PIN di Sicurezza' : 'Enter Security PIN'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'it' 
                  ? 'Inserisci il PIN per confermare il trasferimento di denaro (PIN di demo: 1234)' 
                  : 'Enter security PIN to authorize money transfer (demo PIN: 1234)'}
              </p>
            </div>

            {/* PIN Inputs (Simulation) */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((index) => (
                <div 
                  key={index}
                  className={`h-11 w-11 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${
                    securityPin.length > index 
                      ? 'border-indigo-600 bg-indigo-50/10' 
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  {securityPin.length > index ? '●' : ''}
                </div>
              ))}
            </div>

            {pinError && (
              <p className="text-xs text-rose-600 font-semibold flex items-center justify-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {pinError}
              </p>
            )}

            {/* Simple numeric pad */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (securityPin.length < 4) {
                      setSecurityPin(securityPin + num.toString());
                    }
                  }}
                  disabled={isProcessing}
                  className="py-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl font-bold text-lg border border-slate-100 transition-all focus:outline-none"
                  id={`numeric-pin-${num}`}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => {
                  setSecurityPin('');
                  setPinError('');
                }}
                disabled={isProcessing}
                className="py-3 text-xs text-slate-400 font-bold hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                id="pin-clear"
              >
                {language === 'it' ? 'Pulisci' : 'Clear'}
              </button>
              <button
                onClick={() => {
                  if (securityPin.length < 4) {
                    setSecurityPin(securityPin + '0');
                  }
                }}
                disabled={isProcessing}
                className="py-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl font-bold text-lg border border-slate-100 transition-all focus:outline-none"
                id="numeric-pin-0"
              >
                0
              </button>
              <button
                onClick={() => setSecurityPin(securityPin.slice(0, -1))}
                disabled={isProcessing}
                className="py-3 text-xs text-slate-400 font-bold hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                id="pin-backspace"
              >
                ←
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleVerifyAndSubmit}
              disabled={securityPin.length < 4 || isProcessing}
              className={`w-full py-3 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                securityPin.length === 4 && !isProcessing
                  ? 'bg-indigo-600 hover:bg-indigo-500' 
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
              id="pin-submit-button"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {language === 'it' ? 'Elaborazione Remessa in Corso...' : 'Processing Remittance...'}
                </>
              ) : (
                <>
                  {language === 'it' ? 'Conferma Invia Denaro' : 'Confirm Money Transfer'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Receipt */}
      {step === 'receipt' && latestTx && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 lg:p-8 relative">
            
            {/* Visual Header Confirmation */}
            <div className="text-center pb-6 border-b border-dashed border-slate-200">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {language === 'it' ? 'Trasferimento Eseguito!' : 'Transfer Successful!'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'it' ? 'Ricevuta ufficiale di transazione Wealink' : 'Official digital remittance receipt from Wealink'}
              </p>
              <div className="inline-block mt-3 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                <span className="text-[10px] font-bold text-indigo-700 font-mono tracking-wider">
                  ID: {latestTx.id}
                </span>
              </div>
            </div>

            {/* Receipt Table Body details */}
            <div className="py-6 space-y-4 text-xs font-medium text-slate-500">
              
              {/* Sending info */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">
                    {language === 'it' ? 'Ordinante' : 'Sender'}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{latestTx.senderName}</span>
                  <span className="text-[10px] text-slate-400 block">{latestTx.recipientEmail === user.email ? 'Marco Rossi' : user.email}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">
                    {language === 'it' ? 'Destinatario' : 'Beneficiary'}
                  </span>
                  <span className="text-sm font-bold text-slate-800">{latestTx.recipientName}</span>
                  <span className="text-[10px] text-slate-400 block">{latestTx.recipientEmail}</span>
                </div>
              </div>

              {/* Remittance financial details */}
              <div className="space-y-3 pb-4 border-b border-slate-100">
                <div className="flex justify-between">
                  <span>{language === 'it' ? 'Importo inviato' : 'Transfer Amount'}</span>
                  <span className="font-bold text-slate-800">€{latestTx.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'it' ? 'Commissione di servizio' : 'Service Fee'}</span>
                  <span className="font-bold text-slate-800">€{latestTx.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'it' ? 'Tasso di cambio applicato' : 'Exchange Rate Applied'}</span>
                  <span className="font-bold text-slate-800">1 EUR = {latestTx.exchangeRate.toFixed(4)} {latestTx.targetCurrency}</span>
                </div>
                <div className="flex justify-between text-slate-800 font-bold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span>{language === 'it' ? 'Ricevuto in destinazione' : 'Amount Received'}</span>
                  <span className="text-indigo-600 text-sm">
                    {CURRENCY_RATES.find(c => c.code === latestTx.targetCurrency)?.symbol || ''}
                    {latestTx.targetAmount.toFixed(2)} {latestTx.targetCurrency}
                  </span>
                </div>
              </div>

              {/* Timestamp & Meta details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">
                    {language === 'it' ? 'Data & Ora Operazione' : 'Transaction Date'}
                  </span>
                  <span className="text-slate-700 text-[11px]">
                    {new Date(latestTx.timestamp).toLocaleString(language === 'it' ? 'it-IT' : 'en-US')}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400 block">
                    {language === 'it' ? 'Causale / Riferimento' : 'Reference / Description'}
                  </span>
                  <span className="text-slate-700 text-[11px] truncate block">
                    {latestTx.reference}
                  </span>
                </div>
              </div>

              {/* Security Shield Seal */}
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5 border border-slate-100 mt-4">
                <div className="h-7 w-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-600 font-bold">
                    {language === 'it' ? 'Firma Digitale Wealink Sicura' : 'Secured with Wealink Digital Seal'}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    {language === 'it' ? 'Transazione autorizzata, crittografata ed emessa via SEPA / Swift Network' : 'Authorized, encrypted, and processed over compliant banking rails'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom mini-bar barcode mock simulation for aesthetics */}
            <div className="flex flex-col items-center pt-2 gap-1.5 opacity-40">
              <div className="h-6 w-44 bg-repeating-bar" style={{ backgroundImage: 'linear-gradient(90deg, #334155, #334155 2px, transparent 2px, transparent 6px)' }}></div>
              <span className="text-[9px] font-mono tracking-widest text-slate-600 font-bold">WEALINK-{latestTx.id}-SECURE</span>
            </div>
          </div>

          {/* Receipt Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handlePrintReceipt}
              className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              id="print-receipt-btn"
            >
              <Printer className="h-4 w-4" />
              {language === 'it' ? 'Stampa / Salva PDF' : 'Print / Save PDF'}
            </button>
            <button 
              onClick={handleReset}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
              id="make-another-transfer-btn"
            >
              <Sparkles className="h-4 w-4" />
              {language === 'it' ? 'Invia Altro Denaro' : 'New Remittance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
