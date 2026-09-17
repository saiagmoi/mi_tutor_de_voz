// ==========================================================
// 1. Elementos del DOM y Selectores
// ==========================================================
const htmlEl = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const openKeyModalBtn = document.getElementById('openKeyModalBtn');
const keyLabel = document.getElementById('keyLabel');
const keyModal = document.getElementById('keyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

const assistantBubble = document.getElementById('assistantBubble');
const bubbleStage = document.querySelector('.bubble-stage');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const assistantTitle = document.getElementById('assistantTitle');
const assistantSubtitle = document.getElementById('assistantSubtitle');
const connectBtn = document.getElementById('connectBtn');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');
const voiceBar = document.getElementById('voiceBar');
const remoteAudio = document.getElementById('remoteAudio');
const errorBanner = document.getElementById('errorBanner');
const errorMessage = document.getElementById('errorMessage');

// Constantes y Estado de la Aplicación
const STORAGE_KEY = 'openai_api_key';
const STORAGE_THEME = 'tutor_theme_preference';

let isConnected = false;
let peerConnection = null;
let dataChannel = null;
let localMediaStream = null;

// ==========================================================
// 2. Gestión de Temas: Modo Oscuro y Modo Claro
// ==========================================================
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_THEME);
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    // Detectar preferencia del sistema operativo
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }
}

function applyTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_THEME, theme);
  themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
});

// ==========================================================
// 3. Gestión de la OpenAI API Key
// ==========================================================
function initApiKey() {
  const savedKey = localStorage.getItem(STORAGE_KEY);
  if (savedKey) {
    updateKeyDisplay(savedKey);
  } else {
    // Abrir automáticamente el modal en la primera visita
    showModal();
  }
}

function updateKeyDisplay(key) {
  if (key) {
    const masked = key.slice(0, 6) + '...' + key.slice(-3);
    keyLabel.textContent = masked;
    openKeyModalBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
  } else {
    keyLabel.textContent = 'API Key';
    openKeyModalBtn.style.borderColor = '';
  }
}

function showModal() {
  apiKeyInput.value = localStorage.getItem(STORAGE_KEY) || '';
  keyModal.classList.remove('hidden');
  apiKeyInput.focus();
}

function hideModal() {
  keyModal.classList.add('hidden');
}

openKeyModalBtn.addEventListener('click', showModal);
closeModalBtn.addEventListener('click', () => {
  if (localStorage.getItem(STORAGE_KEY)) {
    hideModal();
  }
});

toggleKeyVisibility.addEventListener('click', () => {
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleKeyVisibility.textContent = '🙈';
  } else {
    apiKeyInput.type = 'password';
    toggleKeyVisibility.textContent = '👁️';
  }
});

saveKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    alert('Por favor ingresá tu OpenAI API Key.');
    return;
  }
  if (!key.startsWith('sk-')) {
    alert('La API Key debe comenzar con "sk-".');
    return;
  }
  localStorage.setItem(STORAGE_KEY, key);
  updateKeyDisplay(key);
  hideModal();
  hideError();
});

keyModal.addEventListener('click', (e) => {
  if (e.target === keyModal && localStorage.getItem(STORAGE_KEY)) {
    hideModal();
  }
});

// ==========================================================
// 4. Estados Visuales y Animaciones de la Burbuja
// ==========================================================
function setUIState(state, customMessage) {
  // Limpiar clases de estado
  statusDot.className = 'status-indicator-dot';
  assistantBubble.className = 'glowing-bubble';
  bubbleStage.className = 'bubble-stage';

  switch (state) {
    case 'disconnected':
      statusText.textContent = 'Listo para conversar';
      assistantTitle.textContent = 'Tu tutor personal de inglés';
      assistantSubtitle.textContent = 'Practicá hablando con naturalidad. Alex te escuchará y responderá con voz humana al instante.';
      btnIcon.textContent = '▶';
      btnText.textContent = 'Comenzar Conversación';
      connectBtn.className = 'main-action-btn';
      connectBtn.disabled = false;
      voiceBar.classList.remove('active');
      isConnected = false;
      break;

    case 'connecting':
      statusDot.classList.add('connecting');
      assistantBubble.classList.add('connecting');
      statusText.textContent = customMessage || 'Conectando con Alex...';
      assistantTitle.textContent = 'Conectando llamada...';
      assistantSubtitle.textContent = 'Estableciendo canal de audio seguro con OpenAI.';
      btnIcon.textContent = '⏳';
      btnText.textContent = 'Conectando...';
      connectBtn.disabled = true;
      voiceBar.classList.remove('active');
      break;

    case 'listening':
      statusDot.classList.add('listening');
      assistantBubble.classList.add('listening');
      bubbleStage.classList.add('listening');
      statusText.textContent = 'Te estoy escuchando...';
      assistantTitle.textContent = 'Tu turno de hablar';
      assistantSubtitle.textContent = 'Hablale a Alex como a un amigo. No te preocupes por equivocarte.';
      btnIcon.textContent = '⏹';
      btnText.textContent = 'Finalizar Llamada';
      connectBtn.className = 'main-action-btn btn-active';
      connectBtn.disabled = false;
      voiceBar.classList.add('active');
      isConnected = true;
      break;

    case 'speaking':
      statusDot.classList.add('speaking');
      assistantBubble.classList.add('speaking');
      bubbleStage.classList.add('speaking');
      statusText.textContent = 'Alex está hablando...';
      assistantTitle.textContent = 'Alex está respondiendo';
      assistantSubtitle.textContent = 'Escuchá la pronunciación y su respuesta con atención.';
      btnIcon.textContent = '⏹';
      btnText.textContent = 'Finalizar Llamada';
      connectBtn.className = 'main-action-btn btn-active';
      connectBtn.disabled = false;
      voiceBar.classList.add('active');
      isConnected = true;
      break;
  }
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorBanner.classList.remove('hidden');
}

