# Tutor de Inglés Conversacional con Voz 🎙️

Aplicación web interactiva que permite a estudiantes practicar inglés hablado en tiempo real mediante la **API Realtime de OpenAI (versión GA)** usando **WebRTC** para una experiencia fluida, instantánea y de bajísima latencia.

Diseñado especialmente para personas sin conocimientos técnicos: **¡sin necesidad de tocar la terminal!**

---

## 🚀 Cómo Iniciar en macOS (con 1 solo clic)

1. En el **Finder**, ve a la carpeta del proyecto.
2. Haz **doble clic sobre el archivo `INICIAR_MAC.command`** (o `INICIAR.command`).
3. El lanzador detectará el entorno, levantará el servidor local automáticamente y abrirá `http://localhost:3000` directamente en **Safari**.
   *(No necesitas instalar Node.js ni configurar nada: si tu Mac no tiene Node, utiliza automáticamente el motor nativo de macOS).*

---

## ☁️ Despliegue en Vercel

Puedes desplegar este proyecto directamente en **Vercel**:
1. Conecta tu repositorio de GitHub a Vercel.
2. Agrega la variable de entorno en Vercel:
   - `OPENAI_API_KEY`: tu clave de API de OpenAI (`sk-...`).
3. ¡Listo! Vercel servirá la aplicación web y ejecutará la función serverless en `/api/session` sin necesidad de ingresar la clave en cada navegador.

---

## 💻 Cómo Iniciar en Windows

1. Haz **doble clic en el archivo `INICIAR.bat`**.
2. Instalará dependencias automáticamente y abrirá el navegador.

---

## 📖 Cómo Usar el Tutor

1. Al abrir la página por primera vez, te pedirá tu **OpenAI API Key** (`sk-...`) si no está configurada en las variables de entorno de Vercel.
2. Haz clic en **"Guardar y Continuar"** (se guarda de forma segura en tu propio navegador).
3. Presiona el botón **"Comenzar Conversación"** y autoriza los permisos de micrófono si tu navegador los solicita.
4. ¡Listo! Ya puedes hablar en inglés de forma natural con Alex.

---

## 🛠️ Arquitectura Técnica

```
├── api/
│   └── session.js       # Serverless function para Vercel (/api/session)
├── vercel.json          # Configuración de rutas y rewrites para Vercel
├── INICIAR_MAC.command  # Lanzador automático con doble clic para Mac (abre Safari)
├── INICIAR.command      # Lanzador compatible para Mac / Linux (abre Safari)
├── INICIAR.bat          # Lanzador automático con doble clic para Windows
├── server.py            # Servidor nativo con zero-dependencias para macOS
├── server.js            # Servidor Node.js / Express
├── package.json         # Configuración del paquete Node.js
├── GEMINI.md            # Reglas permanentes del repositorio y Git
└── public/
    ├── index.html       # Interfaz visual de usuario
    ├── style.css        # Animación del micrófono y estilos modernos
    └── app.js           # Lógica WebRTC, handshake contra /v1/realtime/calls y session.update
```
