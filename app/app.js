/* ============================================================
   app.js — Fitness Tracker logic.
   Modules:
     DB        – Supabase wrapper + offline cache
     Profile   – user profile (age/sex/weight/start date)
     Template  – workout-plan template (loaded from template.json)
     Pct       – percentile lookup + score interpolation
     Calendar  – month grid + day status (complete/missed/today)
     Workout   – workout entry screen, timer, save
     Summary   – post-workout growth analysis
     Insights  – charts of weight/time trends
     Stats     – overall 99 score + percentile rings
     Settings  – profile editor
     App       – top-level navigation + boot
   ============================================================ */


/* -------- Tiny helpers -------- */
const $ = (id) => document.getElementById(id);
const fmtSec = (s) => {
    if (s == null || isNaN(s)) return "--:--";
    s = Math.max(0, Math.round(s));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
};
const fmtDate = (d) => d.toISOString().slice(0, 10);
const parseDate = (s) => {
    if (s instanceof Date) return s;
    const [y, m, dd] = s.split("-").map(Number);
    return new Date(y, m - 1, dd);
};
const dayName = (d) => ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d.getDay()];
const todayLocal = () => { const n = new Date(); n.setHours(0,0,0,0); return n; };

function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}


/* ============================================================
   DB — Supabase wrapper. Falls back to localStorage if not configured
   (so the app at least demos locally on first load).
   ============================================================ */
const DB = (() => {
    let sb = null;
    let online = false;

    function init() {
        const url = window.APP_CONFIG?.SUPABASE_URL;
        const key = window.APP_CONFIG?.SUPABASE_ANON_KEY;
        if (url && key && !url.includes("YOUR-PROJECT")) {
            sb = window.supabase.createClient(url, key);
            online = true;
            console.log("Supabase connected");
        } else {
            console.warn("Supabase not configured — using localStorage fallback");
            online = false;
        }
    }

    // Local fallback uses a single JSON blob in localStorage.
    function _local() {
        const raw = localStorage.getItem("fitnessLocal");
        return raw ? JSON.parse(raw) : { profile: null, sessions: [], logs: [] };
    }
    function _saveLocal(state) {
        localStorage.setItem("fitnessLocal", JSON.stringify(state));
    }

    async function getProfile() {
        if (online) {
            const { data, error } = await sb.from("profile").select("*").eq("id", 1).maybeSingle();
            if (error) console.error(error);
            return data;
        }
        return _local().profile;
    }
    async function saveProfile(p) {
        p.id = 1; p.updated_at = new Date().toISOString();
        if (online) {
            const { error } = await sb.from("profile").upsert(p);
            if (error) { console.error(error); throw error; }
            return;
        }
        const s = _local(); s.profile = p; _saveLocal(s);
    }
    async function getSessions(fromDate = null, toDate = null) {
        if (online) {
            let q = sb.from("session").select("*").order("session_date", { ascending: false });
            if (fromDate) q = q.gte("session_date", fromDate);
            if (toDate)   q = q.lte("session_date", toDate);
            const { data, error } = await q;
            if (error) console.error(error);
            return data || [];
        }
        let s = _local().sessions.slice();
        if (fromDate) s = s.filter(x => x.session_date >= fromDate);
        if (toDate)   s = s.filter(x => x.session_date <= toDate);
        return s.sort((a, b) => b.session_date.localeCompare(a.session_date));
    }
    async function saveSession(sess) {
        if (online) {
            const { data, error } = await sb.from("session").upsert(sess).select().single();
            if (error) { console.error(error); throw error; }
            return data;
        }
        const s = _local();
        if (!sess.id) sess.id = crypto.randomUUID();
        const i = s.sessions.findIndex(x => x.id === sess.id);
        if (i >= 0) s.sessions[i] = sess; else s.sessions.push(sess);
        _saveLocal(s);
        return sess;
    }
    async function getLogs(sessionId = null, exerciseName = null) {
        if (online) {
            let q = sb.from("exercise_log").select("*");
            if (sessionId)    q = q.eq("session_id", sessionId);
            if (exerciseName) q = q.eq("exercise_name", exerciseName);
            const { data, error } = await q.order("created_at", { ascending: true });
            if (error) console.error(error);
            return data || [];
        }
        let s = _local().logs.slice();
        if (sessionId)    s = s.filter(x => x.session_id === sessionId);
        if (exerciseName) s = s.filter(x => x.exercise_name === exerciseName);
        return s;
    }
    async function saveLogs(logs) {
        if (online) {
            const { error } = await sb.from("exercise_log").insert(logs);
            if (error) { console.error(error); throw error; }
            return;
        }
        const s = _local();
        for (const l of logs) {
            if (!l.id) l.id = crypto.randomUUID();
            if (!l.created_at) l.created_at = new Date().toISOString();
            s.logs.push(l);
        }
        _saveLocal(s);
    }
    async function deleteSessionLogs(sessionId) {
        if (online) {
            const { error } = await sb.from("exercise_log").delete().eq("session_id", sessionId);
            if (error) console.error(error);
            return;
        }
        const s = _local();
        s.logs = s.logs.filter(x => x.session_id !== sessionId);
        _saveLocal(s);
    }

    return { init, getProfile, saveProfile, getSessions, saveSession, getLogs, saveLogs, deleteSessionLogs,
             isOnline: () => online };
})();


