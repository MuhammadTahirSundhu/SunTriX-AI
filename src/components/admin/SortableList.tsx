import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

interface SortableListProps<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  children: React.ReactNode;
  strategy?: 'rect' | 'vertical';
  className?: string;
}

export function SortableList<T extends { _id: string }>({ 
  items, 
  onReorder, 
  children,
  strategy = 'rect',
  className = ''
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item._id === active.id);
      const newIndex = items.findIndex((item) => item._id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(i => i._id)}
        strategy={strategy === 'rect' ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <div className={className}>
          {children}
        </div>
      </SortableContext>
    </DndContext>
  );
}
