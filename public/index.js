const socket = io();

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const name_input = document.getElementById('name_input');

window.onload = function() {
    console.log("Trying to fetch name if existing session exists...");
    fetch('/getName').then(res => res.json()).then(data => {
        console.log("/getName returned:" + JSON.stringify(data));
        name_input.value = data.name;
    });
}

function updateName() {
    // Save Name to session
    let name_to_save = name_input.value;
    console.log(name_to_save);
    fetch('http://winter.heronet.us:22080/saveName', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({name: name_to_save}),
    }).then(res => {
        console.log(res.data);
    });
}

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', name_input.value, input.value);
        input.value = '';
    }
});

socket.on('chat message', function(name, msg, date_time) {
    console.log(name, ', ', msg, ', ', date_time);

    let message_text = document.createElement('div');
    message_text.style['float'] = 'left';
    message_text.textContent = name + ": " + msg;

    let date_text = document.createElement('div');
    date_text.style['float'] = 'right';
    date_text.textContent = new Date(date_time).toLocaleString();

    let item = document.createElement('li');
    item.style['overflow'] = 'auto';
    item.appendChild(message_text);
    item.appendChild(date_text);

    messages.appendChild(item);

    window.scrollTo(0, document.body.scrollHeight);
});
