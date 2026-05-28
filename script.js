const tbody = document.querySelector("#ingredientes-body");
const form = document.querySelector("form");
const nombreInput = document.querySelector("#nombre");
const unidadInput = document.querySelector("#unidad");
const cantidadInput = document.querySelector("#cantidad");
const precioInput = document.querySelector("#precio");
const mermaInput = document.querySelector("#merma");
let ingredientes = [];


function renderizarIngredientes() {
  tbody.innerHTML = "";

  ingredientes.forEach(function (ingrediente) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${ingrediente.nombre}</td>
      <td>${ingrediente.unidad}</td>
      <td>${ingrediente.cantidad}</td>
      <td>${ingrediente.precio} €</td>
      <td>${ingrediente.merma}%</td>
      <td>
        <button 
          class="btn-danger"
          data-id="${ingrediente.id}"
          type="button">
          Eliminar
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

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

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const ingrediente = {
    id: Date.now(),
    nombre: nombreInput.value,
    unidad: unidadInput.value,
    cantidad: Number(cantidadInput.value),
    precio: Number(precioInput.value),
    merma: Number(mermaInput.value)
  };

    ingredientes.push(ingrediente);
    guardarIngredientes();
    renderizarIngredientes();
    form.reset();
//  console.table(ingredientes);
});

tbody.addEventListener("click", function (event) {
  if (event.target.classList.contains("btn-danger")) {
    const id = Number(event.target.dataset.id);

    ingredientes = ingredientes.filter(function (ingrediente) {
      return ingrediente.id !== id;
    });

    guardarIngredientes();
    renderizarIngredientes();
  }
});

cargarIngredientes();