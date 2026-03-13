"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Note, NoteAttachment, NoteColor, NOTE_COLORS } from "@/lib/types";
import {
  Plus,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  X,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Download,
  Search,
  Filter,
  ChevronDown,
  StickyNote,
} from "lucide-react";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: body instanceof FormData ? {} : body ? { "Content-Type": "application/json" } : {},
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
  return json;
}

const ALL_COLORS: NoteColor[] = ["red", "blue", "yellow", "green", "purple"];

export default function NotesPage() {
  const { currentUser } = useApp();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [search, setSearch] = useState("");
  const [filterColor, setFilterColor] = useState<NoteColor | "all">("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await api(`/api/notes?user_id=${currentUser.id}`);
      setNotes(data as Note[]);
    } catch (e) {
      console.error("Fetch notes error:", e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const togglePin = async (note: Note) => {
    try {
      const updated = await api(`/api/notes/${note.id}`, "PATCH", { pinned: !note.pinned });
      setNotes((prev) =>
        prev.map((n) => (n.id === note.id ? updated : n))
          .sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          })
      );
    } catch (e) {
      console.error("Pin error:", e);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await api(`/api/notes/${id}`, "DELETE");
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const filtered = notes.filter((n) => {
    if (filterColor !== "all" && n.color !== filterColor) return false;
    if (search) {
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || (n.content || "").toLowerCase().includes(q);
    }
    return true;
  });

  const pinnedNotes = filtered.filter((n) => n.pinned);
  const unpinnedNotes = filtered.filter((n) => !n.pinned);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <StickyNote className="text-blue-600" size={28} />
            Жазбалар
          </h1>
          <p className="text-gray-500 text-sm mt-1">Жеке жазбалар мен ескертулер</p>
        </div>
        <button
          onClick={() => { setEditingNote(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm font-medium"
        >
          <Plus size={18} />
          Жазба қосу
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Іздеу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            <Filter size={16} />
            Түсі бойынша
            <ChevronDown size={14} className={showFilters ? "rotate-180 transition-transform" : "transition-transform"} />
          </button>
          {showFilters && (
            <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-30 min-w-[200px]">
              <button
                onClick={() => { setFilterColor("all"); setShowFilters(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${filterColor === "all" ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50"}`}
              >
                Бәрі
              </button>
              {ALL_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setFilterColor(c); setShowFilters(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${filterColor === c ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50"}`}
                >
                  <span className={`w-3 h-3 rounded-full ${NOTE_COLORS[c].dot}`} />
                  {NOTE_COLORS[c].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
          Жүктелуде...
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <StickyNote className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-400 text-lg">Жазбалар жоқ</p>
          <p className="text-gray-300 text-sm mt-1">Жаңа жазба қосу үшін жоғарыдағы батырманы басыңыз</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="mx-auto mb-3 text-gray-300" size={36} />
          <p>Сәйкес жазба табылмады</p>
        </div>
      ) : (
        <>
          {/* Pinned notes */}
          {pinnedNotes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Pin size={14} /> Бекітілген
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => { setEditingNote(note); setShowModal(true); }}
                    onPin={() => togglePin(note)}
                    onDelete={() => deleteNote(note.id)}
                    onRefresh={fetchNotes}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Unpinned notes */}
          {unpinnedNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Барлық жазбалар</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={() => { setEditingNote(note); setShowModal(true); }}
                    onPin={() => togglePin(note)}
                    onDelete={() => deleteNote(note.id)}
                    onRefresh={fetchNotes}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <NoteModal
          note={editingNote}
          userId={currentUser?.id || ""}
          onClose={() => { setShowModal(false); setEditingNote(null); }}
          onSaved={(saved) => {
            if (editingNote) {
              setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)));
            } else {
              setNotes((prev) => [saved, ...prev]);
            }
            setShowModal(false);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================================
// Note Card Component
// ============================================================
function NoteCard({
  note,
  onEdit,
  onPin,
  onDelete,
  onRefresh,
}: {
  note: Note;
  onEdit: () => void;
  onPin: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const colors = NOTE_COLORS[note.color];
  const attachments = note.attachments || [];
  const images = attachments.filter((a) => a.file_type?.startsWith("image/"));
  const files = attachments.filter((a) => !a.file_type?.startsWith("image/"));

  const deleteAttachment = async (att: NoteAttachment) => {
    try {
      await api(`/api/notes/${note.id}/attachments?attachment_id=${att.id}`, "DELETE");
      onRefresh();
    } catch (e) {
      console.error("Delete attachment error:", e);
    }
  };

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-2xl overflow-hidden transition-all hover:shadow-lg group`}>
      {/* Image preview */}
      {images.length > 0 && (
        <div className={`grid ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-0.5`}>
          {images.slice(0, 4).map((img, i) => (
            <div key={img.id} className="relative aspect-video bg-black/5 overflow-hidden">
              <img
                src={img.file_url}
                alt={img.file_name}
                className="w-full h-full object-cover"
              />
              {i === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg">
                  +{images.length - 4}
                </div>
              )}
              <button
                onClick={() => deleteAttachment(img)}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.dot}`} />
            <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
            {note.pinned && <Pin size={14} className="text-blue-500 shrink-0" />}
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {new Date(note.updated_at).toLocaleDateString("kk-KZ", { day: "2-digit", month: "2-digit" })}
          </span>
        </div>

        {/* Content */}
        {note.content && (
          <p className="text-sm text-gray-600 line-clamp-4 mb-3 whitespace-pre-wrap">{note.content}</p>
        )}

        {/* File attachments */}
        {files.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-xs bg-white/60 rounded-lg px-2.5 py-1.5 group/file">
                <FileText size={14} className="text-gray-400 shrink-0" />
                <span className="truncate flex-1 text-gray-600">{f.file_name}</span>
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 shrink-0"
                >
                  <Download size={14} />
                </a>
                <button
                  onClick={() => deleteAttachment(f)}
                  className="text-gray-300 hover:text-red-500 shrink-0 opacity-0 group-hover/file:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Category label */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{colors.label}</span>
          <div className="flex items-center gap-1">
            {attachments.length > 0 && (
              <span className="text-xs text-gray-400 flex items-center gap-1 mr-2">
                <Paperclip size={12} /> {attachments.length}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-black/5">
          <button
            onClick={onPin}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-white/60 transition-colors"
            title={note.pinned ? "Босату" : "Бекіту"}
          >
            {note.pinned ? <PinOff size={14} /> : <Pin size={14} />}
            {note.pinned ? "Босату" : "Бекіту"}
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-white/60 transition-colors"
          >
            <Edit3 size={14} /> Өңдеу
          </button>
          {showConfirmDelete ? (
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={onDelete}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Иә, жою
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="text-xs px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-white/60 transition-colors"
              >
                Жоқ
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors ml-auto"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Note Modal (Create / Edit)
// ============================================================
function NoteModal({
  note,
  userId,
  onClose,
  onSaved,
}: {
  note: Note | null;
  userId: string;
  onClose: () => void;
  onSaved: (note: Note) => void;
}) {
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [color, setColor] = useState<NoteColor>(note?.color || "yellow");
  const [pinned, setPinned] = useState(note?.pinned || false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<NoteAttachment[]>(note?.attachments || []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEdit = !!note;

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let saved: Note;

      if (isEdit) {
        saved = await api(`/api/notes/${note.id}`, "PATCH", { title, content, color, pinned });
      } else {
        saved = await api("/api/notes", "POST", { user_id: userId, title, content, color, pinned });
      }

      // Upload pending files
      if (pendingFiles.length > 0) {
        setUploading(true);
        for (const file of pendingFiles) {
          const formData = new FormData();
          formData.append("file", file);
          const att = await api(`/api/notes/${saved.id}/attachments`, "POST", formData);
          setAttachments((prev) => [...prev, att]);
        }
        setPendingFiles([]);
        setUploading(false);

        // Re-fetch the note with all attachments
        const refreshed = await api(`/api/notes?user_id=${userId}`);
        const freshNote = (refreshed as Note[]).find((n) => n.id === saved.id);
        if (freshNote) saved = freshNote;
      }

      onSaved(saved);
    } catch (e) {
      console.error("Save error:", e);
      alert("Қате: " + (e instanceof Error ? e.message : "Белгісіз қате"));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const removeAttachment = async (att: NoteAttachment) => {
    try {
      await api(`/api/notes/${note?.id}/attachments?attachment_id=${att.id}`, "DELETE");
      setAttachments((prev) => prev.filter((a) => a.id !== att.id));
    } catch (e) {
      console.error("Remove attachment error:", e);
    }
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (f.size > 5 * 1024 * 1024) {
        alert(`${f.name} — файл тым үлкен (макс 5 МБ)`);
        continue;
      }
      newFiles.push(f);
    }
    setPendingFiles((prev) => [...prev, ...newFiles]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? "Жазбаны өңдеу" : "Жаңа жазба"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Тақырып *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Жазба тақырыбы"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Мазмұны</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Жазба мәтіні..."
              rows={5}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Түсі</label>
            <div className="flex gap-2">
              {ALL_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                    color === c
                      ? `${NOTE_COLORS[c].bg} ${NOTE_COLORS[c].border} ring-2 ring-offset-1 ring-${c === "yellow" ? "yellow" : c}-300`
                      : `${NOTE_COLORS[c].bg} border-transparent hover:${NOTE_COLORS[c].border}`
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${NOTE_COLORS[c].dot}`} />
                  {NOTE_COLORS[c].label}
                </button>
              ))}
            </div>
          </div>

          {/* Pin toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 flex items-center gap-1.5">
              <Pin size={14} className="text-blue-500" /> Бекіту (жоғарыда көрсету)
            </span>
          </label>

          {/* File attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Тіркемелер</label>

            {/* Existing attachments (edit mode) */}
            {attachments.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                    {att.file_type?.startsWith("image/") ? <ImageIcon size={14} className="text-gray-400" /> : <FileText size={14} className="text-gray-400" />}
                    <span className="truncate flex-1">{att.file_name}</span>
                    <span className="text-gray-300">{att.file_size ? `${(att.file_size / 1024).toFixed(0)} КБ` : ""}</span>
                    <button onClick={() => removeAttachment(att)} className="text-gray-400 hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending files (not yet uploaded) */}
            {pendingFiles.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {pendingFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs bg-blue-50 rounded-lg px-3 py-2">
                    {f.type.startsWith("image/") ? <ImageIcon size={14} className="text-blue-400" /> : <FileText size={14} className="text-blue-400" />}
                    <span className="truncate flex-1">{f.name}</span>
                    <span className="text-blue-300">{(f.size / 1024).toFixed(0)} КБ</span>
                    <button
                      onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-blue-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 px-3 py-2 border border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors w-full justify-center"
            >
              <Paperclip size={16} />
              Файл тіркеу (макс 5 МБ)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Бас тарту
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="px-5 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving || uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploading ? "Файлдар жүктелуде..." : "Сақталуда..."}
              </>
            ) : (
              isEdit ? "Сақтау" : "Қосу"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
