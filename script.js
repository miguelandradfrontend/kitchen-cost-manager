/* =========================
   1. Selectors
========================= */

const tbody = document.querySelector("#ingredientes-body");
const form = document.querySelector("form");

const nombreInput = document.querySelector("#nombre");
const unidadInput = document.querySelector("#unidad");
const cantidadInput = document.querySelector("#cantidad");
const precioInput = document.querySelector("#precio");
const mermaInput = document.querySelector("#merma");
const alergenosInputs = document.querySelectorAll(
  '.allergens-grid input[type="checkbox"]'
);
const alergenosSection = document.querySelector(".allergens-section");
const limpiarFormularioBtn = document.querySelector("#limpiar-formulario");
const alergenosSummary = document.querySelector(".allergens-section summary");

const recetasBody = document.querySelector("#recetas-body");
const recetaForm = document.querySelector("#receta-form");

const recetaNombreInput = document.querySelector("#receta-nombre");
const recetaCategoriaInput = document.querySelector("#receta-categoria");
const recetaRendimientoCantidadInput = document.querySelector(
  "#receta-rendimiento-cantidad"
);
const recetaRendimientoUnidadInput = document.querySelector(
  "#receta-rendimiento-unidad"
);
const recetaRacionesInput = document.querySelector("#receta-raciones");
const recetaPrecioVentaInput = document.querySelector(
  "#receta-precio-venta"
);
const limpiarRecetaFormularioBtn = document.querySelector(
  "#limpiar-receta-formulario"
);

const componenteForm = document.querySelector("#componente-form");
const componenteItemInput = document.querySelector("#componente-item");
const componenteCantidadInput = document.querySelector("#componente-cantidad");
const componenteUnidadInput = document.querySelector("#componente-unidad");
const componentesBody = document.querySelector("#componentes-body");
const componentesCard = document.querySelector("#componentes-card");
/* =========================
   2. State
========================= */

let ingredientes = [];
let ingredienteEditando = null;
let recetas = [];
let recetaEditando = null;
let recetaSeleccionada = null;

/* =========================
   3. Business Logic
========================= */

function calcularCantidadUtil(ingrediente) {
  return ingrediente.cantidad * (1 - ingrediente.merma / 100);
}

function calcularCosteUnitario(ingrediente) {
  const cantidadUtil = calcularCantidadUtil(ingrediente);

  return ingrediente.precio / cantidadUtil;
}

function calcularCosteBase(ingrediente) {
  let cantidadBase = convertirUnidadBase(ingrediente);

  cantidadBase = cantidadBase * (1 - ingrediente.merma / 100);

  return ingrediente.precio / cantidadBase;
}
function calcularCosteComponente(componente) {
  if (componente.tipo === "ingrediente") {
    const ingrediente = ingredientes.find(function (ingrediente) {
      return ingrediente.id === componente.itemId;
    });

    if (!ingrediente) {
      return 0;
    }

    const costeBase = calcularCosteBase(ingrediente);

    let cantidadBase = componente.cantidad;

    if (componente.unidad === "kg") {
      cantidadBase *= 1000;
    }

    if (componente.unidad === "l") {
      cantidadBase *= 1000;
    }

    return costeBase * cantidadBase;
  }

  if (componente.tipo === "receta") {
    const receta = recetas.find(function (receta) {
      return receta.id === componente.itemId;
    });

    if (!receta) {
      return 0;
    }

    const costeTotalReceta = calcularCosteTotalReceta(receta);

    let rendimientoBase = receta.rendimientoCantidad;

    if (receta.rendimientoUnidad === "kg") {
      rendimientoBase *= 1000;
    }

    if (receta.rendimientoUnidad === "l") {
      rendimientoBase *= 1000;
    }

    let cantidadUsadaBase = componente.cantidad;

    if (componente.unidad === "kg") {
      cantidadUsadaBase *= 1000;
    }

    if (componente.unidad === "l") {
      cantidadUsadaBase *= 1000;
    }

    const costePorUnidadBase = costeTotalReceta / rendimientoBase;

    return costePorUnidadBase * cantidadUsadaBase;
  }

  return 0;
}

