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
    workCompleteMessage: 'Time to take a break and recharge!',
    breakCompleteMessage: 'Time to get back to work!',
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
let notificationAudio = null;

// Initialize
function init() {
    loadSettings();
    loadSessionCount();
    updateTimerDisplay();
    updateProgressRing();
    requestNotificationPermission();
    registerServiceWorker();
    setupEventListeners();
    createNotificationSound();
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('focusTimerSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }
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

// Create notification sound
function createNotificationSound() {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

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

    // Play sound
    if (notificationAudio) {
        notificationAudio.play();
    }

    if (isWorkMode) {
        // Work session complete
        sessionsCompleted++;
        saveSessionCount();
        updateSessionDisplay();

        // Show notification
        showNotification('Work Complete!', settings.workCompleteMessage);

        // Show break modal
        breakMessageEl.textContent = settings.workCompleteMessage;
        breakModal.classList.add('show');
    } else {
        // Break complete
        showNotification('Break Over!', settings.breakCompleteMessage);

        // Show work modal
        workMessageEl.textContent = settings.breakCompleteMessage;
        workModal.classList.add('show');
    }
}

// Start break
function startBreak() {
    breakModal.classList.remove('show');
    isWorkMode = false;
    timerModeEl.textContent = 'BREAK';
    progressCircle.classList.add('break-mode');
    resetTimer();
    startTimer();
}

// Skip break
function skipBreak() {
    breakModal.classList.remove('show');
    isWorkMode = true;
    timerModeEl.textContent = 'WORK';
    progressCircle.classList.remove('break-mode');
    resetTimer();
}

// Start work
function startWork() {
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
