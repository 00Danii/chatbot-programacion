# Chatbot — Experto en Programación (Astro)

Este proyecto es una interfaz web ligera construida con Astro que actúa como cliente para un chatbot experto en programación. La UI imita una terminal estilo "neón" y envía las solicitudes al endpoint de servidor `/api/query`, que reenvía la petición a la API de Hugging Face (o cualquier otra compatible) usando una clave segura en el servidor.

## Características principales
- Interfaz tipo terminal (neón) con mensajes de usuario y respuestas del asistente.
- Formato Markdown seguro: bloques de código, inline code, enlaces, negritas y saltos de línea.
- El cliente envía un único objeto `message` al endpoint local; el servidor lo transforma y lo reenvía a Hugging Face.
- Estilos CRT opcionales (scanlines, flicker) y scrolled messages.

## Estructura relevante
- `src/pages/index.astro`: UI del chat (cliente). Contiene el área de mensajes, textarea y lógica para POST a `/api/query`.
- `src/pages/api/query.ts`: endpoint server-side que valida el cuerpo, añade la cabecera `Authorization: Bearer ${process.env.HF_TOKEN}` y reenvía a `https://router.huggingface.co/v1/chat/completions`.

## Requisitos
- Node.js (v16+ recomendado)
- Una clave válida de Hugging Face (o el servicio que uses) si quieres llamar al modelo remoto.

## Cómo ejecutar en desarrollo (PowerShell)
```powershell
npm install
# exporta temporalmente tu token HF en la sesión
$env:HF_TOKEN = 'hf_tu_token_aqui'
npm run dev
```

La UI estará disponible en `http://localhost:4321/` (según la salida de Astro). Para probar la API directamente puedes usar PowerShell/curl:
```powershell
$env:HF_TOKEN='hf_tu_token_aqui'
curl -Method POST -Uri http://localhost:4321/api/query -Headers @{ 'Content-Type' = 'application/json' } -Body (ConvertTo-Json @{ messages = @( @{ role='user'; content='Hola' } ); model='Qwen/Qwen3-Coder-30B-A3B-Instruct:nebius' })
```

## API y formato esperado
- Cliente -> servidor (`/api/query`): JSON con `message` (objeto) o `messages` (array). Ejemplo aceptado desde el cliente:
```json
{ "message": { "role": "user", "content": "What is the capital of France?" }, "model": "Qwen/Qwen3-Coder-30B-A3B-Instruct:nebius" }
```
- El servidor normaliza a `{ messages: [...] , model: '...' }` y lo reenvía a Hugging Face.

