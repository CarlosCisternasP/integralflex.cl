const { Client } = require('pg');
const crypto = require('crypto');

function normalizarRut(rut) {
  return rut.replace(/\./g, '').replace(/\s+/g, '').trim().toUpperCase();
}

function verifyScryptPassword(password, storedHash) {
  try {
    // Formato esperado:
    // scrypt:32768:8:1$SALT$HASHHEX
    const [methodPart, salt, hashHex] = storedHash.split('$');

    if (!methodPart || !salt || !hashHex) {
      return false;
    }

    const [algorithm, N, r, p] = methodPart.split(':');

    if (algorithm !== 'scrypt') {
      return false;
    }

    const cost = parseInt(N, 10);
    const blockSize = parseInt(r, 10);
    const parallelization = parseInt(p, 10);

    const derivedKey = crypto.scryptSync(password, salt, 64, {
      N: cost,
      r: blockSize,
      p: parallelization
    });

    const derivedHex = derivedKey.toString('hex');

    const a = Buffer.from(derivedHex, 'hex');
    const b = Buffer.from(hashHex, 'hex');

    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  } catch (error) {
    return false;
  }
}

exports.handler = async (event) => {
  let client;

  try {
    const { rut, password } = JSON.parse(event.body || '{}');

    if (!rut || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: 'Debe ingresar RUT y contraseña'
        })
      };
    }

    const rutNormalizado = normalizarRut(rut);

    client = new Client({
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
        empresa_id,
        password_hash
      FROM public.usuarios
      WHERE REPLACE(UPPER(rut), '.', '') = $1
        AND activo = true
      LIMIT 1
      `,
      [rutNormalizado]
    );

    if (result.rows.length === 0) {
      await client.end();
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message: 'Usuario no encontrado'
        })
      };
    }

    const user = result.rows[0];

    const passwordOk = verifyScryptPassword(password, user.password_hash);

    if (!passwordOk) {
      await client.end();
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message: 'Credenciales incorrectas'
        })
      };
    }

    delete user.password_hash;

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        user
      })
    };

  } catch (error) {
    if (client) {
      try {
        await client.end();
      } catch (_) {}
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: error.message
      })
    };
  }
};
