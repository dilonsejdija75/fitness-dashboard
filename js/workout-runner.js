// workout-runner.js
// Handles start/stop workout timer and renders recent sessions with persistence and controls.
(function(){
    const SELECTORS = {
        startBtn: '.start-workout-btn',
        workoutStats: '.workout-stats',
        sessionsList: '.sessions-list',
        clearBtn: '.clear-sessions-btn'
    };

    function $(sel){ return document.querySelector(sel); }

    function formatTime(s) {
        const hrs = Math.floor(s / 3600);
        const mins = Math.floor((s % 3600) / 60);
        const secs = s % 60;
        if (hrs > 0) return `${String(hrs).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    }

    function loadSessions(){
        try { return JSON.parse(localStorage.getItem('workoutSessions')||'[]'); } catch(e){ return []; }
    }

    function saveSession(session){
        const sessions = loadSessions();
        sessions.unshift(session); // newest first
        // keep last 50
        localStorage.setItem('workoutSessions', JSON.stringify(sessions.slice(0,50)));
    }

    function deleteSessionByStart(startIso){
        const sessions = loadSessions().filter(s => s.start !== startIso);
        localStorage.setItem('workoutSessions', JSON.stringify(sessions));
        renderSessions();
    }

    function clearSessions(){
        localStorage.removeItem('workoutSessions');
        renderSessions();
    }

    function renderSessions(){
        const container = $(SELECTORS.sessionsList);
        if (!container) return;
        const sessions = loadSessions();
        if (sessions.length === 0) {
            container.innerHTML = '<div class="no-sessions">No recent sessions</div>';
            return;
        }
        container.innerHTML = sessions.map(s => {
            const d = new Date(s.start);
            const ts = d.toLocaleString();
            const dur = formatTime(s.durationSeconds);
            return `
                <div class="session-item" data-start="${s.start}">
                    <div class="session-meta">
                        <div class="session-time">${ts}</div>
                        <div class="session-duration">${dur}</div>
                    </div>
                    <button class="delete-session" data-start="${s.start}" aria-label="Delete session">&times;</button>
                </div>
            `;
        }).join('\n');

        // delegate delete clicks
        container.querySelectorAll('.delete-session').forEach(btn => {
            btn.addEventListener('click', (e)=>{
                const start = btn.getAttribute('data-start');
                deleteSessionByStart(start);
            });
        });
    }

    // runner logic with persistence of active session
    function initRunner(){
        const btn = document.querySelector(SELECTORS.startBtn);
        if (!btn) return;
        const clearBtn = document.querySelector(SELECTORS.clearBtn);
        if (clearBtn) clearBtn.addEventListener('click', clearSessions);

        let timerEl = null;
        let intervalId = null;
        let startTs = null;
        let elapsed = 0;

        function createTimerElement(){
            timerEl = document.createElement('div');
            timerEl.className = 'workout-timer';
            timerEl.textContent = formatTime(0);
            btn.parentNode.insertBefore(timerEl, btn);
        }

        function setRunningUI(){
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop Workout';
            btn.classList.add('active');
            btn.setAttribute('aria-pressed','true');
        }

        function setIdleUI(){
            btn.innerHTML = '<i class="fas fa-play"></i> Start Workout';
            btn.classList.remove('active');
            btn.removeAttribute('aria-pressed');
        }

        function startWorkout(resumeFrom){
            if (!timerEl) createTimerElement();
            if (resumeFrom) {
                startTs = resumeFrom;
            } else {
                startTs = Date.now();
                // persist active session
                localStorage.setItem('activeWorkout', JSON.stringify({ start: startTs }));
            }
            intervalId = setInterval(()=>{
                elapsed = Math.floor((Date.now() - startTs) / 1000);
                timerEl.textContent = formatTime(elapsed);
            }, 500);
            setRunningUI();
        }

        function stopWorkout(){
            clearInterval(intervalId);
            intervalId = null;
            const duration = elapsed;
            const session = {
                start: new Date(startTs).toISOString(),
                durationSeconds: duration
            };
            saveSession(session);
            // clear persisted active session
            localStorage.removeItem('activeWorkout');
            renderSessions();

            setIdleUI();

            if (timerEl) {
                timerEl.parentNode.removeChild(timerEl);
                timerEl = null;
            }
            elapsed = 0;

            // announce to screen readers via aria-live region if present
            const notifier = document.getElementById('aria-notify');
            const message = `Workout saved — ${Math.floor(duration/60)}m ${duration%60}s`;
            if (notifier) {
                notifier.textContent = message;
            } else {
                const note = document.createElement('div');
                note.className = 'notify-note';
                note.textContent = message;
                btn.parentNode.appendChild(note);
                setTimeout(()=> note.remove(), 3000);
            }
        }

        // resume active session if present
        try {
            const active = JSON.parse(localStorage.getItem('activeWorkout') || 'null');
            if (active && active.start) {
                startWorkout(active.start);
            }
        } catch(e) {}

        btn.addEventListener('click', function(){
            if (!intervalId) startWorkout(); else stopWorkout();
        });
    }

    // init on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ()=>{ initRunner(); renderSessions(); });
    } else {
        initRunner(); renderSessions();
    }

    // expose for debug
    window.__fitness = window.__fitness || {};
    window.__fitness.loadSessions = loadSessions;
    window.__fitness.clearSessions = clearSessions;
})();
