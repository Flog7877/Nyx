import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../utils/auth';
import {
  WrenchIcon
} from "../assets/icons/icons";

function buildTree(catArray) {
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

  return rootNodes;
}

function timeStringToSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

function formatTime(sec) {
  if (typeof sec === 'string') {
    sec = timeStringToSeconds(sec);
  }
  if (sec == null || isNaN(sec)) {
    return '00:00:00';
  }
  const hrs = String(Math.floor(sec / 3600)).padStart(2, '0');
  const mins = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
  const secs = String(sec % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}



function Categories() {
  useAuthGuard();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [slashPath, setSlashPath] = useState('');
  const [color, setColor] = useState('#000000');
  const [editNodeId, setEditNodeId] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempColor, setTempColor] = useState('#000000');
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const [globalSettings, setGlobalSettings] = useState({});

  const [tempPomodoroFocus, setTempPomodoroFocus] = useState('00:25:00');
  const [tempPomodoroPause, setTempPomodoroPause] = useState('00:05:00');
  const [tempPingInterval, setTempPingInterval] = useState('00:15:00');
  const [tempTimerTime, setTempTimerTime] = useState('00:10:00');

  const loadCategories = async () => {
    try {
      const response = await API.get('/categories');
      const fetchedCats = response.data || [];
      setCategories(fetchedCats);

      const allIds = fetchedCats.map((cat) => cat.id);
      setExpandedNodes(new Set(allIds));
    } catch (err) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      } else {
        console.error('Fehler beim Laden der Kategorien:', err);
      }
    }
  };

  const loadUserSettings = async () => {
    try {
      const resp = await API.get('/user_settings');
      const settingsArray = resp.data || [];
      const settingsObj = {};
      settingsArray.forEach(setting => {
        settingsObj[setting.setting_key] = setting.setting_value;
      });
      setGlobalSettings(settingsObj);
    } catch (err) {
      console.error('Fehler beim Laden der Benutzereinstellungen:', err);
    }
  };

  useEffect(() => {
    loadCategories();
    loadUserSettings()
  }, []);


  const handleOpenMenu = (node) => {
    setEditNodeId(node.id);
    setTempName(node.name);
    setTempColor(node.color || '#000000');

    const globalPomodoroFocus = parseInt(globalSettings.timer_pomodoro_focus, 10);
    setTempPomodoroFocus(
      node.pomodoro_focus_setting != null
        ? formatTime(node.pomodoro_focus_setting)
        : !isNaN(globalPomodoroFocus)
          ? formatTime(globalPomodoroFocus)
          : '00:25:00'
    );

    const globalPomodoroPause = parseInt(globalSettings.timer_pomodoro_pause, 10);
    setTempPomodoroPause(
      node.pomodoro_pause_setting != null
        ? formatTime(node.pomodoro_pause_setting)
        : !isNaN(globalPomodoroPause)
          ? formatTime(globalPomodoroPause)
          : '00:05:00'
    );

    const globalPingInterval = parseInt(globalSettings.timer_ping_interval, 10);
    setTempPingInterval(
      node.ping_interval_setting != null
        ? formatTime(node.ping_interval_setting)
        : !isNaN(globalPingInterval)
          ? formatTime(globalPingInterval)
          : '00:15:00'
    );

    const globalTimerDuration = parseInt(globalSettings.timer_timer_duration, 10);
    setTempTimerTime(
      node.timer_time_setting != null
        ? formatTime(node.timer_time_setting)
        : !isNaN(globalTimerDuration)
          ? formatTime(globalTimerDuration)
          : '00:10:00'
    );
  };


  const handleCancelEdit = () => {
    setEditNodeId(null);
  };

  const handleSaveEdit = async (nodeId) => {
    try {
      await API.put(`/categories/${nodeId}`, {
        name: tempName,
        color: tempColor,
        pomodoro_focus_setting: timeStringToSeconds(tempPomodoroFocus),
        pomodoro_pause_setting: timeStringToSeconds(tempPomodoroPause),
        ping_interval_setting: timeStringToSeconds(tempPingInterval),
        timer_time_setting: timeStringToSeconds(tempTimerTime)
      });
      setEditNodeId(null);
      loadCategories();
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      alert(err.response?.data?.error || 'Fehler beim Speichern');
    }
  };


  const handleAddCategory = async () => {
    if (!slashPath.trim()) return;
    try {
      await API.post('/categories', {
        slashPath,
        color,
      });
      setSlashPath('');
      loadCategories();
    } catch (err) {
      console.error('Fehler beim Anlegen:', err);
      alert(err.response?.data?.error || 'Fehler beim Anlegen');
    }
  };

  const toggleNode = (id) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedNodes(newSet);
  };

  const handleDeleteNode = async (id) => {
    if (!window.confirm('Kategorie wirklich löschen?')) return;
    try {
      await API.delete(`/categories/${id}`);
      loadCategories();
      setEditNodeId(null);
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
      alert(err.response?.data?.error || 'Fehler beim Löschen');
    }
  };


  const renderNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isEditing = (editNodeId === node.id);

    return (
      <div key={node.id} style={{ marginLeft: level * 20 }}>
        <span
          onClick={() => toggleNode(node.id)}
          style={{
            cursor: hasChildren ? 'pointer' : 'default',
            color: node.color
          }}
        >
          {hasChildren && (isExpanded ? '▼ ' : '▶ ')}
          {node.name}
        </span>
        <button style={{ marginLeft: 8, padding: '0', background: 'none', verticalAlign: '-5px' }} onClick={() => handleOpenMenu(node)}>
          <WrenchIcon width="18px" />
        </button>
        {isEditing && (
          <div style={{
            border: '1px solid #ddd',
            background: '#333333',
            padding: '8px',
            marginTop: '4px'
          }}>
            <div style={{ marginBottom: '6px' }}>
              <label>
                Name:
                <input
                  type="text"
                  style={{ marginLeft: '8px' }}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
              </label>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <label>
                Farbe:
                <input
                  type="color"
                  style={{ marginLeft: '8px' }}
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                />
              </label>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <label>
                Fokuszeit (hh:mm:ss):
                <input
                  type="text"
                  style={{ marginLeft: '8px' }}
                  value={tempPomodoroFocus}
                  onChange={(e) => setTempPomodoroFocus(e.target.value)}
                />
              </label>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <label>
                Pausenzeit (hh:mm:ss):
                <input
                  type="text"
                  style={{ marginLeft: '8px' }}
                  value={tempPomodoroPause}
                  onChange={(e) => setTempPomodoroPause(e.target.value)}
                />
              </label>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <label>
                Ping-Intervall (hh:mm:ss):
                <input
                  type="text"
                  style={{ marginLeft: '8px' }}
                  value={tempPingInterval}
                  onChange={(e) => setTempPingInterval(e.target.value)}
                />
              </label>
            </div>

            <div style={{ marginBottom: '6px' }}>
              <label>
                Timer-Dauer (hh:mm:ss):
                <input
                  type="text"
                  style={{ marginLeft: '8px' }}
                  value={tempTimerTime}
                  onChange={(e) => setTempTimerTime(e.target.value)}
                />
              </label>
            </div>

            <button onClick={() => handleSaveEdit(node.id)}>
              Bestätigen
            </button>
            <button onClick={handleCancelEdit} style={{ marginLeft: '8px' }}>
              Abbrechen
            </button>
            <br />

            <button
              onClick={() => handleDeleteNode(node.id)}
              style={{ marginTop: '8px', color: 'red' }}
            >
              Löschen
            </button>
          </div>
        )}
        {isExpanded && node.children.map(child => renderNode(child, level + 1))}
      </div>
    );
  };



  const tree = buildTree(categories);

  return (
    <div>
      <h1>Kategorien</h1>

      <div style={{ marginBottom: '10px' }}>
        <label>
          Neue Kategorie:
          <input
            style={{ marginLeft: 10 }}
            type="text"
            value={slashPath}
            onChange={(e) => setSlashPath(e.target.value)}
          />
        </label>
        <p style={{ textAlign: 'justify', textJustify: 'inter-word' }}>
          Kategorien haben eine hierarchische Struktur, d.h. man kann beliebig viele Unterkategorien erstellen.
          Dabei trennt man die Kategorien mit "/". Zum Beispiel ist bei Uni/Mathe/Analysis die oberste Kategorie "Uni", deren Subkategorie ist "Mathe" und deren Subkategorie ist wiederum "Analysis" und so weiter.
          Erstellt man eine Kategorie, deren Parents noch nicht existeiren, werden diese automatisch erstellt und erhalten die Farbe manuell erstellten Childs.
        </p>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Farbe:
          <input
            style={{ marginLeft: 10 }}
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleAddCategory}>Kategorie anlegen</button>
      <h2>Meine Kategorien</h2>
      {tree.map(root => renderNode(root))}
    </div>
  );
}

export default Categories;