/* ============================================================
   Profile — cached user profile.
   ============================================================ */
const Profile = (() => {
    let p = null;
    async function load() { p = await DB.getProfile(); return p; }
    function get() { return p; }
    function set(np) { p = np; }
    function ageBracket() {
        if (!p) return "24-39";
        const a = +p.age;
        if (a <= 23) return "18-23";
        if (a <= 39) return "24-39";
        if (a <= 49) return "40-49";
        if (a <= 59) return "50-59";
        return "60+";
    }
    return { load, get, set, ageBracket };
})();


/* ============================================================
   Template — loads the workout plan from template.json.
   Computes which week+day a given date falls on.
   ============================================================ */
const Template = (() => {
    let tpl = null;
    async function load() {
        const r = await fetch("template.json");
        tpl = await r.json();
        return tpl;
    }
    function get() { return tpl; }
    function dayForDate(date) {
        const name = dayName(date);
        const block = tpl.schedule[name];
        if (!block) return { name, isRest: true };
        return { name, isRest: false, ...block };
    }
    function weekNumber(date, startDate) {
        // Anchor weeks to the Monday of the program-start week so that each
        // Mon-Sun block is its own week. If program_start is a Tuesday,
        // the previous Monday is treated as Week 1 Monday (skipped per user).
        const start = parseDate(startDate);
        const startMonday = new Date(start);
        const dow = start.getDay();              // 0=Sun..6=Sat
        const back = dow === 0 ? 6 : dow - 1;    // days to go back to Monday
        startMonday.setDate(start.getDate() - back);
        const diffDays = Math.floor((date - startMonday) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 0;
        return Math.floor(diffDays / 7) + 1;
    }
    return { load, get, dayForDate, weekNumber };
})();


/* ============================================================
   Pct — percentile lookup + scoring.
   ============================================================ */
const Pct = (() => {
    let data = null;

    async function load() {
        const r = await fetch("percentiles.json");
        data = await r.json();
        return data;
    }

    /**
     * Given a list of (percentile, value) anchor points (sorted ascending by percentile)
     * and a `value`, find the percentile via linear interpolation.
     * If higher_is_better=true: a larger value -> larger percentile.
     * If higher_is_better=false (run times): a smaller value -> larger percentile.
     * Returns a percentile clamped 1..99.
     */
    function interp(anchors, value, higherIsBetter) {
        if (!anchors || !anchors.length || value == null) return null;
        // Sort by ascending percentile -> [(p, v), ...]
        const A = anchors.slice().sort((a, b) => a[0] - b[0]);
        if (higherIsBetter) {
            // Higher v = higher percentile.
            if (value <= A[0][1]) return Math.max(1, Math.round(A[0][0] * value / A[0][1]));
            if (value >= A[A.length - 1][1]) return 99;
            for (let i = 0; i < A.length - 1; i++) {
                if (value >= A[i][1] && value <= A[i + 1][1]) {
                    const t = (value - A[i][1]) / (A[i + 1][1] - A[i][1]);
                    return Math.round(A[i][0] + t * (A[i + 1][0] - A[i][0]));
                }
            }
        } else {
            // Lower v = higher percentile (e.g., run times).
            // As p increases, v decreases.
            if (value >= A[0][1]) return Math.max(1, Math.round(A[0][0] * A[0][1] / value));
            if (value <= A[A.length - 1][1]) return 99;
            for (let i = 0; i < A.length - 1; i++) {
                if (value <= A[i][1] && value >= A[i + 1][1]) {
                    const t = (A[i][1] - value) / (A[i][1] - A[i + 1][1]);
                    return Math.round(A[i][0] + t * (A[i + 1][0] - A[i][0]));
                }
            }
        }
        return 50;
    }

    /**
     * Score a lift: given exercise, top-set weight (lbs), bodyweight.
     * Returns 0..99 percentile-style score, or null if not scoreable.
     */
    function scoreLift(exerciseName, topSetLbs, bodyweight) {
        if (!data || !topSetLbs || !bodyweight) return null;
        const m = data.exercise_map[exerciseName];
        if (!m || !m.anchor) return null;
        const sex = Profile.get()?.sex || "male";
        const bracket = Profile.ageBracket();
        const anchors = data.strength?.[sex]?.[bracket]?.[m.anchor];
        if (!anchors) return null;
        // Total weight moved: dumbbell exercises pair both DBs.
        const totalWeight = m.is_dumbbell_pair ? topSetLbs * 2 : topSetLbs;
        const rawRatio = totalWeight / bodyweight;
        // Normalize against the anchor lift's expected ratio.
        const normalized = rawRatio / m.effort;
        return interp(anchors, normalized, true);
    }

    /** Score a run: distance miles + total seconds. Returns {endurance, speed} or null. */
    function scoreRun(miles, seconds) {
        if (!data || !miles || !seconds) return null;
        const sex = Profile.get()?.sex || "male";
        const bracket = Profile.ageBracket();
        const pacePerMile = seconds / miles;
        // Equivalent 1-mile time = pace * 1.
        const eq1mile = pacePerMile;
        // Equivalent 1.5-mile time = pace * 1.5.
        const eq15 = pacePerMile * 1.5;
        const speed = interp(data.run_1mile_seconds?.[sex]?.[bracket], eq1mile, false);
        const endurance = interp(data.run_15mile_seconds?.[sex]?.[bracket], eq15, false);
        return { speed, endurance };
    }

    function getMap() { return data?.exercise_map || {}; }

    return { load, scoreLift, scoreRun, getMap };
})();


/* ============================================================
   App — top-level controller.
   ============================================================ */
const App = (() => {
    function navTab(tab) {
        document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        const scr = $(`screen-${tab}`);
        if (scr) scr.classList.add("active");
        const tabBtn = document.querySelector(`.tab[data-tab="${tab}"]`);
        if (tabBtn) tabBtn.classList.add("active");

        $("backBtn").style.display = "none";
        $("screenTitle").textContent =
            { home: "Fitness Tracker", calendar: "Calendar", insights: "Insights",
              stats: "Stats", settings: "Settings", workout: "Workout", summary: "Summary"
            }[tab] || "Fitness Tracker";

        if (tab === "calendar") Calendar.render();
        if (tab === "insights") Insights.render();
        if (tab === "stats") Stats.render();
        if (tab === "settings") Settings.populate();
        if (tab === "home") refreshHome();
        window.scrollTo(0, 0);
    }

    async function refreshHome() {
        const p = Profile.get();
        if (!p) {
            $("todayDescription").textContent = "Set up your profile to begin →";
            $("todayBanner").innerHTML = '<div class="info-banner">Tap Settings (bottom-right) to enter your age, sex, and bodyweight.</div>';
            return;
        }
        $("todayBanner").innerHTML = "";
        const today = todayLocal();
        const d = Template.dayForDate(today);
        const wk = Template.weekNumber(today, p.program_start);
        if (d.isRest) {
            $("todayDescription").textContent = `${d.name} • Week ${wk} • Rest day`;
        } else {
            $("todayDescription").textContent = `${d.name} • Week ${wk} • ${d.muscle_group}`;
        }
    }

    async function startTodayWorkout() {
        const p = Profile.get();
        if (!p) { toast("Set your profile first"); navTab("settings"); return; }
        const today = todayLocal();
        await Workout.openFor(today);
    }

    async function boot() {
        DB.init();
        await Template.load();
        await Pct.load();
        await Profile.load();
        if (!Profile.get()) {
            // Pre-fill setStart with today
            $("setStart").value = fmtDate(todayLocal());
            navTab("settings");
            toast("Welcome — set your profile to begin");
        } else {
            navTab("home");
        }
    }

    return { boot, navTab, startTodayWorkout, refreshHome };
})();


/* ============================================================
   Settings — profile form.
   ============================================================ */
const Settings = (() => {
    function populate() {
        const p = Profile.get();
        if (!p) return;
        $("setSex").value = p.sex;
        $("setAge").value = p.age;
        $("setWeight").value = p.bodyweight_lbs;
        $("setHeight").value = p.height_in || "";
        $("setStart").value = p.program_start;
    }
    async function save() {
        const p = {
            sex: $("setSex").value,
            age: +$("setAge").value,
            bodyweight_lbs: +$("setWeight").value,
            height_in: $("setHeight").value ? +$("setHeight").value : null,
            program_start: $("setStart").value,
        };
        if (!p.age || !p.bodyweight_lbs || !p.program_start) {
            toast("Please fill all required fields"); return;
        }
        try {
            await DB.saveProfile(p);
            Profile.set(p);
            toast("Profile saved");
            App.navTab("home");
        } catch (e) {
            toast("Save failed: check Supabase config");
        }
    }
    return { populate, save };
})();


/* ============================================================
   Calendar — month grid colored by status.
   ============================================================ */
const Calendar = (() => {
    let cursor = todayLocal();
    let sessionsByDate = {};

    async function _loadSessions() {
        const sessions = await DB.getSessions();
        sessionsByDate = {};
        for (const s of sessions) sessionsByDate[s.session_date] = s;
    }

    async function render() {
        await _loadSessions();
        const p = Profile.get();
        const startDate = p ? parseDate(p.program_start) : todayLocal();
        const today = todayLocal();

        const year = cursor.getFullYear();
        const month = cursor.getMonth();
        $("calMonthLabel").textContent = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

        // DOW row
        const dowRow = $("calDowRow");
        dowRow.innerHTML = "";
        ["S","M","T","W","T","F","S"].forEach(d => {
            const el = document.createElement("div");
            el.className = "cal-dow";
            el.textContent = d;
            dowRow.appendChild(el);
        });

        // Grid
        const grid = $("calGrid");
        grid.innerHTML = "";
        const first = new Date(year, month, 1);
        const startDay = first.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Leading blanks
        for (let i = 0; i < startDay; i++) {
            const el = document.createElement("div");
            el.className = "cal-cell empty";
            grid.appendChild(el);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dStr = fmtDate(date);
            const cell = document.createElement("div");
            cell.className = "cal-cell";
            cell.textContent = day;

            const isFuture = date > today;
            const isToday  = date.getTime() === today.getTime();
            const beforeStart = date < startDate;
            const tplDay = Template.dayForDate(date);
            const isRest = tplDay.isRest;
            const session = sessionsByDate[dStr];

            if (beforeStart) {
                cell.classList.add("outside");
            } else if (isRest) {
                cell.classList.add("rest");
                cell.title = "Rest day";
            } else if (session && session.completed) {
                cell.classList.add("complete");
                if (isToday) cell.classList.add("today");
            } else if (isToday) {
                cell.classList.add("today");
            } else if (isFuture) {
                cell.classList.add("future");
            } else {
                // Past workout day with no session = missed
                cell.classList.add("missed");
            }

            cell.onclick = () => {
                if (beforeStart || isRest) return;
                Workout.openFor(date);
            };
            grid.appendChild(cell);
        }
    }

    function prev() { cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1); render(); }
    function next() { cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1); render(); }

    return { render, prev, next };
})();


