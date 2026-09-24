#!/bin/bash
cd "$(dirname "$0")"

clear
echo "========================================================"
echo "          Tutor de Inglés con Voz (macOS)"
echo "========================================================"
echo ""

# Detener cualquier instancia previa en el puerto 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Comprobar si existe Node.js o usar Python 3 nativo de macOS
if command -v node &> /dev/null; then
    echo "[INFO] Iniciando con motor Node.js..."
    if [ ! -d "node_modules" ]; then
        echo "[INFO] Instalando módulos de Node por primera vez..."
        npm install
    fi
    node server.js &
    SERVER_PID=$!
else
    echo "[INFO] Usando el motor nativo de macOS (Python 3)..."
    python3 server.py &
    SERVER_PID=$!
fi

sleep 1.5
echo "[INFO] Abriendo en Safari..."
open -a Safari http://localhost:3000

echo ""
echo "========================================================"
echo "   ¡Tutor activo en http://localhost:3000!"
echo "   Para detener el tutor, simplemente cierra esta ventana."
echo "========================================================"
echo ""

wait $SERVER_PID
