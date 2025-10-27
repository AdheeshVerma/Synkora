import http from 'http';
import { WebSocketServer as WSS } from 'ws';

/**
 * Creates and attaches a WebSocket server to an existing HTTP server.
 * The server will broadcast any received message to all connected clients
 * except the sender. It also implements a heartbeat mechanism to detect
 * and clean up dead connections.
 *
 * @param {http.Server} httpServer - The HTTP server instance to bind to.
 * @returns {WSS} The instantiated WebSocket server.
 */
export function createWebSocketServer(httpServer) {
  if (!httpServer || !(httpServer instanceof http.Server)) {
    throw new Error('A valid http.Server instance must be provided');
  }

  const wss = new WSS({ server: httpServer });

  // Handle new connections
  wss.on('connection', (ws, req) => {
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (message) => {
      // Broadcast to all other clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === client.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on('close', () => {
      // No special cleanup required here; the heartbeat interval will handle it.
    });

    ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  });

  // Heartbeat to terminate dead connections
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

/**
 * Convenience function to start an HTTP server on the default port (8000)
 * and attach the WebSocket server to it.
 *
 * @returns {{ httpServer: http.Server, wsServer: WSS }}
 */
export function startServer() {
  const httpServer = http.createServer();
  const port = process.env.PORT || 8000;

  httpServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });

  const wsServer = createWebSocketServer(httpServer);

  return { httpServer, wsServer };
}
