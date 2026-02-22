const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const imageInput = document.getElementById('image-input');
const imagePreview = document.getElementById('image-preview');
const imagePreviewContainer = document.getElementById('image-preview-container');
const removeImageBtn = document.getElementById('remove-image');
const micBtn = document.getElementById('micBtn');
const ttsBtn = document.getElementById('ttsBtn');

let selectedImageBase64 = null;
let isTTSEnabled = true;
let ttsEnabled = true;
let lastAIMessage = '';
let sentences = [];
let currentSentenceIndex = 0;

imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            selectedImageBase64 = event.target.result;
            imagePreview.src = selectedImageBase64;
            imagePreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

removeImageBtn.addEventListener('click', () => {
    selectedImageBase64 = null;
    imageInput.value = '';
    imagePreviewContainer.classList.add('hidden');
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'en-US';

recognition.onstart = function() {
    micBtn.style.color = 'red';
};

recognition.onend = function() {
    micBtn.style.color = 'white';
};

recognition.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    sendMessage();
};

micBtn.addEventListener('click', () => {
    recognition.start();
});

function speak(text) {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    currentSentenceIndex = 0;

    speakSentence();
}

function speakSentence() {
    if (currentSentenceIndex >= sentences.length) return;

    const utterance = new SpeechSynthesisUtterance(sentences[currentSentenceIndex]);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
        currentSentenceIndex++;
        speakSentence();
    };

    window.speechSynthesis.speak(utterance);
}

function toggleTTSAndStop() {
    const btn = document.getElementById('ttsBtn');
    const icon = btn.querySelector('i');

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        ttsEnabled = false;
        btn.classList.remove('active');
        icon.className = 'fas fa-volume-mute';
    } else if (!ttsEnabled) {
        ttsEnabled = true;
        btn.classList.add('active');
        icon.className = 'fas fa-volume-up';
        if (lastAIMessage) speakSentence(); 
    } else {
        ttsEnabled = false;
        btn.classList.remove('active');
        icon.className = 'fas fa-volume-mute';
    }
}

function toggleChat() {
    const chat = document.getElementById('chatContainer');
    const btn = document.getElementById('chatToggleBtn');
    const icon = btn.querySelector('i');

    chat.classList.toggle('open');

    if (chat.classList.contains('open')) {
        icon.className = 'fas fa-times';
    } else {
        icon.className = 'fas fa-comment-dots';
    }
}

async function sendMessage() {
    const text = userInput.value.trim();

    if (!text && !selectedImageBase64) return;

    addMessageToUI('user-message', text, selectedImageBase64);

    userInput.value = '';
    removeImageBtn.click();

    const loadingId = addLoadingIndicator();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                image: selectedImageBase64
            })
        });

        const data = await response.json();

        removeLoadingIndicator(loadingId);
        addMessageToUI('bot-message', data.reply);

        // Save last AI message and speak it
        lastAIMessage = data.reply;
        if (ttsEnabled) {
            speak(data.reply);
        }

    } catch (error) {
        console.error(error);
        removeLoadingIndicator(loadingId);
        addMessageToUI('bot-message', "Error connecting to server.");
    }
}

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function addMessageToUI(type, text, image = null) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', type);

    if (text) {
        const textP = document.createElement('p');
        textP.textContent = text;
        msgDiv.appendChild(textP);
    }

    if (image) {
        const img = document.createElement('img');
        img.src = image;
        msgDiv.appendChild(img);
    }

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.classList.add('message', 'bot-message');
    msgDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Thinking...';
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return id;
}

function removeLoadingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}
