import { useEffect, useRef } from 'react';
import { Crepe } from '@milkdown/crepe';
import { replaceAll } from '@milkdown/utils';
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

interface Props {
  initialValue: string;
  onChange: (markdown: string) => void;
}

export function MilkdownEditor({ initialValue, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(initialValue);
  const isProgrammaticUpdateRef = useRef(false);
  onChangeRef.current = onChange;
  initialValueRef.current = initialValue;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const crepe = new Crepe({
      root: el,
      defaultValue: initialValue,
      features: {
        'code-mirror': true,
        'list-item': true,
        'link-tooltip': true,
        'block-edit': true,
        table: true,
        toolbar: true,
        cursor: true,
        placeholder: true,
        'image-block': true,
      },
      featureConfigs: {
        placeholder: {
          text: 'Schreibe etwas...',
        },
      },
    });

    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => {
        if (isProgrammaticUpdateRef.current) {
          isProgrammaticUpdateRef.current = false;
          return;
        }

        onChangeRef.current(markdown);
      });
    });

    crepe.create().then(() => {
      crepeRef.current = crepe;

      const currentMarkdown = crepe.getMarkdown();
      if (currentMarkdown !== initialValueRef.current) {
        isProgrammaticUpdateRef.current = true;
        crepe.editor.action(replaceAll(initialValueRef.current));
      }
    });

    return () => {
      crepe.destroy();
      crepeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const crepe = crepeRef.current;
    if (!crepe) return;

    const currentMarkdown = crepe.getMarkdown();
    if (currentMarkdown === initialValue) return;

    isProgrammaticUpdateRef.current = true;
    crepe.editor.action(replaceAll(initialValue));
  }, [initialValue]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto prose prose-sm sm:prose-base max-w-none
        [&_.milkdown]:min-h-full [&_.milkdown]:p-6
        [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[calc(100vh-8rem)]"
    />
  );
}
