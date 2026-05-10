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
    <div ref={setNodeRef} style={style} className="bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 mb-3 shadow-sm flex flex-col group transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center flex-1 min-w-0">
          <div {...attributes} {...listeners} className="cursor-grab mr-4 text-slate-500 hover:text-indigo-400 transition-colors">
            <GripVertical size={20} />
          </div>
          <div className="flex-1 min-w-0 truncate">
            <p className="text-sm font-semibold text-white truncate" title={fileWrapper.file.name}>
              {fileWrapper.file.name}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {(fileWrapper.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemove(fileWrapper.id)}
          className="ml-3 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-md transition-all"
          title="Remove file"
        >
          <X size={18} />
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
// ... existing sensors setup ...
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
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Merge Queue</h3>
        <span className="text-xs font-medium bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20">{files.length} Files</span>
      </div>
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
