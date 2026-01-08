// Timer State
let timerInterval = null;
let timeRemaining = 0;
let totalTime = 0;
let isRunning = false;
let isWorkMode = true;

// Settings (defaults)
let settings = {
    workDuration: 25,
    breakDuration: 5,
    workCompleteMessages: ['Time to take a break and recharge!'],
    breakCompleteMessages: ['Time to get back to work!'],
    notificationSound: 'default'
};

// Session counter
let sessionsCompleted = 0;

// DOM Elements
const timerTimeEl = document.getElementById('timerTime');
const timerModeEl = document.getElementById('timerMode');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const sessionCountEl = document.getElementById('sessionCount');
const progressCircle = document.querySelector('.progress-ring-circle');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');

// Modals
const breakModal = document.getElementById('breakModal');
const workModal = document.getElementById('workModal');
const breakMessageEl = document.getElementById('breakMessage');
const workMessageEl = document.getElementById('workMessage');
const startBreakBtn = document.getElementById('startBreakBtn');
const skipBreakBtn = document.getElementById('skipBreakBtn');
const startWorkBtn = document.getElementById('startWorkBtn');

// Audio
let currentPlayingSound = null;

// Initialize
function init() {
    loadSettings();
    loadSessionCount();
    updateTimerDisplay();
    updateProgressRing();
    requestNotificationPermission();
    registerServiceWorker();
    setupEventListeners();
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('focusTimerSettings');
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
            settings.workCompleteMessages = ['Time to take a break and recharge!'];
        }
        if (!settings.breakCompleteMessages) {
            settings.breakCompleteMessages = ['Time to get back to work!'];
        }
    }
}

// Get random message from array
function getRandomMessage(messages) {
    if (!messages || messages.length === 0) {
        return '';
    }
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

// Load session count
function loadSessionCount() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('focusTimerDate');

    if (savedDate === today) {
        sessionsCompleted = parseInt(localStorage.getItem('focusTimerSessions') || '0');
    } else {
        sessionsCompleted = 0;
        localStorage.setItem('focusTimerDate', today);
        localStorage.setItem('focusTimerSessions', '0');
    }

    updateSessionDisplay();
}

// Save session count
function saveSessionCount() {
    localStorage.setItem('focusTimerSessions', sessionsCompleted.toString());
}

// Update session display
function updateSessionDisplay() {
    sessionCountEl.textContent = sessionsCompleted;
}

// Stop currently playing sound
function stopSound() {
    if (currentPlayingSound && currentPlayingSound.stop) {
        currentPlayingSound.stop();
        currentPlayingSound = null;
    }
}

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

// Register service worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/service-worker.js');
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
    settingsBtn.addEventListener('click', () => window.location.href = 'settings.html');
    startBreakBtn.addEventListener('click', startBreak);
    skipBreakBtn.addEventListener('click', skipBreak);
    startWorkBtn.addEventListener('click', startWork);
}

// Toggle timer
function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// Start timer
function startTimer() {
    if (timeRemaining === 0) {
        timeRemaining = isWorkMode ? settings.workDuration * 60 : settings.breakDuration * 60;
        totalTime = timeRemaining;
    }

    isRunning = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';

    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        updateProgressRing();

        if (timeRemaining <= 0) {
            timerComplete();
        }
    }, 1000);
}

// Pause timer
function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
}

// Reset timer
function resetTimer() {
    pauseTimer();
    timeRemaining = 0;
    totalTime = 0;
    updateTimerDisplay();
    updateProgressRing();
}

// Timer complete
function timerComplete() {
    pauseTimer();
    timeRemaining = 0;
    updateTimerDisplay();
    updateProgressRing();

    // Play continuous looping sound
    const soundName = settings.notificationSound || 'default';
    currentPlayingSound = SoundLibrary.playSound(soundName, true);

    if (isWorkMode) {
        // Work session complete
        sessionsCompleted++;
        saveSessionCount();
        updateSessionDisplay();

        // Get random work complete message
        const workMessage = getRandomMessage(settings.workCompleteMessages);

        // Show notification
        showNotification('Work Complete!', workMessage);

        // Show break modal
        breakMessageEl.textContent = workMessage;
        breakModal.classList.add('show');
    } else {
        // Break complete
        // Get random break complete message
        const breakMessage = getRandomMessage(settings.breakCompleteMessages);

        showNotification('Break Over!', breakMessage);

        // Show work modal
        workMessageEl.textContent = breakMessage;
        workModal.classList.add('show');
    }
}

// Start break
function startBreak() {
    stopSound();
    breakModal.classList.remove('show');
    isWorkMode = false;
    timerModeEl.textContent = 'BREAK';
    progressCircle.classList.add('break-mode');
    resetTimer();
    startTimer();
}

// Skip break
function skipBreak() {
    stopSound();
    breakModal.classList.remove('show');
    isWorkMode = true;
    timerModeEl.textContent = 'WORK';
    progressCircle.classList.remove('break-mode');
    resetTimer();
}

// Start work
function startWork() {
    stopSound();
    workModal.classList.remove('show');
    isWorkMode = true;
    timerModeEl.textContent = 'WORK';
    progressCircle.classList.remove('break-mode');
    resetTimer();
    startTimer();
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerTimeEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    if (timeRemaining === 0 && !isRunning) {
        timerTimeEl.textContent = isWorkMode
            ? `${settings.workDuration}:00`
            : `${settings.breakDuration.toString().padStart(2, '0')}:00`;
    }
}

// Update progress ring
function updateProgressRing() {
    const circumference = 2 * Math.PI * 120; // radius = 120

    if (timeRemaining === 0 && totalTime === 0) {
        progressCircle.style.strokeDashoffset = circumference;
        return;
    }

    const progress = timeRemaining / totalTime;
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;
}

// Show notification
function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-192.png',
            vibrate: [200, 100, 200],
            tag: 'focus-timer'
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
}

// Initialize app
init();
