const socket = io();

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', function(name, msg) {
    let item = document.createElement('li');
    item.textContent = name + ": " + msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});
