let interval = null;
let mode = 'Pomodoro';

let endTime = null;
let isPause = false;
let focusTime = 25 * 60; 
let pauseTime = 5 * 60;  
let duration = 10 * 60;  

// Ping-Variablen (Stoppuhr)
let pingInterval = 0; 
let pingCount = 0;
let pingStartTime = 0;
let lastPingAt = 0; 
let pausedRemaining = null; 

self.onmessage = (event) => {
  const { command, payload } = event.data;

  switch (command) {
    case 'start':
      mode = payload.mode;
      focusTime = payload.focusTime || focusTime;
      pauseTime = payload.pauseTime || pauseTime;
      pingInterval = payload.pingInterval || pingInterval;
      duration = payload.duration || duration;

      if (mode === 'Pomodoro') {

        endTime = Date.now() + focusTime * 1000;
        isPause = false;

      } else if (mode === 'Ping') {

        pingStartTime = Date.now();
        lastPingAt = pingStartTime;
        pingCount = 0;
        isPause = false; 
        pausedRemaining = null;

      } else if (mode === 'Chronograph') {
        pingStartTime = Date.now();
        isPause = false;
        pausedRemaining = null;
      }else if (mode === 'Timer') {

        endTime = Date.now() + duration * 1000;
        isPause = false;
      }
      startTimer();
      break;

    case 'pause':
      pauseTimer();
      break;

    case 'resume':
      resumeTimer();
      break;

    case 'reset':
      resetTimer();
      break;

    default:
      console.error('Unbekanntes Kommando:', command);
  }
};


const startTimer = () => {
  if (interval) {
    return;
  }

  interval = setInterval(() => {
    if (mode === 'Ping') {
      handlePingMode();
    } else if (mode === 'Chronograph') {
      handleChronographMode();
    }else {
      handlePomodoroOrTimer();
    }
  }, 1000);
};

function handlePingMode() {
  const now = Date.now();
  const elapsedSec = Math.floor((now - pingStartTime) / 1000);

  self.postMessage({
    command: 'tick',
    timeLeft: elapsedSec, 
    isPause: false 
  });

  if (now - lastPingAt >= pingInterval * 1000) {
    pingCount += 1;
    self.postMessage({ command: 'ping', pingCount });
    lastPingAt = now; 
  }
}

function handleChronographMode() {
  const now = Date.now();
  const elapsedSec = Math.floor((now - pingStartTime) / 1000);

  self.postMessage({
    command: 'tick',
    timeLeft: elapsedSec,
    isPause: false
  });
}


function handlePomodoroOrTimer() {
  const now = Date.now();
  const remaining = Math.round((endTime - now) / 1000);

  if (remaining >= 0) {
    self.postMessage({ 
      command: 'tick', 
      timeLeft: remaining, 
      isPause: isPause 
    });
  } else {
    clearInterval(interval);
    interval = null;

    if (mode === 'Pomodoro') {
      isPause = !isPause;
      if (isPause) {
        endTime = Date.now() + pauseTime * 1000;
        self.postMessage({ command: 'pauseStart' });
      } else {
        endTime = Date.now() + focusTime * 1000;
        self.postMessage({ command: 'focusStart' });
      }
      startTimer();

    } else {
      self.postMessage({ command: 'done' });
    }
  }
}

const pauseTimer = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;

    const now = Date.now();

    if (mode === 'Ping') {
      pausedRemaining = now - pingStartTime;
    } else {
      pausedRemaining = endTime - now;
    }

    self.postMessage({ command: 'paused' });
  }
};

const resumeTimer = () => {
  if (!interval) {
    const now = Date.now();

    if (mode === 'Ping' && pausedRemaining !== null) {
      pingStartTime = now - pausedRemaining;
      lastPingAt = now;
      pausedRemaining = null;

    } else if (mode !== 'Ping' && pausedRemaining !== null) {
      endTime = now + pausedRemaining;
      pausedRemaining = null;
    }

    startTimer();
    self.postMessage({ command: 'resumed' });
  }
};

const resetTimer = () => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  endTime = null;
  isPause = false;

  pingStartTime = 0;
  lastPingAt = 0;
  pingCount = 0;
  pausedRemaining = null;

  self.postMessage({ command: 'reset' });
};
