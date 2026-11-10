import React, { useState } from 'react';
import { Lock, Sparkles, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { VALID_ACCESS_TOKENS } from '../../config/constants';

interface AccessGateProps {
  onUnlock: () => void;
}

export const AccessGate: React.FC<AccessGateProps> = ({ onUnlock }) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toLowerCase();
    const isValid = VALID_ACCESS_TOKENS.some((tok) => tok.toLowerCase() === clean);

    if (isValid) {
      setErrorMsg(false);
      onUnlock();
    } else {
      setErrorMsg(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4 sm:p-6 text-stone-100">
      <div className="w-full max-w-md bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* En-tête avec logo et icône de cadenas */}
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center text-white shadow-lg shadow-amber-950/40">
              <Sparkles className="w-8 h-8 text-amber-200" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-stone-900 border-2 border-stone-800 flex items-center justify-center text-amber-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Traiteur Annie
            </h1>
            <p className="text-xs text-amber-400/90 font-semibold uppercase tracking-wider mt-0.5">
              Espace de Cadrage & Découverte
            </p>
          </div>
        </div>

        {/* Message d'exclusivité */}
        <div className="bg-stone-900/90 rounded-2xl p-4 border border-stone-800 text-center mb-6">
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Cet outil de cadrage est strictement privé et réservé à la conception du futur site internet de <span className="text-white font-bold">Traiteur Annie</span>.
          </p>
          <p className="text-[11px] text-stone-400 mt-2 font-medium">
            Pour y accéder, veuillez utiliser le lien direct qui vous a été transmis ou saisir votre clé d'accès ci-dessous.
          </p>
        </div>

        {/* Formulaire de saisie manuelle si le lien n'a pas été cliqué */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="access-code" className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2">
              Clé d'accès confidentielle :
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="access-code"
                type="text"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value);
                  setErrorMsg(false);
                }}
                placeholder="Ex: 7f9c2a8e4b1d..."
                className="w-full min-h-[48px] pl-10 pr-4 rounded-xl bg-stone-900 border border-stone-700 text-white placeholder-stone-600 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
                autoComplete="off"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold mt-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Clé d'accès invalide. Vérifiez votre saisie ou utilisez votre lien direct.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition cursor-pointer"
          >
            <span>Accéder au questionnaire</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-center text-stone-600 mt-6">
          Protection d'accès par lien exclusif • Antigravity 2026
        </p>
      </div>
    </div>
  );
};
