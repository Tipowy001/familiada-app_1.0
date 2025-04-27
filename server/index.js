const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

// Zapamiętujemy aktualną drużynę
let currentTeam = null;

io.on('connection', (socket) => {
  console.log('✅ Użytkownik podłączony:', socket.id);

  // Po połączeniu nowego klienta wysyłamy aktualną drużynę
  if (currentTeam) {
    socket.emit('current_team', { team: currentTeam });
  }

  socket.on('send_question', (data) => {
    console.log('📨 Nowe pytanie:', data);
    io.emit('receive_question', data);
  });

  socket.on('show_answer', (data) => {
    console.log('📨 Odkryta odpowiedź:', data);
    io.emit('show_answer', data);
  });

  socket.on('update_scores', (data) => {
    console.log('📨 Aktualizacja punktów:', data);
    io.emit('update_scores', data);
  });

  socket.on('wrong_answer', (data) => {
    console.log('📨 Błąd drużyny:', data);
    io.emit('wrong_answer', data);
  });

  socket.on('current_team', (data) => {
    console.log('📨 Aktualna drużyna ustawiona:', data);
    currentTeam = data.team;
    io.emit('current_team', data);
  });

  // ➔ Dodane: obsługa ODKRYJ WSZYSTKIE
  socket.on('reveal_all', () => {
    console.log('📨 Serwer: odebrano reveal_all, wysyłam do wszystkich!');
    io.emit('reveal_all');
  });

  socket.on('disconnect', () => {
    console.log('❌ Użytkownik rozłączony:', socket.id);
  });
});

server.listen(3001, () => {
  console.log('🚀 Serwer działa na porcie 3001');
});
