// main.js

// Función para mostrar alertas bonitas
function mostrarMensaje(mensaje, tipo="info") {
    // tipo: info, success, error
    const div = document.createElement("div");
    div.textContent = mensaje;
    div.style.padding = "10px";
    div.style.marginTop = "10px";
    div.style.borderRadius = "5px";
    div.style.maxWidth = "400px";

    switch(tipo) {
        case "success":
            div.style.backgroundColor = "#2ecc71";
            div.style.color = "white";
            break;
        case "error":
            div.style.backgroundColor = "#e74c3c";
            div.style.color = "white";
            break;
        default:
            div.style.backgroundColor = "#3498db";
            div.style.color = "white";
    }

    document.body.prepend(div);

    // Desaparece después de 3 segundos
    setTimeout(() => div.remove(), 3000);
}

// Función para inicializar SQL.js y cargar la base de datos
async function cargarDB() {
    const SQL = await initSqlJs();
    const res = await fetch('db/residencial.db');
    const buf = await res.arrayBuffer();
    return new SQL.Database(new Uint8Array(buf));
}
