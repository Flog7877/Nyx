import '../assets/Styles/stylingStatistics.css';
import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuthGuard } from '../utils/auth';
import {
  EditIcon,
  DropDownRightIcon,
  DropDownDownIcon
} from '../assets/icons/icons';

function formatTime(sec) {
  const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const secs = String(sec % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function formatDateTime(isoString) {
  const d = new Date(isoString);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year} (${hh}:${mm} Uhr)`;
}

function buildHierarchyAndFlatten(catArray) {
  const map = {};
  catArray.forEach((c) => {
    map[c.id] = { ...c, children: [] };
  });
  const rootNodes = [];
  catArray.forEach((c) => {
    if (!c.parent_id) {
      rootNodes.push(map[c.id]);
    } else {
      map[c.parent_id].children.push(map[c.id]);
    }
  });

  function sortChildren(node) {
    node.children.sort((a, b) => a.name.localeCompare(b.name));
    node.children.forEach(sortChildren);
  }
  rootNodes.sort((a, b) => a.name.localeCompare(b.name));
  rootNodes.forEach(sortChildren);

  const result = [];
  function traverse(node, prefix) {
    const path = prefix ? prefix + '/' + node.name : node.name;
    result.push({ id: node.id, slashPath: path });
    node.children.forEach((child) => traverse(child, path));
  }
  rootNodes.forEach((r) => traverse(r, ''));
  return result;
}

function RoundRow({ runde, onCommentUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(runde.comment || '');

  const saveComment = () => {
    onCommentUpdate(runde.nr, editedComment);
    setIsEditing(false);
  };

  return (
    <tr>
      <td>{runde.nr}</td>
      <td>{runde.createdAt ? new Date(runde.createdAt).toLocaleTimeString() : '-'}</td>
      <td>{formatTime(runde.length)}</td>
      <td>{formatTime(runde.total)}</td>
      <td>
        {isEditing ? (
          <input
            type="text"
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
          />
        ) : (
          runde.comment
        )}
      </td>
      <td>
        {isEditing ? (
          <>
            <button onClick={saveComment}>✔️</button>
            <button onClick={() => setIsEditing(false)}>✖️</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)}><EditIcon width="16px" /></button>
        )}
      </td>
    </tr>
  );
}


function CategoryCheckboxDropdown({
  categories,
  selectedCategoryIds,
  setSelectedCategoryIds
}) {
  const [open, setOpen] = useState(false);

  const allCatIds = categories.map(c => c.id);
  const allSelected = allCatIds.every(id => selectedCategoryIds.includes(id))
    && selectedCategoryIds.includes(-1)
    && selectedCategoryIds.length === (allCatIds.length + 1);

  const toggleDropdown = () => setOpen(!open);

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedCategoryIds([]);
    } else {
      const newAll = [...allCatIds, -1];
      setSelectedCategoryIds(newAll);
    }
  };

  const handleToggleCategory = (catId) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  return (
    <div className="category-dropdown">
      <button onClick={toggleDropdown}>Kategorien filtern</button>
      {open && (
        <div className="category-dropdown-content">
          <div className="dropdown-actions">
            <button onClick={handleToggleAll}>
              {allSelected ? 'Keine auswählen' : 'Alle auswählen'}
            </button>
          </div>
          <ul>
            <li>
              <label>
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(-1)}
                  onChange={() => handleToggleCategory(-1)}
                />
                Nicht kategorisiert
              </label>
            </li>
            {categories.map((cat) => {
              const checked = selectedCategoryIds.includes(cat.id);
              return (
                <li key={cat.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCategory(cat.id)}
                    />
                    {cat.slashPath}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function SessionListItem({
  session,
  onEditClick,
  isOpen,
  toggleOpen,
  onRoundCommentUpdate
}) {
  let data = null;
  if (session.extra_data) {
    try {
      data = (typeof session.extra_data === 'string')
        ? JSON.parse(session.extra_data)
        : session.extra_data;
    } catch (e) {
    }
  }

  const isChrono = session.modus === 'Chronograph';
  const rounds = isChrono && data?.rounds ? data.rounds : [];

  return (
    <li className="session-list-item">
      <div className="session-header">
        <button className="expand-btn" onClick={toggleOpen}>
          {isOpen ? <DropDownDownIcon width="32px" style={{ verticalAlign: '-17px' }} /> : <DropDownRightIcon width="32px" style={{ verticalAlign: '-17px' }} />}
        </button>
        <span>Session {session.id}</span>
      </div>

      {isOpen && (
        <div className="session-details">
          <p>Beginn: {session.start_time ? formatDateTime(session.start_time) : '-'}</p>
          <p>Ende: {session.created_at ? formatDateTime(session.created_at) : '-'}</p>
          <p>Kategorie: {session.category_name || 'Keine'}</p>
          {session.modus === 'Pomodoro' && data && (
            <div>
              <p>Runden: {data.rounds || '-'}</p>
              <p>Fokus-Intervall: {data.focus_interval ? formatTime(data.focus_interval) : '-'}</p>
              <p>Pause-Intervall: {data.pause_interval ? formatTime(data.pause_interval) : '-'}</p>
            </div>
          )}
          {session.modus === 'Ping' && data && (
            <div>
              <p>Pings erhalten: {data.received_pings || '-'}</p>
              <p>Ping-Intervall: {data.ping_interval ? formatTime(data.ping_interval) : '-'}</p>
            </div>
          )}
          {isChrono && (
            <div>
              <table className="rounds-table">
                <thead>
                  <tr>
                    <th>Nr</th>
                    <th>Zeit</th>
                    <th>Length</th>
                    <th>Total</th>
                    <th>Kommentar</th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map(r => (
                    <RoundRow
                      key={r.nr}
                      runde={r}
                      onCommentUpdate={(rundeNr, newComment) =>
                        onRoundCommentUpdate(session.id, rundeNr, newComment)
                      }
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p>Fokuszeit total: {formatTime(session.focusTime)}</p>
          <p>Pausenzeit total: {formatTime(session.pauseTime)}</p>
          <p>Zeit gesamt: {formatTime(session.totalTime)}</p>
          <p>Notiz: {session.note || ''}</p>

          <button onClick={onEditClick} className="session-edit-btn">
            <EditIcon width="18px" style={{ verticalAlign: '-2.25px' }} /> Session bearbeiten
          </button>
        </div>
      )}
    </li>
  );
}


function Statistics() {
  useAuthGuard();

  const [sessions, setSessions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const [openSessionIds, setOpenSessionIds] = useState({});
  const [editId, setEditId] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');
  const [message, setMessage] = useState('');

  const [showRoundsModal, setShowRoundsModal] = useState(false);
  const [modalRounds, setModalRounds] = useState([]);
  const [modalSessionId, setModalSessionId] = useState(null);

  useEffect(() => {
    loadSessions();
    loadCategories();
  }, []);

  const loadSessions = async () => {
    try {
      const resp = await API.get('/sessions');
      const newSessions = (resp.data || []).map((s) => {
        const total = (s.focusTime || 0) + (s.pauseTime || 0);
        return { ...s, totalTime: total };
      });
      setSessions(newSessions);
    } catch (err) {
      setMessage(err.error || 'Fehler beim Laden der Sessions');
    }
  };

  const loadCategories = async () => {
    try {
      const resp = await API.get('/categories');
      const cats = resp.data || [];
      const flattened = buildHierarchyAndFlatten(cats);
      setCategories(flattened);

      const allIds = flattened.map(c => c.id);
      allIds.push(-1);
      setSelectedCategoryIds(allIds);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoundCommentUpdate = async (sessionId, rundeNr, newComment) => {
    try {
      await API.post(`/sessions/${sessionId}/rounds/${rundeNr}`, {
        comment: newComment
      });
      setModalRounds((prev) =>
        prev.map((r) => (r.nr === rundeNr ? { ...r, comment: newComment } : r))
      );
      setMessage(`Kommentar für Runde ${rundeNr} aktualisiert.`);
      loadSessions();
    } catch (error) {
      setMessage(
        `Fehler beim Aktualisieren: ${error.response?.data?.error || error.message}`
      );
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (s.category_id == null) {
      return selectedCategoryIds.includes(-1);
    }
    return selectedCategoryIds.includes(s.category_id);
  });

  const toggleSessionOpen = (sessionId) => {
    setOpenSessionIds(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const openEditModal = (session) => {
    setEditId(session.id);
    setEditCategory(session.category_id);
    setEditNote(session.note || '');
  };

  const handleSaveEdit = async () => {
    if (!editId) return;
    try {
      const resp = await API.put(`/sessions/${editId}`, {
        category_id: editCategory,
        note: editNote
      });
      setMessage(resp.data.message);
      loadSessions();
    } catch (err) {
      setMessage(err.error || 'Fehler beim Speichern');
    } finally {
      setEditId(null);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Session wirklich löschen?')) return;
    try {
      const resp = await API.delete(`/sessions/${sessionId}`);
      setMessage(resp.data.message);
      loadSessions();
    } catch (err) {
      setMessage(err.error || 'Fehler beim Löschen');
    } finally {
      setEditId(null);
    }
  };

  return (
    <div className="statistics-container">
      <h1>Statistiken</h1>
      {message && <p className="stats-message">{message}</p>}

      <CategoryCheckboxDropdown
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        setSelectedCategoryIds={setSelectedCategoryIds}
      />

      <ul className="session-list">
        {filteredSessions.map(session => {
          const isOpen = !!openSessionIds[session.id];
          return (
            <SessionListItem
              key={session.id}
              session={session}
              isOpen={isOpen}
              toggleOpen={() => toggleSessionOpen(session.id)}
              onEditClick={() => openEditModal(session)}
              onRoundCommentUpdate={handleRoundCommentUpdate}
            />
          );
        })}
      </ul>

      {editId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Session bearbeiten (ID: {editId})</h2>
            <div style={{ marginBottom: '8px' }}>
              <label>Kategorie:</label>
              <select
                value={editCategory || ''}
                onChange={(e) => setEditCategory(e.target.value)}
                style={{ marginLeft: '8px' }}
              >
                <option value="">Keine</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.slashPath}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label>Notiz:</label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                rows={3}
                style={{ marginLeft: '8px' }}
              />
            </div>

            <button onClick={handleSaveEdit}>Speichern</button>
            <button
              onClick={() => handleDeleteSession(editId)}
              style={{ marginLeft: '8px', color: 'red' }}
            >
              Löschen
            </button>
            <button onClick={() => setEditId(null)} style={{ marginLeft: '8px' }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




export default Statistics;
