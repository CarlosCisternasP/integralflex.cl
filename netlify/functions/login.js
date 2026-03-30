const { Client } = require('pg');
const crypto = require('crypto');

function normalizarRut(rut) {
  return rut
    .replace(/\./g, '')
    .replace(/\s+/g, '')
    .trim()
    .toUpperCase();
}

function sha256(texto) {
  return crypto.createHash('sha256').update(texto).digest('hex');
}

exports.handler = async (event) => {
  try {
    const { rut, password } = JSON.parse(event.body || '{}');

    if (!rut || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Faltan credenciales'
        })
      };
    }

    const rutNormalizado = normalizarRut(rut);
    const passwordHash = sha256(password);

    const client = new Client({
      host: "4.186.27.1",
      port: 5432,
      database: "logindb",
      user: "admin",
      password: "S0p0rt3.sql",
      ssl: false
    });

    await client.connect();

    const result = await client.query(
      `
      SELECT 
        id,
        rut,
        nombre,
        apellido,
        email,
        rol,
        activo,
        empresa_id
      FROM public.usuarios
      WHERE REPLACE(UPPER(rut), '.', '') = $1
        AND password_hash = $2
        AND activo = true
      LIMIT 1
      `,
      [rutNormalizado, passwordHash]
    );

    await client.end();

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message: 'Credenciales incorrectas'
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user: result.rows[0]
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error.message
      })
    };
  }
};
