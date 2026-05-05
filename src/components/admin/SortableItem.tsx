import React, { createContext, useContext } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

interface SortableItemContextType {
  attributes: Record<string, any>;
  listeners: Record<string, any>;
  disabled: boolean;
}

const SortableItemContext = createContext<SortableItemContextType>({ attributes: {}, listeners: {}, disabled: false });

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SortableItem({ id, children, className = '', disabled = false }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <SortableItemContext.Provider value={{ attributes, listeners, disabled }}>
      <div ref={setNodeRef} style={style} className={`${className} ${isDragging ? 'ring-2 ring-primary relative z-50' : ''}`}>
        {children}
      </div>
    </SortableItemContext.Provider>
  );
}

export function DragHandle({ className = '' }: { className?: string }) {
  const { attributes, listeners, disabled } = useContext(SortableItemContext);
  
  if (disabled) return null;

  return (
    <button 
      type="button"
      {...attributes} 
      {...listeners} 
      className={`cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 rounded transition-colors ${className}`}
    >
      <GripVertical className="h-5 w-5" />
    </button>
  );
}
