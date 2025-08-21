async function visitarPagina() {
  try {
    const response = await fetch("https://purchase-request-status.onrender.com", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    console.log("Visita realizada:", response.status, new Date().toLocaleString());
  } catch (error) {
    console.error("Error visitando la página:", error);
  }

  // Programar la próxima visita aleatoria entre 1 y 14 minutos
  const minutos = Math.floor(Math.random() * 14) + 1; // 1 a 14
  console.log(`Próxima visita en ${minutos} minuto(s)`);
  setTimeout(visitarPagina, minutos * 60 * 1000);
}

// Primera visita inmediata
visitarPagina();
