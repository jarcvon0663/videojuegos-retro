const productosEnCarrito =
  JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const botonComprar = document.querySelector("#carrito-acciones-comprar");
const total = document.querySelector("#total");

cargarProductosCarrito();

function cargarProductosCarrito() {
  if (productosEnCarrito.length > 0) {
    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.remove("disabled");
    contenedorCarritoAcciones.classList.remove("disabled");
    contenedorCarritoComprado.classList.add("disabled");
    contenedorCarritoProductos.innerHTML = "";

    // Función para obtener la moneda local del usuario basado en su IP
function obtenerMonedaLocal() {
    // Usamos una API pública de geolocalización
    fetch('https://ipinfo.io/json?token=c51ec3e0269f24')
      .then((response) => response.json())
      .then((data) => {
        const pais = data.country_name;  // El nombre del país
        monedaLocal = obtenerMonedaSegunPais(pais);  // Determinamos la moneda local según el país
  
        obtenerTasaCambio();  // Ahora obtenemos la tasa de cambio una vez tengamos la moneda local
      })
      .catch((error) => {
        console.error("Error al obtener la ubicación del usuario:", error);
        obtenerTasaCambio();  // En caso de error, usamos el valor predeterminado
      });
  
      // Mostrar la moneda y el símbolo en el HTML
      const simbolo = obtenerSimboloMoneda(monedaLocal);
      document.querySelector("#moneda").textContent = `El precio está en ${simbolo}${monedaLocal}`;
  }
  
  // Función para obtener la tasa de cambio para convertir los precios
  function obtenerTasaCambio() {
    fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
      .then((response) => response.json())
      .then((data) => {
        tasaCambio = data.rates[monedaLocal]; // Establece la tasa de cambio de USD a la moneda local
        cargarProductos(productos); // Después de obtener la tasa de cambio, carga los productos
      })
      .catch((error) => console.error("Error al obtener la tasa de cambio:", error));
  }
  
  
  function obtenerMonedaSegunPais(pais) {
    const monedas = {
      "Argentina": "ARS", // Argentina
      "Bolivia": "BOB",   // Bolivia
      "Chile": "CLP",     // Chile
      "Colombia": "COP",  // Colombia
      "Costa Rica": "CRC", // Costa Rica
      "Cuba": "CUP",      // Cuba (Peso cubano)
      "República Dominicana": "DOP", // República Dominicana (Peso dominicano)
      "Ecuador": "USD",   // Ecuador (USA Dollar)
      "El Salvador": "SVC", // El Salvador (Colón)
      "Guatemala": "GTQ", // Guatemala (Quetzal)
      "Honduras": "HNL",  // Honduras (Lempira)
      "México": "MXN",    // México (Peso mexicano)
      "Nicaragua": "NIO", // Nicaragua (Córdoba)
      "Panamá": "PAB",    // Panamá (Balboa)
      "Paraguay": "PYG",  // Paraguay (Guaraní)
      "Perú": "PEN",      // Perú (Sol peruano)
      "Puerto Rico": "USD", // Puerto Rico (USA Dollar)
      "República Dominicana": "DOP", // República Dominicana (Peso dominicano)
      "Uruguay": "UYU",   // Uruguay (Peso uruguayo)
      "Venezuela": "VES", // Venezuela (Bolívar Soberano)
      "España": "EUR",    // España (Euro)
      // Agregar más países según sea necesario...
    };
  
    return monedas[pais] || "COP"; // Si el país no está en la lista, usamos COP como moneda predeterminada
  }

    productosEnCarrito.forEach((producto) => {
      // Calcular el precio en moneda local para cada producto
      const precioEnMonedaLocal = producto.precio * tasaCambio * 1.1;

      const div = document.createElement("div");
      div.classList.add("carrito-producto");
      div.innerHTML = `
                <img class="carrito-producto-imagen" src="${
                  producto.imagen
                }" alt="${producto.titulo}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${producto.titulo}</h3>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>${obtenerSimboloMoneda(monedaLocal)}${Math.floor(
        precioEnMonedaLocal
      ).toLocaleString("es-CO")}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${
                  producto.id
                }"><i class="bi bi-trash-fill"></i></button>
            `;
      contenedorCarritoProductos.append(div);
    });

    actualizarBotonesEliminar();
    actualizarTotal();
  } else {
    contenedorCarritoVacio.classList.remove("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.add("disabled");
  }
}

function actualizarBotonesEliminar() {
  const botonesEliminar = document.querySelectorAll(
    ".carrito-producto-eliminar"
  );
  botonesEliminar.forEach((boton) => {
    boton.addEventListener("click", eliminarDelCarrito);
  });
}

function eliminarDelCarrito(e) {
  const idBoton = e.currentTarget.id;
  const index = productosEnCarrito.findIndex(
    (producto) => producto.id === idBoton
  );
  if (index !== -1) {
    productosEnCarrito.splice(index, 1);
    localStorage.setItem(
      "productos-en-carrito",
      JSON.stringify(productosEnCarrito)
    );
    cargarProductosCarrito();
    Toastify({
      text: "Juego eliminado",
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: "linear-gradient(to right, #4b33a8, #785ce9)",
        borderRadius: "2rem",
        textTransform: "uppercase",
        fontSize: ".75rem",
      },
    }).showToast();
  }
}

botonVaciar.addEventListener("click", vaciarCarrito);
function vaciarCarrito() {
  Swal.fire({
    title: "¿Estás seguro?",
    icon: "question",
    html: `Se van a borrar ${productosEnCarrito.reduce(
      (acc, producto) => acc + producto.cantidad,
      0
    )} juegos.`,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: "Sí",
    cancelButtonText: "No",
  }).then((result) => {
    if (result.isConfirmed) {
      productosEnCarrito.length = 0;
      localStorage.setItem(
        "productos-en-carrito",
        JSON.stringify(productosEnCarrito)
      );
      cargarProductosCarrito();
    }
  });
}

botonComprar.addEventListener("click", comprarCarrito);
function comprarCarrito() {
  productosEnCarrito.length = 0;
  localStorage.setItem(
    "productos-en-carrito",
    JSON.stringify(productosEnCarrito)
  );
  cargarProductosCarrito();
  Toastify({
    text: "Gracias por tu compra",
    duration: 3000,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: {
      background: "linear-gradient(to right, #4b33a8, #785ce9)",
      borderRadius: "2rem",
      textTransform: "uppercase",
      fontSize: ".75rem",
    },
  }).showToast();
}

function actualizarTotal() {
  const totalCalculado = productosEnCarrito.reduce(
    (acc, producto) => acc + producto.precio * producto.cantidad,
    0
  );
  total.innerText = `$${totalCalculado}`;
}

function actualizarMensaje(event) {
  // Evitar que se abra la página por defecto
  event.preventDefault();

  // Obtener los títulos de los videojuegos en el carrito
  const carrito =
    JSON.parse(localStorage.getItem("productos-en-carrito")) || [];
  const titulos = carrito.map((producto) => producto.titulo);

  // Crear el mensaje con los títulos de los videojuegos
  const mensaje = encodeURIComponent(
    `Hola, te envío el comprobante de la consignación para los siguientes videojuegos: ${titulos.join(
      ", "
    )}`
  );

  // Actualizar el href del enlace del botón de WhatsApp con el mensaje generado
  document.getElementById(
    "whatsapp-link"
  ).href = `https://api.whatsapp.com/send?phone=573042672810&text=${mensaje}`;

  // Seguir con el enlace después de actualizar el href
  window.location = document.getElementById("whatsapp-link").href;
}
