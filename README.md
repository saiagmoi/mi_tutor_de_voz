# Tutor de Inglés Conversacional con Voz 🎙️

Aplicación web interactiva que permite a estudiantes practicar inglés hablado en tiempo real mediante la **API Realtime de OpenAI (versión GA)** usando **WebRTC** para una experiencia fluida, instantánea y de bajísima latencia.

Diseñado especialmente para personas sin conocimientos técnicos: **¡sin necesidad de tocar la terminal!**

---

## ✨ Características Principales

- **Conexión WebRTC de Alta Velocidad**: Audio bidireccional en tiempo real contra `https://api.openai.com/v1/realtime/calls`.
- **Tokens Efímeros de Seguridad**: El backend genera un `client_secret` temporal en `https://api.openai.com/v1/realtime/client_secrets` para que tu clave de API nunca quede expuesta públicamente.
- **Configuración Minimalista (API GA)**: Envío de `session.update` limpio y compatible, sin parámetros obsoletos.
- **Tutor Amigable y Paciente**: Configurado con un prompt pedagógico para incentivar la conversación fluida y corregir de manera constructiva.
- **Privacidad Local**: La clave API se almacena de forma segura únicamente en tu navegador (`localStorage`).
- **Lanzadores con 1 Clic**: Archivo `.bat` para Windows y `.command` para Mac.

---

## 🚀 Cómo Iniciar la Aplicación

### En Windows (con 1 solo clic):
1. Asegúrate de tener instalado [Node.js](https://nodejs.org) (versión 18 o superior).
2. Haz **doble clic en el archivo `INICIAR.bat`**.
3. El lanzador instalará las dependencias necesarias automáticamente, levantará el servidor en segundo plano y abrirá `http://localhost:3000` en tu navegador.

### En macOS:
1. Haz **doble clic en `INICIAR.command`** (o ejecuta `npm install && npm start`).
2. Se abrirá automáticamente tu navegador en `http://localhost:3000`.

---

## 📖 Cómo Usar el Tutor

1. Al abrir la página por primera vez, te pedirá tu **OpenAI API Key** (`sk-...`).
2. Haz clic en **"Guardar y Continuar"**.
3. Presiona el botón **"Comenzar a Hablar"** y autoriza los permisos de micrófono si tu navegador los solicita.
4. ¡Empieza a conversar en inglés con Alex!

---

## 🛠️ Arquitectura Técnica

```
├── server.js            # Servidor Node.js/Express (genera Token Efímero via header x-api-key)
├── package.json         # Dependencias del servidor (express)
├── INICIAR.bat          # Lanzador automático con 1 clic para Windows
├── INICIAR.command      # Lanzador automático con 1 clic para macOS
├── GEMINI.md            # Reglas permanentes del proyecto
└── public/
    ├── index.html       # Estructura de la aplicación web
    ├── style.css        # Estilos modernos y animación del micrófono
    └── app.js           # Lógica WebRTC, handshake y DataChannel session.update
```
