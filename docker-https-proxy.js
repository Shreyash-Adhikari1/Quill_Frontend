// Docker-only HTTPS proxy for the standalone Next.js server.
// The app code stays unchanged; this file only adapts the container runtime.

const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const { spawn } = require("child_process");

// The public container port stays 3000 so users open https://localhost:3000.
const HTTPS_PORT = Number(process.env.PORT || 3000);

// The standalone Next server runs privately on loopback behind this proxy.
// Keeping it on 127.0.0.1 prevents direct network access to the plain HTTP port.
const NEXT_PORT = Number(process.env.NEXT_INTERNAL_PORT || 3001);
const NEXT_HOST = "127.0.0.1";

// Certificates are mounted read-only by docker-compose.
// They are not baked into the image because private keys must stay out of images.
const certDir = path.join(__dirname, "certs");
const tlsOptions = {
  key: fs.readFileSync(path.join(certDir, "server.key")),
  cert: fs.readFileSync(path.join(certDir, "server.crt")),
};

// Start the generated standalone server as a child process.
// It listens only on loopback so the HTTPS proxy is the sole public entry point.
const nextServer = spawn(process.execPath, ["server.js"], {
  stdio: "inherit",
  env: {
    ...process.env,
    PORT: String(NEXT_PORT),
    HOSTNAME: NEXT_HOST,
  },
});

// If Next exits, the container should exit too so Docker can restart it.
nextServer.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code || 0);
});

// Proxy browser requests from HTTPS port 3000 to the private HTTP Next server.
// This preserves Secure-cookie behavior without modifying the Next app itself.
const server = https.createServer(tlsOptions, (clientReq, clientRes) => {
  const proxyReq = http.request(
    {
      hostname: NEXT_HOST,
      port: NEXT_PORT,
      path: clientReq.url,
      method: clientReq.method,
      headers: {
        ...clientReq.headers,
        host: clientReq.headers.host,
        "x-forwarded-proto": "https",
      },
    },
    (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(clientRes);
    }
  );

  proxyReq.on("error", () => {
    clientRes.writeHead(502, { "content-type": "text/plain" });
    clientRes.end("Frontend server is not ready");
  });

  clientReq.pipe(proxyReq);
});

// Bind to all interfaces so Docker port publishing can expose the HTTPS frontend.
server.listen(HTTPS_PORT, "0.0.0.0", () => {
  console.log(`Quill frontend HTTPS proxy listening on https://localhost:${HTTPS_PORT}`);
});

// Forward termination to the child process for clean Docker shutdowns.
process.on("SIGTERM", () => nextServer.kill("SIGTERM"));
process.on("SIGINT", () => nextServer.kill("SIGINT"));