function hideError() {
  errorBanner.classList.add('hidden');
  errorMessage.textContent = '';
}

// ==========================================================
// 5. Conexión WebRTC con OpenAI Realtime API (GA)
// ==========================================================
async function startSession() {
  hideError();
  const apiKey = localStorage.getItem(STORAGE_KEY);

  if (!apiKey) {
    showModal();
    return;
  }

  try {
    setUIState('connecting', 'Solicitando credenciales efímeras...');

    // 1. Obtener Token Efímero desde nuestro backend
    const tokenRes = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey
      }
    });

    if (!tokenRes.ok) {
      const errJson = await tokenRes.json().catch(() => ({}));
      throw new Error(errJson.error || `Error del servidor (${tokenRes.status})`);
    }

    const tokenData = await tokenRes.json();
    const ephemeralToken = tokenData.client_secret?.value || tokenData.client_secret || tokenData.value;

    if (!ephemeralToken) {
      throw new Error('No se pudo extraer el token efímero de la sesión.');
    }

    setUIState('connecting', 'Activando micrófono...');

    // 2. Inicializar RTCPeerConnection
    peerConnection = new RTCPeerConnection();

    // Reproducir audio remoto
    peerConnection.ontrack = (event) => {
      remoteAudio.srcObject = event.streams[0];
    };

    // Capturar micrófono local
    localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localMediaStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localMediaStream);
    });

    // 3. Crear DataChannel para eventos del tutor
    dataChannel = peerConnection.createDataChannel('oai-events');

    dataChannel.addEventListener('open', () => {
      console.log('Canal de eventos WebRTC listo.');

      const tutorPrompt = `You are a friendly, patient, and engaging conversational English tutor named Alex.
Your mission is to help the student practice and gain confidence speaking natural English.
Guidelines:
- Speak clearly, naturally, and warmly in English.
- Keep your answers concise and conversational (1 to 3 sentences maximum) so the student gets plenty of talking time.
- If the student makes a grammar, vocabulary, or pronunciation mistake, gently and warmly provide a brief correction or suggest a more natural way to say it, then seamlessly continue the conversation.
- If the student speaks in Spanish or hesitates, understand them kindly, provide the English expression, and encourage them to repeat it.
- Be supportive, enthusiastic, and ask engaging open-ended questions about their life, hobbies, work, or interests.`;

      // Payload strictly minimalista conforme a OpenAI Realtime GA
      const sessionUpdate = {
        type: 'session.update',
        session: {
          type: 'realtime',
          instructions: tutorPrompt
        }
      };

      dataChannel.send(JSON.stringify(sessionUpdate));
      console.log('Evento session.update enviado exitosamente.');
    });

    // Animar la burbuja según los eventos en tiempo real
    dataChannel.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'response.audio.delta') {
          setUIState('speaking');
        } else if (msg.type === 'response.done') {
          setUIState('listening');
        } else if (msg.type === 'input_audio_buffer.speech_started') {
          setUIState('listening');
        }
      } catch (e) {
        // Ignorar mensajes no JSON
      }
    });

    // 4. Oferta WebRTC y Handshake con OpenAI en /v1/realtime/calls
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      body: offer.sdp,
      headers: {
        'Authorization': `Bearer ${ephemeralToken}`,
        'Content-Type': 'application/sdp'
      }
    });

    if (!sdpResponse.ok) {
      const errDetail = await sdpResponse.text();
      throw new Error(`Fallo en el handshake WebRTC (${sdpResponse.status}): ${errDetail}`);
    }

    const answerSdp = await sdpResponse.text();
    const answer = {
      type: 'answer',
      sdp: answerSdp
    };

    await peerConnection.setRemoteDescription(answer);

    // Conectado con éxito
    setUIState('listening');

  } catch (error) {
    console.error('Error durante la sesión:', error);
    showError(error.message || 'Error desconocido al conectar.');
    stopSession();
  }
}

// ==========================================================
// 6. Detener Sesión y Limpiar Recursos
// ==========================================================
function stopSession() {
  if (localMediaStream) {
    localMediaStream.getTracks().forEach((track) => track.stop());
    localMediaStream = null;
  }

  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }

  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  setUIState('disconnected');
}

// Botón de acción y clic directo sobre la burbuja
connectBtn.addEventListener('click', () => {
  if (isConnected) {
    stopSession();
  } else {
    startSession();
  }
});

assistantBubble.addEventListener('click', () => {
  if (isConnected) {
    stopSession();
  } else {
    startSession();
  }
});

// Inicialización general
initTheme();
initApiKey();
