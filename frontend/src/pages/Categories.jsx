import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
import { useAuthGuard } from '../utils/auth';

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
  
  

  useEffect(() => {
    loadCategories();
  }, []);

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

  const handleOpenMenu = (node) => {
    setEditNodeId(node.id);
    setTempName(node.name);            
    setTempColor(node.color || '#000000'); 
  };

  const handleCancelEdit = () => {
    setEditNodeId(null);
  };
  
  const handleSaveEdit = async (nodeId) => {
    try {
      await API.put(`/categories/${nodeId}`, {
        name: tempName,
        color: tempColor
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
  

  const renderNode = (node, level=0) => {
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
        <button style={{ marginLeft: 8 }} onClick={() => handleOpenMenu(node)}>
          ...
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
        {isExpanded && node.children.map(child => renderNode(child, level+1))}
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
        <p style = {{ textAlign: 'justify', textJustify: 'inter-word' }}>
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
