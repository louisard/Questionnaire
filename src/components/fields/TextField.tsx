import React, { useRef, useEffect } from 'react';

interface TextFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  minRows?: number;
}

export const TextField: React.FC<TextFieldProps> = ({
  value = '',
  onChange,
  placeholder,
  textarea = false,
  minRows = 3,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Ajustement automatique de la hauteur pour une saisie multiligne sans saut intempestif
  useEffect(() => {
    if (textarea && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, minRows * 24 + 24)}px`;
    }
  }, [value, textarea, minRows]);

  if (textarea) {
    return (
      <textarea
        ref={textareaRef}
        rows={minRows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[84px] px-4 py-3 text-base sm:text-sm text-stone-900 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition shadow-xs placeholder:text-stone-400 leading-relaxed resize-y"
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-h-[48px] px-4 py-3 text-base sm:text-sm text-stone-900 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition shadow-xs placeholder:text-stone-400"
    />
  );
};
