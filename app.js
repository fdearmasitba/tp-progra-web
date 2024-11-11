let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const productos = [
    { id: 1, nombre: 'Smart TV 55"', precio: 950000, imagen: 'https://images.fravega.com/f1000/799a8ceaf934954792eea028e9b44cfd.jpg' },
    { id: 2, nombre: 'Laptop Gaming', precio: 1299999, imagen: 'https://www.asus.com/media/Odin/Websites/global/ProductLine/20200824120814.jpg' },
    { id: 3, nombre: 'Smartphone Pro', precio: 799999, imagen: 'https://arbghprod.vtexassets.com/arquivos/ids/163692-800-auto?v=638665015682900000&width=800&height=auto&aspect=true' },
    { id: 4, nombre: 'Heladera Smart Inverter', precio: 1499999, imagen: 'https://microsites-production-latam.s3.amazonaws.com/uploads/1685628243-GT57BPSX__1_.jpg' },
    { id: 5, nombre: 'Lavarropas Automático', precio: 899999, imagen: 'https://static.hendel.com/media/catalog/product/cache/0c3e9ac8430b5a3e77d1544ae1698a10/3/4/34423.jpg' },
    { id: 6, nombre: 'Microondas Digital', precio: 299999, imagen: 'https://arbghprod.vtexassets.com/arquivos/ids/161869/IMG_0345.jpg?v=638001574028570000' },
    { id: 7, nombre: 'Aspiradora Robot', precio: 599999, imagen: 'https://www.zonamovilidad.es/fotos/2/8LTHs-W0.jpeg' }
];

function animarAgregarCarrito(button) {
    button.classList.add('agregar-animacion');
    setTimeout(() => {
        button.classList.remove('agregar-animacion');
    }, 500);
}

function agregarAlCarrito(id, button) {
    const producto = productos.find(p => p.id === id);
    const cantidad = prompt("¿Cuántas unidades deseas agregar?", "1");
    const cantidadNumerica = parseInt(cantidad);

    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }

   
    const productoEnCarrito = carrito.find(item => item.id === id);
    if (productoEnCarrito) {
        
        productoEnCarrito.cantidad += cantidadNumerica;
    } else {
        
        carrito.push({ ...producto, cantidad: cantidadNumerica });
    }

    actualizarCarrito();
    guardarCarrito();
    animarAgregarCarrito(button);
    abrirCarrito();
    actualizarCantidadCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    actualizarCantidadCarrito(); 
    guardarCarrito();
}

function verificarEnvioGratis() {
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const faltante = 1000000 - total;
    
    if (total >= 1000000) {
        return { 
            esGratis: true, 
            mensaje: "¡Felicitaciones! Tenés envío gratis" 
        };
    } else {
        return { 
            esGratis: false, 
            mensaje: `Te faltan $${faltante.toLocaleString()} para tener envío gratis` 
        };
    }
}

async function enviarEmailConfirmacion(email, detallesCompra) {
    try {
        const response = await fetch('https://formsubmit.co/ajax/dearmasfeli@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                _subject: "Confirmación de compra - Teccnommax",
                message: `
                    ¡Gracias por tu compra!
                    
                    Detalles de tu pedido:
                    ${detallesCompra.items.map(item => `
                    - ${item.nombre} (Cantidad: ${item.cantidad}): $${(item.precio * item.cantidad).toLocaleString()}`).join('\n')}
                    
                    Costo de Envío: $${detallesCompra.costoEnvio.toLocaleString()}
                    Total: $${detallesCompra.total.toLocaleString()}
                    
                    Te contactaremos pronto con más detalles sobre tu envío.
                    
                    Saludos,
                    Equipo Teccnommax
                `
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Error al enviar email:', error);
        return false;
    }
}

function mostrarDetalleProducto(id) {
    const producto = productos.find(p => p.id === id);
    document.getElementById('detalle-modal').innerHTML = `
        <div class="modal-content">
            <button class="cerrar-modal" onclick="cerrarModal('detalle-modal')">✕</button>
            <div class="detalle-producto">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h2>${producto.nombre}</h2>
                <p class="precio">$${producto.precio.toLocaleString()}</p>
                <button class="agregar-carrito" onclick="agregarAlCarrito(${producto.id}, this)">
                    Agregar al carrito
                </button>
            </div>
        </div>
    `;
    document.getElementById('detalle-modal').style.display = 'block';
}

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function actualizarCarrito() {
    const carritoItems = document.getElementById('carrito-items');
    const carritoTotal = document.getElementById('carrito-total');
    const envioInfo = document.getElementById('costo-envio'); 
    carritoItems.innerHTML = ''; 

    if (carrito.length === 0) {
        carritoTotal.innerHTML = `<p>No hay productos en el carrito.</p>`;
        envioInfo.innerHTML = ''; 
        return;
    }

    let total = 0;

    carrito.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('carrito-item');
        itemElement.innerHTML = `
            <span>${item.nombre}</span>
            <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" onchange="actualizarCantidad(${index}, this.value)">
            <span>$${(item.precio * item.cantidad).toLocaleString()}</span>
            <div class="carrito-item-derecha">
                <button class="eliminar-item" onclick="eliminarDelCarrito(${index})">Eliminar</button>
            </div>
        `;
        carritoItems.appendChild(itemElement);
        total += item.precio * item.cantidad; 
    });

    const costoEnvio = verificarEnvioGratis().esGratis ? 0 : 10000; 
    carritoTotal.innerHTML = `
        <p>Costo de Envío: $${costoEnvio.toLocaleString()}</p>
        <p>Total: $${(total + costoEnvio).toLocaleString()}</p>
    `;

    
    const faltante = 1000000 - total;
    if (faltante > 0) {
        envioInfo.innerHTML = `<p>Te faltan $${faltante.toLocaleString()} para tener envío gratis.</p>`;
    } else {
        envioInfo.innerHTML = `<p>¡Felicitaciones! Tenés envío gratis.</p>`;
    }
}


