import React from 'react';
import { Check, X } from 'lucide-react';

interface BooleanToggleFieldProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  trueLabel?: string;
  falseLabel?: string;
}

export const BooleanToggleField: React.FC<BooleanToggleFieldProps> = ({
  value,
  onChange,
  trueLabel = 'Oui, tout à fait',
  falseLabel = 'Non, pas à ce jour',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
          value === true
            ? 'bg-amber-50/70 border-amber-600 shadow-sm ring-1 ring-amber-500/20'
            : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50/60'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            value === true
              ? 'bg-amber-600 border-amber-600 text-white'
              : 'bg-stone-50 border-stone-300'
          }`}
        >
          {value === true && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
        <span
          className={`text-sm font-semibold ${
            value === true ? 'text-amber-950' : 'text-stone-800'
          }`}
        >
          {trueLabel}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange(false)}
        className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
          value === false
            ? 'bg-stone-100/90 border-stone-500 shadow-sm ring-1 ring-stone-400/20'
            : 'bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50/60'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
            value === false
              ? 'bg-stone-600 border-stone-600 text-white'
              : 'bg-stone-50 border-stone-300'
          }`}
        >
          {value === false && <X className="w-3.5 h-3.5 stroke-[3]" />}
        </div>
        <span
          className={`text-sm font-semibold ${
            value === false ? 'text-stone-900' : 'text-stone-800'
          }`}
        >
          {falseLabel}
        </span>
      </button>
    </div>
  );
};
