// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static("public")); // si tu HTML, CSS y JS están en public/

const dataPath = path.join(__dirname, "data.json");

// GET /compras
app.get("/compras", (req, res) => {
  try {
    const compras = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    res.json(compras);
  } catch (err) {
    res.status(500).json({ error: "Error leyendo compras" });
  }
});

// POST /compras
app.post("/compras", (req, res) => {
  try {
    let compras = [];
    if (fs.existsSync(dataPath)) {
      compras = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    }
    compras.push(req.body);
    fs.writeFileSync(dataPath, JSON.stringify(compras, null, 2));
    res.json({ mensaje: "Compra agregada" });
  } catch (err) {
    console.error("Error guardando compra:", err);
    res.status(500).json({ error: "Error guardando compra" });
  }
});

// PUT /compras/:id -> actualizar cualquier campo (estatus, id_orden_compra, etc.)
app.put("/compras/:id", (req, res) => {
  try {
    const compras = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const id = parseInt(req.params.id); 
    const compraIndex = compras.findIndex(c => c.id === id);

    if (compraIndex === -1) {
      return res.status(404).json({ error: "Compra no encontrada" });
    }

    // Actualiza cualquier campo enviado en el body
    Object.keys(req.body).forEach(key => {
      compras[compraIndex][key] = req.body[key];
    });

    fs.writeFileSync(dataPath, JSON.stringify(compras, null, 2));
    res.json({ mensaje: "Compra actualizada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando compra" });
  }
});

// DELETE /compras/:id -> eliminar compra
app.delete("/compras/:id", (req, res) => {
  try {
    const compras = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const id = parseInt(req.params.id);
    const compraIndex = compras.findIndex(c => c.id === id);

    if (compraIndex === -1) return res.status(404).json({ error: "Compra no encontrada" });

    compras.splice(compraIndex, 1); // eliminar del array
    fs.writeFileSync(dataPath, JSON.stringify(compras, null, 2));
    res.json({ mensaje: "Compra eliminada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error eliminando compra" });
  }
});





const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));

