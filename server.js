// server.js
require('dotenv').config(); // opcional, para desarrollo local
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(express.static('public')); // si tienes frontend en /public

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

// Crear tabla si no existe
const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS compras (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
`;

// Inicialización
(async () => {
  try {
    await pool.query(CREATE_TABLE_SQL);
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (err) {
    console.error('Error inicializando la base de datos:', err);
    process.exit(1);
  }
})();

/* --- RUTAS --- */

// GET /compras -> devuelve array con { id, ...data }
app.get('/compras', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, data FROM compras ORDER BY id');
    const compras = result.rows.map(r => ({ id: r.id, ...r.data }));
    res.json(compras);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error leyendo compras' });
  }
});

// POST /compras -> inserta body completo en columna JSONB y devuelve objeto con id incluido
app.post('/compras', async (req, res) => {
  try {
    const body = req.body || {};
    const result = await pool.query(
      'INSERT INTO compras (data) VALUES ($1) RETURNING id',
      [body]
    );
    const newCompra = { id: result.rows[0].id, ...body };
    res.json({ mensaje: 'Compra agregada', compra: newCompra });
  } catch (err) {
    console.error('Error guardando compra:', err);
    res.status(500).json({ error: 'Error guardando compra' });
  }
});

// PUT /compras/:id -> hace merge de JSON (sobrescribe claves enviadas)
app.put('/compras/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = req.body || {};
    const result = await pool.query(
      'UPDATE compras SET data = data || $1 WHERE id = $2 RETURNING id',
      [updates, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json({ mensaje: 'Compra actualizada', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando compra' });
  }
});

// DELETE /compras/:id -> elimina
app.delete('/compras/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const result = await pool.query('DELETE FROM compras WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json({ mensaje: 'Compra eliminada', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando compra' });
  }
});
