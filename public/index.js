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

socket.on('chat message', function(name, msg, date_time) {
    let message_text = document.createElement('div');
    message_text.style['float'] = 'left';
    message_text.textContent = name + ": " + msg;
    let date_text = document.createElement('div');
    date_text.style['float'] = 'right';
    date_text.textContent = date_time;
    let item = document.createElement('li');
    item.style['overflow'] = 'auto';
    item.appendChild(message_text);
    item.appendChild(date_text);
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});
