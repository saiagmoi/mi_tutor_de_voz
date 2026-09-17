// ==========================================================
// 1. Elementos del DOM y Selectores
// ==========================================================
const htmlEl = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');

// Selectores de Nivel
const levelBtn = document.getElementById('levelBtn');
const levelLabel = document.getElementById('levelLabel');
const levelModal = document.getElementById('levelModal');
const closeLevelModalBtn = document.getElementById('closeLevelModalBtn');
const levelChips = document.querySelectorAll('.level-chip');

// Selectores de API Key
const openKeyModalBtn = document.getElementById('openKeyModalBtn');
const keyLabel = document.getElementById('keyLabel');
const keyModal = document.getElementById('keyModal');
const apiKeyInput = document.getElementById('apiKeyInput');
const toggleKeyVisibility = document.getElementById('toggleKeyVisibility');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const closeModalBtn = document.getElementById('closeModalBtn');

// Asistente y Burbuja
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

// ==========================================================
// 2. Claves de Almacenamiento Local (Memoria)
// ==========================================================
const STORAGE_KEY = 'openai_api_key';
const STORAGE_THEME = 'tutor_theme_preference';
const STORAGE_LEVEL = 'tutor_student_level';

let isConnected = false;
let peerConnection = null;
let dataChannel = null;
let localMediaStream = null;

// ==========================================================
// 3. Gestión de Tema (Modo Claro / Modo Oscuro)
// ==========================================================
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_THEME);
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
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
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// ==========================================================
// 4. Gestión y Memoria del Nivel de Inglés
// ==========================================================
function initLevel() {
  const savedLevel = localStorage.getItem(STORAGE_LEVEL);
  updateLevelDisplay(savedLevel);
}

function updateLevelDisplay(level) {
  if (level && level !== 'diagnostic') {
    const shortLevel = level.split(' - ')[0] || level;
    levelLabel.textContent = `Nivel: ${shortLevel}`;
    levelBtn.style.borderColor = 'rgba(99, 102, 241, 0.5)';
  } else {
    levelLabel.textContent = 'Nivel: Sin definir';
    levelBtn.style.borderColor = '';
  }

  // Marcar chip activo en el modal
  levelChips.forEach(chip => {
    if (chip.getAttribute('data-level') === (level || 'diagnostic')) {
      chip.classList.add('selected');
    } else {
      chip.classList.remove('selected');
    }
  });
}

levelBtn.addEventListener('click', () => {
  levelModal.classList.remove('hidden');
});

closeLevelModalBtn.addEventListener('click', () => {
  levelModal.classList.add('hidden');
});

levelModal.addEventListener('click', (e) => {
  if (e.target === levelModal) {
    levelModal.classList.add('hidden');
  }
});

levelChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const chosenLevel = chip.getAttribute('data-level');
    if (chosenLevel === 'diagnostic') {
      localStorage.removeItem(STORAGE_LEVEL);
      updateLevelDisplay(null);
    } else {
      localStorage.setItem(STORAGE_LEVEL, chosenLevel);
      updateLevelDisplay(chosenLevel);
    }
    levelModal.classList.add('hidden');
  });
});

