'use client';

import { type Task } from '@/lib/api';
import { InitialsBadge } from './InitialsBadge';

interface TaskCardProps {
  task: Task;
  isCreator: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const statusAccent: Record<string, string> = {
  todo: 'border-l-indigo-400',
  'in-progress': 'border-l-amber-400',
  done: 'border-l-emerald-400',
};

export function TaskCard({ task, isCreator, onEdit, onDelete, onDragStart, onDragEnd }: TaskCardProps) {
  const accent = statusAccent[task.status] ?? 'border-l-slate-300';

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ id: task.id, status: task.status }));
        e.dataTransfer.effectAllowed = 'move';
        onDragStart?.(e, task);
      }}
      onDragEnd={onDragEnd}
      className={`cursor-grab rounded-xl border border-slate-200/80 border-l-4 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300/80 active:cursor-grabbing ${accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-800 leading-snug">{task.title}</h3>
          {task.description ? (
            <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
          ) : null}
        </div>
        {task.createdBy && (
          <InitialsBadge name={task.createdBy.name} />
        )}
      </div>
      {task.assignedTo && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-400">Assigned to</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {task.assignedTo.name}
          </span>
        </div>
      )}
      {isCreator && (onEdit || onDelete) && (
        <div className="mt-3 flex gap-3 border-t border-slate-100 pt-3">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="text-xs font-medium text-red-600 hover:text-red-700"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}
