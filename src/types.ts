export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  fee: number;
  exchangeRate: number;
  targetAmount: number;
  targetCurrency: string;
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  recipientAvatar?: string;
  recipientWallet?: string;
  status: 'completed' | 'pending' | 'failed';
  category: 'Transfer' | 'Bill' | 'Refund' | 'Subscription' | 'Top-up';
  timestamp: string;
  reference: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  color: string; // Tailwind color class for fallback avatar background
  walletAddress: string;
  bankName: string;
  accountNumber: string;
  lastTransferDate?: string;
}

export interface Card {
  id: string;
  cardNumber: string; // masked, e.g. "**** **** **** 4321"
  cardHolder: string;
  expiryDate: string;
  cvc: string;
  balance: number;
  currency: string;
  type: 'visa' | 'mastercard' | 'amex';
  colorTheme: 'emerald' | 'indigo' | 'violet' | 'rose' | 'amber';
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateToEur: number; // base rate is EUR
  flag: string;
}

export type ViewType = 'dashboard' | 'send' | 'wallet' | 'contacts' | 'activity';
