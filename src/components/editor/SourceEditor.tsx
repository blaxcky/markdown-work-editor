import { useEffect, useRef } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SourceEditor({ value, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 w-full resize-none bg-background text-foreground p-6 font-mono text-sm leading-relaxed focus:outline-none"
      spellCheck={false}
    />
  );
}
