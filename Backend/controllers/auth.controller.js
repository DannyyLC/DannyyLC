// Importa el array de usuarios desde el archivo JSON (se carga una sola vez al iniciar)
const users = require('../models/users.json');

// Función controladora para manejar el login
exports.login = (req, res) => {
  // Extrae 'cuenta' y 'contrasena' del body de la petición (protección contra body undefined)
  const { cuenta } = req.body || {};
  // Acepta 'contraseña' o 'contrasena' (con/sin ñ) usando optional chaining
  const contrasena = req.body?.contrasena ?? req.body?.["contraseña"];

  // Valida que vengan ambos campos requeridos
  if (!cuenta || !contrasena) {
    // Responde 400 Bad Request si faltan datos
    return res.status(400).json({
      error: "Faltan campos obligatorios: 'cuenta' y 'contrasena'.",
      ejemplo: { cuenta: "daniel", contrasena: "5678" }
    });
  }

  // Busca un usuario que coincida exactamente con cuenta Y contraseña
  const match = users.find(u => u.cuenta === cuenta && u.contrasena === contrasena);

  // Si no encuentra coincidencia, credenciales incorrectas
  if (!match) {
    // Responde 401 Unauthorized
    return res.status(401).json({ error: "Credenciales inválidas." });
  }

  // Login exitoso
  return res.status(200).json({
    mensaje: "Acceso permitido",
    usuario: { cuenta: match.cuenta } // Devuelve solo la cuenta, NO la contraseña
  });
};