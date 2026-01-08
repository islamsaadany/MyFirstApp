// Default settings
const defaultSettings = {
    workDuration: 25,
    breakDuration: 5,
    workCompleteMessages: ['Time to take a break and recharge!'],
    breakCompleteMessages: ['Time to get back to work!'],
    notificationSound: 'default'
};

// DOM Elements
const settingsForm = document.getElementById('settingsForm');
const workDurationSlider = document.getElementById('workDuration');
const breakDurationSlider = document.getElementById('breakDuration');
const workDurationValue = document.getElementById('workDurationValue');
const breakDurationValue = document.getElementById('breakDurationValue');
const notificationSoundSelect = document.getElementById('notificationSound');
const testSoundBtn = document.getElementById('testSoundBtn');
const workMessagesList = document.getElementById('workMessagesList');
const breakMessagesList = document.getElementById('breakMessagesList');
const addWorkMessageBtn = document.getElementById('addWorkMessageBtn');
const addBreakMessageBtn = document.getElementById('addBreakMessageBtn');
const resetSessionsBtn = document.getElementById('resetSessionsBtn');

// Audio context for sound testing
let audioContext = null;
let notificationAudio = null;

// Initialize settings page
function init() {
    loadSettings();
    setupEventListeners();
    createNotificationSound();
}

// Create notification sound
function createNotificationSound() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    notificationAudio = {
        play: () => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }
    };
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('focusTimerSettings');
    let settings = defaultSettings;

    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        // Ensure backward compatibility - convert old single messages to arrays
        if (typeof settings.workCompleteMessage === 'string') {
            settings.workCompleteMessages = [settings.workCompleteMessage];
            delete settings.workCompleteMessage;
        }
        if (typeof settings.breakCompleteMessage === 'string') {
            settings.breakCompleteMessages = [settings.breakCompleteMessage];
            delete settings.breakCompleteMessage;
        }
        // Ensure arrays exist
        if (!settings.workCompleteMessages) {
            settings.workCompleteMessages = defaultSettings.workCompleteMessages;
        }
        if (!settings.breakCompleteMessages) {
            settings.breakCompleteMessages = defaultSettings.breakCompleteMessages;
        }
    }

    // Set slider values
    workDurationSlider.value = settings.workDuration;
    breakDurationSlider.value = settings.breakDuration;
    workDurationValue.textContent = settings.workDuration;
    breakDurationValue.textContent = settings.breakDuration;
    notificationSoundSelect.value = settings.notificationSound;

    // Load messages
    loadMessages(settings.workCompleteMessages, workMessagesList, 'work');
    loadMessages(settings.breakCompleteMessages, breakMessagesList, 'break');
}

// Load messages into list
function loadMessages(messages, container, type) {
    container.innerHTML = '';
    messages.forEach((message, index) => {
        addMessageToList(message, container, type);
    });
}

// Add message to list
function addMessageToList(message, container, type) {
    const messageItem = document.createElement('div');
    messageItem.className = 'message-item';

    const textarea = document.createElement('textarea');
    textarea.className = 'message-input';
    textarea.value = message;
    textarea.placeholder = type === 'work' ? 'Enter work complete message...' : 'Enter break complete message...';
    textarea.rows = 2;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-remove';
    removeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;
    removeBtn.onclick = () => {
        if (container.children.length > 1) {
            messageItem.remove();
        } else {
            alert('You must have at least one message!');
        }
    };

    messageItem.appendChild(textarea);
    messageItem.appendChild(removeBtn);
    container.appendChild(messageItem);
}

// Update slider background
function updateSliderBackground(slider) {
    const min = slider.min || 0;
    const max = slider.max || 100;
    const value = slider.value;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${percentage}%, #e8e8ed ${percentage}%, #e8e8ed 100%)`;
}

// Setup event listeners
function setupEventListeners() {
    // Slider updates
    workDurationSlider.addEventListener('input', (e) => {
        workDurationValue.textContent = e.target.value;
        updateSliderBackground(e.target);
    });

    breakDurationSlider.addEventListener('input', (e) => {
        breakDurationValue.textContent = e.target.value;
        updateSliderBackground(e.target);
    });

    // Initialize slider backgrounds
    updateSliderBackground(workDurationSlider);
    updateSliderBackground(breakDurationSlider);

    // Test sound button
    testSoundBtn.addEventListener('click', () => {
        if (notificationAudio) {
            notificationAudio.play();
        }
    });

    // Add message buttons
    addWorkMessageBtn.addEventListener('click', () => {
        addMessageToList('', workMessagesList, 'work');
    });

    addBreakMessageBtn.addEventListener('click', () => {
        addMessageToList('', breakMessagesList, 'break');
    });

    // Reset sessions button
    resetSessionsBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset your session count for today?')) {
            localStorage.setItem('focusTimerSessions', '0');
            alert('Session count has been reset to 0');
        }
    });

    // Form submit
    settingsForm.addEventListener('submit', saveSettings);
}

// Get messages from list
function getMessagesFromList(container) {
    const messages = [];
    const textareas = container.querySelectorAll('.message-input');
    textareas.forEach((textarea) => {
        const message = textarea.value.trim();
        if (message) {
            messages.push(message);
        }
    });
    return messages;
}

// Save settings
function saveSettings(e) {
    e.preventDefault();

    // Get messages
    const workMessages = getMessagesFromList(workMessagesList);
    const breakMessages = getMessagesFromList(breakMessagesList);

    // Validate
    if (workMessages.length === 0) {
        alert('Please enter at least one work complete message');
        return;
    }

    if (breakMessages.length === 0) {
        alert('Please enter at least one break complete message');
        return;
    }

    const settings = {
        workDuration: parseInt(workDurationSlider.value),
        breakDuration: parseInt(breakDurationSlider.value),
        workCompleteMessages: workMessages,
        breakCompleteMessages: breakMessages,
        notificationSound: notificationSoundSelect.value
    };

    // Save to localStorage
    localStorage.setItem('focusTimerSettings', JSON.stringify(settings));

    // Show success feedback
    const saveBtn = settingsForm.querySelector('.save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '✓ Saved!';
    saveBtn.style.background = '#34C759';

    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
        window.location.href = 'index.html';
    }, 1000);
}

// Initialize
init();
