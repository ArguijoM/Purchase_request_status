function dentroHorario() {
  // Fecha ajustada a la zona horaria de México
  const ahora = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" })
  );

  const hora = ahora.getHours();   // hora local en CDMX
  const dia = ahora.getDay();      // 0=Dom, 1=Lun, ..., 6=Sab

  // Entre lunes (1) y viernes (5) Y entre 6 AM y 10 PM
  return dia >= 1 && dia <= 5 && hora >= 6 && hora < 22;
}

async function visitarPagina() {
  if (dentroHorario()) {
    try {
      const response = await fetch("https://purchase-request-status.onrender.com", {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
      });
      console.log("Visita realizada:", response.status, new Date().toLocaleString("es-MX"));
    } catch (error) {
      console.error("Error visitando la página:", error);
    }
  } else {
    console.log("Fuera de horario laboral (Lun-Vie, 6 AM - 10 PM México):", new Date().toLocaleString("es-MX"));
  }

  // Próxima visita aleatoria entre 1 y 14 minutos
  const minutos = Math.floor(Math.random() * 14) + 1;
  console.log(`Próxima ejecución en ${minutos} minuto(s)`);
  setTimeout(visitarPagina, minutos * 60 * 1000);
}

// Primera ejecución inmediata
visitarPagina();
