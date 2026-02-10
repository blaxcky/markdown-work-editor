import { SidebarHeader } from './SidebarHeader';
import { SidebarFooter } from './SidebarFooter';
import { FileTree } from '@/components/file-tree/FileTree';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
  return (
    <>
      <SidebarHeader />
      <ScrollArea className="flex-1">
        <FileTree />
      </ScrollArea>
      <SidebarFooter />
    </>
  );
}
