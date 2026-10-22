import React, { useEffect, useState } from 'react';
import { Package, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { IconButton } from '../ui';
import { AttributeSection } from './AttributeSection';
import { BrandSection } from './BrandSection';
import { CategorySection } from './CategorySection';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
}) => {
  const selectedCategory = useStore((state) => state.selectedCategory);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    category: true,
    brands: true,
    attributes: true,
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleSection = (section: string) => {
    setExpandedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }));
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close product configuration"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        id="configuration-sidebar"
        aria-label="Product configuration"
        className={`${
          isOpen ? 'flex' : 'hidden'
        } fixed inset-y-0 left-0 z-40 w-80 max-w-[85vw] shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-900 lg:static lg:z-auto lg:flex lg:w-[380px] lg:min-w-[380px] xl:w-1/2 xl:min-w-[560px]`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/50 p-5">
          <h2 className="flex min-w-0 items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
            <Package className="h-4 w-4 shrink-0 text-indigo-500" />
            <span className="truncate">Product Configuration</span>
          </h2>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-xs text-slate-500">
              {selectedCategory.name}
            </span>
            <IconButton
              label="Close product configuration"
              onClick={onClose}
              className="shrink-0 lg:hidden"
            >
              <X className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto">
          <CategorySection
            key={selectedCategory.id}
            expanded={expandedSections.category}
            onToggle={() => toggleSection('category')}
          />

          <BrandSection
            expanded={expandedSections.brands}
            onToggle={() => toggleSection('brands')}
          />

          <AttributeSection
            key={selectedCategory.id}
            expanded={expandedSections.attributes}
            onToggle={() => toggleSection('attributes')}
          />
        </div>
      </aside>
    </>
  );
};
