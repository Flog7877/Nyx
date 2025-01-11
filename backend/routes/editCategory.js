const db = require('../config/db');


async function editCategory(req, res) {
  const userId = req.user.userId;
  const categoryId = req.params.id;
  const { name, color, parent_id } = req.body;
  let fields = [];
  let values = [];
  if (name !== undefined) {
    fields.push('name=?');
    values.push(name);
  }
  if (color !== undefined) {
    fields.push('color=?');
    values.push(color);
  }
  if (parent_id !== undefined) {
    fields.push('parent_id=?');
    values.push(parent_id || null);
  }
  if (fields.length === 0) {
    return res.status(400).json({ error: 'Keine gültigen Felder zum Aktualisieren übergeben.' });
  }

  if (req.body.pomodoro_focus_setting !== undefined) {
    fields.push('pomodoro_focus_setting=?');
    values.push(req.body.pomodoro_focus_setting);
  }
  if (req.body.pomodoro_pause_setting !== undefined) {
    fields.push('pomodoro_pause_setting=?');
    values.push(req.body.pomodoro_pause_setting);
  }
  if (req.body.ping_interval_setting !== undefined) {
    fields.push('ping_interval_setting=?');
    values.push(req.body.ping_interval_setting);
  }
  if (req.body.timer_time_setting !== undefined) {
    fields.push('timer_time_setting=?');
    values.push(req.body.timer_time_setting);
  }

  let results;

  try {
    const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    values.push(categoryId, userId);
    const querySQL = await db.query(query, values);
    results = querySQL[0];
  } catch (err) {
    console.error('Fehler beim Aktualisieren der Kategorie:', err);
    return res.status(500).json({ error: 'Datenbankfehler.' });
  }

  if (results.affectedRows === 0) {
    return res.status(404).json({ error: 'Kategorie nicht gefunden oder Zugriff verweigert.' });
  }
  res.status(200).json({ message: 'Kategorie erfolgreich aktualisiert.' });
}

module.exports = editCategory;