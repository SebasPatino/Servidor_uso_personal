# Informe Técnico de Cambios — Servidor localhost:3000
**Proyecto:** servidor_parejas_dom  
**Autores:** Karol Nicolle Torres Fuentes | Juan Sebastián Patiño Hernández  
**Institución:** SENA — Técnico en Programación de Software  
**Fecha:** Marzo 2026  
**Versión:** 2.0

---

## 2. Creación de `server.js`

El archivo `server.js` fue **creado desde cero**. Su función es envolver json-server con Express para:

1. Exponer las rutas con prefijo `/api` que requieren los módulos nuevos (`usuariosApi.js`, `adminPanel.js`, `buscarUsuario.js`).
2. Mantener compatibilidad con las rutas sin prefijo que usa `tareasApi.js` (`/users`, `/tasks`).

### Rutas habilitadas

| Método | Ruta | Descripción | Usado por |
|--------|------|-------------|-----------|
| GET | `/api/users` | Lista de usuarios | `usuariosApi.js`, `buscarUsuario.js` |
| POST | `/api/users` | Crear usuario | `usuariosApi.js` |
| DELETE | `/api/users/:id` | Eliminar usuario | `usuariosApi.js` |
| GET | `/api/tasks` | Lista de tareas | `adminPanel.js`, `buscarUsuario.js` |
| POST | `/api/tasks` | Crear tarea | `tareasApi.js` |
| PATCH | `/api/tasks/:id` | Actualizar tarea | `tareasApi.js` |
| DELETE | `/api/tasks/:id` | Eliminar tarea | `tareasApi.js` |
| GET | `/users` | Lista de usuarios sin prefijo | `tareasApi.js` |
| GET/POST | `/tasks` | Tareas sin prefijo | `tareasApi.js` |

### Configuración CORS

Se configuró middleware CORS manual para permitir peticiones desde `localhost:5173` (Vite) hacia `localhost:3000` (Express), incluyendo soporte para preflight `OPTIONS`:

```js
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});
```

### Montaje del router

El router de json-server se monta **dos veces** de forma intencional:

```js
app.use('/api', router);  // para módulos nuevos (usuariosApi.js, adminPanel.js)
app.use('/', router);     // para compatibilidad con tareasApi.js
```

---

## 3. Actualización de `server.json`

Se agregó el campo `documento` a cada usuario. Este campo es fundamental para el funcionamiento del sistema:

- `tareasApi.js` filtra usuarios comparando `u.documento.toString() === documentoId.toString()`
- `tareasService.js` guarda `usuarioActual.documento` en el campo `userId` de cada tarea nueva
- `filtros.js` compara `tarea.userId` con el texto que escribe el usuario en el input de búsqueda (no se realizó el cambio, no es obligatorio)

**Estructura anterior:**
```json
{ "id": 1, "name": "Karol Torres", "email": "karoln.oficiall@gmail.com" }
```

**Estructura actualizada:**
```json
{ "id": 1, "documento": "1097497124", "name": "Karol Torres", "email": "karoln.oficiall@gmail.com" }
```

Se registraron **10 usuarios** en total. El array `tasks` se dejó vacío para evitar inconsistencias con tareas viejas que tenían el id interno en `userId` en lugar del número de documento.

---

## 4. Resolución del Conflicto de Versiones de json-server

Al intentar iniciar el servidor se detectó un error de compatibilidad. El `package.json` tenía instalada `json-server 1.0.0-beta.12`, que cambió completamente su API y ya no es compatible con `require('json-server')`.

### Solución aplicada

```bash
npm uninstall json-server
npm install json-server@0.17.4 --save
npm start
```

### Verificar la versión instalada

```bash
cat node_modules/json-server/package.json | grep '"version"' | head -1
# Debe mostrar: "version": "0.17.4"
```

### ¿Por qué 0.17.4 y no la más nueva?

| Versión | Estado | Compatibilidad |
|---------|--------|----------------|
| `0.17.4` | Estable ✅ | `require('json-server')` + Express router |
| `1.0.0-beta.12` | Beta ⚠️ | API completamente diferente, incompatible |

La versión `1.x` es una beta que migró a ESModules y cambió su API. Para un proyecto de desarrollo que usa CommonJS (`require`), la versión `0.17.4` es la elección correcta y la que usa el 99% de los tutoriales y proyectos existentes.

---

## 5. Actualización de `package.json`

```json
{
  "name": "servidor_parejas_dom",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "type": "commonjs",
  "dependencies": {
    "express": "^5.2.1",
    "json-server": "^0.17.4"
  }
}
```

---

## 6. Bugs Corregidos en el Servidor

| Bug | Causa | Solución |
|-----|-------|----------|
| Servidor no iniciaba | `json-server 1.0.0-beta.12` instalado, incompatible con `require()` | Desinstalar beta e instalar `json-server@0.17.4` |
| Router montado dos veces en `/api` | Bloque duplicado en una versión intermedia de `server.js` | Dejar una instancia en `/api` y otra en `/` |
| Usuarios sin campo `documento` | `server.json` no tenía el campo requerido por `tareasApi.js` | Agregar campo `documento` a los 10 usuarios |

---

## 7. Estructura Final del Servidor

```
servidor_parejas_dom/
├── server.js        ← creado
├── server.json      ← actualizado (campo documento agregado)
└── package.json     ← actualizado (json-server@0.17.4)
```

---

## 8. Cómo Iniciar el Servidor

```bash
cd servidor_parejas_dom
npm start
```

**Salida esperada en consola:**
```
✅ Servidor corriendo en http://localhost:3000
📋 Usuarios  → http://localhost:3000/api/users
📋 Tareas    → http://localhost:3000/api/tasks
```

> El frontend (Vite) debe iniciarse en una terminal separada con `npm run dev` desde la carpeta `transferencia_dom`.

---
