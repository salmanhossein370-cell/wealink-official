import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <h1 className="text-6xl font-extrabold text-slate-900 font-display">404</h1>
      <p className="text-xl text-slate-600">Pagina non trovata</p>
      <p className="text-sm text-slate-400">La pagina che stai cercando non esiste o è stata spostata.</p>
      <Link to="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors inline-block mt-4">
        Torna alla Home
      </Link>
    </div>
  );
}
