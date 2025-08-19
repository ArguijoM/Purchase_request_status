const btnNuevaCompra = document.getElementById('btnNuevaCompra');
const formContainer = document.getElementById('formContainer');
const formCompra = document.getElementById('formCompra');
const comprasList = document.getElementById('listaCompras');

let compras = [];
const usuarios = [
  { usuario: "admin", password: "admin", tipo: "admin" }
];

const estados = ["No iniciado", "En proceso", "Terminado", "Cancelado"];
const camposEstatus = [
  "solicitado",
  "Cotizacion_de_departamento",
  "OC_solicitada",
  "OC_realizada",
  "OC_verificada",
  "OC_autorizada",
  "OC_pagada",
  "Producto_enviado",
  "Producto_recibido",
  "Factura",
  "Agregado_al_sistema"
];

let usuarioActual = null; // guardará el usuario logueado


document.getElementById('formLogin').addEventListener('submit', (e) => {
  e.preventDefault();
  const usuario = document.getElementById('loginUsuario').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const encontrado = usuarios.find(u => u.usuario === usuario && u.password === password);

  if (encontrado) {
    usuarioActual = encontrado;
    document.getElementById('loginContainer').style.display = 'none';
    actualizarPermisos();
  } else {
    alert("Usuario o contraseña incorrectos");
  }
});
function actualizarPermisos() {
  if (!usuarioActual) return;

  // Si es admin, mostramos el botón Nueva Compra y los botones de editar/borrar
  if (usuarioActual.tipo === "admin") {
    document.getElementById('btnNuevaCompra').style.display = 'inline-block';
    document.querySelectorAll('.guardar-btn').forEach(btn => btn.style.display = 'inline-block');
  } else {
    // Usuarios generales: ocultar botones de edición/borrado y Nueva Compra
    document.getElementById('btnNuevaCompra').style.display = 'none';
    document.querySelectorAll('.guardar-btn').forEach(btn => btn.style.display = 'none');
  }
}


function verificarPermiso() {
  if (!usuarioActual) {
    // Mostrar el modal de login
    document.getElementById('loginContainer').style.display = 'flex';
    return false;
  }
  if (usuarioActual.tipo !== "admin") {
    alert("No tienes permisos para realizar esta acción");
    return false;
  }
  return true;
}

function mostrarCompras() {
  comprasList.innerHTML = '';
  compras.forEach((compra) => {
    const div = document.createElement('details');
    div.className = 'compra';
    div.open = true; // <-- Esto lo mantiene abierto por defecto

    const summary = document.createElement('summary');
    summary.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <strong>${compra.nombre}</strong>
        <button class="guardar-btn" onclick="eliminarCompra(${compra.id})"
          style="font-size: 18px; padding: 10px 15px; min-width: 50px; background-color:#f44336; color:#fff;">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;

    div.appendChild(summary);

    const contenido = document.createElement('div');
    contenido.innerHTML = generarVistaEstatus(compra);
    div.appendChild(contenido);

    comprasList.appendChild(div);
  });
}

function actualizarVistaIdOrden(compra) {
  if (!compra) return '';

  if (compra.id_orden_compra) {
    return `
      <div class="fila-orden">
        <label>No. Orden de Compra:</label>
        <span id="textoOrden_${compra.id}">${compra.id_orden_compra}</span>
        <button class="guardar-btn" onclick="editarIdOrden(${compra.id})">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
      </div>
    `;
  } else {
    return `
      <div class="fila-orden">
        <label for="idOrden_${compra.id}">No. Orden de Compra:</label>
        <input type="text"  class="input-corto" id="idOrden_${compra.id}" placeholder="Ingrese la Orden de compra">
        <button class="guardar-btn-2" onclick="guardarIdOrden(${compra.id})"><i class="fa-solid fa-plus"></i></button>
      </div>
    `;
  }
}




