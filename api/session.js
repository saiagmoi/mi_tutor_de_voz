module.exports = async function handler(req, res) {
  // Permitir verificación de si el servidor ya tiene la API Key configurada
  if (req.method === 'GET') {
    return res.status(200).json({
      hasServerKey: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim())
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const apiKey = req.headers['x-api-key'] || process.env.OPENAI_API_KEY;

    if (!apiKey || !apiKey.trim()) {
      return res.status(400).json({
        error: 'No se configuró la OpenAI API Key (debes ingresarla en la web o definir la variable de entorno OPENAI_API_KEY en Vercel).'
      });
    }

    // Llamada al endpoint oficial GA de client_secrets de OpenAI
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
      console.error('Error de OpenAI al solicitar client_secret en Vercel:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'Error al comunicarse con OpenAI Realtime API',
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error interno en /api/session (Vercel):', error);
    return res.status(500).json({
      error: 'Error interno del servidor en Vercel: ' + error.message
    });
  }
};
