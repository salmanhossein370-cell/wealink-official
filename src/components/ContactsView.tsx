import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Building,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { Contact } from '../types';

interface ContactsViewProps {
  language: 'it' | 'en';
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onRemoveContact: (id: string) => void;
  onQuickSend: (id: string) => void;
}

export default function ContactsView({
  language,
  contacts,
  onAddContact,
  onRemoveContact,
  onQuickSend
}: ContactsViewProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  // New Contact form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');

  // Random tailwind colors
  const avatarColors = [
    'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 
    'bg-violet-500', 'bg-amber-500', 'bg-blue-500', 'bg-cyan-500'
  ];

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newAccountNumber) {
      alert(language === 'it' ? 'Si prega di completare i campi obbligatori.' : 'Please complete all required fields.');
      return;
    }

    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const initials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const newContact: Contact = {
      id: `contact-${Math.floor(Math.random() * 10000)}`,
      name: newName,
      email: newEmail,
      phone: newPhone || '+39 000 000 0000',
      avatar: initials,
      color: randomColor,
      walletAddress: `WL-${Math.floor(1000 + Math.random() * 8999)}-${initials}`,
      bankName: newBankName || 'Unicredit Bank',
      accountNumber: newAccountNumber,
      lastTransferDate: undefined
    };

    onAddContact(newContact);

    // reset fields
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewBankName('');
    setNewAccountNumber('');
    setIsAdding(false);
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.bankName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="font-bold text-slate-800 text-xl">
            {language === 'it' ? 'Elenco Contatti' : 'Contacts Directory'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'it' ? 'Invia rimesse immediate salvando le coordinate dei destinatari' : 'Store billing details of friends and families for immediate global transfer'}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          id="contact-add-toggle-btn"
        >
          {isAdding ? (
            language === 'it' ? 'Mostra Elenco' : 'Show Directory'
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              {language === 'it' ? 'Nuovo Contatto' : 'Add Recipient'}
            </>
          )}
        </button>
      </div>

      {/* FORM: Add new recipient */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-4">
            {language === 'it' ? 'Inserisci Nuovo Contatto' : 'Add New Recipient'}
          </h3>

          <form onSubmit={handleCreateContact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'it' ? 'Nome Completo *' : 'Full Name *'}
              </label>
              <input 
                type="text"
                placeholder="e.g. Elena Dumitru"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-indigo-500"
                id="addcontact-name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'it' ? 'Email di Contatto *' : 'Email Address *'}
              </label>
              <input 
                type="email"
                placeholder="e.g. elena@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-indigo-500"
                id="addcontact-email"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'it' ? 'Telefono (Opzionale)' : 'Phone Number (Optional)'}
              </label>
              <input 
                type="text"
                placeholder="e.g. +39 345..."
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-indigo-500"
                id="addcontact-phone"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'it' ? 'Nome Banca (Opzionale)' : 'Bank Name (Optional)'}
              </label>
              <input 
                type="text"
                placeholder="e.g. Banca Transilvania"
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-indigo-500"
                id="addcontact-bank"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'it' ? 'IBAN / Numero di Conto Corrente *' : 'IBAN / Account Number *'}
              </label>
              <input 
                type="text"
                placeholder="e.g. IT02L03069..."
                value={newAccountNumber}
                onChange={(e) => setNewAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 text-sm outline-none focus:border-indigo-500"
                id="addcontact-iban"
              />
            </div>

            <button
              type="submit"
              className="md:col-span-2 mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors"
              id="addcontact-submit-btn"
            >
              {language === 'it' ? 'Salva Contatto in Rubrica' : 'Save Contact'}
            </button>
          </form>
        </div>
      )}

      {/* Directory Grid */}
      {!isAdding && (
        <div className="space-y-4">
          {/* Dynamic Search Box */}
          <div className="relative max-w-md bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400 h-4 w-4" />
              <input 
                type="text"
                placeholder={language === 'it' ? 'Cerca contatti per nome, email o banca...' : 'Search contacts by name, email or bank...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-sm rounded-xl border border-transparent focus:border-slate-200 outline-none transition-all text-slate-700"
                id="contacts-search-field"
              />
            </div>
          </div>

          {filteredContacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredContacts.map(contact => (
                <div 
                  key={contact.id}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:border-indigo-100 hover:shadow-md transition-all relative group"
                  id={`contact-card-${contact.id}`}
                >
                  {/* Delete Button on Hover */}
                  <button
                    onClick={() => {
                      if (confirm(language === 'it' ? `Sei sicuro di voler rimuovere ${contact.name}?` : `Are you sure you want to remove ${contact.name}?`)) {
                        onRemoveContact(contact.id);
                      }
                    }}
                    className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    title={language === 'it' ? 'Elimina contatto' : 'Delete contact'}
                    id={`delete-contact-${contact.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="space-y-4">
                    {/* Header: Avatar, Name, Wallet Address */}
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-full bg-gradient-to-tr ${contact.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                        {contact.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">
                          {contact.name}
                        </h4>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded mt-1 inline-block">
                          {contact.walletAddress}
                        </span>
                      </div>
                    </div>

                    {/* Detailed info lines */}
                    <div className="space-y-2 border-t border-slate-50 pt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{contact.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Building className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700 truncate">{contact.bankName}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{contact.accountNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Action footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 italic">
                      {contact.lastTransferDate 
                        ? `${language === 'it' ? 'Ultimo invio:' : 'Last transfer:'} ${contact.lastTransferDate}`
                        : (language === 'it' ? 'Ancora nessun invio' : 'No transfers yet')
                      }
                    </span>
                    
                    <button
                      onClick={() => onQuickSend(contact.id)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                      id={`contact-cta-send-${contact.id}`}
                    >
                      {language === 'it' ? 'Invia' : 'Send'}
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">{language === 'it' ? 'Nessun contatto corrisponde ai criteri di ricerca.' : 'No contacts matching search query.'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
