// socket-server.js
const { WebSocketServer } = require('ws');

const port = process.env.WEBSOCKET_PORT || 8080;
const wss = new WebSocketServer({ port });

// A map to store clients per conversation
const conversations = new Map();

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            // When a client subscribes to a conversation
            if (data.type === 'subscribe') {
                const { conversationId } = data;
                if (!conversations.has(conversationId)) {
                    conversations.set(conversationId, new Set());
                }
                conversations.get(conversationId).add(ws);
                ws.conversationId = conversationId; // Associate ws with conversation
                console.log(`Client subscribed to conversation ${conversationId}`);
            }

            // When a message is received, broadcast it to the correct conversation
            if (data.type === 'chat_message') {
                const { message: chatMessage } = data;
                const { conversationId } = chatMessage;
                const clients = conversations.get(conversationId);
                if (clients) {
                    clients.forEach(client => {
                        if (client.readyState === ws.OPEN) {
                            client.send(JSON.stringify({ type: 'new_message', message: chatMessage }));
                        }
                    });
                }
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

console.log(`WebSocket server started on port ${port}`);
