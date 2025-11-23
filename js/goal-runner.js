// goal-runner.js
// Simple handler to start/stop a fitness goal from the dashboard.
(function(){
    const KEY_ACTIVE = 'activeFitnessGoal';
    const KEY_CONFIG = 'fitnessGoalConfig';

    function $(sel){ return document.querySelector(sel); }

    function loadActive(){ try { return JSON.parse(localStorage.getItem(KEY_ACTIVE) || 'null'); } catch(e){ return null; } }
    function saveActive(o){ localStorage.setItem(KEY_ACTIVE, JSON.stringify(o)); }
    function clearActive(){ localStorage.removeItem(KEY_ACTIVE); }

    function loadConfig(){ try { return JSON.parse(localStorage.getItem(KEY_CONFIG) || 'null'); } catch(e){ return null; } }
    function saveConfig(o){ localStorage.setItem(KEY_CONFIG, JSON.stringify(o)); }
    function clearConfig(){ localStorage.removeItem(KEY_CONFIG); }

    function formatSince(iso){
        if (!iso) return '';
        const started = new Date(iso);
        const diff = Math.floor((Date.now() - started) / 1000);
        const mins = Math.floor(diff/60);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins/60);
        return `${hrs}h ${mins % 60}m ago`;
    }

    function renderSummary(){
        const cfg = loadConfig();
        const el = $('#goalSummary');
        if (!el) return;
        if (!cfg) { el.textContent = 'No goal set'; return; }
        const label = cfg.type === 'distance' ? `${cfg.target} km` : cfg.type === 'duration' ? `${cfg.target} min` : `${cfg.target} kcal`;
        el.textContent = `Goal: ${cfg.type} — ${label}`;
    }

    function setActiveUI(activeObj){
        const btn = $('#startGoalBtn');
        const status = $('#goalSummary');
        if (!btn || !status) return;
        if (activeObj) {
            btn.classList.add('active');
            btn.textContent = 'Stop Goal';
            btn.setAttribute('aria-pressed','true');
            // also update summary to include running time
            const cfg = loadConfig();
            const basic = cfg ? `${cfg.type} ${cfg.target}` : 'Active goal';
            status.textContent = `Running: ${basic} — started ${formatSince(activeObj.start)}`;
        } else {
            btn.classList.remove('active');
            btn.textContent = 'Start Goal';
            btn.setAttribute('aria-pressed','false');
            renderSummary();
        }
    }

    function init(){
        const openBtn = $('#openGoalBtn');
        const form = $('#goalForm');
        const saveBtn = $('#saveGoalBtn');
        const cancelBtn = $('#cancelGoalBtn');
        const startBtn = $('#startGoalBtn');
        const cfg = loadConfig();

        // render initial summary
        renderSummary();

        // helper to update form class based on selected type for better color cues
        function updateGoalFormClass(type){
            const f = document.getElementById('goalForm');
            const open = document.getElementById('openGoalBtn');
            if (f) {
                f.classList.remove('goal-type-distance','goal-type-duration','goal-type-calories');
                if (type === 'distance') f.classList.add('goal-type-distance');
                else if (type === 'duration') f.classList.add('goal-type-duration');
                else if (type === 'calories') f.classList.add('goal-type-calories');
            }
            if (open) {
                // also add a direct class on the open button so it's visibly styled even when form is hidden
                open.classList.remove('goal-type-distance','goal-type-duration','goal-type-calories');
                if (type === 'distance') open.classList.add('goal-type-distance');
                else if (type === 'duration') open.classList.add('goal-type-duration');
                else if (type === 'calories') open.classList.add('goal-type-calories');
            }
        }

        // if the select exists, bind change to update colors immediately
        const typeSelect = document.getElementById('goalType');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e)=> updateGoalFormClass(e.target.value));
            // set initial class based on current value or saved config
            const initialType = (cfg && cfg.type) ? cfg.type : typeSelect.value;
            updateGoalFormClass(initialType);
            // if a saved config exists, set the select value so the UI matches
            if (cfg && cfg.type) typeSelect.value = cfg.type;
        }

        if (openBtn && form) {
            openBtn.addEventListener('click', ()=>{
                form.classList.toggle('hidden');
            });
        }

        if (cancelBtn && form) {
            cancelBtn.addEventListener('click', ()=>{ form.classList.add('hidden'); });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', ()=>{
                const type = document.getElementById('goalType').value;
                const target = Number(document.getElementById('goalTarget').value);
                if (!target || target <= 0) {
                    alert('Please enter a valid target');
                    return;
                }
                const newCfg = { type, target };
                saveConfig(newCfg);
                // update visual type after saving
                updateGoalFormClass(type);
                renderSummary();
                if (form) form.classList.add('hidden');
            });
        }

        if (startBtn) {
            startBtn.addEventListener('click', ()=>{
                const active = loadActive();
                if (active) {
                    clearActive();
                    setActiveUI(null);
                    const s = $('#goalSummary'); if (s) s.textContent = 'Goal stopped';
                    setTimeout(()=> renderSummary(), 1400);
                } else {
                    const config = loadConfig();
                    if (!config) { alert('Please set a goal first'); return; }
                    const newActive = { start: new Date().toISOString(), config };
                    saveActive(newActive);
                    setActiveUI(newActive);
                }
            });
        }

        // wire existing saved active state
        const existing = loadActive();
        setActiveUI(existing);

        setInterval(()=>{ const cur = loadActive(); if (cur) setActiveUI(cur); }, 60*1000);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
