import { Contact, Card, Transaction, CurrencyRate } from './types';

export const INITIAL_USER = {
  name: "Marco Rossi",
  email: "marco.rossi@wealink.com",
  avatar: "MR",
  color: "from-blue-600 to-indigo-600",
  mainBalance: 4850.20,
  currency: "EUR"
};

export const CURRENCY_RATES: CurrencyRate[] = [
  { code: "EUR", name: "Euro", symbol: "€", rateToEur: 1.0, flag: "🇪🇺" },
  { code: "USD", name: "US Dollar", symbol: "$", rateToEur: 1.08, flag: "🇺🇸" },
  { code: "GBP", name: "British Pound", symbol: "£", rateToEur: 0.85, flag: "🇬🇧" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", rateToEur: 0.96, flag: "🇨🇭" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", rateToEur: 1.48, flag: "🇨🇦" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", rateToEur: 168.42, flag: "🇯🇵" },
  { code: "RON", name: "Romanian Leu", symbol: "RON", rateToEur: 4.97, flag: "🇷🇴" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "MAD", rateToEur: 10.82, flag: "🇲🇦" }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: "c-1",
    name: "Elena Dumitru",
    email: "elena.dumitru@example.com",
    phone: "+40 722 123 456",
    avatar: "ED",
    color: "bg-rose-500",
    walletAddress: "WL-7729-DUM",
    bankName: "Banca Transilvania",
    accountNumber: "RO29BTRL0192837482910293",
    lastTransferDate: "2026-06-20"
  },
  {
    id: "c-2",
    name: "Amine El Amrani",
    email: "amine.elamrani@example.com",
    phone: "+212 661 987 654",
    avatar: "AE",
    color: "bg-emerald-500",
    walletAddress: "WL-1082-AMR",
    bankName: "Attijariwafa Bank",
    accountNumber: "MA2100010928374650192834",
    lastTransferDate: "2026-06-15"
  },
  {
    id: "c-3",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 212 555 0199",
    avatar: "JS",
    color: "bg-indigo-500",
    walletAddress: "WL-4491-SMI",
    bankName: "Chase Bank",
    accountNumber: "US99CHAS123456789012",
    lastTransferDate: "2026-06-25"
  },
  {
    id: "c-4",
    name: "Sophie Dubois",
    email: "sophie.dubois@example.com",
    phone: "+33 6 1234 5678",
    avatar: "SD",
    color: "bg-amber-500",
    walletAddress: "WL-2849-DUB",
    bankName: "BNP Paribas",
    accountNumber: "FR76300040192837465829103",
    lastTransferDate: "2026-05-12"
  },
  {
    id: "c-5",
    name: "Luca Bianchi",
    email: "luca.bianchi@example.com",
    phone: "+39 333 456 7890",
    avatar: "LB",
    color: "bg-violet-500",
    walletAddress: "WL-9031-BIA",
    bankName: "Intesa Sanpaolo",
    accountNumber: "IT02L0306909606000000123456",
    lastTransferDate: "2026-06-26"
  }
];

export const INITIAL_CARDS: Card[] = [
  {
    id: "card-1",
    cardNumber: "•••• •••• •••• 4231",
    cardHolder: "MARCO ROSSI",
    expiryDate: "11/29",
    cvc: "482",
    balance: 2350.00,
    currency: "EUR",
    type: "visa",
    colorTheme: "indigo"
  },
  {
    id: "card-2",
    cardNumber: "•••• •••• •••• 8849",
    cardHolder: "MARCO ROSSI",
    expiryDate: "03/28",
    cvc: "109",
    balance: 1500.20,
    currency: "EUR",
    type: "mastercard",
    colorTheme: "emerald"
  },
  {
    id: "card-3",
    cardNumber: "•••• •••• •••• 5512",
    cardHolder: "MARCO ROSSI",
    expiryDate: "08/30",
    cvc: "931",
    balance: 1000.00,
    currency: "EUR",
    type: "visa",
    colorTheme: "rose"
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1001",
    amount: 150.00,
    currency: "EUR",
    fee: 1.50,
    exchangeRate: 1.0,
    targetAmount: 150.00,
    targetCurrency: "EUR",
    senderName: "Marco Rossi",
    recipientName: "Luca Bianchi",
    recipientEmail: "luca.bianchi@example.com",
    recipientAvatar: "LB",
    status: "completed",
    category: "Transfer",
    timestamp: "2026-06-26T15:30:00Z",
    reference: "Regalo di compleanno Luca"
  },
  {
    id: "tx-1002",
    amount: 500.00,
    currency: "EUR",
    fee: 4.50,
    exchangeRate: 1.08,
    targetAmount: 540.00,
    targetCurrency: "USD",
    senderName: "Marco Rossi",
    recipientName: "John Smith",
    recipientEmail: "john.smith@example.com",
    recipientAvatar: "JS",
    status: "completed",
    category: "Transfer",
    timestamp: "2026-06-25T09:12:00Z",
    reference: "Payment for consultancy work"
  },
  {
    id: "tx-1003",
    amount: 200.00,
    currency: "EUR",
    fee: 2.00,
    exchangeRate: 4.97,
    targetAmount: 994.00,
    targetCurrency: "RON",
    senderName: "Marco Rossi",
    recipientName: "Elena Dumitru",
    recipientEmail: "elena.dumitru@example.com",
    recipientAvatar: "ED",
    status: "completed",
    category: "Transfer",
    timestamp: "2026-06-20T18:45:00Z",
    reference: "Supporto familiare Romania"
  },
  {
    id: "tx-1004",
    amount: 80.00,
    currency: "EUR",
    fee: 0.00,
    exchangeRate: 1.0,
    targetAmount: 80.00,
    targetCurrency: "EUR",
    senderName: "Netflix Inc.",
    recipientName: "Marco Rossi",
    recipientEmail: "marco.rossi@wealink.com",
    status: "completed",
    category: "Subscription",
    timestamp: "2026-06-18T04:20:00Z",
    reference: "Rimborso abbonamento condiviso"
  },
  {
    id: "tx-1005",
    amount: 300.00,
    currency: "EUR",
    fee: 3.50,
    exchangeRate: 10.82,
    targetAmount: 3246.00,
    targetCurrency: "MAD",
    senderName: "Marco Rossi",
    recipientName: "Amine El Amrani",
    recipientEmail: "amine.elamrani@example.com",
    recipientAvatar: "AE",
    status: "pending",
    category: "Transfer",
    timestamp: "2026-06-15T11:05:00Z",
    reference: "Acconto vacanze Marrakech"
  },
  {
    id: "tx-1006",
    amount: 1000.00,
    currency: "EUR",
    fee: 0.00,
    exchangeRate: 1.0,
    targetAmount: 1000.00,
    targetCurrency: "EUR",
    senderName: "Marco Rossi",
    recipientName: "Self-Deposit (Top-Up)",
    recipientEmail: "marco.rossi@wealink.com",
    status: "completed",
    category: "Top-up",
    timestamp: "2026-06-10T14:00:00Z",
    reference: "Ricarica conto da Intesa"
  },
  {
    id: "tx-1007",
    amount: 450.00,
    currency: "EUR",
    fee: 5.00,
    exchangeRate: 0.85,
    targetAmount: 382.50,
    targetCurrency: "GBP",
    senderName: "Marco Rossi",
    recipientName: "London Flat Rent Ltd",
    recipientEmail: "london.rent@example.com",
    status: "failed",
    category: "Bill",
    timestamp: "2026-06-08T08:15:00Z",
    reference: "Spese d'affitto Londra giugno"
  }
];
