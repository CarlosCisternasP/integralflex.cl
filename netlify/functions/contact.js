// Función serverless de Netlify: recibe el formulario de contacto y envía el correo vía Resend.
// La API key vive aquí (lado servidor), nunca se expone al navegador.
// Recomendado: definir RESEND_API_KEY en Netlify (Site settings > Environment variables)
// y eliminar el valor de respaldo de este archivo.

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_XxjHpFxz_HucxTQEFfZCN79iCch6WpyBL";
const TO_EMAIL = "contacto@integralflex.cl";
const FROM_EMAIL = "IntegralFlex Web <contacto@integralflex.cl>"; // requiere dominio verificado en Resend

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido" }) };
  }

  const { nombre, empresa, email, telefono, producto, mensaje, website } = data;

  // Honeypot anti-spam: campo oculto que los humanos dejan vacío
  if (website) return { statusCode: 200, body: JSON.stringify({ ok: true }) };

  if (!nombre || !email || !mensaje) {
    return { statusCode: 400, body: JSON.stringify({ error: "Nombre, email y mensaje son obligatorios" }) };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Email inválido" }) };
  }

  const esc = (s) => String(s || "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

  const html = `
    <h2>Nuevo contacto desde integralflex.cl</h2>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><td><strong>Nombre</strong></td><td>${esc(nombre)}</td></tr>
      <tr><td><strong>Empresa</strong></td><td>${esc(empresa) || "-"}</td></tr>
      <tr><td><strong>Email</strong></td><td>${esc(email)}</td></tr>
      <tr><td><strong>Teléfono</strong></td><td>${esc(telefono) || "-"}</td></tr>
      <tr><td><strong>Producto de interés</strong></td><td>${esc(producto) || "-"}</td></tr>
    </table>
    <p style="font-family:sans-serif;font-size:14px"><strong>Mensaje:</strong><br>${esc(mensaje).replace(/\n/g, "<br>")}</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `[Web] ${producto ? producto + " - " : ""}${nombre}${empresa ? " (" + empresa + ")" : ""}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
      return { statusCode: 502, body: JSON.stringify({ error: "No se pudo enviar el correo. Intenta nuevamente." }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: "Error interno al enviar el correo" }) };
  }
};
