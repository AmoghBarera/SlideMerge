import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import SlideRangePicker from './SlideRangePicker';

function SortableFileItem({ fileWrapper, onRemove, onRangeChange }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: fileWrapper.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-md p-3 mb-2 shadow-sm flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 min-w-0">
          <div {...attributes} {...listeners} className="cursor-grab mr-3 text-gray-400 hover:text-gray-600">
            <GripVertical size={20} />
          </div>
          <div className="flex-1 min-w-0 truncate">
            <p className="text-sm font-medium text-gray-800 truncate" title={fileWrapper.file.name}>
              {fileWrapper.file.name}
            </p>
            <p className="text-xs text-gray-500">
              {(fileWrapper.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemove(fileWrapper.id)}
          className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
          title="Remove file"
        >
          <X size={20} />
        </button>
      </div>
      <SlideRangePicker
        fileId={fileWrapper.id}
        slideRange={fileWrapper.slideRange}
        onChange={onRangeChange}
      />
    </div>
  );
}

export default function FileQueue({ files, setFiles }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRemove = (id) => {
    setFiles((items) => items.filter(item => item.id !== id));
  };

  const handleRangeChange = (id, newRange) => {
    setFiles((items) => items.map(item => 
      item.id === id ? { ...item, slideRange: newRange } : item
    ));
  };

  if (files.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-800 mb-3">Merge Queue</h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={files.map(f => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {files.map(fileWrapper => (
            <SortableFileItem
              key={fileWrapper.id}
              fileWrapper={fileWrapper}
              onRemove={handleRemove}
              onRangeChange={handleRangeChange}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
