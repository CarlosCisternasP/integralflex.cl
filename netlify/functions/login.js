const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Método no permitido' })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'JSON inválido' })
    };
  }

  const { rut, password } = payload;
  if (!rut || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, message: 'RUT y contraseña son obligatorios' })
    };
  }

  const client = new Client({
    host: process.env.DB_HOST || '4.186.27.1',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'logindb',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'S0p0rt3.sql',
    ssl: false
  });

  try {
    await client.connect();
    const result = await client.query(
      `SELECT id, rut, nombre, apellido, email, rol, activo, empresa_id
       FROM public.usuarios
       WHERE rut = $1 AND password_hash = $2 AND activo = true
       LIMIT 1`,
      [rut, password]
    );
    await client.end();

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ success: false, message: 'Credenciales incorrectas' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, user: result.rows[0] })
    };
  } catch (error) {
    try { await client.end(); } catch {}
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: error.message })
    };
  }
};
