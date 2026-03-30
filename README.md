# IntegralFlex Platform

Proyecto listo para subir a GitHub y desplegar en Netlify.

## Estructura
- `/login` acceso a la plataforma
- `/dashboard` panel base de módulos
- `/netlify/functions/login.js` autenticación PostgreSQL

## Variables recomendadas en Netlify
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

## Base configurada
- Host: `4.186.27.1`
- Base: `logindb`
- Schema: `public`
- Tabla: `usuarios`
