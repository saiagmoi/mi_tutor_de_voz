@echo off
title Tutor de Voz en Ingles
cls

echo ========================================================
echo        Iniciando Tutor de Voz en Ingles
echo ========================================================
echo.

:: 1. Comprobar si Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js instalado en esta computadora.
    echo Por favor descargalo e instalalo desde: https://nodejs.org
    echo.
    pause
    exit /b
)

:: 2. Instalar dependencias si no existen
if not exist node_modules (
    echo [INFO] Instalando dependencias por primera vez...
    echo Esto puede demorar unos momentos...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Hubo un problema al instalar las dependencias con npm.
        pause
        exit /b
    )
)

:: 3. Iniciar el servidor Node en segundo plano (minimizada)
echo [INFO] Levantando servidor local en segundo plano...
start "Tutor de Voz Server" /min node server.js

:: 4. Esperar 2 segundos a que el servidor este listo
timeout /t 2 /nobreak >nul

:: 5. Abrir la interfaz en el navegador predeterminado
echo [INFO] Abriendo la aplicacion en tu navegador...
start http://localhost:3000

echo.
echo ========================================================
echo    Tutor iniciado exitosamente en http://localhost:3000
echo    Para cerrar el servidor, cerra la ventana minimizada.
echo ========================================================
echo.