function generarVistaEstatus(compra) {
  const pasosHtml = camposEstatus.map((campo, index) => {
    const estActual = compra.estatus[campo];

    // Color del LED según estatus
    let colorActual = '';
    switch (estActual) {
      case "Terminado": colorActual = "green"; break;
      case "En proceso": colorActual = "yellow"; break;
      case "No iniciado": colorActual = "gray"; break;
      case "Cancelado": colorActual = "red"; break;
      default: colorActual = "blue";
    }

    // Filtramos "No iniciado" para menú
    const opcionesHtml = estados
      .filter(est => est !== estActual && est !== "No iniciado")
      .map(est => {
        let color = '';
        switch (est) {
          case "Terminado": color = "green"; break;
          case "En proceso": color = "yellow"; break;
          case "Cancelado": color = "red"; break;
          default: color = "blue";
        }
        return `
          <li onclick="cambiarEstatus(${compra.id}, '${campo}', '${est}')"
              style="padding:4px 8px; cursor:pointer; list-style:none; display:flex; align-items:center; justify-content:space-between;">
            <span>${est}</span>
            <span class="led-pequeno" style="
                display:inline-block;
                width:12px;
                height:12px;
                border-radius:50%;
                background-color:${color};
                border:1px solid #999;
            "></span>
          </li>
        `;
      }).join('');

    return `
      <div class="paso-horizontal" data-compra-id="${compra.id}" data-campo="${campo}" font-size:14px; style="margin-bottom:16px;">
        <strong>${index + 1}: ${campo.replace(/_/g, " ")}</strong>
        
        <!-- Etiqueta y botón alineados -->
        <div class="estatus-dropdown" 
             style="display:flex; align-items:center; gap:6px; justify-content:center; position:relative;">
          
          <span class="estatus-actual" style="
                display:inline-flex;
                align-items:center;
                justify-content:center;
                padding:4px 8px;
                font-size:16px;
                background:#121212;
                border:1px solid #ccc;
                border-radius:4px;
                height:24px;">
            ${estActual}
          </span>
          
          <button 
            onclick="handleDropdownClick(this, '${compra.id}', '${campo}')"
            class="desplegar-btn" 
            style="display:inline-flex; align-items:center; justify-content:center;
                   padding:4px 6px; font-size:12px; background-color:gray; 
                   color:white; border:none; border-radius:4px; height:24px;">
            ▼
          </button>

          <!-- Menú oculto inicialmente -->
          <ul class="menu-estatus" style="
              display:none; 
              position:absolute; 
              top:100%; 
              left:50%; 
              transform:translateX(-50%);
              background:#000; 
              color:#fff;
              border:1px solid #ccc; 
              padding:4px 0; 
              margin:4px 0 0 0; 
              min-width:180px; 
              z-index:10;">
            ${opcionesHtml}
          </ul>
        </div>

        <!-- LED grande centrado -->
        <div style="margin-top:8px; display:flex; justify-content:center;">
          <span class="led" style="
              display:inline-block;
              width:24px;
              height:24px;
              border-radius:50%;
              background-color:${colorActual};
              border:2px solid #999;
          "></span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="compra-grid">
      <div class="col col1">
        ${actualizarVistaIdOrden(compra)}
        ${compra.descripcion ? `<p>Descripción: ${compra.descripcion}</p>` : ''}
      </div>
      <div class="col col2"></div>
      <div class="col col3">
        <div class="otros-pasos-horizontal">
          ${pasosHtml}
        </div>
      </div>
    </div>
  `;
}

// Función para manejar el click del dropdown
function handleDropdownClick(button, compraId, campo) {
  if (usuarioActual && usuarioActual.tipo === 'admin') {
    toggleMenu(button); // admin puede abrir menú
  } else {
    // No admin → llamar función de verificación
    if (typeof verificarPermiso === 'function') {
      verificarPermiso();
    } else {
      console.warn('Función verificarPermiso() no definida.');
    }
  }
}





// Función para mostrar/ocultar menú
function toggleMenu(btn) {
  const menu = btn.parentElement.querySelector('.menu-estatus');
  if (!menu) return;
  menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

// Función para cambiar estatus
async function cambiarEstatus(compraId, campo, nuevoEstado) {
  if (!verificarPermiso()) return;

  const compra = compras.find(c => c.id === compraId);
  if (!compra) return;

  // Guardar para revertir si falla
  const estadoAnterior = compra.estatus[campo];

  // Actualiza en memoria
  compra.estatus[campo] = nuevoEstado;

  // Regla: si se marca "Terminado", avanzar el siguiente paso a "En proceso" si está "No iniciado"
  if (nuevoEstado === "Terminado") {
    const idx = camposEstatus.indexOf(campo);
    const sig = camposEstatus[idx + 1];
    if (sig && compra.estatus[sig] === "No iniciado") {
      compra.estatus[sig] = "En proceso";
    }
  }

  try {
    const res = await fetch(`/compras/${compraId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compra)
    });
    if (!res.ok) throw new Error("PUT /compras/:id falló");

    // Re-render y cerrar menús abiertos de este paso
    mostrarCompras();
    // (opcional) si quieres: actualizarPermisos(); // por si ocultas botones a no-admins tras re-render
  } catch (err) {
    console.error(err);
    alert("No se pudo actualizar el estado en el servidor. Se revertirá el cambio.");
    // Revertir en memoria y re-render
    compra.estatus[campo] = estadoAnterior;
    mostrarCompras();
  }
}



function generarChecks(compraId, campo, estado) {
  return estados.map(est => `
    <label>
      <input type="checkbox" data-compra-id="${compraId}" data-campo="${campo}" value="${est}" 
      ${estado === est ? "checked" : ""} ${usuarioActual && usuarioActual.tipo !== 'admin' ? 'disabled' : ''}>
      ${est}
    </label>
  `).join("");
}

// ---------- CAMBIOS DE ESTATUS ----------
function cambiarPaso(compraId, campoNuevo, selectElement) {
  const compra = compras.find(c => c.id === compraId);
  if (!compra) return;

  // Guardamos el valor previo
  let pasoActual = Object.entries(compra.estatus).find(([campo, estado]) => estado === "En proceso");
  if (!pasoActual) pasoActual = Object.entries(compra.estatus)[0];
  const [campoActual, estadoActual] = pasoActual;

  // Verificamos permiso
  if (!verificarPermiso()) {
    selectElement.value = campoActual; // Restauramos
    return;
  }

  // Solo si hay permiso, actualizar los checks
  const estadoNuevo = compra.estatus[campoNuevo];
  const checksDiv = document.getElementById(`checks_${compraId}`);
  checksDiv.innerHTML = generarChecks(compraId, campoNuevo, estadoNuevo);
}


// ---------- ID ORDEN ----------
async function guardarIdOrden(compraId) {
  if (!verificarPermiso()) return;
  const input = document.getElementById(`idOrden_${compraId}`);
  const valor = input.value.trim();
  if (!valor) { alert('Ingrese un valor válido para la Orden de Compra.'); return; }

  const compra = compras.find(c => c.id === compraId);
  if (!compra) return;
  compra.id_orden_compra = valor;

  try {
    const res = await fetch(`/compras/${compraId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(compra) });
    if (!res.ok) throw new Error('Error guardando en el servidor');
    mostrarCompras();
  } catch (err) {
    console.error(err);
    alert('No se pudo guardar la Orden de compra en el servidor.');
  }
}

function editarIdOrden(compraId) {
  if (!verificarPermiso()) return;

  const compra = compras.find(c => c.id === compraId);
  if (!compra) return;

  const span = document.getElementById(`textoOrden_${compra.id}`);
  if (!span) return;

  const valorActual = span.innerText;
  // Reemplazar el texto por input + botón guardar
  span.parentElement.innerHTML = `
    <input type="text" id="editarOrden_${compraId}" value="${valorActual}" class="editable-input">
    <button class="guardar-btn" onclick="guardarEdicionOrden(${compraId})">Guardar</button>
  `;
}


async function guardarEdicionOrden(compraId) {
  if (!verificarPermiso()) return;
  const input = document.getElementById(`editarOrden_${compraId}`);
  const valor = input.value.trim();
  if (!valor) { alert('Ingrese un valor válido para la Orden de Compra.'); return; }

  const compra = compras.find(c => c.id === compraId);
  if (!compra) return;
  compra.id_orden_compra = valor;

  try {
    const res = await fetch(`/compras/${compraId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(compra) });
    if (!res.ok) throw new Error('Error guardando en el servidor');
    alert("Orden de Compra editada con éxito.");
    mostrarCompras();
  } catch (err) {
    console.error(err);
    alert('No se pudo actualizar la Orden de compra en el servidor.');
  }
}








// ---------- ESCUCHAR CHECKS ----------
document.addEventListener("change", async (e) => {
  if (!e.target.matches(".estado-global input[type='checkbox']") &&
    !e.target.closest(".paso-horizontal input[type='checkbox']")) return;

  const compraId = parseInt(e.target.dataset.compraId);
  const campo = e.target.dataset.campo;
  const value = e.target.value;

  const compra = compras.find(c => c.id === compraId);
  if (!compra) return;

  const estadoPrevio = compra.estatus[campo];

  if (!verificarPermiso()) {
    e.target.checked = estadoPrevio === value;
    return;
  }

  // Solo un check por paso
  const checkboxes = e.target.closest(".checkbox-group").querySelectorAll("input");
  checkboxes.forEach(chk => chk.checked = chk.value === value);

  compra.estatus[campo] = value;

  // Avanzar siguiente paso si se termina
  if (value === "Terminado") {
    const campoIndex = camposEstatus.indexOf(campo);
    const siguienteCampo = camposEstatus[campoIndex + 1];
    if (siguienteCampo && compra.estatus[siguienteCampo] === "No iniciado") {
      compra.estatus[siguienteCampo] = "En proceso";
    }
  }

  // Guardar en servidor
  try {
    const res = await fetch(`/compras/${compraId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compra)
    });
    if (!res.ok) throw new Error("Error actualizando estado");
    console.log("Estado actualizado");
  } catch (err) {
    console.error(err);
    alert("No se pudo actualizar el estado en el servidor.");
  }
});



// ---------- CRUD ----------
async function cargarCompras() {
  try {
    const res = await fetch("/compras");
    if (!res.ok) throw new Error("Error al cargar compras");
    compras = await res.json();
    mostrarCompras();
  } catch (err) {
    console.error(err);
    compras = [];
  }
}

formCompra.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!verificarPermiso()) return;

  const nombre = document.getElementById('nombre').value.trim();
  if (!nombre) { alert('Ingrese un nombre válido'); return; }

  const descripcion = document.getElementById('descripcion').value.trim();
  const idOrden = document.getElementById('idOrdenCompra').value.trim();

  const nuevoId = compras.length > 0 ? Math.max(...compras.map(c => c.id)) + 1 : 1;

  const estatusPorDefault = {};
  camposEstatus.forEach((campo, i) => estatusPorDefault[campo] = i === 0 ? "En proceso" : "No iniciado");

  const nuevaCompra = { id: nuevoId, nombre, descripcion, id_orden_compra: idOrden, estatus: estatusPorDefault };

  compras.push(nuevaCompra);

  try {
    const res = await fetch("/compras", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nuevaCompra) });
    if (!res.ok) throw new Error("Error guardando en el servidor");
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar la compra en el servidor.");
  }

  mostrarCompras();
  formCompra.reset();
  formContainer.style.display = 'none';
});

async function eliminarCompra(compraId) {
  if (!verificarPermiso()) return;
  if (!confirm("¿Estás seguro de eliminar esta compra?")) return;

  try {
    const res = await fetch(`/compras/${compraId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando en el servidor");

    compras = compras.filter(c => c.id !== compraId);
    mostrarCompras();
  } catch (err) {
    console.error(err);
    alert("No se pudo eliminar la compra del servidor.");
  }
}

// ---------- FORMULARIO NUEVA COMPRA ----------
btnNuevaCompra.addEventListener('click', () => {
  if (!verificarPermiso()) return;
  formContainer.style.display = 'flex';
});

function cerrarFormulario() {
  document.getElementById('formContainer').style.display = 'none';
  document.getElementById('loginContainer').style.display = 'none';
}


// ---------- INICIO ----------
cargarCompras();
