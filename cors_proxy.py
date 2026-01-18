import http.server
import socketserver
import urllib.request
import json

PORT = 8081
TARGET_URL = "https://api.infinitepay.io/invoices/public/checkout/links"

class CORSProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        # Read request body
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        # Forward to InfinitePay
        try:
            req = urllib.request.Request(TARGET_URL, data=post_data)
            req.add_header('Content-Type', 'application/json')
            req.add_header('User-Agent', 'Mozilla/5.0')
            
            with urllib.request.urlopen(req) as response:
                response_body = response.read()
                
                # Send response back to frontend
                self.send_response(response.status)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(response_body)
                print(f"Success: {response.status}")

        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(e.read())
            print(f"Error: {e.code}")
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(str(e).encode())
            print(f"Exception: {e}")

print(f"Starting CORS Proxy on port {PORT}")
with socketserver.TCPServer(("", PORT), CORSProxyHandler) as httpd:
    httpd.serve_forever()
