// Elementos del DOM
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const visualOrb = document.getElementById('visualOrb');
const connectBtn = document.getElementById('connectBtn');
const btnText = document.getElementById('btnText');
const keyIndicator = document.getElementById('keyIndicator');
const openKeyModalBtn = document.getElementById('openKeyModalBtn');
const keyModal = document.getElementById('keyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const remoteAudio = document.getElementById('remoteAudio');
const errorBanner = document.getElementById('errorBanner');
const errorMessage = document.getElementById('errorMessage');

// Variables de estado
let isConnected = false;
let peerConnection = null;
let dataChannel = null;
let localMediaStream = null;

// Clave en LocalStorage
const STORAGE_KEY = 'openai_api_key';

// 1. Inicialización de la API Key
function initApiKey() {
  const savedKey = localStorage.getItem(STORAGE_KEY);
  if (savedKey) {
    updateKeyDisplay(savedKey);
  } else {
    // Si no existe, abrir el modal en el primer inicio
    showModal();
  }
}

function updateKeyDisplay(key) {
  if (key) {
    const masked = key.slice(0, 7) + '...' + key.slice(-4);
    keyIndicator.textContent = `🔑 Clave API: ${masked}`;
    keyIndicator.style.color = '#10b981';
  } else {
    keyIndicator.textContent = '🔑 Clave API: No configurada';
    keyIndicator.style.color = '#94a3b8';
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
    alert('Por favor ingresá una API Key válida.');
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

// Cerrar modal al hacer clic fuera del contenido
keyModal.addEventListener('click', (e) => {
  if (e.target === keyModal && localStorage.getItem(STORAGE_KEY)) {
    hideModal();
  }
});

// 2. Control de Estados visuales de la UI
function setUIState(state, message) {
  statusDot.className = 'status-dot';
  visualOrb.classList.remove('active');

  switch (state) {
    case 'disconnected':
      statusText.textContent = message || 'Desconectado';
      btnText.textContent = 'Comenzar a Hablar';
      connectBtn.className = 'btn btn-primary';
      connectBtn.disabled = false;
      isConnected = false;
      break;

    case 'connecting':
      statusDot.classList.add('connecting');
      statusText.textContent = message || 'Conectando con el tutor...';
      btnText.textContent = 'Conectando...';
      connectBtn.disabled = true;
      break;

    case 'connected':
      statusDot.classList.add('connected');
      visualOrb.classList.add('active');
      statusText.textContent = message || 'Conectado (Escuchando...)';
      btnText.textContent = 'Finalizar Conversación';
      connectBtn.className = 'btn btn-danger';
      connectBtn.disabled = false;
      isConnected = true;
      break;

    case 'speaking':
      statusDot.classList.add('speaking');
      visualOrb.classList.add('active');
      statusText.textContent = message || 'El tutor está hablando...';
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

// 3. Conexión WebRTC con OpenAI Realtime API (GA)
async function startSession() {
  hideError();
  const apiKey = localStorage.getItem(STORAGE_KEY);

  if (!apiKey) {
    showModal();
    return;
  }

  try {
    setUIState('connecting', 'Obteniendo credenciales efímeras...');

    // Paso A: Solicitar Token Efímero a nuestro backend mediante POST /api/session
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
      throw new Error('No se pudo extraer el token efímero de la respuesta.');
    }

    setUIState('connecting', 'Conectando audio y micrófono...');

    // Paso B: Crear instancia de RTCPeerConnection
    peerConnection = new RTCPeerConnection();

    // Reproducir el audio entrante del tutor
    peerConnection.ontrack = (event) => {
      remoteAudio.srcObject = event.streams[0];
    };

    // Capturar el micrófono del usuario
    localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localMediaStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localMediaStream);
    });

    // Paso C: Crear DataChannel ("oai-events") para enviar session.update
    dataChannel = peerConnection.createDataChannel('oai-events');

    dataChannel.addEventListener('open', () => {
      console.log('WebRTC DataChannel abierto.');

      // Prompt para el tutor de inglés conversacional
      const tutorPrompt = `You are a friendly, patient, and encouraging conversational English tutor named Alex.
Your mission is to help the student practice and gain confidence in speaking English naturally.
Guidelines:
- Speak clearly, naturally, and warmly in English.
- Keep your answers concise and conversational (1 to 3 sentences maximum) so the student gets plenty of talking time.
- If the student makes a grammar, vocabulary, or pronunciation mistake, gently and warmly provide a brief correction or suggest a more natural way to say it, then seamlessly continue the conversation.
- If the student speaks in Spanish or hesitates, understand them kindly, provide the English expression, and encourage them to repeat it.
- Be supportive, enthusiastic, and ask engaging open-ended questions about their life, hobbies, work, or interests.`;

      // Evento session.update estrictamente minimalista conforme a la API GA
      const sessionUpdate = {
        type: 'session.update',
        session: {
          type: 'realtime',
          instructions: tutorPrompt
        }
      };

      dataChannel.send(JSON.stringify(sessionUpdate));
      console.log('session.update enviado al tutor.');
    });

    // Detectar eventos del DataChannel para animar la interfaz
    dataChannel.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'response.audio.delta') {
          setUIState('speaking', 'Alex está hablando...');
        } else if (msg.type === 'response.done') {
          setUIState('connected', 'Conectado (Tu turno de hablar)');
        } else if (msg.type === 'input_audio_buffer.speech_started') {
          setUIState('connected', 'Alex te está escuchando...');
        }
      } catch (e) {
        // Ignorar mensajes no JSON
      }
    });

    // Paso D: Crear oferta SDP y configurar descripción local
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Paso E: Handshake WebRTC con OpenAI en https://api.openai.com/v1/realtime/calls
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
      throw new Error(`Fallo en el handshake de OpenAI (${sdpResponse.status}): ${errDetail}`);
    }

    const answerSdp = await sdpResponse.text();
    const answer = {
      type: 'answer',
      sdp: answerSdp
    };

    await peerConnection.setRemoteDescription(answer);

    // Conexión exitosa
    setUIState('connected', 'Conectado (¡Empezá a hablar en inglés!)');

  } catch (error) {
    console.error('Error al iniciar la sesión:', error);
    showError(error.message || 'Error desconocido al conectar.');
    stopSession();
  }
}

// 4. Detener y limpiar la sesión
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

  setUIState('disconnected', 'Desconectado');
}

// 5. Manejador del botón principal
connectBtn.addEventListener('click', () => {
  if (isConnected) {
    stopSession();
  } else {
    startSession();
  }
});

// Iniciar comprobación de API Key
initApiKey();
