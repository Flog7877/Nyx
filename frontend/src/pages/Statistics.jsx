import '../assets/Styles/stylingStatistics.css';
import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuthGuard } from '../utils/auth';

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

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#363636',
  border: '1px solid #ccc',
  padding: '20px',
  zIndex: 2000
};

function buildHierarchyAndFlatten(catArray) {
  const map = {};
  catArray.forEach(c => {
    map[c.id] = { ...c, children: [] };
  });
  const rootNodes = [];
  catArray.forEach(c => {
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
    node.children.forEach(child => traverse(child, path));
  }
  rootNodes.forEach(r => traverse(r, ''));

  return result;
}

function Statistics() {

  useAuthGuard();

  const [sessions, setSessions] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);

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
      const newSessions = (resp.data || []).map(s => {
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
    } catch (err) {
      console.error(err);
    }
  };

  function renderInfo(session) {
    if (!session.extra_data) return '-';
    let data;
    try {
      data = typeof session.extra_data === 'string'
        ? JSON.parse(session.extra_data)
        : session.extra_data;
    } catch (e) {
      return '-';
    }

    if (session.modus === 'Pomodoro') {
      return (
        <ul>
          <li>Rundenzahl: {data.rounds || '-'}</li>
          <li>Fokus-Intervall: {data.focus_interval ? formatTime(data.focus_interval) : '-'}</li>
          <li>Pausen-Intervall: {data.pause_interval ? formatTime(data.pause_interval) : '-'}</li>
        </ul>
      );
    } else if (session.modus === 'Ping') {
      return (
        <ul>
          <li>Ping-Count: {data.received_pings || '-'}</li>
          <li>Intervall: {data.ping_interval ? formatTime(data.ping_interval) : '-'}</li>
        </ul>
      );
    } else if (session.modus === 'Chronograph') {
      const rounds = data.rounds || [];
      return (
        <div>
          <button
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setModalRounds(rounds);
              setModalSessionId(session.id);
              setShowRoundsModal(true);
            }}
          >
            ...
          </button>
        </div>
      );
    }
    return '-';
  }

  const openEditModal = (session) => {
    setEditId(session.id);
    setEditCategory(session.category_id);
    setEditNote(session.note || '');
  };

  const handleCancelEdit = () => {
    setEditId(null);
  };

  const handleSaveEdit = async () => {
    if (!editId) return;

    try {
      const resp = await API.put(`/sessions/${editId}`, {
        category_id: editCategory,
        note: editNote,
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

  const handleRoundCommentUpdate = async (rundeNr, newComment) => {
    try {
      await API.post(`/sessions/${modalSessionId}/rounds/${rundeNr}`, {
        comment: newComment,
      });
      // Lokale Aktualisierung:
      setModalRounds(prevRounds =>
        prevRounds.map(r => r.nr === rundeNr ? { ...r, comment: newComment } : r)
      );
      setMessage(`Kommentar für Runde ${rundeNr} aktualisiert.`);
    } catch (error) {
      setMessage(`Fehler beim Aktualisieren: ${error.response?.data?.error || error.message}`);
    }
  };


  return (
    <div>
      <h1>Statistiken</h1>
      {message && <p>{message}</p>}

      <table border="1" cellPadding="6" className='statistics-table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Datum</th>
            <th>Kategorie</th>
            <th>Modus</th>
            <th>Info</th>
            <th>Fokuszeit</th>
            <th>Pause</th>
            <th>Total</th>
            <th>Notiz</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>
                Beginn: {s.start_time ? formatDateTime(s.start_time) : '-'}<br />
                Ende: {s.created_at ? formatDateTime(s.created_at) : '-'}
              </td>
              <td>{s.category_name || ''}</td>
              <td>{s.modus}</td>
              <td>{renderInfo(s)}</td>
              <td>{formatTime(s.focusTime)}</td>
              <td>{formatTime(s.pauseTime)}</td>
              <td>{formatTime(s.totalTime)}</td>
              <td>{s.note || ''}</td>
              <td>
                <button onClick={() => openEditModal(s)}>...</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showRoundsModal && (
        <div style={modalStyle}>
          <h2>Runden für Session {modalSessionId}</h2>
          <button onClick={() => setShowRoundsModal(false)}>Schließen</button>
          <table border={1} style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>Nr</th>
                <th>Zeit</th>
                <th>Length</th>
                <th>Total</th>
                <th>Notiz</th>
                <th>Bearbeiten</th>
              </tr>
            </thead>
            <tbody>
              {modalRounds.map((runde) => (
                <RoundRow
                  key={runde.nr}
                  runde={runde}
                  onCommentUpdate={handleRoundCommentUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editId && (
        <div style={{
          position: 'fixed',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          border: '1px solid #666', background: '#363636', padding: '20px'
        }}>
          <h2>Session bearbeiten (ID: {editId})</h2>
          <div style={{ marginBottom: '8px' }}>
            <label>Kategorie:</label>
            <select
              value={editCategory || ''}
              onChange={(e) => setEditCategory(e.target.value)}
              style={{ marginLeft: '8px' }}
            >
              <option value="">Keine</option>
              {categories.map(cat => (
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
          <button onClick={() => handleDeleteSession(editId)} style={{ marginLeft: '8px', color: 'red' }}>
            Löschen
          </button>
          <button onClick={handleCancelEdit} style={{ marginLeft: '8px' }}>
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
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
          <button onClick={() => setIsEditing(true)}>...</button>
        )}
      </td>
    </tr>
  );
}



export default Statistics;
