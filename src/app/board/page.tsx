'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Task, type TaskStatus, type UserOption } from '@/lib/api';
import { TaskCard } from '@/components/TaskCard';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in-progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

export default function BoardPage() {
  const { user, token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<TaskStatus | null>(null);
  const [moving, setMoving] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<TaskStatus>('todo');
  const [newAssignedTo, setNewAssignedTo] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('todo');
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setError('');
    setLoading(true);
    const params: Record<string, string> = {};
    if (searchTitle.trim()) params.title = searchTitle.trim();
    if (filterStatus) params.status = filterStatus;
    const { data, error: err } = await api<Task[]>(`/api/tasks`, { params });
    setLoading(false);
    if (err) {
      setError(err);
      if (err.includes('Unauthorized') || err.includes('Invalid')) {
        logout();
        router.push('/login');
      }
      return;
    }
    setTasks(data ?? []);
  }, [searchTitle, filterStatus, logout, router]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push('/login');
      return;
    }
    if (token) {
      fetchTasks();
      api<UserOption[]>('/api/users').then(({ data }) => setUsers(data ?? []));
    }
  }, [token, authLoading, router, fetchTasks]);

  async function handleDrop(targetStatus: TaskStatus, taskId: string) {
    setDropTarget(null);
    setDraggingId(null);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) return;
    setError('');
    setMoving(true);
    const { error: err } = await api<Task>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: targetStatus }),
    });
    setMoving(false);
    if (err) {
      setError(err);
      return;
    }
    await fetchTasks();
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreateError('');
    setCreateLoading(true);
    const { error: err } = await api<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: newStatus,
        ...(newAssignedTo ? { assignedTo: newAssignedTo } : {}),
      }),
    });
    setCreateLoading(false);
    if (err) {
      setCreateError(err);
      return;
    }
    setShowNewTask(false);
    setNewTitle('');
    setNewDescription('');
    setNewStatus('todo');
    setNewAssignedTo('');
    await fetchTasks();
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditAssignedTo(task.assignedTo?.id ?? '');
    setEditError('');
  }

  async function handleUpdateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTask) return;
    setEditError('');
    setEditLoading(true);
    const { error: err } = await api<Task>(`/api/tasks/${editingTask.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
        assignedTo: editAssignedTo || '',
      }),
    });
    setEditLoading(false);
    if (err) {
      setEditError(err);
      return;
    }
    setEditingTask(null);
    await fetchTasks();
  }

  async function handleDeleteTask(task: Task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeletingId(task.id);
    setError('');
    const { error: err } = await api(`/api/tasks/${task.id}`, { method: 'DELETE' });
    setDeletingId(null);
    if (err) setError(err);
    else await fetchTasks();
  }

  function handleDragOver(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(status);
  }

  function handleDragLeave() {
    setDropTarget(null);
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          <span className="text-sm text-slate-500">Loading…</span>
        </div>
      </div>
    );
  }

  if (!token) return null;

  const columnBg: Record<string, string> = {
    todo: 'bg-indigo-50/70',
    'in-progress': 'bg-amber-50/70',
    done: 'bg-emerald-50/70',
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-slate-200/80 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Task Board</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowNewTask(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              <span className="text-lg leading-none">+</span>
              New task
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <span className="text-sm text-slate-600">{user?.name ?? user?.email}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Search & filter */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <input
            type="text"
            placeholder="Search by title…"
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            onBlur={() => fetchTasks()}
            onKeyDown={(e) => e.key === 'Enter' && fetchTasks()}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus((e.target.value as TaskStatus) || '')}
            className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All statuses</option>
            {COLUMNS.map((c) => (
              <option key={c.status} value={c.status}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => fetchTasks()}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            Apply
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {moving && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-xl">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              <span className="font-medium text-slate-700">Moving task…</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5">
                <div className="mb-4 h-6 w-24 animate-pulse rounded-lg bg-slate-200" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-24 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const columnTasks = tasks.filter((t) => t.status === col.status);
              const isDropTarget = dropTarget === col.status;
              const bg = columnBg[col.status] ?? 'bg-slate-50/70';
              return (
                <div
                  key={col.status}
                  onDragOver={(e) => handleDragOver(e, col.status)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    e.preventDefault();
                    const raw = e.dataTransfer.getData('application/json');
                    try {
                      const { id } = JSON.parse(raw) as { id: string };
                      handleDrop(col.status, id);
                    } catch {
                      // ignore
                    }
                  }}
                  className={`rounded-2xl border-2 border-dashed p-5 transition-all duration-200 ${bg} ${
                    isDropTarget ? 'border-indigo-400 bg-indigo-50/80 scale-[1.02]' : 'border-slate-200/80'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-bold text-slate-700">{col.label}</h2>
                    <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-600 shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="flex min-h-[140px] flex-col gap-3">
                    {columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isCreator={user?.id === task.createdBy?.id}
                        onEdit={openEdit}
                        onDelete={handleDeleteTask}
                        onDragStart={() => setDraggingId(task.id)}
                        onDragEnd={() => setDraggingId(null)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New task modal */}
        {showNewTask && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl">
              <h2 className="mb-5 text-xl font-bold text-slate-800">New task</h2>
              <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
                {createError && (
                  <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</div>
                )}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600">Title</span>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600">Description</span>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    rows={2}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600">Status</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.status} value={c.status}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600">Assign to</span>
                  <select
                    value={newAssignedTo}
                    onChange={(e) => setNewAssignedTo(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={createLoading || !newTitle.trim()}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {createLoading ? 'Creating…' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNewTask(false); setCreateError(''); }}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit task modal */}
        {editingTask && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl">
              <h2 className="mb-5 text-xl font-bold text-slate-800">Edit task</h2>
              <form onSubmit={handleUpdateTask} className="flex flex-col gap-3">
                {editError && (
                  <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{editError}</div>
                )}
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600">Title</span>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600">Description</span>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    rows={2}
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600">Status</span>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.status} value={c.status}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-slate-600">Assign to</span>
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3.5 py-2.5 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </label>
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={editLoading || !editTitle.trim()}
                    className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {editLoading ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingTask(null); setEditError(''); }}
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deletingId && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-xl">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
              <span className="font-medium text-slate-700">Deleting…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
