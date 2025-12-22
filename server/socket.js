let io = null;

module.exports = {
  init: (server, options = {}) => {
    const { Server } = require('socket.io');
    io = new Server(server, options);
    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);
      // Allow clients to notify server of a purchase; server will rebroadcast updated quantities
      socket.on('book:purchased', async (payload) => {
        try {
          // payload: { updates: [{ id, quantity }, ...] }
          if (!io) return;
          if (payload && Array.isArray(payload.updates)) {
            payload.updates.forEach((u) => {
              io.emit('book:updated', { id: u.id, quantity: u.quantity });
            });
          }
        } catch (e) {
          console.error('Error handling book:purchased from client:', e);
        }
      });

      socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
    });
    return io;
  },
  getIO: () => io,
};
