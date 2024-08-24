const socket = io();

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const name_input = document.getElementById('name_input');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', name_input.value, input.value);
        input.value = '';
    }
});

socket.on('chat message', function(name, msg) {
    let item = document.createElement('li');
    item.textContent = name + ": " + msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});
