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
const stockActualInput = document.querySelector("#stock-actual");
const stockMinimoInput = document.querySelector("#stock-minimo");
const alergenosInputs = document.querySelectorAll('.allergens-grid input[type="checkbox"]');
const alergenosSection = document.querySelector(".allergens-section");
const limpiarFormularioBtn = document.querySelector("#limpiar-formulario");
const alergenosSummary = document.querySelector(".allergens-section summary");
const recetasBody = document.querySelector("#recetas-body");
const recetaForm = document.querySelector("#receta-form");
const recetaNombreInput = document.querySelector("#receta-nombre");
const recetaCategoriaInput = document.querySelector("#receta-categoria");
const recetaRendimientoCantidadInput = document.querySelector("#receta-rendimiento-cantidad");
const recetaRendimientoUnidadInput = document.querySelector("#receta-rendimiento-unidad");
const recetaRacionesInput = document.querySelector("#receta-raciones");
const recetaPrecioVentaInput = document.querySelector("#receta-precio-venta");
const limpiarRecetaFormularioBtn = document.querySelector("#limpiar-receta-formulario");
const componenteForm = document.querySelector("#componente-form");
const componenteItemInput = document.querySelector("#componente-item");
const componenteCantidadInput = document.querySelector("#componente-cantidad");
const componenteUnidadInput = document.querySelector("#componente-unidad");
const componentesBody = document.querySelector("#componentes-body");
const componentesCard = document.querySelector("#componentes-card");
const stockSummary = document.querySelector("#stock-summary");
const buscarIngredienteInput =  document.querySelector("#buscar-ingrediente");
const buscarRecetaInput =  document.querySelector("#buscar-receta");
const movimientoForm =  document.querySelector("#movimiento-form");
const movimientoIngredienteInput =  document.querySelector("#movimiento-ingrediente");
const movimientoTipoInput =  document.querySelector("#movimiento-tipo");
const movimientoCantidadInput =  document.querySelector("#movimiento-cantidad");
const movimientoUnidadInput =  document.querySelector("#movimiento-unidad");
const movimientoNotaInput =  document.querySelector("#movimiento-nota");
const movimientosBody =  document.querySelector("#movimientos-body");
const buscarMovimientoInput = document.querySelector("#buscar-movimiento");
const produccionForm = document.querySelector("#produccion-form");
const produccionRecetaInput = document.querySelector("#produccion-receta");
const produccionCantidadInput = document.querySelector("#produccion-cantidad");
const produccionNotaInput = document.querySelector("#produccion-nota");
const buscarProduccionInput = document.querySelector("#buscar-produccion");
const produccionesBody = document.querySelector("#producciones-body");
const exportarIngredientesBtn = document.querySelector("#exportar-ingredientes-btn");
const exportarRecetasBtn = document.querySelector("#exportar-recetas-btn");
const exportarMovimientosBtn = document.querySelector("#exportar-movimientos-btn");
const exportarProduccionesBtn = document.querySelector("#exportar-producciones-btn");

/* =========================
   2. State
========================= */

let ingredientes = [];
let ingredienteEditando = null;
let recetas = [];
let movimientos = [];
let recetaEditando = null;
let recetaSeleccionada = null;
let filtroIngrediente = "";
let filtroReceta = "";
let filtroMovimiento = "";
let producciones = [];
let filtroProduccion = "";

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

function convertirCantidadMovimiento(
  cantidad,
  unidadMovimiento,
  unidadIngrediente
) {

  if (unidadMovimiento === unidadIngrediente) {
    return cantidad;
  }

  // g -> kg
  if (
    unidadMovimiento === "g" &&
    unidadIngrediente === "kg"
  ) {
    return cantidad / 1000;
  }

  // kg -> g
  if (
    unidadMovimiento === "kg" &&
    unidadIngrediente === "g"
  ) {
    return cantidad * 1000;
  }

  // ml -> l
  if (
    unidadMovimiento === "ml" &&
    unidadIngrediente === "l"
  ) {
    return cantidad / 1000;
  }

  // l -> ml
  if (
    unidadMovimiento === "l" &&
    unidadIngrediente === "ml"
  ) {
    return cantidad * 1000;
  }

  return cantidad;
}

