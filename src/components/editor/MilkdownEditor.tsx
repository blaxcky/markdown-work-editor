import { useEffect, useRef } from 'react';
import { Crepe } from '@milkdown/crepe';
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
  onChangeRef.current = onChange;

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
        onChangeRef.current(markdown);
      });
    });

    crepe.create().then(() => {
      crepeRef.current = crepe;
    });

    return () => {
      crepe.destroy();
      crepeRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto prose prose-sm sm:prose-base max-w-none
        [&_.milkdown]:min-h-full [&_.milkdown]:p-6
        [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[calc(100vh-8rem)]"
    />
  );
}
