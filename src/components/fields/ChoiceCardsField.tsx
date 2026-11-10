import React from 'react';
import { ChoiceOption } from '../../types/questionnaire';
import { Check } from 'lucide-react';

interface ChoiceCardsFieldProps {
  options: ChoiceOption[];
  multiple?: boolean;
  value: string | string[] | undefined;
  customText?: string;
  onChange: (newValue: string | string[]) => void;
  onCustomTextChange?: (text: string) => void;
}

export const ChoiceCardsField: React.FC<ChoiceCardsFieldProps> = ({
  options,
  multiple = false,
  value,
  customText = '',
  onChange,
  onCustomTextChange,
}) => {
  const selectedValues = multiple
    ? (Array.isArray(value) ? value : [])
    : (typeof value === 'string' && value ? [value] : []);

  const handleSelect = (optionId: string) => {
    if (multiple) {
      if (selectedValues.includes(optionId)) {
        onChange(selectedValues.filter((v) => v !== optionId));
      } else {
        onChange([...selectedValues, optionId]);
      }
    } else {
      onChange(optionId);
    }
  };

  const isOtherOption = (opt: ChoiceOption) => {
    return opt.allowCustomText || opt.id === 'autre' || opt.id.startsWith('autre_') || opt.label.toLowerCase().startsWith('autre');
  };

  return (
    <div className="space-y-3 pt-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.id);
          const hasCustom = isOtherOption(option);

          return (
            <div key={option.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`min-h-[48px] flex items-start text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-amber-50/70 border-amber-600 shadow-sm ring-1 ring-amber-500/20'
                    : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50/60'
                }`}
              >
                {/* Case ou Pastille de sélection */}
                <div
                  className={`mt-0.5 mr-3 w-5 h-5 flex-shrink-0 rounded-${
                    multiple ? 'md' : 'full'
                  } border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-stone-50 border-stone-300'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm sm:text-base font-semibold leading-snug ${
                        isSelected ? 'text-amber-950' : 'text-stone-800'
                      }`}
                    >
                      {option.label}
                    </span>
                    {option.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                        {option.badge}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
                      {option.description}
                    </p>
                  )}
                </div>
              </button>

              {/* Champ de précision libre pour "Autre" */}
              {isSelected && hasCustom && onCustomTextChange && (
                <div className="mt-2 pl-2 border-l-2 border-amber-400">
                  <label className="block text-xs font-semibold text-amber-900 mb-1">
                    Précise ta réponse :
                  </label>
                  <textarea
                    rows={2}
                    value={customText}
                    onChange={(e) => onCustomTextChange(e.target.value)}
                    placeholder="Précise ici ce que tu souhaites ajouter..."
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm text-stone-900 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition shadow-xs placeholder:text-stone-400 resize-y"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
