const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para verificar si el servidor tiene clave configurada en sus variables de entorno
app.get('/api/session', (req, res) => {
  res.json({
    hasServerKey: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim())
  });
});

// Endpoint para generar el Token Efímero usando la Realtime API de OpenAI (GA)
app.post('/api/session', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;

    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({
        error: 'No se configuró la OpenAI API Key (ingresala en la web o configurala en OPENAI_API_KEY).'
      });
    }

    // Llamada al endpoint oficial GA de client_secrets
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: 'gpt-realtime'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de OpenAI al solicitar client_secret:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Error al comunicarse con OpenAI Realtime API',
        details: data
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Error interno en /api/session:', error);
    res.status(500).json({
      error: 'Error interno del servidor: ' + error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor del Tutor de Voz activo en http://localhost:${PORT}`);
});
