// Default settings
const defaultSettings = {
    workDuration: 25,
    breakDuration: 5,
    workCompleteMessage: 'Time to take a break and recharge!',
    breakCompleteMessage: 'Time to get back to work!',
    notificationSound: 'default'
};

// DOM Elements
const settingsForm = document.getElementById('settingsForm');
const workDurationInput = document.getElementById('workDuration');
const breakDurationInput = document.getElementById('breakDuration');
const workCompleteMessageInput = document.getElementById('workCompleteMessage');
const breakCompleteMessageInput = document.getElementById('breakCompleteMessage');
const notificationSoundSelect = document.getElementById('notificationSound');

// Initialize settings page
function init() {
    loadSettings();
    setupEventListeners();
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('focusTimerSettings');

    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        workDurationInput.value = settings.workDuration;
        breakDurationInput.value = settings.breakDuration;
        workCompleteMessageInput.value = settings.workCompleteMessage;
        breakCompleteMessageInput.value = settings.breakCompleteMessage;
        notificationSoundSelect.value = settings.notificationSound;
    } else {
        // Use defaults
        workDurationInput.value = defaultSettings.workDuration;
        breakDurationInput.value = defaultSettings.breakDuration;
        workCompleteMessageInput.value = defaultSettings.workCompleteMessage;
        breakCompleteMessageInput.value = defaultSettings.breakCompleteMessage;
        notificationSoundSelect.value = defaultSettings.notificationSound;
    }
}

// Setup event listeners
function setupEventListeners() {
    settingsForm.addEventListener('submit', saveSettings);
}

// Save settings
function saveSettings(e) {
    e.preventDefault();

    const settings = {
        workDuration: parseInt(workDurationInput.value),
        breakDuration: parseInt(breakDurationInput.value),
        workCompleteMessage: workCompleteMessageInput.value,
        breakCompleteMessage: breakCompleteMessageInput.value,
        notificationSound: notificationSoundSelect.value
    };

    // Validate
    if (settings.workDuration < 1 || settings.workDuration > 120) {
        alert('Work duration must be between 1 and 120 minutes');
        return;
    }

    if (settings.breakDuration < 1 || settings.breakDuration > 60) {
        alert('Break duration must be between 1 and 60 minutes');
        return;
    }

    if (!settings.workCompleteMessage.trim()) {
        alert('Please enter a work complete message');
        return;
    }

    if (!settings.breakCompleteMessage.trim()) {
        alert('Please enter a break complete message');
        return;
    }

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