function obtenerIngredientesDeReceta(receta, multiplicador = 1) {
  const ingredientesNecesarios = [];

  receta.componentes.forEach(function (componente) {
    if (componente.tipo === "ingrediente") {
      ingredientesNecesarios.push({
        ingredienteId: componente.itemId,
        cantidad: componente.cantidad * multiplicador,
        unidad: componente.unidad
      });
    }

    if (componente.tipo === "receta") {
      const subreceta = recetas.find(function (receta) {
        return receta.id === componente.itemId;
      });

      if (!subreceta) {
        return;
      }

      let rendimientoBase = subreceta.rendimientoCantidad;

      if (subreceta.rendimientoUnidad === "kg") {
        rendimientoBase *= 1000;
      }

      if (subreceta.rendimientoUnidad === "l") {
        rendimientoBase *= 1000;
      }

      let cantidadUsadaBase = componente.cantidad;

      if (componente.unidad === "kg") {
        cantidadUsadaBase *= 1000;
      }

      if (componente.unidad === "l") {
        cantidadUsadaBase *= 1000;
      }

      const factorSubreceta =
        rendimientoBase > 0
          ? cantidadUsadaBase / rendimientoBase
          : 0;

      const ingredientesSubreceta =
        obtenerIngredientesDeReceta(
          subreceta,
          multiplicador * factorSubreceta
        );

      ingredientesSubreceta.forEach(function (ingrediente) {
        ingredientesNecesarios.push(ingrediente);
      });
    }
  });

  return ingredientesNecesarios;
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

function obtenerAlergenosReceta(receta) {
  const alergenos = [];

  receta.componentes.forEach(function (componente) {
    if (componente.tipo === "ingrediente") {
      const ingrediente = ingredientes.find(function (ingrediente) {
        return ingrediente.id === componente.itemId;
      });

      if (ingrediente && ingrediente.alergenos) {
        ingrediente.alergenos.forEach(function (alergeno) {
          if (!alergenos.includes(alergeno)) {
            alergenos.push(alergeno);
          }
        });
      }
    }

    if (componente.tipo === "receta") {
      const subreceta = recetas.find(function (receta) {
        return receta.id === componente.itemId;
      });

      if (subreceta) {
        const alergenosSubreceta = obtenerAlergenosReceta(subreceta);

        alergenosSubreceta.forEach(function (alergeno) {
          if (!alergenos.includes(alergeno)) {
            alergenos.push(alergeno);
          }
        });
      }
    }
  });

  return alergenos;
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

  return ["unidad"];
}

function obtenerAlergenosComponente(componente) {
  if (componente.tipo === "ingrediente") {
    const ingrediente = ingredientes.find(function (ingrediente) {
      return ingrediente.id === componente.itemId;
    });

    return ingrediente?.alergenos || [];
  }

  if (componente.tipo === "receta") {
    const receta = recetas.find(function (receta) {
      return receta.id === componente.itemId;
    });

    return receta ? obtenerAlergenosReceta(receta) : [];
  }

  return [];
}

function obtenerIngredientesSinStockReceta(receta) {
  const ingredientesSinStock = [];

  receta.componentes.forEach(function (componente) {

    if (componente.tipo === "ingrediente") {

      const ingrediente =
        ingredientes.find(function (ingrediente) {
          return ingrediente.id === componente.itemId;
        });

      if (
        ingrediente &&
        ingrediente.stockActual <= 0
      ) {
        ingredientesSinStock.push(
          ingrediente.nombre
        );
      }
    }

    if (componente.tipo === "receta") {

      const subreceta =
        recetas.find(function (receta) {
          return receta.id === componente.itemId;
        });

      if (subreceta) {

        const faltantesSubreceta =
          obtenerIngredientesSinStockReceta(subreceta);

        faltantesSubreceta.forEach(function (nombre) {

          if (
            !ingredientesSinStock.includes(nombre)
          ) {
            ingredientesSinStock.push(nombre);
          }
        });
      }
    }
  });
  return ingredientesSinStock;
}

function obtenerEstadoStock(ingrediente) {
  if (ingrediente.stockActual <= 0) {
    return {
      texto: "Sin stock",
      clase: "stock-danger"
    };
  }

  if (ingrediente.stockActual <= ingrediente.stockMinimo) {
    return {
      texto: "Bajo stock",
      clase: "stock-warning"
    };
  }

  return {
    texto: "Stock OK",
    clase: "stock-good"
  };
}
function aplicarMovimientoStock(movimiento) {
  const ingrediente = ingredientes.find(function (ingrediente) {
    return ingrediente.id === movimiento.ingredienteId;
  });

  if (!ingrediente) {
    return;
  }

  const cantidadConvertida =
  convertirCantidadMovimiento(
    movimiento.cantidad,
    movimiento.unidad,
    ingrediente.unidad
  );

  if (movimiento.tipo === "entrada") {
    ingrediente.stockActual += cantidadConvertida;
  }

  if (movimiento.tipo === "salida") {
    ingrediente.stockActual -= cantidadConvertida;

    if (ingrediente.stockActual < 0) {
      ingrediente.stockActual = 0;
    }
  }

  if (movimiento.tipo === "ajuste") {
    ingrediente.stockActual = cantidadConvertida;
  }
}

function descargarCSV(nombreArchivo, filas) {

  if (!filas.length) {
    alert("No hay datos para exportar.");
    return;
  }

  const csv = filas
    .map(function (fila) {

      return fila
        .map(function (valor) {

          return `"${String(valor ?? "").replaceAll('"', '""')}"`;

        })
        .join(",");

    })
    .join("\n");

  const blob = new Blob(
    [csv],
    {
      type: "text/csv;charset=utf-8;"
    }
  );

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();

  URL.revokeObjectURL(url);
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

    ingredientes = ingredientes.map(function (ingrediente) {
      return {
        ...ingrediente,
        stockActual: ingrediente.stockActual ?? 0,
        stockMinimo: ingrediente.stockMinimo ?? 0
      };
    });

    guardarIngredientes();
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

function guardarMovimientos() {
  localStorage.setItem(
    "movimientos",
    JSON.stringify(movimientos)
  );
}

function cargarMovimientos() {
  const movimientosGuardados =
    localStorage.getItem("movimientos");

  if (movimientosGuardados) {
    movimientos = JSON.parse(movimientosGuardados);
  }
}

function guardarProducciones() {
  localStorage.setItem("producciones", JSON.stringify(producciones));
}

function cargarProducciones() {
  const produccionesGuardadas = localStorage.getItem("producciones");

  if (produccionesGuardadas) {
    producciones = JSON.parse(produccionesGuardadas);
  }
}

/* =========================
   5. Render
========================= */
function renderizarUnidadesMovimiento() {
  const ingredienteId = Number(movimientoIngredienteInput.value);

  const ingrediente = ingredientes.find(function (ingrediente) {
    return ingrediente.id === ingredienteId;
  });

  if (!ingrediente) return;

  const unidadesCompatibles =
    obtenerUnidadesCompatibles(ingrediente, "ingrediente");

  movimientoUnidadInput.innerHTML = "";

  unidadesCompatibles.forEach(function (unidad) {
    const option = document.createElement("option");

    option.value = unidad;
    option.textContent = unidad;

    movimientoUnidadInput.appendChild(option);
  });
}

function obtenerNombreIngredientePorId(id) {
  const ingrediente = ingredientes.find(function (ingrediente) {
    return ingrediente.id === id;
  });

  return ingrediente ? ingrediente.nombre : "Ingrediente no encontrado";
}

function renderizarMovimientos() {
  movimientosBody.innerHTML = "";

const movimientosOrdenados =
  [...movimientos].reverse();

const movimientosFiltrados =
  movimientosOrdenados.filter(function (movimiento) {
    const nombreIngrediente =
      obtenerNombreIngredientePorId(
        movimiento.ingredienteId
      ).toLowerCase();

    const tipo =
      movimiento.tipo.toLowerCase();

    const nota =
      movimiento.nota.toLowerCase();

    return (
      nombreIngrediente.includes(filtroMovimiento) ||
      tipo.includes(filtroMovimiento) ||
      nota.includes(filtroMovimiento)
    );
  });

movimientosFiltrados.forEach(function (movimiento) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${new Date(movimiento.fecha).toLocaleString()}</td>
      <td>${obtenerNombreIngredientePorId(movimiento.ingredienteId)}</td>
      <td>${movimiento.tipo}</td>
      <td>${movimiento.cantidad}</td>
      <td>${movimiento.unidad}</td>
      <td>${movimiento.nota || "-"}</td>
    `;
    movimientosBody.appendChild(row);
  });
}
function cargarOpcionesMovimientoIngredientes() {

  movimientoIngredienteInput.innerHTML = `
    <option value="">
      Selecciona un ingrediente
    </option>
  `;

  const ingredientesOrdenados =
    [...ingredientes].sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });

  ingredientesOrdenados.forEach(function (ingrediente) {
    const option = document.createElement("option");

    option.value = ingrediente.id;
    option.textContent = ingrediente.nombre;
    movimientoIngredienteInput.appendChild(option);
  });
  renderizarUnidadesMovimiento();
}

function renderizarResumenStock() {
  const sinStock = ingredientes.filter(function (ingrediente) {
    return ingrediente.stockActual <= 0;
  }).length;

  const bajoStock = ingredientes.filter(function (ingrediente) {
    return ingrediente.stockActual > 0 && ingrediente.stockActual <= ingrediente.stockMinimo;
  }).length;

  const stockOk = ingredientes.filter(function (ingrediente) {
    return ingrediente.stockActual > ingrediente.stockMinimo;
  }).length;

  stockSummary.innerHTML = `
    <span>🔴 Sin stock: ${sinStock}</span>
    <span>🟡 Bajo stock: ${bajoStock}</span>
    <span>🟢 Stock OK: ${stockOk}</span>
  `;
}

function renderizarIngredientes() {
  tbody.innerHTML = "";
  renderizarResumenStock();

const ingredientesOrdenados = [...ingredientes].sort(function (a, b) {

  const prioridadA =
    a.stockActual <= 0
      ? 0
      : a.stockActual <= a.stockMinimo
      ? 1
      : 2;

  const prioridadB =
    b.stockActual <= 0
      ? 0
      : b.stockActual <= b.stockMinimo
      ? 1
      : 2;

  return prioridadA - prioridadB;
});

const ingredientesFiltrados =
  ingredientesOrdenados.filter(function (ingrediente) {
    return ingrediente.nombre
      .toLowerCase()
      .includes(filtroIngrediente);
  });

ingredientesFiltrados.forEach(function (ingrediente) {
    const row = document.createElement("tr");
    const cantidadUtil = calcularCantidadUtil(ingrediente);
    const costeUnitario = calcularCosteUnitario(ingrediente);
    const costeBase = calcularCosteBase(ingrediente);
    const estadoStock = obtenerEstadoStock(ingrediente);
    row.innerHTML = `
      <td>${ingrediente.nombre}</td>
      <td class="${estadoStock.clase}"> ${estadoStock.texto} </td>
      <td>${ingrediente.stockActual}</td>
      <td>${ingrediente.stockMinimo}</td>
      <td>${ingrediente.cantidad}</td>
      <td>${ingrediente.unidad}</td>
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
  const recetasFiltradas =
  recetas.filter(function (receta) {
    return receta.nombre
      .toLowerCase()
      .includes(filtroReceta);
  });

  recetasFiltradas.forEach(function (receta) {
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

    const alergenosReceta = obtenerAlergenosReceta(receta);
    const ingredientesSinStock = obtenerIngredientesSinStockReceta(receta);
      
        row.innerHTML = `
      <td>
        ${receta.nombre}
        ${
          alergenosReceta.length
            ? `<span
                class="recipe-allergen-badge"
                title="${alergenosReceta.join(", ")}"
              >
                ⚠️ ${alergenosReceta.length}
              </span>`
            : ""
        }
        ${
          ingredientesSinStock.length
            ? `<span
                class="recipe-stock-warning"
                title="Sin stock: ${ingredientesSinStock.join(", ")}"
              >
                📦 ${ingredientesSinStock.length}
              </span>
              `
              : ""
        }
      </td>
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

function cargarOpcionesProduccionRecetas() {

  produccionRecetaInput.innerHTML = `
    <option value="">
      Selecciona una receta
    </option>
  `;

  const recetasOrdenadas =
    [...recetas].sort(function (a, b) {
      return a.nombre.localeCompare(b.nombre);
    });

  recetasOrdenadas.forEach(function (receta) {

    const option = document.createElement("option");

    option.value = receta.id;
    option.textContent = receta.nombre;

    produccionRecetaInput.appendChild(option);
  });
}

function renderizarComponentes() {
  componentesBody.innerHTML = "";

  if (!recetaSeleccionada) {
    return;
  }

  const costeTotalComponentes = recetaSeleccionada.componentes.reduce(
    function (total, componente) {
      return total + calcularCosteComponente(componente);
    },
    0
  );

  recetaSeleccionada.componentes.forEach(function (componente, index) {
    const row = document.createElement("tr");
    const nombreComponente = obtenerNombreComponente(componente);
    const coste = calcularCosteComponente(componente);
    const alergenosComponente = obtenerAlergenosComponente(componente);
    const costeTotalComponentes = recetaSeleccionada.componentes.reduce(
    function (total, componente) {
      return total + calcularCosteComponente(componente);
        },
        0
      );
    const porcentaje =
      costeTotalComponentes > 0
        ? (coste / costeTotalComponentes) * 100
        : 0;

    row.innerHTML = `
      <td>
        ${nombreComponente}
          ${
            alergenosComponente.length
              ? `<span
                  class="component-allergen-badge"
                  title="${alergenosComponente.join(", ")}"
                >
                  ⚠️ ${alergenosComponente.length}
                </span>`
              : ""
            }
      </td>
      <td>${componente.cantidad}</td>
      <td>${componente.unidad}</td>
      <td>${coste.toFixed(2)} €</td>
      <td>${porcentaje.toFixed(1)}%</td>
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

const totalRow = document.createElement("tr");

totalRow.classList.add("total-row");

totalRow.innerHTML = `
  <td colspan="3"><strong>Coste total</strong></td>
  <td><strong>${costeTotalComponentes.toFixed(2)} €</strong></td>
  <td><strong>100%</strong></td>
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

function obtenerNombreRecetaPorId(id) {
  const receta = recetas.find(function (receta) {
    return receta.id === id;
  });

  return receta ? receta.nombre : "Receta no encontrada";
}

function renderizarProducciones() {
  produccionesBody.innerHTML = "";

  const produccionesOrdenadas = [...producciones].reverse();
  const produccionesFiltradas =
    produccionesOrdenadas.filter(function (produccion) {
      const nombreReceta = obtenerNombreRecetaPorId(produccion.recetaId).toLowerCase();
      const nota = produccion.nota.toLowerCase();

      return (
        nombreReceta.includes(filtroProduccion) ||
        nota.includes(filtroProduccion)
      );
    });

  produccionesFiltradas.forEach(function (produccion) {
    const row = document.createElement("tr");

  row.innerHTML = `
    <td>${new Date(produccion.fecha).toLocaleString()}</td>
    <td>${obtenerNombreRecetaPorId(produccion.recetaId)}</td>
    <td>${produccion.cantidad}</td>
    <td>${produccion.nota || "-"}</td>
    <td>
        ${produccion.revertida
          ? `<span class="produccion-revertida">Revertida</span>`
          : `<span class="produccion-activa">Activa</span>`
        }
  </td>
  <td>
    ${
      produccion.revertida
        ? "✅ Revertida"
        : `<button
            class="btn-revertir-produccion"
            data-id="${produccion.id}"
            type="button"
          >
            ↩️ Revertir
          </button>`
    }
  </td>
`;
    produccionesBody.appendChild(row);
  });
}



/* =========================
   6. Events
========================= */

exportarIngredientesBtn.addEventListener("click", function () {

  const filas = [
    [
      "Nombre",
      "Unidad",
      "Cantidad",
      "Precio",
      "Stock Actual",
      "Stock Mínimo"
    ],

    ...ingredientes.map(function (ingrediente) {
      return [
        ingrediente.nombre,
        ingrediente.unidad,
        ingrediente.cantidad,
        ingrediente.precio,
        ingrediente.stockActual,
        ingrediente.stockMinimo
      ];
    })
  ];

  descargarCSV("ingredientes.csv", filas);
});

exportarMovimientosBtn.addEventListener("click", function () {

  const filas = [
    [
      "Fecha",
      "Ingrediente",
      "Tipo",
      "Cantidad",
      "Unidad",
      "Nota"
    ],

    ...movimientos.map(function (movimiento) {
      return [
        new Date(movimiento.fecha).toLocaleString(),
        obtenerNombreIngredientePorId(movimiento.ingredienteId),
        movimiento.tipo,
        movimiento.cantidad,
        movimiento.unidad,
        movimiento.nota
      ];
    })
  ];

  descargarCSV("movimientos-inventario.csv", filas);
});

exportarProduccionesBtn.addEventListener("click", function () {

  const filas = [
    [
      "Fecha",
      "Receta",
      "Cantidad",
      "Nota",
      "Estado"
    ],

    ...producciones.map(function (produccion) {
      return [
        new Date(produccion.fecha).toLocaleString(),
        obtenerNombreRecetaPorId(produccion.recetaId),
        produccion.cantidad,
        produccion.nota,
        produccion.revertida ? "Revertida" : "Activa"
      ];
    })
  ];
  descargarCSV("producciones.csv", filas);

});

exportarRecetasBtn.addEventListener("click", function () {

  const filas = [
    [
      "Nombre",
      "Categoría",
      "Rendimiento",
      "Unidad",
      "Raciones",
      "Precio Venta",
      "Coste Total",
      "Coste por Ración",
      "Food Cost %"
    ],

    ...recetas.map(function (receta) {
      const costeTotal = calcularCosteTotalReceta(receta);
      const costePorRacion =
        receta.raciones > 0 ? costeTotal / receta.raciones : 0;
      const foodCost =
        receta.precioVenta > 0 ? (costePorRacion / receta.precioVenta) * 100 : 0;

      return [
        receta.nombre,
        receta.categoria,
        receta.rendimientoCantidad,
        receta.rendimientoUnidad,
        receta.raciones,
        receta.precioVenta,
        costeTotal.toFixed(2),
        costePorRacion.toFixed(2),
        foodCost.toFixed(2)
      ];
    })
  ];
  descargarCSV("recetas.csv", filas);

});

buscarMovimientoInput.addEventListener("input", function () {
  filtroMovimiento =
    buscarMovimientoInput.value.toLowerCase();

  renderizarMovimientos();
});
movimientoIngredienteInput.addEventListener(
  "change",
  renderizarUnidadesMovimiento
);

buscarProduccionInput.addEventListener("input", function () {
  filtroProduccion =
    buscarProduccionInput.value.toLowerCase();

  renderizarProducciones();
});

produccionesBody.addEventListener("click", function (event) {
  if (!event.target.classList.contains("btn-revertir-produccion")) {
    return;
  }

  const produccionId = Number(event.target.dataset.id);

  const produccion = producciones.find(function (produccion) {
    return produccion.id === produccionId;
  });

  if (!produccion || produccion.revertida) {
    return;
  }

  const receta = recetas.find(function (receta) {
    return receta.id === produccion.recetaId;
  });

  if (!receta) {
    alert("No se ha encontrado la receta original.");
    return;
  }

  if (
    !confirm(
      `¿Seguro que quieres revertir la producción de ${produccion.cantidad} x ${receta.nombre}?`
    )
  ) {
    return;
  }

  const ingredientesNecesarios =
    obtenerIngredientesDeReceta(
      receta,
      produccion.cantidad
    );

  ingredientesNecesarios.forEach(function (item) {
    const ingrediente = ingredientes.find(function (ingrediente) {
      return ingrediente.id === item.ingredienteId;
    });

    if (!ingrediente) {
      return;
    }

    const movimiento = {
      id: Date.now() + Math.random(),
      ingredienteId: ingrediente.id,
      tipo: "entrada",
      cantidad: item.cantidad,
      unidad: item.unidad,
      fecha: new Date().toISOString(),
      nota: `Reversión producción: ${receta.nombre}`
    };

    aplicarMovimientoStock(movimiento);
    movimientos.push(movimiento);
  });

  produccion.revertida = true;

  guardarIngredientes();
  guardarMovimientos();
  guardarProducciones();
  renderizarIngredientes();
  renderizarRecetas();
  renderizarMovimientos();
  renderizarProducciones();
});

movimientoForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const movimiento = {
    id: Date.now(),
    ingredienteId: Number(movimientoIngredienteInput.value),
    tipo: movimientoTipoInput.value,
    cantidad: Number(movimientoCantidadInput.value),
    unidad: movimientoUnidadInput.value,
    fecha: new Date().toISOString(),
    nota: movimientoNotaInput.value
  };

  aplicarMovimientoStock(movimiento);

  movimientos.push(movimiento);

  guardarIngredientes();
  guardarMovimientos();

  renderizarIngredientes();
  renderizarRecetas();
  renderizarMovimientos();

  movimientoForm.reset();
});

produccionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const recetaId = Number(produccionRecetaInput.value);
  const receta = recetas.find(function (receta) {
    return receta.id === recetaId;
  });

  if (!receta) {
    alert("Selecciona una receta válida.");
    return;
  }

  const cantidadProduccion = Number(produccionCantidadInput.value);
  const ingredientesNecesarios =
    obtenerIngredientesDeReceta(
      receta,
      cantidadProduccion
    );

  const ingredientesConFaltaStock = [];

ingredientesNecesarios.forEach(function (item) {

  const ingrediente =
    ingredientes.find(function (ingrediente) {
      return ingrediente.id === item.ingredienteId;
    });

  if (!ingrediente) {
    return;
  }

  const cantidadNecesaria =
    convertirCantidadMovimiento(
      item.cantidad,
      item.unidad,
      ingrediente.unidad
    );

  if (cantidadNecesaria > ingrediente.stockActual) {

    ingredientesConFaltaStock.push(
      `- ${ingrediente.nombre} ` +
      `(necesitas ${cantidadNecesaria.toFixed(2)} ${ingrediente.unidad}, ` +
      `tienes ${ingrediente.stockActual.toFixed(2)} ${ingrediente.unidad})`
    );
  }
});

if (ingredientesConFaltaStock.length > 0) {

  const continuar =
    confirm(
      `⚠️ Stock insuficiente detectado:\n\n` +
      ingredientesConFaltaStock.join("\n") +
      `\n\n¿Quieres continuar igualmente?`
    );

  if (!continuar) {
    return;
  }
}

  const resumenProduccion =
  ingredientesNecesarios
    .map(function (item) {
      const ingrediente =
        ingredientes.find(function (ingrediente) {
          return ingrediente.id === item.ingredienteId;
        });

      if (!ingrediente) {
        return null;
      }

      return `- ${item.cantidad} ${item.unidad} ${ingrediente.nombre}`;
    })
    .filter(Boolean)
    .join("\n");

const confirmarProduccion =
  confirm(
    `Vas a producir ${cantidadProduccion} x ${receta.nombre}.\n\n` +
    `Se descontará del inventario:\n` +
    `${resumenProduccion}\n\n` +
    `¿Quieres continuar?`
  );

if (!confirmarProduccion) {
  return;
}

  ingredientesNecesarios.forEach(function (item) {
    const ingrediente =
      ingredientes.find(function (ingrediente) {
        return ingrediente.id === item.ingredienteId;
      });

    if (!ingrediente) {
      return;
    }

    const movimiento = {
      id: Date.now() + Math.random(),
      ingredienteId: ingrediente.id,
      tipo: "salida",
      cantidad: item.cantidad,
      unidad: item.unidad,
      fecha: new Date().toISOString(),
      nota: `Producción receta: ${receta.nombre}`
    };

    aplicarMovimientoStock(movimiento);
    movimientos.push(movimiento);
  });

  const produccion = {
    id: Date.now(),
    recetaId: receta.id,
    cantidad: cantidadProduccion,
    fecha: new Date().toISOString(),
    nota: produccionNotaInput.value,
    revertida: false
  };

  producciones.push(produccion);

  guardarIngredientes();
  guardarMovimientos();
  guardarProducciones();
  renderizarIngredientes();
  renderizarRecetas();
  renderizarMovimientos();
  renderizarProducciones();
  produccionForm.reset();
});

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
    stockActual: Number(stockActualInput.value),
    stockMinimo: Number(stockMinimoInput.value),
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
    cargarOpcionesMovimientoIngredientes();
    form.reset();
    alergenosSection.open = false;
    actualizarContadorAlergenos();
});

tbody.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-danger")) {
    const id = Number(event.target.dataset.id);
    if (!confirm("¿Estás seguro de que quieres continuar?")) {
      return;
    }

    ingredientes = ingredientes.filter(function (ingrediente) {
      return ingrediente.id !== id;
    });

    guardarIngredientes();
    renderizarIngredientes();
    cargarOpcionesMovimientoIngredientes();
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
    stockActualInput.value = ingrediente.stockActual || 0;
    stockMinimoInput.value = ingrediente.stockMinimo || 0;

    alergenosInputs.forEach(function (checkbox) {
      checkbox.checked = ingrediente.alergenos?.includes(checkbox.value) || false;
    });

    actualizarContadorAlergenos();
    ingredienteEditando = id;
    form.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
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

  const recetaExistente = recetas.find(function (receta) {
  return receta.id === recetaEditando;
});
  const receta = {
    id: recetaEditando || Date.now(),
    nombre: recetaNombreInput.value,
    categoria: recetaCategoriaInput.value,
    rendimientoCantidad: Number(recetaRendimientoCantidadInput.value),
    rendimientoUnidad: recetaRendimientoUnidadInput.value,
    raciones: Number(recetaRacionesInput.value),
    precioVenta: Number(recetaPrecioVentaInput.value),
    componentes: recetaExistente ? recetaExistente.componentes : []
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
    if (!confirm("¿Estás seguro de que quieres continuar?")) {
      return;
    }

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
    recetaForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
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
  renderizarRecetas();
  cargarOpcionesProduccionRecetas();
  componenteForm.reset();
});

componentesBody.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-eliminar-componente")) {
    if (!confirm("¿Estás seguro de que quieres continuar?")) {
      return;
    }
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
    renderizarRecetas();
    cargarOpcionesProduccionRecetas();
  }
});

componenteItemInput.addEventListener("change", renderizarUnidadesComponente);

buscarIngredienteInput.addEventListener("input", function () {
  filtroIngrediente = buscarIngredienteInput.value.toLowerCase();

  renderizarIngredientes();
});

buscarRecetaInput.addEventListener("input", function () {
  filtroReceta = buscarRecetaInput.value.toLowerCase();

  renderizarRecetas();
});

/* =========================
   7. Init
========================= */

cargarIngredientes();
cargarRecetas();
cargarMovimientos();
cargarProducciones();
cargarOpcionesMovimientoIngredientes();
cargarOpcionesProduccionRecetas();
renderizarMovimientos();
renderizarProducciones();
activarScrollHorizontalDrag();