function calcularCosteTotalReceta(receta) {
  return receta.componentes.reduce(function (total, componente) {
    return total + calcularCosteComponente(componente);
  }, 0);
}

function convertirUnidadBase(ingrediente) {
  if (ingrediente.unidad === "kg") {
    return ingrediente.cantidad * 1000;
  }

  if (ingrediente.unidad === "l") {
    return ingrediente.cantidad * 1000;
  }

  return ingrediente.cantidad;
}

function actualizarContadorAlergenos() {
  const totalSeleccionados = [...alergenosInputs].filter(function (checkbox) {
    return checkbox.checked;
  }).length;

  alergenosSummary.textContent = `Alérgenos (${totalSeleccionados})`;
}

function obtenerNombreComponente(componente) {
  if (componente.tipo === "ingrediente") {
    const ingrediente = ingredientes.find(function (ingrediente) {
      return ingrediente.id === componente.itemId;
    });

    return ingrediente ? ingrediente.nombre : "Ingrediente no encontrado";
  }

  if (componente.tipo === "receta") {
    const receta = recetas.find(function (receta) {
      return receta.id === componente.itemId;
    });

    return receta ? receta.nombre : "Receta no encontrada";
  }
}

function obtenerUnidadesCompatibles(item, tipo) {
  if (tipo === "receta") {
    return [item.rendimientoUnidad];
  }

  if (item.unidad === "kg" || item.unidad === "g") {
    return ["kg", "g"];
  }

  if (item.unidad === "l" || item.unidad === "ml") {
    return ["l", "ml"];
  }

  return ["ud"];
}

/* =========================
   4. Storage
========================= */

function guardarIngredientes() {
  localStorage.setItem("ingredientes", JSON.stringify(ingredientes));
}

function cargarIngredientes() {
  const ingredientesGuardados = localStorage.getItem("ingredientes");

  if (ingredientesGuardados) {
    ingredientes = JSON.parse(ingredientesGuardados);

    renderizarIngredientes();
  }
}

function guardarRecetas() {
  localStorage.setItem("recetas", JSON.stringify(recetas));
}

function cargarRecetas() {
  const recetasGuardadas = localStorage.getItem("recetas");

  if (recetasGuardadas) {
    recetas = JSON.parse(recetasGuardadas);
    renderizarRecetas();
  }
}

/* =========================
   5. Render
========================= */

