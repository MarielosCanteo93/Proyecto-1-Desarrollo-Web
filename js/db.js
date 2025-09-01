// db.js
let db;

async function initDB() {
  const SQL = await initSqlJs({
    locateFile: file => `./vendor/sqljs/${file}` // apunta a sql-wasm.wasm
  });

  // Cargar archivo .db exportado de DB Browser
  const response = await fetch("./data/residencial.db");
  const buffer = await response.arrayBuffer();
  db = new SQL.Database(new Uint8Array(buffer));

  console.log("Base de datos SQLite cargada desde archivo ✅");
  return db;
}

// SELECT genérico
function selectQuery(sql, params = []) {
  const stmt = db.prepare(sql, params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}