/* ============================================================
   Workout — entry screen + timer.
   ============================================================ */
const Workout = (() => {
    let current = null;        // { date, dayInfo, weekNum, inputs: {...} }
    let timers = {};           // exerciseName -> { startedAt, elapsedSec, running }

    async function openFor(date) {
        const p = Profile.get();
        if (!p) { toast("Set your profile first"); App.navTab("settings"); return; }
        const d = Template.dayForDate(date);
        if (d.isRest) { toast(`${d.name} is a rest day`); return; }
        const weekNum = Template.weekNumber(date, p.program_start);
        current = { date, dayInfo: d, weekNum, inputs: {} };
        timers = {};
        render();
        App.navTab("workout");
    }

    function render() {
        if (!current) return;
        const { date, dayInfo, weekNum } = current;
        $("workoutTitle").textContent = `${dayInfo.name} — Week ${weekNum}`;
        $("workoutSubtitle").textContent =
            `${date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} • ${dayInfo.muscle_group}`;

        const list = $("exerciseList");
        list.innerHTML = "";

        for (const ex of dayInfo.exercises) {
            const card = document.createElement("div");
            card.className = "exercise-card";

            const head = document.createElement("div");
            head.className = "ex-name";
            head.innerHTML = `<span>${ex.name}</span>`;
            const meta = document.createElement("span");
            meta.className = "ex-meta";
            if (ex.kind === "lift")  meta.textContent = `${ex.sets} × ${ex.reps}`;
            if (ex.kind === "timed") meta.textContent = `${ex.sets} × ${ex.target_seconds}s`;
            if (ex.kind === "run")   meta.textContent = `${ex.target_miles} mi target`;
            head.appendChild(meta);
            card.appendChild(head);

            if (ex.kind === "lift") {
                for (let i = 1; i <= ex.sets; i++) {
                    const row = document.createElement("div");
                    row.className = "set-row";
                    row.innerHTML = `
                        <div class="set-label">Set ${i}</div>
                        <input type="number" inputmode="decimal" placeholder="Weight (lbs)" id="lift_${ex.name}_${i}_w" step="0.5">
                        <input type="number" inputmode="numeric"  placeholder="Reps (${ex.reps})" id="lift_${ex.name}_${i}_r">
                    `;
                    card.appendChild(row);
                }
            } else if (ex.kind === "timed") {
                const row = document.createElement("div");
                row.className = "set-row";
                row.innerHTML = `
                    <div class="set-label">Done</div>
                    <input type="number" inputmode="numeric" placeholder="Sets done (e.g. 3)" id="timed_${ex.name}_sets">
                    <input type="number" inputmode="numeric" placeholder="Sec per set (${ex.target_seconds})" id="timed_${ex.name}_sec">
                `;
                card.appendChild(row);
            } else if (ex.kind === "run") {
                const tid = `run_${ex.name}`;
                const block = document.createElement("div");
                block.innerHTML = `
                    <div class="timer-display" id="${tid}_disp">00:00</div>
                    <div class="timer-pace" id="${tid}_pace">Tap Start when you begin the run</div>
                    <div class="timer-controls">
                        <button class="btn primary" id="${tid}_start" onclick="Workout.timerStart('${ex.name}')">Start</button>
                        <button class="btn warn"    id="${tid}_stop"  onclick="Workout.timerStop('${ex.name}')" disabled>Stop</button>
                    </div>
                    <div style="height:10px;"></div>
                    <div class="set-row">
                        <div class="set-label">Or</div>
                        <input type="number" inputmode="decimal" placeholder="Miles (${ex.target_miles})" id="${tid}_miles" step="0.01">
                        <input type="text"   inputmode="numeric" placeholder="Time mm:ss" id="${tid}_time">
                    </div>
                `;
                card.appendChild(block);
                timers[ex.name] = { startedAt: null, elapsedSec: 0, running: false, miles: ex.target_miles };
            }
            list.appendChild(card);
        }
    }

    function timerStart(exName) {
        const t = timers[exName];
        if (!t || t.running) return;
        t.running = true;
        t.startedAt = Date.now() - t.elapsedSec * 1000;
        $(`run_${exName}_start`).disabled = true;
        $(`run_${exName}_stop`).disabled = false;
        _tick(exName);
    }

    function timerStop(exName) {
        const t = timers[exName];
        if (!t) return;
        t.running = false;
        t.elapsedSec = (Date.now() - t.startedAt) / 1000;
        $(`run_${exName}_start`).disabled = false;
        $(`run_${exName}_stop`).disabled = true;
        // Auto-fill the time field as mm:ss so user can adjust miles if they ran a different distance.
        const sec = Math.round(t.elapsedSec);
        const mm = Math.floor(sec/60), ss = sec%60;
        $(`run_${exName}_time`).value = `${mm}:${String(ss).padStart(2,"0")}`;
        if (!$(`run_${exName}_miles`).value) $(`run_${exName}_miles`).value = t.miles;
    }

    function _tick(exName) {
        const t = timers[exName];
        if (!t || !t.running) return;
        const elapsed = (Date.now() - t.startedAt) / 1000;
        const sec = Math.round(elapsed);
        const mm = Math.floor(sec/60), ss = sec%60;
        $(`run_${exName}_disp`).textContent = `${String(mm).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
        const miles = +($(`run_${exName}_miles`).value || t.miles);
        if (miles > 0) {
            const pace = elapsed / miles;
            $(`run_${exName}_pace`).textContent = `Pace: ${fmtSec(pace)} / mile`;
        }
        requestAnimationFrame(() => _tick(exName));
    }

    function _parseTime(str) {
        if (!str) return null;
        if (str.includes(":")) {
            const [m, s] = str.split(":").map(Number);
            return m * 60 + (s || 0);
        }
        return +str * 60;  // bare number = minutes
    }

    async function save() {
        if (!current) return;
        const p = Profile.get();
        const { date, dayInfo, weekNum } = current;
        const logs = [];

        for (const ex of dayInfo.exercises) {
            if (ex.kind === "lift") {
                for (let i = 1; i <= ex.sets; i++) {
                    const w = +($(`lift_${ex.name}_${i}_w`).value || 0);
                    const r = +($(`lift_${ex.name}_${i}_r`).value || 0);
                    if (w > 0) {
                        logs.push({
                            exercise_name: ex.name,
                            exercise_kind: "lift",
                            set_number: i,
                            weight_lbs: w,
                            reps_completed: r || ex.reps,
                            bodyweight_lbs: p.bodyweight_lbs,
                        });
                    }
                }
            } else if (ex.kind === "timed") {
                const sets = +($(`timed_${ex.name}_sets`).value || 0);
                const sec = +($(`timed_${ex.name}_sec`).value || 0);
                if (sets > 0) {
                    logs.push({
                        exercise_name: ex.name,
                        exercise_kind: "timed",
                        set_number: sets,
                        seconds: sec || ex.target_seconds,
                        bodyweight_lbs: p.bodyweight_lbs,
                    });
                }
            } else if (ex.kind === "run") {
                const t = timers[ex.name];
                let sec = (t && t.elapsedSec) ? t.elapsedSec : _parseTime($(`run_${ex.name}_time`).value);
                const miles = +($(`run_${ex.name}_miles`).value || 0) || (t ? t.miles : 0);
                if (miles > 0 && sec > 0) {
                    logs.push({
                        exercise_name: ex.name,
                        exercise_kind: "run",
                        miles: miles,
                        seconds: sec,
                        bodyweight_lbs: p.bodyweight_lbs,
                    });
                }
            }
        }

        if (logs.length === 0) { toast("Log at least one set before saving"); return; }

        // Save / upsert session, then logs (replace any existing logs for that session).
        let session = (await DB.getSessions(fmtDate(date), fmtDate(date)))[0];
        const sessRow = {
            id: session?.id,
            session_date: fmtDate(date),
            day_of_week: dayInfo.name,
            week_number: weekNum,
            day_type: dayInfo.day_type,
            muscle_group: dayInfo.muscle_group,
            completed: true,
        };
        const saved = await DB.saveSession(sessRow);
        await DB.deleteSessionLogs(saved.id);
        for (const l of logs) l.session_id = saved.id;
        await DB.saveLogs(logs);

        toast("Workout saved");
        await Summary.showFor(saved, logs);
    }

    return { openFor, render, save, timerStart, timerStop };
})();


/* ============================================================
   Summary — growth analysis vs previous same workout.
   ============================================================ */
const Summary = (() => {
    async function showFor(session, logs) {
        $("summaryHeader").textContent =
            `${session.day_of_week} • Week ${session.week_number} • ${session.muscle_group}`;
        const body = $("summaryBody");
        body.innerHTML = "";

        // For each exercise in this session, find the previous logged version (any past date).
        const exNames = [...new Set(logs.map(l => l.exercise_name))];
        const prevSessions = await DB.getSessions(null, session.session_date);
        // Exclude current session.
        const otherSessions = prevSessions.filter(s => s.id !== session.id);
        // Build lookups of historical logs by exercise.
        const byExercise = {};
        for (const sess of otherSessions) {
            const sLogs = await DB.getLogs(sess.id);
            for (const l of sLogs) {
                if (!byExercise[l.exercise_name]) byExercise[l.exercise_name] = [];
                byExercise[l.exercise_name].push({ ...l, session_date: sess.session_date });
            }
        }

        for (const exName of exNames) {
            const curLogs = logs.filter(l => l.exercise_name === exName);
            const prior = (byExercise[exName] || []).sort((a,b) => b.session_date.localeCompare(a.session_date));
            const block = document.createElement("div");
            block.className = "summary-block";

            const kind = curLogs[0].exercise_kind;
            let line = `<div class="ex">${exName}</div>`;

            if (kind === "lift") {
                const curTop = Math.max(...curLogs.map(l => +l.weight_lbs || 0));
                const curVol = curLogs.reduce((a,l) => a + (+l.weight_lbs||0)*(+l.reps_completed||0), 0);
                if (prior.length) {
                    const lastSessId = prior[0].session_id;
                    const lastLogs = prior.filter(l => l.session_id === lastSessId);
                    const lastTop = Math.max(...lastLogs.map(l => +l.weight_lbs || 0));
                    const lastVol = lastLogs.reduce((a,l) => a + (+l.weight_lbs||0)*(+l.reps_completed||0), 0);
                    const dTop = curTop - lastTop;
                    const dVol = curVol - lastVol;
                    const cls = dTop > 0 ? "up" : dTop < 0 ? "down" : "";
                    line += `<div class="delta ${cls}">Top set: ${curTop} lbs (${dTop>=0?"+":""}${dTop.toFixed(1)} vs last)</div>`;
                    const volCls = dVol > 0 ? "up" : dVol < 0 ? "down" : "";
                    line += `<div class="delta ${volCls}">Volume: ${curVol.toFixed(0)} lb·reps (${dVol>=0?"+":""}${dVol.toFixed(0)})</div>`;
                } else {
                    line += `<div class="delta">Top set: ${curTop} lbs (first time logged — baseline set)</div>`;
                }
            } else if (kind === "run") {
                const cur = curLogs[0];
                const curPace = cur.seconds / cur.miles;
                const last = prior[0];
                if (last) {
                    const lastPace = last.seconds / last.miles;
                    const dPace = curPace - lastPace;
                    const cls = dPace < 0 ? "up" : dPace > 0 ? "down" : "";
                    line += `<div class="delta ${cls}">Pace: ${fmtSec(curPace)} / mi (${dPace<=0?"":"+"}${fmtSec(Math.abs(dPace))} vs last)</div>`;
                    line += `<div class="delta">Distance: ${(+cur.miles).toFixed(2)} mi in ${fmtSec(cur.seconds)}</div>`;
                } else {
                    line += `<div class="delta">${(+cur.miles).toFixed(2)} mi in ${fmtSec(cur.seconds)} — baseline set</div>`;
                }
            } else if (kind === "timed") {
                const cur = curLogs[0];
                const last = prior[0];
                line += `<div class="delta">${cur.set_number} sets × ${cur.seconds}s`;
                if (last) {
                    const dSets = (+cur.set_number) - (+last.set_number);
                    const cls = dSets > 0 ? "up" : dSets < 0 ? "down" : "";
                    line += ` <span class="${cls}">(${dSets>=0?"+":""}${dSets} sets vs last)</span>`;
                }
                line += `</div>`;
            }

            block.innerHTML = line;
            body.appendChild(block);
        }

        App.navTab("summary");
    }

    return { showFor };
})();


/* ============================================================
   Insights — trend charts of weights/times/volume.
   ============================================================ */
const Insights = (() => {
    let rangeDays = 90;
    let charts = [];

    function setRange(days, btn) {
        rangeDays = days;
        document.querySelectorAll('#screen-insights [data-range]').forEach(b => b.classList.add("ghost"));
        if (btn) btn.classList.remove("ghost"), btn.classList.add("primary"), btn.style.background = "var(--amcor-blue-deep)";
        render();
    }

    async function render() {
        for (const c of charts) c.destroy();
        charts = [];
        const body = $("insightsBody");
        body.innerHTML = "";

        let from = null;
        if (rangeDays > 0) {
            const d = todayLocal(); d.setDate(d.getDate() - rangeDays);
            from = fmtDate(d);
        }
        const sessions = (await DB.getSessions(from)).filter(s => s.completed);
        if (sessions.length === 0) {
            body.innerHTML = `<div class="empty-state">No workouts logged in this range yet.</div>`;
            return;
        }
        // Gather all logs for these sessions.
        const allLogs = [];
        for (const s of sessions) {
            const sLogs = await DB.getLogs(s.id);
            for (const l of sLogs) allLogs.push({ ...l, session_date: s.session_date });
        }

        // ---- 1. Volume per workout (line) ----
        const byDate = {};
        for (const l of allLogs.filter(l => l.exercise_kind === "lift")) {
            const v = (+l.weight_lbs||0) * (+l.reps_completed||0) * (Pct.getMap()[l.exercise_name]?.is_dumbbell_pair ? 2 : 1);
            byDate[l.session_date] = (byDate[l.session_date] || 0) + v;
        }
        const volDates = Object.keys(byDate).sort();
        if (volDates.length) body.appendChild(_chartCard("Total volume per workout (lb·reps)", volDates, volDates.map(d => byDate[d]), "var(--amcor-blue-deep)"));

        // ---- 2. Top set weight progression for each big lift ----
        const bigLifts = ["Dumbell Bench", "Inclince Bench", "Lat Pull Down", "Cable Rows", "Leg Press"];
        for (const ex of bigLifts) {
            const liftLogs = allLogs.filter(l => l.exercise_name === ex && +l.weight_lbs > 0);
            if (liftLogs.length < 2) continue;
            // Top set per date
            const tops = {};
            for (const l of liftLogs) {
                tops[l.session_date] = Math.max(tops[l.session_date] || 0, +l.weight_lbs);
            }
            const dates = Object.keys(tops).sort();
            body.appendChild(_chartCard(`${ex} — top set (lbs)`, dates, dates.map(d => tops[d]), "var(--amcor-teal)"));
        }

        // ---- 3. Run pace progression ----
        const runLogs = allLogs.filter(l => l.exercise_kind === "run" && +l.miles > 0 && +l.seconds > 0);
        if (runLogs.length >= 2) {
            const sorted = runLogs.sort((a,b) => a.session_date.localeCompare(b.session_date));
            const labels = sorted.map(l => l.session_date);
            const paces = sorted.map(l => +l.seconds / +l.miles / 60);  // min/mile
            body.appendChild(_chartCard("Run pace (min/mile, lower is faster)", labels, paces, "var(--amcor-red)", true));
        }

        // ---- 4. Days missed count summary ----
        // Count program workout-days from start to today, minus completed sessions.
        const p = Profile.get();
        if (p) {
            const start = parseDate(p.program_start);
            const today = todayLocal();
            let workoutDays = 0;
            for (let d = new Date(start); d <= today; d.setDate(d.getDate()+1)) {
                if (!Template.dayForDate(d).isRest) workoutDays++;
            }
            const completed = (await DB.getSessions()).filter(s => s.completed).length;
            const missed = Math.max(0, workoutDays - completed);
            const tile = document.createElement("div");
            tile.className = "card";
            tile.innerHTML = `
                <h3>Compliance</h3>
                <div style="display:flex; justify-content:space-around; text-align:center;">
                    <div><div style="font-size:28px; font-weight:600; color:var(--amcor-green);">${completed}</div><div style="font-size:11px; color:var(--text-muted);">COMPLETED</div></div>
                    <div><div style="font-size:28px; font-weight:600; color:var(--amcor-red);">${missed}</div><div style="font-size:11px; color:var(--text-muted);">MISSED</div></div>
                    <div><div style="font-size:28px; font-weight:600; color:var(--amcor-navy);">${workoutDays}</div><div style="font-size:11px; color:var(--text-muted);">SCHEDULED</div></div>
                </div>
            `;
            body.appendChild(tile);
        }
    }

    function _chartCard(title, labels, data, color, reverse=false) {
        const card = document.createElement("div");
        card.className = "card chart-card";
        const h = document.createElement("h3"); h.textContent = title; card.appendChild(h);
        const canvas = document.createElement("canvas");
        card.appendChild(canvas);
        setTimeout(() => {
            const chart = new Chart(canvas, {
                type: "line",
                data: { labels, datasets: [{
                    data, borderColor: color, backgroundColor: color + "33",
                    tension: 0.25, pointRadius: 3, fill: true, borderWidth: 2,
                }]},
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { ticks: { font: { size: 10 }, maxTicksLimit: 6 } },
                        y: { ticks: { font: { size: 10 } }, reverse },
                    },
                },
            });
            charts.push(chart);
        }, 0);
        return card;
    }

    return { render, setRange };
})();


/* ============================================================
   Stats — overall 99 score + percentile rings.
   ============================================================ */
const Stats = (() => {
    async function render() {
        const p = Profile.get();
        if (!p) {
            $("overallScore").textContent = "--";
            $("overallSub").textContent = "Set your profile first";
            $("statsRings").innerHTML = "";
            return;
        }

        // Walk recent logs and find each user's best score per category.
        const sessions = (await DB.getSessions()).filter(s => s.completed);
        if (!sessions.length) {
            $("overallScore").textContent = "—";
            $("overallSub").textContent = "Log a workout to start scoring";
            $("statsRings").innerHTML = `<div class="empty-state" style="grid-column:1/-1;">No data yet</div>`;
            return;
        }

        const exMap = Pct.getMap();
        const best = {
            upper_strength: 0, lower_strength: 0,
            endurance: 0, speed: 0, core: 0,
        };
        // We also want a "from what" label (the lift that gave the score) for each.
        const source = {};

        for (const s of sessions) {
            const logs = await DB.getLogs(s.id);
            // For lifts, find top set per exercise within this session.
            const liftTops = {};
            for (const l of logs.filter(l => l.exercise_kind === "lift")) {
                liftTops[l.exercise_name] = Math.max(liftTops[l.exercise_name] || 0, +l.weight_lbs || 0);
            }
            for (const [ex, w] of Object.entries(liftTops)) {
                const m = exMap[ex];
                if (!m || !m.anchor) continue;
                const sc = Pct.scoreLift(ex, w, +s.bodyweight_lbs || p.bodyweight_lbs || +(logs[0]?.bodyweight_lbs));
                if (sc && sc > best[m.category]) {
                    best[m.category] = sc;
                    source[m.category] = `${ex} ${w} lb`;
                }
            }
            // Runs.
            for (const l of logs.filter(l => l.exercise_kind === "run")) {
                const sc = Pct.scoreRun(+l.miles, +l.seconds);
                if (sc) {
                    if (sc.endurance > best.endurance) {
                        best.endurance = sc.endurance;
                        source.endurance = `${(+l.miles).toFixed(2)} mi in ${fmtSec(+l.seconds)}`;
                    }
                    if (sc.speed > best.speed) {
                        best.speed = sc.speed;
                        source.speed = `${(+l.miles).toFixed(2)} mi in ${fmtSec(+l.seconds)}`;
                    }
                }
            }
        }

        // Core: simple "sets-completed across timed exercises" derived score.
        // Cap at 99: 27 total timed sets across a workout = ~99 (3 sets * 9 core exercises).
        const allLogs = [];
        for (const s of sessions) {
            const ll = await DB.getLogs(s.id);
            allLogs.push(...ll.filter(l => l.exercise_kind === "timed"));
        }
        if (allLogs.length) {
            // Best single-session core volume (sets * seconds).
            const bySess = {};
            for (const l of allLogs) {
                bySess[l.session_id] = (bySess[l.session_id] || 0) + (+l.set_number * +l.seconds);
            }
            const bestCore = Math.max(...Object.values(bySess));
            // Anchor: a "great" session = 9 exercises * 3 sets * 60s = 1620.
            const coreScore = Math.min(99, Math.round((bestCore / 1620) * 99));
            best.core = coreScore;
            source.core = `${bestCore} timed sec`;
        }

        // Compute overall: weighted average of the five categories.
        // Weights tuned so a balanced lifter has a higher overall.
        const W = { upper_strength: 1, lower_strength: 1, endurance: 1, speed: 1, core: 0.5 };
        let num = 0, den = 0;
        for (const k of Object.keys(W)) {
            if (best[k] > 0) { num += best[k] * W[k]; den += W[k]; }
        }
        const overall = den > 0 ? Math.round(num / den) : 0;
        $("overallScore").textContent = overall || "—";
        $("overallSub").textContent = `${p.sex === "male" ? "Men" : "Women"} ${Profile.ageBracket()} • ${p.bodyweight_lbs} lb`;

        // Render five rings: Endurance, Speed, Upper, Lower, Core.
        const rings = [
            { key: "endurance",       label: "Endurance",   color: "var(--amcor-teal)" },
            { key: "speed",           label: "Speed",       color: "var(--amcor-blue-light)" },
            { key: "upper_strength",  label: "Upper Body",  color: "var(--amcor-green)" },
            { key: "lower_strength",  label: "Lower Body",  color: "var(--amcor-orange)" },
            { key: "core",            label: "Core",        color: "var(--amcor-red)" },
        ];
        const grid = $("statsRings");
        grid.innerHTML = "";
        for (const r of rings) {
            const val = best[r.key] || 0;
            const card = document.createElement("div");
            card.className = "ring-card";
            card.innerHTML = `
                <div class="ring-label">${r.label}</div>
                ${_ringSvg(val, r.color)}
                <div class="ring-pct">Top ${val ? (100 - val) : "--"}% ${val ? "of " + (p.sex==="male"?"men":"women") : ""}</div>
                <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${source[r.key] || "—"}</div>
            `;
            grid.appendChild(card);
        }
    }

    function _ringSvg(value, color) {
        const r = 32, c = 2 * Math.PI * r;
        const dash = c * (value / 100);
        return `
            <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="${r}" fill="none" stroke="#E4E7EB" stroke-width="8"/>
                <circle cx="40" cy="40" r="${r}" fill="none" stroke="${color}" stroke-width="8"
                        stroke-dasharray="${dash} ${c}" stroke-linecap="round"
                        transform="rotate(-90 40 40)"/>
                <text x="40" y="46" text-anchor="middle" font-size="22" font-weight="600" fill="var(--amcor-navy)" font-family="Segoe UI">${value || "--"}</text>
            </svg>
        `;
    }

    return { render };
})();


/* ============================================================
   Boot.
   ============================================================ */
window.DB = DB;
window.Profile = Profile;
window.Template = Template;
window.Pct = Pct;
window.App = App;
window.Settings = Settings;
window.Calendar = Calendar;
window.Workout = Workout;
window.Summary = Summary;
window.Insights = Insights;
window.Stats = Stats;

document.addEventListener("DOMContentLoaded", () => App.boot());