function actualizarCantidadCarrito() {
    const carritoCantidad = document.getElementById('carrito-cantidad');
    carritoCantidad.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
}


setTimeout(() => {
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
}, 3600000); 

function actualizarCantidad(index, nuevaCantidad) {
    const cantidadNumerica = parseInt(nuevaCantidad);
    if (isNaN(cantidadNumerica) || cantidadNumerica <= 0) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }
    carrito[index].cantidad = cantidadNumerica; 
    actualizarCarrito(); 
    guardarCarrito(); 
}

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

function cambiarTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

function abrirCarrito() {
    document.getElementById('carrito-modal').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarCarrito();
    actualizarCantidadCarrito(); // Inicializa la cantidad del carrito

    document.getElementById('checkout-form-pago').addEventListener('input', (e) => {
        if (e.target.id === 'nombre-tarjeta') {
            e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
        }
        if (['numero-tarjeta', 'cvv-tarjeta', 'identificacion'].includes(e.target.id)) {
            e.target.value = e.target.value.replace(/\D/g, '');
        }
        if (e.target.id === 'fecha-tarjeta') {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0,2) + '/' + value.slice(2);
            }
            e.target.value = value;
        }
    });

    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            cambiarTab(e.target.dataset.tab);
        });
    });

    document.querySelectorAll('.producto').forEach(producto => {
        producto.addEventListener('click', (e) => {
            if (!e.target.classList.contains('agregar-carrito')) {
                const id = parseInt(producto.dataset.id);
                mostrarDetalleProducto(id);
            }
        });
    });

    document.querySelectorAll('.agregar-carrito').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(e.target.closest('.producto').dataset.id);
            agregarAlCarrito(id, e.target);
        });
    });

    const carritoModal = document.getElementById('carrito-modal');
    document.getElementById('carrito-btn').addEventListener('click', abrirCarrito);

    document.querySelectorAll('.cerrar-modal').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    document.getElementById('seguir-comprando').addEventListener('click', () => {
        cerrarModal('carrito-modal');
        cambiarTab('tienda');
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (carrito.length === 0) {
            alert("No hay productos en el carrito. Agrega productos antes de continuar.");
            return; 
        }
        cerrarModal('carrito-modal');
        document.getElementById('checkout-modal').style.display = 'block';
        document.getElementById('paso-pago').style.display = 'block';
        document.getElementById('paso-envio').style.display = 'none';
    });

    document.getElementById('checkout-form-pago').addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('paso-pago').style.display = 'none';
        document.getElementById('paso-envio').style.display = 'block';
    });

    document.getElementById('checkout-form-envio').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const detallesCompra = {
            items: carrito,
            total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
            costoEnvio: verificarEnvioGratis().esGratis ? 0 : 10000
        };

        document.getElementById('checkout-modal').style.display = 'none';
        document.getElementById('confirmacion-modal').style.display = 'block';

        await enviarEmailConfirmacion(email, detallesCompra);

    
        setTimeout(() => {
            carrito = [];
            guardarCarrito();
            actualizarCarrito();
            actualizarCantidadCarrito(); 
            document.getElementById('confirmacion-modal').style.display = 'none';
            document.getElementById('paso-pago').style.display = 'block';
            document.getElementById('paso-envio').style.display = 'none';
            cambiarTab('tienda');
        }, 3000);
    });
});