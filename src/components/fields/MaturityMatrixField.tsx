import React from 'react';
import { MaturityItem, MaturityLevel } from '../../types/questionnaire';
import { MATURITY_LABELS } from '../../config/constants';
import { Check } from 'lucide-react';

interface MaturityMatrixFieldProps {
  items: MaturityItem[];
  value: Record<string, MaturityLevel> | undefined;
  onChange: (newValue: Record<string, MaturityLevel>) => void;
}

const MATURITY_OPTIONS: MaturityLevel[] = ['EXISTING', 'SHORT_TERM', 'LONG_TERM', 'NONE'];

export const MaturityMatrixField: React.FC<MaturityMatrixFieldProps> = ({
  items,
  value = {},
  onChange,
}) => {
  const handleItemLevelChange = (itemId: string, level: MaturityLevel) => {
    onChange({
      ...value,
      [itemId]: level,
    });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* Légende rapide explicative */}
      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs text-stone-600 flex flex-wrap gap-x-4 gap-y-2 items-center">
        <span className="font-semibold text-stone-700">Légende :</span>
        {MATURITY_OPTIONS.map((lvl) => (
          <div key={lvl} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: MATURITY_LABELS[lvl].color }}
            />
            <span>{MATURITY_LABELS[lvl].label}</span>
          </div>
        ))}
      </div>

      {/* Lignes de la matrice */}
      <div className="space-y-3">
        {items.map((item) => {
          const currentLevel = value[item.id];

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                currentLevel && currentLevel !== 'NONE'
                  ? 'bg-white border-amber-300/80 shadow-xs'
                  : 'bg-white/80 border-stone-200'
              }`}
            >
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-stone-900 leading-snug">
                  {item.label}
                </h4>
                {item.description && (
                  <p className="text-xs text-stone-500 mt-0.5">{item.description}</p>
                )}
              </div>

              {/* Boutons de sélection du niveau de maturité */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MATURITY_OPTIONS.map((lvl) => {
                  const isSelected = currentLevel === lvl;
                  const cfg = MATURITY_LABELS[lvl];

                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleItemLevelChange(item.id, lvl)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? `${cfg.badgeClass} border-current ring-1 ring-current/30 font-semibold shadow-xs`
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{cfg.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
