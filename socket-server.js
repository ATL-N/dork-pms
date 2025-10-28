// socket-server.js
const { WebSocketServer } = require('ws');
const http = require('http');

const port = process.env.WEBSOCKET_PORT || 8080;

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Handle internal broadcast requests
  if (req.url === '/broadcast' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { conversationId, message } = JSON.parse(body);
        broadcast(conversationId, message);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Broadcast successful' }));
      } catch (error) {
        console.error('Broadcast error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
      }
    });
  }
});

const wss = new WebSocketServer({ server }); // Attach WebSocket server to the HTTP server

// A map to store clients per conversation
const conversations = new Map();

function broadcast(conversationId, message) {
  const clients = conversations.get(conversationId);
  if (clients) {
    console.log(`Broadcasting to ${clients.size} clients in conversation ${conversationId}`);
    clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: 'new_message', message }));
      }
    });
  }
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            if (data.type === 'subscribe') {
                const { conversationId } = data;
                if (!conversations.has(conversationId)) {
                    conversations.set(conversationId, new Set());
                }
                conversations.get(conversationId).add(ws);
                ws.conversationId = conversationId; // Associate ws with conversation
                console.log(`Client subscribed to conversation ${conversationId}`);
            }
        } catch (error) {
            console.error('Failed to process message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // Remove the client from the conversation it was subscribed to
        const { conversationId } = ws;
        if (conversationId && conversations.has(conversationId)) {
            conversations.get(conversationId).delete(ws);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

server.listen(port, () => {
  console.log(`WebSocket server with HTTP listener started on port ${port}`);
});
