import React from 'react';
import { Sparkles, BookOpen, PenTool } from 'lucide-react';

interface HeaderProps {
  currentMode: 'normal' | 'model';
  onSwitchMode: (mode: 'normal' | 'model') => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSwitchMode,
  onReset,
}) => {

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-900/10 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Identité visuelle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center text-white shadow-md shadow-amber-900/20">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-amber-950 tracking-tight leading-tight">
                Traiteur Annie
              </h1>
              <span
                className={`text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border ${
                  currentMode === 'model'
                    ? 'bg-purple-100 text-purple-900 border-purple-300'
                    : 'bg-amber-100 text-amber-800 border-amber-200/60'
                }`}
              >
                {currentMode === 'model' ? 'Modèle Prérempli' : 'Formulaire Officiel'}
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              Gastronomie Africaine & Matériel de Réception
            </p>
          </div>
        </div>

        {/* Sélecteur de Version (Normal vs Modèle indépendant) & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap justify-end">
          {/* Sélecteur Version A / Version B */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => onSwitchMode('normal')}
              className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                currentMode === 'normal'
                  ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-300'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Version A : Formulaire vierge pour les informations réelles"
            >
              <PenTool className="w-3.5 h-3.5 text-amber-700" />
              <span>Normal (Vierge)</span>
            </button>

            <button
              type="button"
              onClick={() => onSwitchMode('model')}
              className={`min-h-[36px] flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                currentMode === 'model'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Version B : Modèle prérempli d'exemples réalistes (indépendant)"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Modèle Prérempli</span>
            </button>
          </div>

          {/* Bouton Réinitialiser */}
          <button
            type="button"
            onClick={() => {
              const confirmMsg =
                currentMode === 'model'
                  ? "Réinitialiser le modèle prérempli avec ses exemples d'origine ?"
                  : "Voulez-vous vraiment réinitialiser le formulaire normal ? Toutes vos réponses seront effacées.";
              if (window.confirm(confirmMsg)) {
                onReset();
              }
            }}
            className="min-h-[36px] px-2.5 py-1 rounded-lg text-stone-400 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
            title="Réinitialiser"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </header>
  );
};
