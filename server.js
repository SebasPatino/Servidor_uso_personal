// server.js
// Servidor de desarrollo que envuelve json-server con el prefijo /api
// para que las rutas coincidan con lo que espera el frontend nuevo.
//
// Rutas disponibles:
//   GET    /api/users           → todos los usuarios
//   GET    /api/users?documento=XXX → filtrar por documento
//   POST   /api/users           → crear usuario
//   DELETE /api/users/:id       → eliminar usuario
//   GET    /api/tasks           → todas las tareas
//   POST   /api/tasks           → crear tarea
//   PATCH  /api/tasks/:id       → actualizar tarea
//   DELETE /api/tasks/:id       → eliminar tarea

const express    = require('express');
const jsonServer = require('json-server');
const path       = require('path');

// ─── CONFIGURACIÓN BASE ───────────────────────────────────────────────────────

const app      = express();
const router   = jsonServer.router(path.join(__dirname, 'server.json'));
const middlewares = jsonServer.defaults();

// Puerto donde corre el servidor — coincide con API_BASE_URL del proyecto
const PUERTO = 3000;

// ─── CORS ─────────────────────────────────────────────────────────────────────

// Permite que el frontend en localhost:5173 (Vite) pueda hacer peticiones
// al servidor en localhost:3000 sin que el navegador las bloquee
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    // Las peticiones OPTIONS son preflight del navegador — las respondemos directo
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ─── MIDDLEWARES DE JSON-SERVER ───────────────────────────────────────────────

// middlewares incluye: logger, static, cors y bodyParser de json-server
app.use(middlewares);

// ─── RUTAS CON PREFIJO /api ───────────────────────────────────────────────────

// Montamos el router bajo /api para los módulos nuevos (usuariosApi.js, adminPanel.js)
// que usan /api/users y /api/tasks
app.use('/api', router);

// También respondemos en la raíz / para mantener compatibilidad con tareasApi.js
// que hace fetch a /users y /tasks directamente (sin prefijo)
app.use('/', router);

// ─── INICIO DEL SERVIDOR ──────────────────────────────────────────────────────

app.listen(PUERTO, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PUERTO}`);
    console.log(`📋 Usuarios  → http://localhost:${PUERTO}/api/users`);
    console.log(`📋 Tareas    → http://localhost:${PUERTO}/api/tasks`);
});