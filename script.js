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

/* =========================
   2. State
========================= */

let ingredientes = [];
let ingredienteEditando = null;

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
  const cantidadBase = convertirUnidadBase(ingrediente);

  return ingrediente.precio / cantidadBase;
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

/* =========================
   6. Events
========================= */

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
/* =========================
   7. Init
========================= */

cargarIngredientes();

