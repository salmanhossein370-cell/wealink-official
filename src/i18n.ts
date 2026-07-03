import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "transfer_money": "Transfer Money",
          "select_service": "Select Service",
          "enter_amount": "Enter Amount",
          "you_send": "You Send",
          "recipient_receives": "Recipient Receives",
          "calculator_title": "TapTap Exchange Calculator",
          "rate": "Rate",
          "fee": "Fee",
          "total_to_pay": "Total to pay",
          "send_now": "Send Now",
          "feedback_title": "Rate our service",
          "feedback_success": "Thank you for your feedback!",
          "submit": "Submit",
          "hero_title": "Wealink\nInstant and Safe Transfers",
          "home": "Home",
          "money": "Money",
          "shop": "Shop",
          "travel": "Travel",
          "settings": "Settings",
          "services": "Services",
          "instant_calculator": "Instant Calculator",
          "you_receive": "You Receive",
          "commission": "Commission",
          "amount_eur": "Amount (EUR)",
          "send_money": "Send Money",
          "flash_deals_title": "Flash Deals",
          "global_rates": "Global Exchange Rates",
          "last_updated": "Last Updated",
          "search_country": "Search country or currency...",
          "flag_col": "Flag",
          "country": "Country",
          "loading": "Loading",
          "no_results": "No results found"
        }
      },
      it: {
        translation: {
          "transfer_money": "Invia Denaro",
          "select_service": "Seleziona Servizio",
          "enter_amount": "Inserisci Importo",
          "you_send": "Invii",
          "recipient_receives": "Riceve",
          "calculator_title": "Calcolatore TapTap",
          "rate": "Tasso",
          "fee": "Commissione",
          "total_to_pay": "Totale da pagare",
          "send_now": "Invia Ora",
          "feedback_title": "Valuta il nostro servizio",
          "feedback_success": "Grazie per il tuo feedback!",
          "submit": "Invia",
          "hero_title": "Wealink\nTrasferimenti Sicuri e Istantanei",
          "home": "Home",
          "money": "Invia Denaro",
          "shop": "Shop",
          "travel": "Viaggi",
          "settings": "Impostazioni",
          "services": "Servizi",
          "instant_calculator": "Calcolatore Istantaneo",
          "you_receive": "Ricevi",
          "commission": "Commissione",
          "amount_eur": "Importo (EUR)",
          "send_money": "Invia Denaro",
          "flash_deals_title": "Offerte Lampo",
          "global_rates": "Tassi di Cambio Globali",
          "last_updated": "Ultimo aggiornamento",
          "search_country": "Cerca paese o valuta...",
          "flag_col": "Bandiera",
          "country": "Paese",
          "loading": "Caricamento",
          "no_results": "Nessun risultato trovato"
        }
      }
    },
    lng: 'it',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
