import '../assets/Styles/TimerFullscreen.css';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import HtmlDurationPicker from 'html-duration-picker/dist/html-duration-picker.min.js';

import API, { saveSession } from '../api';
import TimerWorker from '../workers/timerWorker.js?worker';
import { useAuthContext } from '../AuthContext';
import { useAuthGuard } from '../utils/auth';

import {
  MaximizeIcon,
  MinimizeIcon,
  PlayIcon,
  PauseIcon,
  SaveIcon,
  TimerIcon1,
  TimerIcon2
} from '../assets/icons/icons';

import ProgressCircle from '../components/ProgressCircle';

const sessionEndAudio = new Audio('/sounds/sessionEnd.wav');
const sessionStartAudio = new Audio('/sounds/sessionStart.wav');
const pingAudio = new Audio('/sounds/ping.mp3');

const MODES = {
  POMODORO: 'Pomodoro',
  PING: 'Ping',
  TIMER: 'Timer',
  CHRONOGRAPH: 'Chronograph',
};

const DEFAULT_TIMES = {
  [MODES.POMODORO]: {
    focus: 25 * 60,
    pause: 5 * 60,
  },
  [MODES.PING]: {
    interval: 15 * 60,
  },
  [MODES.TIMER]: {
    duration: 10 * 60,
  },
};
function formatTime(seconds) {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

const Timer = () => {

  useAuthGuard();

  const { isFullscreen, setIsFullscreen } = useAuthContext();

  const workerRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [mode, setMode] = useState(MODES.POMODORO);
  const [timeSettings, setTimeSettings] = useState({
    focus: DEFAULT_TIMES[MODES.POMODORO].focus,
    pause: DEFAULT_TIMES[MODES.POMODORO].pause,
    interval: DEFAULT_TIMES[MODES.PING].interval,
    duration: DEFAULT_TIMES[MODES.TIMER].duration,
  });
  const [focusInput, setFocusInput] = useState(formatTime(DEFAULT_TIMES[MODES.POMODORO].focus));
  const [pauseInput, setPauseInput] = useState(formatTime(DEFAULT_TIMES[MODES.POMODORO].pause));
  const [pingInput, setPingInput] = useState(formatTime(DEFAULT_TIMES[MODES.PING].interval));
  const [timerInput, setTimerInput] = useState(formatTime(DEFAULT_TIMES[MODES.TIMER].duration));
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES[MODES.POMODORO].focus);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [canStart, setCanStart] = useState(true);
  const [startButtonTooltip, setStartButtonTooltip] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const [round, setRound] = useState(0);
  const [isFocusPhase, setIsFocusPhase] = useState(true);

  const [pingCount, setPingCount] = useState(0);

  const [elapsedFocusTime, setElapsedFocusTime] = useState(0);
  const [elapsedPauseTime, setElapsedPauseTime] = useState(0);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [errors, setErrors] = useState({});
  const [saveFeedback, setSaveFeedback] = useState(null);

  const [circleSize, setCircleSize] = useState(400);

  const [c_rounds, setCRounds] = useState([]);
  const [roundComment, setRoundComment] = useState('');
  const [editingRoundNr, setEditingRoundNr] = useState(null);
  const [editingComment, setEditingComment] = useState('');


  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new TimerWorker();
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    if (HtmlDurationPicker) {
      try {
        HtmlDurationPicker.init();
      } catch (err) {
        console.error('Fehler bei der Initialisierung: ', err);
      }

    } else {
      console.error('HtmlDurationPicker ist nicht verfügbar.');
    }
  }, [mode]);

  useEffect(() => {
    const updateSize = () => {
      if (isFullscreen) {
        const newSize = Math.min(
          Math.max(window.innerWidth * 0.45, 150),
          600
        );
        setCircleSize(newSize);
      } else {
        setCircleSize(300);
      }

      window.addEventListener('resize', updateSize)
    };
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, [isFullscreen]);


  useEffect(() => {
    function buildHierarchyAndFlatten(catArray) {
      const map = {};
      catArray.forEach(c => {
        map[c.id] = { ...c, children: [] };
      });

      const rootNodes = [];
      catArray.forEach(c => {
        if (!c.parent_id) {
          rootNodes.push(map[c.id]);
        } else {
          map[c.parent_id].children.push(map[c.id]);
        }
      });

      function sortChildren(node) {
        node.children.sort((a, b) => a.name.localeCompare(b.name));
        node.children.forEach(sortChildren);
      }
      rootNodes.sort((a, b) => a.name.localeCompare(b.name));
      rootNodes.forEach(sortChildren);
      const result = [];
      function traverse(node, prefix) {
        const path = prefix ? prefix + '/' + node.name : node.name;
        result.push({ id: node.id, slashPath: path });
        node.children.forEach(child => traverse(child, path));
      }
      rootNodes.forEach(r => traverse(r, ''));

      return result;
    }

    const fetchCategories = async () => {
      try {
        const response = await API.get('/categories');
        const cats = response.data || [];
        const flattened = buildHierarchyAndFlatten(cats);
        setCategories(flattened);
      } catch (error) {
        console.error('Fehler beim Laden der Kategorien:', error);
      }
    };

    fetchCategories();

    const fetchSettings = async () => {
      try {
        const resp = await API.get('/settings');
        const st = resp.data.settings || {};
        const pomodoroFocus = st.timer_pomodoro_focus ? parseInt(st.timer_pomodoro_focus, 10) : DEFAULT_TIMES[MODES.POMODORO].focus;
        const pomodoroPause = st.timer_pomodoro_pause ? parseInt(st.timer_pomodoro_pause, 10) : DEFAULT_TIMES[MODES.POMODORO].pause;
        const pingInterval = st.timer_ping_interval ? parseInt(st.timer_ping_interval, 10) : DEFAULT_TIMES[MODES.PING].interval;
        const timerDuration = st.timer_timer_duration ? parseInt(st.timer_timer_duration, 10) : DEFAULT_TIMES[MODES.TIMER].duration;

        setTimeSettings({
          focus: pomodoroFocus,
          pause: pomodoroPause,
          interval: pingInterval,
          duration: timerDuration
        });
        setFocusInput(formatTime(pomodoroFocus));
        setPauseInput(formatTime(pomodoroPause));
        setPingInput(formatTime(pingInterval));
        setTimerInput(formatTime(timerDuration));
      } catch (err) {
        console.error('Fehler beim Laden der Settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const timeSettingsRef = useRef(timeSettings);

  useEffect(() => {
    timeSettingsRef.current = timeSettings;
  }, [timeSettings]);


  useEffect(() => {
    if (!isRunning) {
      let newTime;
      if (mode === MODES.POMODORO) {
        newTime = timeSettings.focus;
      } else if (mode === MODES.PING) {
        newTime = 0;
      } else if (mode === MODES.TIMER) {
        newTime = timeSettings.duration;
      } else if (mode === MODES.CHRONOGRAPH) {
        newTime = 0;
      }
      setTimeLeft(newTime);
    }
  }, [mode, timeSettings]);

  const sessionStartTimeRef = useRef(null);

  useEffect(() => {
    workerRef.current = new TimerWorker();

    workerRef.current.onmessage = (event) => {
      const { command, timeLeft: workerTimeLeft, isPause, pingCount: workerPingCount } = event.data;

      switch (command) {
        case 'tick': {

          if (!sessionStartTimeRef.current) {
            sessionStartTimeRef.current = Date.now();
            setSessionStartTime(sessionStartTimeRef.current);
          }

          setTimeLeft(workerTimeLeft);

          if (mode !== MODES.PING) {
            setIsFocusPhase(!isPause);
          }

          if (mode === MODES.POMODORO) {

            if (isPause) {
              setElapsedPauseTime((prev) => prev + 1);
            } else {
              setElapsedFocusTime((prev) => prev + 1);
            }
          } else if (mode === MODES.PING) {
            setElapsedFocusTime((prev) => prev + 1);
          } else {
            setElapsedFocusTime((prev) => prev + 1);
          }
          break;
        }

        case 'done':
          sessionEndAudio.play();
          setIsRunning(false);
          setIsPaused(false);
          break;

        case 'pauseStart':
          sessionEndAudio.play();
          setIsFocusPhase(false);
          setTimeLeft(timeSettingsRef.current.pause);
          break;

        case 'focusStart':
          sessionStartAudio.play();
          setRound((prev) => prev + 1);
          setIsFocusPhase(true);
          setTimeLeft(timeSettingsRef.current.focus);
          break;

        case 'ping':
          setPingCount(workerPingCount);
          pingAudio.play();
          break;

        case 'reset':
          setIsRunning(false);
          setIsPaused(false);
          setIsFocusPhase(true);
          setPingCount(0);
          setRound(0);
          break;

        case 'paused':
          setIsRunning(false);
          setIsPaused(true);
          break;

        case 'resumed':
          setIsRunning(true);
          setIsPaused(false);
          break;

        default:
          console.error('Unbekanntes Kommando vom Worker:', command);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const startWorker = () => {
    workerRef.current?.postMessage({
      command: 'start',
      payload: {
        mode,
        focusTime: timeSettings.focus,
        pauseTime: timeSettings.pause,
        pingInterval: timeSettings.interval,
        duration: timeSettings.duration,
      },
    });
  };

  const pauseWorker = () => {
    workerRef.current?.postMessage({ command: 'pause' });
  };

  const resumeWorker = () => {
    workerRef.current?.postMessage({ command: 'resume' });
  };

  const resetWorker = () => {
    workerRef.current?.postMessage({ command: 'reset' });
  };

  const buffer = () => {
    const rules = () => {
      setCanStart(true);
      setStartButtonTooltip('Timer-Logik wird verarbeitet.')
    }
    setCanStart(false);
    setTimeout(() => rules(), 1000);
  }

  const handleStartPauseResume = () => {
    if (!canStart) return;

    if (isRunning) {
      pauseWorker();
    } else {
      if (isPaused) {
        resumeWorker();
      } else {
        if (mode === MODES.POMODORO && round === 0) {
          setRound(1);
        }
        startWorker();
        setIsRunning(true);
      }
    }
    buffer();
  };

  const handleReset = () => {
    setCRounds([]);
    resetWorker();
    setIsRunning(false);
    setIsPaused(false);
    setIsFocusPhase(true);
    setPingCount(0);
    setRound(0);

    if (mode === MODES.POMODORO) {
      setTimeLeft(timeSettings.focus);
    } else if (mode === MODES.PING || mode === MODES.CHRONOGRAPH) {
      setTimeLeft(0);
    } else if (mode === MODES.TIMER) {
      setTimeLeft(timeSettings.duration);
    }
    buffer();
  };

  const validateTimeString = (str) => {
    const match = str.match(/^(\d{2}):([0-5]\d):([0-5]\d)$/);
    if (!match) return null;

    const [_, hh, mm, ss] = match;
    const totalSec = parseInt(hh, 10) * 3600 + parseInt(mm, 10) * 60 + parseInt(ss, 10);
    if (totalSec <= 0) return null;
    return totalSec;
  };

  const enableStart = () => {
    handleReset()
    setCanStart(true);
    setStartButtonTooltip('')
  }

  const disableStart = (err) => {
    setCanStart(false);
    setStartButtonTooltip(`Fehler: `, err);
  }

  const handleApply = () => {
    const newErrors = {};

    if (mode === MODES.POMODORO) {
      const focusSec = validateTimeString(focusInput);
      const pauseSec = validateTimeString(pauseInput);

      if (focusSec == null) {
        newErrors.focus = 'Ungültige Fokuszeit (Format hh:mm:ss, > 00:00:00).';
      }
      if (pauseSec == null) {
        newErrors.pause = 'Ungültige Pausenzeit (Format hh:mm:ss, > 00:00:00).';
      }

      if (Object.keys(newErrors).length === 0) {
        setTimeSettings((prev) => ({ ...prev, focus: focusSec, pause: pauseSec }));
        if (!isRunning) {
          setTimeLeft(isFocusPhase ? focusSec : pauseSec);
        }
        setSaveFeedback('Einstellungen erfolgreich übernommen!');
        setTimeout(() => setSaveFeedback(null), 3000);
        buffer();
      } else {
        disableStart(newErrors);
      }
    }

    if (mode === MODES.PING) {
      const pingSec = validateTimeString(pingInput);
      if (pingSec == null) {
        newErrors.interval = 'Ungültiges Ping-Intervall (Format hh:mm:ss, > 00:00:00).';
      } else {
        if (Object.keys(newErrors).length === 0) {
          setTimeSettings((prev) => ({ ...prev, interval: pingSec }));
          if (!isRunning) {
            setTimeLeft(pingSec);
          }
          setSaveFeedback('Einstellungen erfolgreich übernommen!');
          setTimeout(() => setSaveFeedback(null), 3000);
          buffer();
        } else {
          disableStart(newErrors);
        }
      }
    }

    if (mode === MODES.TIMER) {
      const timerSec = validateTimeString(timerInput);
      if (timerSec == null) {
        newErrors.duration = 'Ungültige Timer-Dauer (Format hh:mm:ss, > 00:00:00).';
      } else {
        if (Object.keys(newErrors).length === 0) {
          setTimeSettings((prev) => ({ ...prev, duration: timerSec }));
          if (!isRunning) {
            setTimeLeft(timerSec);
          }
          enableStart();
          setSaveFeedback('Einstellungen erfolgreich übernommen!');
          setTimeout(() => setSaveFeedback(null), 3000);
        } else {
          disableStart();
        }
      }
    }



    setErrors(newErrors);
  };

  const handleSave = async (overrideMode) => {
    if (elapsedFocusTime === 0 && elapsedPauseTime === 0) {
      setSaveFeedback('Nix zu speichern.');
      setTimeout(() => setSaveFeedback(null), 5000);
      return;
    }
    const finalMode = overrideMode || mode;
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error('Benutzer-ID fehlt. Speichern nicht möglich.');
      setSaveFeedback('Fehler: Benutzer-ID fehlt. Bitte erneut einloggen.');
      setTimeout(() => setSaveFeedback(null), 3000);
      return;
    }
    try {

      const startTimeFormatted = sessionStartTime
        ? new Date(sessionStartTime).toLocaleString('sv-SE', {
          timeZone: 'Europe/Berlin',
          hour12: false
        }).replace(',', '')
        : null;

      let extraData = {};

      if (finalMode === MODES.PING) {
        extraData = {
          ping_interval: timeSettings.interval,
          received_pings: pingCount,
        };
      } else if (finalMode === MODES.POMODORO) {
        extraData = {
          focus_interval: timeSettings.focus,
          pause_interval: timeSettings.pause,
          rounds: round,
        };
      } else if (finalMode === MODES.CHRONOGRAPH) {
        extraData = {
          rounds: c_rounds,
        };
        setCRounds([]);
      }

      const payload = {
        user_id: parseInt(userId, 10),
        category_id: selectedCategory || null,
        modus: finalMode,
        focusTime: elapsedFocusTime,
        pauseTime: elapsedPauseTime,
        start_time: startTimeFormatted,
        extra_data: extraData
      };

      console.log('[Frontend] Sende Sessions-Payload:', payload); // <--- Debug

      const response = await saveSession(payload);
      console.log('Session erfolgreich gespeichert:', response);
      setSaveFeedback('Sitzung erfolgreich gespeichert!');
      setTimeout(() => setSaveFeedback(null), 3000);

      setElapsedFocusTime(0);
      setElapsedPauseTime(0);

    } catch (error) {
      console.error('Fehler beim Speichern der Sitzung:', error);
      setSaveFeedback('Fehler beim Speichern der Sitzung.');
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  const clearElapsedTimes = () => {
    setElapsedFocusTime(0);
    setElapsedPauseTime(0);
  };

  const getStartPauseButtonLabel = () => {
    if (isRunning) return <PauseIcon width="25px" style={{ verticalAlign: '-6px' }} />;
    if (isPaused) return <PlayIcon width="25px" style={{ verticalAlign: '-6px' }} />;
    return <PlayIcon width="25px" style={{ verticalAlign: '-6px' }} />;
  };

  const changedState = () => {
    setCanStart(false);
    setStartButtonTooltip('Bestehende Änderungen müssen erst übernommen werden.');
  }

  const handleNewRound = () => {
    if (mode !== MODES.CHRONOGRAPH) return;

    const newNr = c_rounds.length > 0 ? c_rounds[c_rounds.length - 1].nr + 1 : 1;

    const now = new Date().toLocaleString('sv-SE', {
      timeZone: 'Europe/Berlin',
      hour12: false
    }).replace(',', '');
    const currentTotal = elapsedFocusTime;

    const lastTotal = c_rounds.length > 0 ? c_rounds[c_rounds.length - 1].total : 0;
    const roundLength = currentTotal - lastTotal;

    const newRound = {
      nr: newNr,
      createdAt: now,
      length: roundLength,
      total: currentTotal,
      comment: roundComment
    };

    setCRounds(prevRounds => [...prevRounds, newRound]);

    setRoundComment('');
    setSaveFeedback(`Runde ${newNr} hinzugefügt!`);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleAddComment = () => {
    setSaveFeedback('Kommentar hinzugefügt.');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const startEditingComment = (runde) => {
    setEditingRoundNr(runde.nr);
    setEditingComment(runde.comment);
  };

  const saveEditedComment = (rundeNr) => {
    setCRounds(prevRounds =>
      prevRounds.map(runde =>
        runde.nr === rundeNr ? { ...runde, comment: editingComment } : runde
      )
    );
    setEditingRoundNr(null);
    setEditingComment('');
    setSaveFeedback(`Kommentar für Runde ${rundeNr} aktualisiert.`);
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const cancelEditing = () => {
    setEditingRoundNr(null);
    setEditingComment('');
  };

  const calculateProgress = () => {
    let totalDuration;
    if (mode === MODES.POMODORO) {
      totalDuration = isFocusPhase ? timeSettings.focus : timeSettings.pause;
    } else if (mode === MODES.PING) {
      totalDuration = timeSettings.interval;
    } else if (mode === MODES.TIMER) {
      totalDuration = timeSettings.duration;
    }

    if (mode === MODES.PING) {
      return 1 - ((totalDuration - timeLeft) / totalDuration);
    }

    return totalDuration ? (totalDuration - timeLeft) / totalDuration : 1;
  };

  const progress = useMemo(() => calculateProgress(), [timeLeft, mode, isFocusPhase, timeSettings]);


  return (
    <div className={isFullscreen ? 'fullscreen-mode' : ''}>
      {!isFullscreen && (
        <div>
          <h1> <TimerIcon1 width="1.2em" style={{ verticalAlign: '-.25em' }} /> Timer</h1>
          <div style={{ marginBottom: '10px' }}>
            <div className="tooltip" style={{ display: 'inline-block' }}>
              <label>
                Modus:
                <select
                  style={{ marginLeft: '10px' }}
                  value={mode}
                  onChange={(e) => {
                    const newMode = e.target.value;
                    if ((elapsedFocusTime > 0 || elapsedPauseTime > 0) && mode !== newMode) {
                      handleSave(mode);
                    }
                    handleReset();
                    setMode(newMode);
                  }}
                  disabled={isRunning}
                >
                  {Object.values(MODES).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              {isRunning && (
                <span className="tooltiptext">
                  Der Modus kann während eines laufenden Timers nicht geändert werden.
                </span>
              )}
            </div>
          </div>
          <div className='wrapper'>
            <div style={{ marginBottom: '10px' }}>
              <label>
                Kategorie:
                <select
                  style={{ marginLeft: '10px' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={isRunning}
                >
                  <option value="">Keine Kategorie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.slashPath}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {mode === MODES.POMODORO && (
            <>
              <div style={{ marginBottom: '10px' }}>
                <label>
                  Fokuszeit (hh:mm:ss):
                  <input
                    type="text"
                    className="html-duration-picker"
                    style={{ marginLeft: '10px' }}
                    placeholder="00:25:00"
                    value={focusInput}
                    disabled={isRunning}
                    onChange={(e) => {
                      changedState();
                      setFocusInput(e.target.value);
                    }}
                    data-duration="1500"
                  />
                </label>
                {errors.focus && (
                  <p style={{ color: 'red' }}>{errors.focus}</p>
                )}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>
                  Pausenzeit (hh:mm:ss):
                  <input
                    type="text"
                    className="html-duration-picker"
                    style={{ marginLeft: '10px' }}
                    placeholder="00:05:00"
                    value={pauseInput}
                    disabled={isRunning}
                    onChange={(e) => {
                      changedState();
                      setPauseInput(e.target.value);
                    }}
                    data-duration="300"
                  />
                </label>
                {errors.pause && (
                  <p style={{ color: 'red' }}>{errors.pause}</p>
                )}
              </div>
            </>
          )}

          {mode === MODES.PING && (
            <div style={{ marginBottom: '10px' }}>
              <label>
                Ping-Intervall (hh:mm:ss):
                <input
                  type="text"
                  className="html-duration-picker"
                  style={{ marginLeft: '10px' }}
                  placeholder="00:15:00"
                  value={pingInput}
                  disabled={isRunning}
                  onChange={(e) => {
                    changedState();
                    setPingInput(e.target.value);
                  }}
                  data-duration="900"
                />
              </label>
              {errors.interval && (
                <p style={{ color: 'red' }}>{errors.interval}</p>
              )}
            </div>
          )}

          {mode === MODES.TIMER && (
            <div style={{ marginBottom: '10px' }}>
              <label>
                Zeit (hh:mm:ss):
                <input
                  type="text"
                  className="html-duration-picker"
                  style={{ marginLeft: '10px' }}
                  placeholder="00:10:00"
                  value={timerInput}
                  disabled={isRunning}
                  onChange={(e) => {
                    changedState();
                    setTimerInput(e.target.value);
                  }}
                  data-duration="600"
                />
              </label>
              {errors.duration && (
                <p style={{ color: 'red' }}>{errors.duration}</p>
              )}
            </div>
          )}

          {mode !== MODES.CHRONOGRAPH && (
            <div className="tooltip applyButton">
              <button
                onClick={handleApply}
                disabled={isRunning}
                style={{ cursor: isRunning ? 'not-allowed' : 'pointer' }}
              >
                Übernehmen
              </button>
              {isRunning && (
                <span className="tooltiptext">
                  Änderungen sind während eines laufenden Timers nicht möglich.
                </span>
              )}
            </div>
          )}
          <br></br>
        </div>
      )}
      <div
        className='displayWrapper'
        style={{ fontSize: '1.5em' }}
      >
        <ProgressCircle
          progress={progress}
          size={circleSize}
          strokeWidth={10}
          color="#BB86FC"
        />
        <div
          className='timer-display'
          style={{ fontSize: '200%' }}
        >
          {formatTime(timeLeft)}
        </div>
      </div>

      {mode === MODES.POMODORO && (
        <div style={{ marginTop: '10px' }}>
          <p><strong>Runde:</strong> {round}</p>
          <p><strong>Status:</strong> {isFocusPhase ? 'Fokus' : 'Pause'}</p>
        </div>
      )}

      {mode === MODES.PING && (
        <div style={{ marginTop: '10px' }}>
          <p><strong>Pings bisher:</strong> {pingCount}</p>
        </div>
      )}

      <div
        className='buttonWrapper'
        style={{ marginTop: '20px' }}
      >
        <div className="tooltip">
          <button
            onClick={handleStartPauseResume}
            disabled={!canStart}
            style={{
              cursor: canStart ? 'pointer' : 'not-allowed',
            }}
          >
            {getStartPauseButtonLabel()}
          </button>
          {!canStart && (
            <span className="tooltiptext">
              {startButtonTooltip}
            </span>
          )}
        </div>

        <button onClick={handleReset} style={{ marginLeft: '10px' }}>
          Reset
        </button>

        <div className="tooltip" style={{ display: 'inline-block', marginLeft: '10px' }}>
          <button
            onClick={() => handleSave()}
            disabled={isRunning}
            style={{
              cursor: isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            <SaveIcon width='18px' style={{ verticalAlign: '-2.25px' }} /> Speichern
          </button>
          {isRunning && (
            <span className="tooltiptext">
              Speichern ist während eines laufenden Timers nicht möglich! Bitte pausiere den Timer zuerst.
            </span>
          )}
        </div>

        <button onClick={clearElapsedTimes} style={{ marginLeft: '10px' }}>
          Clear Session
        </button>
      </div>

      {mode === MODES.CHRONOGRAPH && (
        <div style={{ marginTop: '10px' }}>
          <div>
            <button onClick={handleNewRound}>Runde setzen</button>
            <input
              type="text"
              placeholder="Kommentar..."
              value={roundComment}
              onChange={(e) => setRoundComment(e.target.value)}
              style={{ marginLeft: '10px' }}
            />
          </div>
          <div style={{ marginTop: '10px' }}>
            <h3>Runden:</h3>
            {c_rounds.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '4px' }}>Nr.</th>
                    <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '4px' }}>Dauer</th>
                    <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '4px' }}>Total</th>
                    <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: '4px' }}>Kommentar</th>
                  </tr>
                </thead>
                <tbody>
                  {c_rounds.map((runde) => (
                    <tr key={runde.nr}>
                      <td style={{ padding: '4px' }}>{runde.nr}</td>
                      <td style={{ padding: '4px' }}>{formatTime(runde.length)}</td>
                      <td style={{ padding: '4px' }}>{formatTime(runde.total)}</td>
                      <td style={{ padding: '4px' }}>
                        {editingRoundNr === runde.nr ? (
                          <>
                            <input
                              type="text"
                              value={editingComment}
                              onChange={(e) => setEditingComment(e.target.value)}
                            />
                            <button onClick={() => saveEditedComment(runde.nr)}>✔️</button>
                            <button onClick={cancelEditing}>✖️</button>
                          </>
                        ) : (
                          <>
                            {runde.comment}
                          </>
                        )}
                      </td>
                      <td style={{ padding: '4px' }}>
                        {editingRoundNr !== runde.nr && (
                          <button onClick={() => startEditingComment(runde)}>...</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Keine Runden gesetzt.</p>
            )}
          </div>
        </div>
      )}

      {saveFeedback && <p style={{ marginTop: '10px' }}>{saveFeedback}</p>}
      {!isFullscreen && (
        <div style={{ marginTop: '20px', paddingTop: '10px' }}>
          <h3>Vergangene Zeit</h3>
          <p><strong>Fokuszeit:</strong> {formatTime(elapsedFocusTime)}</p>
          <p><strong>Pausenzeit:</strong> {formatTime(elapsedPauseTime)}</p>
        </div>
      )}
      <button
        className='buttonFS'
        style={{ marginLeft: '10px' }}
        onClick={() => {
          setIsFullscreen(!isFullscreen);
        }}
      >
        {isFullscreen ? <MinimizeIcon width="25px" style={{ verticalAlign: '-2.25px' }} /> : <MaximizeIcon width="25px" style={{ verticalAlign: '-2.25px' }} />}
      </button>
    </div>
  );
};
// Test
export default Timer;