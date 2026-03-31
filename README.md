# IntegralFlex Platform Backend

Incluye:
- sitio comercial Flask como página principal
- login separado en `/login`
- dashboard en `/app`
- autenticación central con PostgreSQL
- SSO por JWT para LogisDesk, CertiDesk y CentralDesk
- ejemplos de endpoints `/sso/login` para módulos

## Instalar
```bash
pip install -r requirements.txt
cp .env.example .env
```

## Ejecutar
```bash
python portal_app/app.py
```

## URLs
- `/` sitio comercial
- `/login` acceso
- `/app` dashboard

## Nota
Para LogisDesk, CertiDesk y CentralDesk debes integrar el ejemplo de SSO en sus apps Flask reales.
