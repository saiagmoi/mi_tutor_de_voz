import http.server
import json
import os
import sys
import urllib.request
import urllib.error

PORT = int(os.environ.get("PORT", 3000))
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")

class RealtimeTutorHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        if self.path == "/api/session":
            has_key = bool(os.environ.get("OPENAI_API_KEY", "").strip())
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"hasServerKey": has_key}).encode("utf-8"))
            return
        return super().do_GET()

    def do_POST(self):
        if self.path == "/api/session":
            api_key = self.headers.get("x-api-key") or os.environ.get("OPENAI_API_KEY")
            if not api_key or not api_key.strip():
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": "No se configuró la OpenAI API Key (ingresala en la web o configurala en OPENAI_API_KEY)."
                }).encode("utf-8"))
                return

            url = "https://api.openai.com/v1/realtime/client_secrets"
            payload = json.dumps({
                "session": {
                    "type": "realtime",
                    "model": "gpt-realtime"
                }
            }).encode("utf-8")

            req = urllib.request.Request(url, data=payload, method="POST")
            req.add_header("Authorization", f"Bearer {api_key.strip()}")
            req.add_header("Content-Type", "application/json")

            try:
                with urllib.request.urlopen(req) as response:
                    data = response.read()
                    self.send_response(response.status)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(data)
            except urllib.error.HTTPError as e:
                err_data = e.read()
                self.send_response(e.code)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(err_data)
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Error interno del servidor: {str(e)}"
                }).encode("utf-8"))
        else:
            self.send_error(404, "Endpoint no encontrado")

    def log_message(self, format, *args):
        # Silenciar logs ruidosos para mantener la consola limpia
        sys.stderr.write(f"[{self.log_date_time_string()}] {format % args}\n")

if __name__ == "__main__":
    server_address = ("", PORT)
    httpd = http.server.HTTPServer(server_address, RealtimeTutorHandler)
    print(f"Servidor del Tutor de Voz activo en http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
