#!/bin/bash
cd "$(dirname "$0")"

clear
echo "========================================================"
echo "       Iniciando Tutor de Voz en Inglés"
echo "========================================================"
echo ""

# 1. Comprobar Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] No se encontró Node.js instalado en esta Mac."
    echo "Por favor descárgalo e instálalo desde: https://nodejs.org"
    echo ""
    read -p "Presiona Enter para salir..."
    exit 1
fi

# 2. Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "[INFO] Instalando dependencias por primera vez..."
    npm install
fi

# 3. Iniciar servidor
echo "[INFO] Iniciando servidor local en segundo plano..."
node server.js &
SERVER_PID=$!

# 4. Esperar 2 segundos y abrir navegador
sleep 2
echo "[INFO] Abriendo en el navegador predeterminado..."
open http://localhost:3000

echo ""
echo "========================================================"
echo "   Tutor activo en http://localhost:3000"
echo "   Para detener el servidor presiona Ctrl + C"
echo "========================================================"
echo ""

wait $SERVER_PID