function renderizarIngredientes() {
  tbody.innerHTML = "";

  ingredientes.forEach(function (ingrediente) {
    const row = document.createElement("tr");
    const cantidadUtil = calcularCantidadUtil(ingrediente);
    const costeUnitario = calcularCosteUnitario(ingrediente);
    const costeBase = calcularCosteBase(ingrediente);
    row.innerHTML = `
      <td>${ingrediente.nombre}</td>
      <td>${ingrediente.unidad}</td>
      <td>${ingrediente.cantidad}</td>
      <td>${ingrediente.precio.toFixed(2)} €</td>
      <td>${ingrediente.merma.toFixed(2)}%</td>
      <td>${cantidadUtil.toFixed(2)} ${ingrediente.unidad}</td>
      <td>${costeUnitario.toFixed(2)} €/${ingrediente.unidad}</td>
      <td>${costeBase.toFixed(2)} €/base</td>
      <td>
        <button class="btn-edit" data-id="${ingrediente.id}" type="button">  ✏️ Editar</button>
        <button class="btn-danger" data-id="${ingrediente.id}" type="button">  🗑️ Eliminar</button>
        ${ingrediente.alergenos?.length
          ? `<span
              class="allergen-badge"
              title="${ingrediente.alergenos.join(", ")}"
            >
              ⚠️ ${ingrediente.alergenos.length}
            </span>`
          : ""
        }
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

function renderizarRecetas() {
  recetasBody.innerHTML = "";

  recetas.forEach(function (receta) {
    const row = document.createElement("tr");
    const costeTotal = calcularCosteTotalReceta(receta);
    const costePorRacion = receta.raciones > 0 ? costeTotal / receta.raciones : 0;
    const foodCost = receta.precioVenta > 0
      ? (costePorRacion / receta.precioVenta) * 100
      : 0;
    const beneficioPorRacion =
      receta.precioVenta - costePorRacion;

    const margen =
      receta.precioVenta > 0
        ? (beneficioPorRacion / receta.precioVenta) * 100
        : 0;

    const margenClass =
  margen > 75
    ? "margin-good"
    : margen >= 60
    ? "margin-warning"
    : "margin-danger";

    const foodCostClass =
      foodCost < 25
        ? "food-cost-good"
        : foodCost <= 35
        ? "food-cost-warning"
        : "food-cost-danger";
      
        row.innerHTML = `
      <td>${receta.nombre}</td>
      <td>${receta.categoria}</td>
      <td>
        ${receta.rendimientoCantidad}
        ${receta.rendimientoUnidad}
      </td>
      <td>${receta.raciones}</td>
      <td>${receta.precioVenta.toFixed(2)} €</td>
      <td>${costeTotal.toFixed(2)} €</td>
      <td>${costePorRacion.toFixed(2)} €</td>
      <td class="${foodCostClass}">
        ${foodCost.toFixed(1)}%
      </td>
      <td>${beneficioPorRacion.toFixed(2)} €</td>
      <td class="${margenClass}">${margen.toFixed(1)}%</td>
      <td>
        <button class="btn-edit-receta" data-id="${receta.id}" type="button">
          ✏️ Editar
        </button>

        <button class="btn-danger-receta" data-id="${receta.id}" type="button">
          🗑️ Eliminar
        </button>

        <button class="btn-componentes" data-id="${receta.id}" type="button">
          🧩 Componentes
        </button>
      </td>
    `;
    recetasBody.appendChild(row);
  });
}

function cargarOpcionesComponentes() {
  componenteItemInput.innerHTML = `
    <option value="">Selecciona un elemento</option>
  `;

  const opcionesIngredientes = ingredientes.map(function (ingrediente) {
    return {
      tipo: "ingrediente",
      id: ingrediente.id,
      nombre: ingrediente.nombre,
      etiqueta: "Ingrediente"
    };
  });

  const opcionesRecetas = recetas
    .filter(function (receta) {
      return !recetaSeleccionada || receta.id !== recetaSeleccionada.id;
    })
    .map(function (receta) {
      return {
        tipo: "receta",
        id: receta.id,
        nombre: receta.nombre,
        etiqueta: "Receta"
      };
    });

  const opcionesOrdenadas = [
    ...opcionesIngredientes,
    ...opcionesRecetas
  ].sort(function (a, b) {
    return a.nombre.localeCompare(b.nombre);
  });

  opcionesOrdenadas.forEach(function (opcion) {
    const option = document.createElement("option");

    option.value = `${opcion.tipo}-${opcion.id}`;
    option.textContent = `${opcion.nombre} (${opcion.etiqueta})`;

    componenteItemInput.appendChild(option);
  });
}

function renderizarComponentes() {
  componentesBody.innerHTML = "";

  if (!recetaSeleccionada) {
    return;
  }

  recetaSeleccionada.componentes.forEach(function (componente, index) {
    const row = document.createElement("tr");
    const nombreComponente = obtenerNombreComponente(componente);
    const coste = calcularCosteComponente(componente);

    row.innerHTML = `
      <td>${nombreComponente}</td>
      <td>${componente.cantidad}</td>
      <td>${componente.unidad}</td>
      <td>${coste.toFixed(2)} €</td>
      <td>
        <button
          class="btn-danger btn-eliminar-componente"
          data-index="${index}"
          type="button"
        >
          🗑️ Eliminar
        </button>
      </td>
    `;

    componentesBody.appendChild(row);
  });

  const costeTotalComponentes = recetaSeleccionada.componentes.reduce(
  function (total, componente) {
    return total + calcularCosteComponente(componente);
  },
  0
);

const totalRow = document.createElement("tr");

totalRow.classList.add("total-row");

totalRow.innerHTML = `
  <td colspan="3"><strong>Coste total</strong></td>
  <td><strong>${costeTotalComponentes.toFixed(2)} €</strong></td>
  <td></td>
`;

componentesBody.appendChild(totalRow);
}

function renderizarUnidadesComponente() {
  const valorSeleccionado = componenteItemInput.value;

  if (!valorSeleccionado) return;

  const [tipo, itemId] = valorSeleccionado.split("-");
  const id = Number(itemId);

  const item =
    tipo === "ingrediente"
      ? ingredientes.find(function (ingrediente) {
          return ingrediente.id === id;
        })
      : recetas.find(function (receta) {
          return receta.id === id;
        });

  if (!item) return;

  const unidadesCompatibles = obtenerUnidadesCompatibles(item, tipo);

  componenteUnidadInput.innerHTML = "";

  unidadesCompatibles.forEach(function (unidad) {
    const option = document.createElement("option");
    option.value = unidad;
    option.textContent = unidad;
    componenteUnidadInput.appendChild(option);
  });
}

/* =========================
   6. Events
========================= */

function activarScrollHorizontalDrag() {
  const tableContainers = document.querySelectorAll(".table-container");

  tableContainers.forEach(function (container) {
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener("mousedown", function (event) {
      isDown = true;
      container.classList.add("dragging");
      startX = event.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener("mouseleave", function () {
      isDown = false;
      container.classList.remove("dragging");
    });

    container.addEventListener("mouseup", function () {
      isDown = false;
      container.classList.remove("dragging");
    });

    container.addEventListener("mousemove", function (event) {
      if (!isDown) return;

      event.preventDefault();

      const x = event.pageX - container.offsetLeft;
      const walk = x - startX;

      container.scrollLeft = scrollLeft - walk;
    });
  });
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

const alergenosSeleccionados = [...alergenosInputs]
  .filter(function (checkbox) {
    return checkbox.checked;
  })
  .map(function (checkbox) {
    return checkbox.value;
  });

  const ingrediente = {
    id: ingredienteEditando || Date.now(),
    nombre: nombreInput.value,
    unidad: unidadInput.value,
    cantidad: Number(cantidadInput.value),
    precio: Number(precioInput.value),
    merma: Number(mermaInput.value),
    alergenos: alergenosSeleccionados
  };

  const ingredienteDuplicado = ingredientes.find(function (ingrediente) {
    return (
      ingrediente.nombre.toLowerCase() === nombreInput.value.toLowerCase() &&
      ingrediente.id !== ingredienteEditando
    );
  });

if (ingredienteDuplicado) {
  alert("Este ingrediente ya existe.");
  return;
}

    if (ingredienteEditando === null) {
  ingredientes.push(ingrediente);
} else {
  ingredientes = ingredientes.map(function (item) {
    if (item.id === ingredienteEditando) {
      return ingrediente;
    }
    return item;
  });

  ingredienteEditando = null;
}
    guardarIngredientes();
    renderizarIngredientes();
    form.reset();
    alergenosSection.open = false;
    actualizarContadorAlergenos();
});

tbody.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-danger")) {
    const id = Number(event.target.dataset.id);

    ingredientes = ingredientes.filter(function (ingrediente) {
      return ingrediente.id !== id;
    });

    guardarIngredientes();
    console.log(ingredientes);
    renderizarIngredientes();
  }
});

tbody.addEventListener("click", function (event) {

  if (event.target.classList.contains("btn-edit")) {
    
    const id = Number(event.target.dataset.id);
    const ingrediente = ingredientes.find(function (ingrediente) {
      return ingrediente.id === id;
    });

    nombreInput.value = ingrediente.nombre;
    unidadInput.value = ingrediente.unidad;
    cantidadInput.value = ingrediente.cantidad;
    precioInput.value = ingrediente.precio;
    mermaInput.value = ingrediente.merma;

    alergenosInputs.forEach(function (checkbox) {
      checkbox.checked = ingrediente.alergenos?.includes(checkbox.value) || false;
    });

    actualizarContadorAlergenos();
    ingredienteEditando = id;
  }
});

limpiarFormularioBtn.addEventListener("click", function () {
  form.reset();
  ingredienteEditando = null;
  alergenosSection.open = false;
  actualizarContadorAlergenos();
});

alergenosInputs.forEach(function (checkbox) {
  checkbox.addEventListener("change", actualizarContadorAlergenos);
});

recetaForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const receta = {
    id: recetaEditando || Date.now(),
    nombre: recetaNombreInput.value,
    categoria: recetaCategoriaInput.value,
    rendimientoCantidad: Number(recetaRendimientoCantidadInput.value),
    rendimientoUnidad: recetaRendimientoUnidadInput.value,
    raciones: Number(recetaRacionesInput.value),
    precioVenta: Number(recetaPrecioVentaInput.value),
    componentes: []
  };
const recetaDuplicada = recetas.find(function (receta) {
  return (
    receta.nombre.toLowerCase() === recetaNombreInput.value.toLowerCase() &&
    receta.id !== recetaEditando
  );
});

if (recetaDuplicada) {
  alert("Esta receta ya existe.");
  return;
}
  if (recetaEditando === null) {
    recetas.push(receta);
  } else {
    recetas = recetas.map(function (item) {
      if (item.id === recetaEditando) {
        return receta;
      }
      return item;
    });

  recetaEditando = null;
}

guardarRecetas();
renderizarRecetas();
recetaForm.reset();
});

recetasBody.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-danger-receta")) {
    const id = Number(event.target.dataset.id);

    recetas = recetas.filter(function (receta) {
      return receta.id !== id;
    });

    guardarRecetas();
    renderizarRecetas();
  }
});

recetasBody.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-edit-receta")) {
    const id = Number(event.target.dataset.id);

    const receta = recetas.find(function (receta) {
      return receta.id === id;
    });

    recetaNombreInput.value = receta.nombre;
    recetaCategoriaInput.value = receta.categoria;
    recetaRendimientoCantidadInput.value = receta.rendimientoCantidad;
    recetaRendimientoUnidadInput.value = receta.rendimientoUnidad;
    recetaRacionesInput.value = receta.raciones;
    recetaPrecioVentaInput.value = receta.precioVenta;

    recetaEditando = id;
  }
});

limpiarRecetaFormularioBtn.addEventListener("click", function () {
  recetaForm.reset();
  recetaEditando = null;
});

recetasBody.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-componentes")) {
    const id = Number(event.target.dataset.id);

    recetaSeleccionada = recetas.find(function (receta) {
      return receta.id === id;
    });

    document.querySelector("#receta-activa").innerHTML = `
      <p><strong>Receta seleccionada:</strong> ${recetaSeleccionada.nombre}</p>
    `;

    componentesCard.style.display = "block";
    cargarOpcionesComponentes();
    renderizarUnidadesComponente();
    renderizarComponentes();
  }
});

componenteForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!recetaSeleccionada) {
    alert("Selecciona una receta primero.");
    return;
  }

  const [tipo, itemId] = componenteItemInput.value.split("-");

  const componente = {
    tipo: tipo,
    itemId: Number(itemId),
    cantidad: Number(componenteCantidadInput.value),
    unidad: componenteUnidadInput.value
  };

  recetaSeleccionada.componentes.push(componente);

  recetas = recetas.map(function (receta) {
    if (receta.id === recetaSeleccionada.id) {
      return recetaSeleccionada;
    }

    return receta;
  });

  guardarRecetas();
  renderizarComponentes();
  componenteForm.reset();
});

componentesBody.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-eliminar-componente")) {
    const index = Number(event.target.dataset.index);

    recetaSeleccionada.componentes.splice(index, 1);

    recetas = recetas.map(function (receta) {
      if (receta.id === recetaSeleccionada.id) {
        return recetaSeleccionada;
      }

      return receta;
    });

    guardarRecetas();
    renderizarComponentes();
  }
});

componenteItemInput.addEventListener("change", renderizarUnidadesComponente);

/* =========================
   7. Init
========================= */

cargarIngredientes();
cargarRecetas();
activarScrollHorizontalDrag();