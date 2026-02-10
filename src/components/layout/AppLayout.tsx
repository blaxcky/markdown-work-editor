import { Sidebar } from './Sidebar';
import { EditorArea } from '@/components/editor/EditorArea';
import { useUIStore } from '@/stores/use-ui-store';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="flex h-full">
      <div
        className={cn(
          'h-full border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200 flex flex-col',
          sidebarOpen ? 'w-[280px] min-w-[280px]' : 'w-0 min-w-0 overflow-hidden'
        )}
      >
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <EditorArea />
      </div>
    </div>
  );
}