// ==========================================================
// 5. Gestión de la OpenAI API Key
// ==========================================================
function initApiKey() {
  const savedKey = localStorage.getItem(STORAGE_KEY);
  if (savedKey) {
    updateKeyDisplay(savedKey);
  } else {
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
// 6. Estados Visuales y Animaciones de la Burbuja
// ==========================================================
function setUIState(state, customMessage) {
  statusDot.className = 'status-indicator-dot';
  assistantBubble.className = 'glowing-bubble';
  bubbleStage.className = 'bubble-stage';

  switch (state) {
    case 'disconnected':
      statusText.textContent = 'Listo para conversar';
      assistantTitle.textContent = 'Tu tutor personal de inglés';
      assistantSubtitle.textContent = 'Practicá hablando con fluidez. Respuestas rápidas, temas de la vida real y adaptación a tu idioma y nivel.';
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
      assistantSubtitle.textContent = 'Iniciando canal de voz seguro de alta velocidad.';
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
      assistantSubtitle.textContent = 'Hablale a Alex con naturalidad en inglés o español.';
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
      assistantSubtitle.textContent = 'Escuchá la respuesta y la pronunciación con atención.';
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
// 7. Handshake WebRTC con OpenAI Realtime GA
// ==========================================================
async function startSession() {
  hideError();
  const apiKey = localStorage.getItem(STORAGE_KEY);

  if (!apiKey) {
    showModal();
    return;
  }

  try {
    setUIState('connecting', 'Obteniendo credenciales efímeras...');

    // 1. Solicitar Token Efímero a nuestro servidor local
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

    // Reproducir el audio del tutor
    peerConnection.ontrack = (event) => {
      remoteAudio.srcObject = event.streams[0];
    };

    // Capturar micrófono
    localMediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localMediaStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localMediaStream);
    });

    // 3. Crear DataChannel para session.update
    dataChannel = peerConnection.createDataChannel('oai-events');

    dataChannel.addEventListener('open', () => {
      console.log('DataChannel abierto.');

      // Recuperar nivel guardado de la memoria
      const savedLevel = localStorage.getItem(STORAGE_LEVEL);
      let levelPromptSection = "";

      if (savedLevel) {
        levelPromptSection = `MEMORIA DE NIVEL PREVIO:
- El alumno ya tiene guardado el nivel: "${savedLevel}".
- Al inicio de la llamada, saludalo brevemente confirmando que recordás su nivel: "¡Hola! Me acuerdo que estamos practicando en nivel ${savedLevel}. ¿Querés que sigamos en ese nivel o preferís que te haga un test rápido para ver si subiste?".
- Adaptá la complejidad de tus palabras y tu velocidad exactamente a ese nivel.`;
      } else {
        levelPromptSection = `EVALUACIÓN DE NIVEL REQUERIDA:
- El nivel del alumno aún NO está definido.
- Al inicio de la llamada, preguntale de forma cálida y directa: "¿Qué nivel de inglés sentís que tenés? (Principiante, Intermedio o Avanzado)".
- Si el alumno te dice que no lo sabe o duda, decile de inmediato: "¡No te preocupes para nada! Te hago 2 o 3 preguntas cortitas y súper fáciles para ver en qué nivel estamos parados".
- Hacé 2 o 3 preguntas diagnósticas progresivas (de una en una, esperando su respuesta):
  1. Una pregunta sobre sí mismo o sus gustos (ej. trabajo, pasatiempo).
  2. Una pregunta en tiempo pasado (ej. qué hizo el último fin de semana).
  3. Una situación o plan a futuro (ej. qué viaje le gustaría hacer).
- Según sus respuestas, decile qué nivel tiene con entusiasmo (A1 Principiante, A2 Básico, B1 Intermedio, etc.) y continuá la charla en ese nivel.`;
      }

      // Prompt ultra optimizado para respuestas rápidas, idioma estricto y temas de la vida real
      const tutorPrompt = `Sos Alex, un tutor de inglés conversacional amigable, paciente y muy despierto.

REGLAS FUNDAMENTALES (OBLIGATORIAS):

1. RESPUESTAS ULTRA RÁPIDAS Y CONCISAS:
- Respondé de inmediato y sin titubeos.
- Tus respuestas deben ser breves (máximo 1 a 2 oraciones). Nunca des discursos largos ni monólogos. El alumno debe hablar el 70% del tiempo.

2. REGLA ESTRICTA DE IDIOMA:
- Si el alumno te habla en ESPAÑOL, tenés que responderle sí o sí en ESPAÑOL (a menos que el alumno te pida explícitamente que le hables en inglés).
- Si el alumno te habla en INGLÉS, respondé en INGLÉS (a menos que el alumno te pida español).
- Si estás en español enseñándole una palabra o frase, explicale en español y proponé la frase en inglés para que la repita.

3. TEMAS DE CHARLA DE LA VIDA COTIDIANA (CERO CHARLA ABURRIDA):
- No hagas preguntas aburridas de manual como "¿Cómo estás? ¿Cómo está el clima?".
- Sacá temas entretenidos y reales del día a día:
  * Situaciones cotidianas graciosas o insólitas (anécdotas de transporte, lidiar con un café equivocado, maratones de series).
  * Viajes y supervivencia cotidiana (pedir comida en un local, aeropuertos, planes del finde).
  * Hobbies, comidas favoritas o hábitos curiosos.
- Terminá siempre tu intervención con una pregunta espontánea y abierta que dé ganas de contestar.

4. ${levelPromptSection}

5. CORRECCIONES AMABLES:
- Si el alumno se equivoca en una palabra o gramática, dale la forma correcta o más natural de manera breve y positiva, y seguí la charla sin frenar la fluidez.`;

      // Enviar session.update estrictamente minimalista conforme a la API GA
      const sessionUpdate = {
        type: 'session.update',
        session: {
          type: 'realtime',
          instructions: tutorPrompt
        }
      };

      dataChannel.send(JSON.stringify(sessionUpdate));
      console.log('session.update enviado.');
    });

    // Detectar eventos de voz para animar la burbuja
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
        // Ignorar
      }
    });

    // 4. Oferta SDP y Handshake con OpenAI en /v1/realtime/calls
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

    // Conexión exitosa
    setUIState('listening');

  } catch (error) {
    console.error('Error durante la llamada:', error);
    showError(error.message || 'Error desconocido al conectar.');
    stopSession();
  }
}

// ==========================================================
// 8. Detener Sesión y Limpiar Recursos
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

// Botón de inicio y clic en la burbuja
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

// Inicialización
initTheme();
initLevel();
initApiKey();
