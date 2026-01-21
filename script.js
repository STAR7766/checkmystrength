const challenges = [
    {
        id: 'proto-1',
        title: 'The Rapid Prototype',
        description: 'Build a tangible version of an idea in 60 minutes. No code allowed (paper, slides, or clay).',
        strength: 'Creativity',
        difficulty: 'Hard',
        xp: 50
    },
    {
        id: 'cold-1',
        title: 'The Cold Ask',
        description: 'Send 3 DMs/Emails to people you admire asking one specific question.',
        strength: 'Courage',
        difficulty: 'Medium',
        xp: 30
    },
    {
        id: 'teach-1',
        title: 'The Simplifier',
        description: 'Explain a complex concept to a friend until they clearly understand it.',
        strength: 'Communication',
        difficulty: 'Easy',
        xp: 20
    },
    {
        id: 'audit-1',
        title: 'The Time Audit',
        description: 'Track every minute of your day for 24 hours. Categorize it.',
        strength: 'Discipline',
        difficulty: 'Medium',
        xp: 35
    },
    {
        id: 'sell-1',
        title: 'The First Dollar',
        description: 'Sell something you own or a small service for at least $1.',
        strength: 'Sales',
        difficulty: 'Hard',
        xp: 100
    }
];

// State Management
let userState = JSON.parse(localStorage.getItem('checkMyStrengthState')) || {
    completedIds: [],
    history: [], // { id, title, date, strength, xp, time, errors, friction }
    streakStart: null,
    lastActionDate: null
};

// DOM Elements
const grid = document.getElementById('challenges-grid');
const totalActionsEl = document.getElementById('total-actions');
const streakEl = document.getElementById('streak-count');
const topStrengthEl = document.getElementById('top-strength');
const logListEl = document.getElementById('action-log-list');
const resetBtn = document.getElementById('reset-btn');

// Modal Elements
const modal = document.getElementById('data-modal');
const metricsForm = document.getElementById('metrics-form');
const cancelModalBtn = document.getElementById('cancel-modal');
const generateReportBtn = document.getElementById('generate-report-btn');
const guidanceReportEl = document.getElementById('guidance-report');

let pendingChallengeId = null;

// Init
function init() {
    renderChallenges();
    updateStats();
    renderLog();
    checkReportAvailability();
}

// Render Challenges
function renderChallenges() {
    grid.innerHTML = '';

    challenges.forEach(challenge => {
        const isCompleted = userState.completedIds.includes(challenge.id);
        const card = document.createElement('div');
        card.className = `challenge-card ${isCompleted ? 'completed' : ''}`;

        card.innerHTML = `
            <div class="card-content">
                <div class="tag-row">
                    <span class="tag type">${challenge.strength}</span>
                    <span class="tag difficulty">${challenge.difficulty}</span>
                </div>
                <h3>${challenge.title}</h3>
                <p class="challenge-desc">${challenge.description}</p>
            </div>
            <button class="accept-btn" onclick="openVerification('${challenge.id}')">
                ${isCompleted ? 'COMPLETED' : 'START CHALLENGE'}
            </button>
        `;

        grid.appendChild(card);
    });
}

// Modal Logic
window.openVerification = (id) => {
    if (userState.completedIds.includes(id)) return;
    pendingChallengeId = id;
    modal.classList.remove('hidden');
};

cancelModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    pendingChallengeId = null;
    metricsForm.reset();
});

metricsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pendingChallengeId) return;

    const time = document.getElementById('m-time').value;
    const errors = document.getElementById('m-errors').value;
    const friction = document.getElementById('m-friction').value;

    completeChallenge(pendingChallengeId, { time, errors, friction });

    modal.classList.add('hidden');
    metricsForm.reset();
    pendingChallengeId = null;
});

// Completion Logic
function completeChallenge(id, metrics) {
    const challenge = challenges.find(c => c.id === id);
    userState.completedIds.push(id);

    userState.history.unshift({
        id: id,
        title: challenge.title,
        date: new Date().toISOString(),
        strength: challenge.strength,
        xp: challenge.xp,
        ...metrics
    });

    const today = new Date().toDateString();
    if (userState.lastActionDate !== today) {
        userState.lastActionDate = today;
    }

    saveState();
    renderChallenges();
    updateStats();
    renderLog();
    checkReportAvailability();
}

// Stats Calculation
function updateStats() {
    totalActionsEl.innerText = userState.completedIds.length;

    if (userState.history.length === 0) {
        topStrengthEl.innerText = "Undetermined";
        return;
    }

    const frequency = {};
    userState.history.forEach(h => {
        frequency[h.strength] = (frequency[h.strength] || 0) + 1;
    });

    const top = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
    topStrengthEl.innerText = top;

    streakEl.innerText = userState.completedIds.length > 0 ? "1 Day" : "0 Days";
}

function renderLog() {
    logListEl.innerHTML = '';
    if (userState.history.length === 0) {
        logListEl.innerHTML = '<li class="empty-state">No actions recorded yet. The arena awaits.</li>';
        return;
    }

    userState.history.forEach(item => {
        const li = document.createElement('li');
        const date = new Date(item.date).toLocaleDateString();
        li.innerHTML = `
            <span>${item.title}</span>
            <span class="log-date">${date} • +${item.xp} XP • Friction: ${item.friction}/10</span>
        `;
        logListEl.appendChild(li);
    });
}

function checkReportAvailability() {
    if (userState.history.length > 0) {
        generateReportBtn.style.opacity = '1';
        generateReportBtn.style.pointerEvents = 'auto';
    } else {
        generateReportBtn.style.opacity = '0.5';
        generateReportBtn.style.pointerEvents = 'none';
    }
}

// Guidance Report Generator
generateReportBtn.addEventListener('click', () => {
    guidanceReportEl.classList.remove('hidden');
    guidanceReportEl.innerHTML = '<p class="loading-text">Analyzing Signal...</p>';

    setTimeout(() => {
        generateGuidance();
    }, 1500);
});

// Seed Data for demonstration (Simulates a student with high creativity/courage but low discipline)
if (!localStorage.getItem('checkMyStrengthState')) {
    userState.history = [
        { id: 'proto-1', title: 'The Rapid Prototype', strength: 'Creativity', xp: 50, friction: 2, errors: 'None', time: '45 mins', date: new Date().toISOString() },
        { id: 'sell-1', title: 'The First Dollar', strength: 'Sales', xp: 100, friction: 3, errors: 'Minor typo', time: '120 mins', date: new Date().toISOString() },
        { id: 'cold-1', title: 'The Cold Ask', strength: 'Courage', xp: 30, friction: 4, errors: 'None', time: '10 mins', date: new Date().toISOString() },
        { id: 'audit-1', title: 'The Time Audit', strength: 'Discipline', xp: 35, friction: 9, errors: 'Stopped halfway', time: '4 hours', date: new Date().toISOString() },
        { id: 'teach-1', title: 'The Simplifier', strength: 'Communication', xp: 20, friction: 3, errors: 'Stumbled once', time: '15 mins', date: new Date().toISOString() }
    ];
    userState.completedIds = ['proto-1', 'sell-1', 'cold-1', 'audit-1', 'teach-1'];
    localStorage.setItem('actuateState', JSON.stringify(userState));
}

function generateGuidance() {
    if (userState.history.length === 0) return;

    const history = userState.history;

    // 1. Analyze Strengths (Low Friction, Completion)
    const strengthCounts = {};
    const frictionByStrength = {};

    history.forEach(h => {
        strengthCounts[h.strength] = (strengthCounts[h.strength] || 0) + 1;
        if (!frictionByStrength[h.strength]) frictionByStrength[h.strength] = [];
        frictionByStrength[h.strength].push(parseInt(h.friction));
    });

    let bestStrength = '';
    let lowestFriction = 11;

    Object.keys(frictionByStrength).forEach(s => {
        const avg = frictionByStrength[s].reduce((a, b) => a + b, 0) / frictionByStrength[s].length;
        if (avg < lowestFriction) {
            lowestFriction = avg;
            bestStrength = s;
        }
    });

    // 2. Analyze Weaknesses (High Friction, Errors, Drop-off)
    let worstArea = '';
    let highestFriction = 0;

    Object.keys(frictionByStrength).forEach(s => {
        const avg = frictionByStrength[s].reduce((a, b) => a + b, 0) / frictionByStrength[s].length;
        if (avg > highestFriction) {
            highestFriction = avg;
            worstArea = s;
        }
    });

    // 3. Construct Narrative
    let strengthText = "";
    let weaknessText = "";
    let focusText = "";
    let avoidText = "";

    // Strength Logic
    if (lowestFriction <= 4) {
        strengthText = `<strong>${bestStrength}</strong>. Data shows high completion rate with minimal friction (<${lowestFriction.toFixed(1)}/10). You enter flow capability quickly here.`;
    } else {
        strengthText = `<strong>Resilience</strong>. You engage even when friction is moderate. No clear "easy mode" detected yet, but you persist.`;
    }

    // Weakness Logic
    if (highestFriction >= 7) {
        weaknessText = `<strong>${worstArea}</strong>. Friction spikes to ${highestFriction.toFixed(1)}/10. Evidence suggests cognitive load is too high or interest is non-existent. Mistakes recorded: "Stopped halfway" or similar drop-offs.`;
        avoidText = `Pause strict <strong>${worstArea}</strong> drills. The friction cost is currently outweighing the learning benefit for your current state.`;
    } else {
        weaknessText = `<strong>Volume</strong>. No major friction spikes, but volume is low. You are comfortable, which suggests you are under-challenged.`;
        avoidText = `Avoid <strong>Passive Learning</strong>. You are ready for harder active challenges.`;
    }

    // Next Step
    focusText = `Complete 3 advanced protocols in <strong>${bestStrength}</strong>. Double the stakes (e.g., if you sold for $1, sell for $10).`;


    const reportHTML = `
        <div class="report-grid">
            <div class="report-section report-box">
                <h4>What you're naturally handling well</h4>
                <p>${strengthText}</p>
            </div>

            <div class="report-section report-box warning">
                <h4>Where you're getting stuck (and why)</h4>
                <p>${weaknessText}</p>
            </div>

            <div class="report-section">
                <h4>Best next 30-day focus</h4>
                <p>${focusText}</p>
            </div>

            <div class="report-section">
                <h4>Things to pause or avoid for now</h4>
                <p>${avoidText}</p>
            </div>
        </div>
        <div class="report-section">
            <h4>Evidence Base</h4>
            <p style="font-size: 0.8rem; color: var(--text-muted);">
                Analyzed ${history.length} data points. 
                Lowest Friction: ${lowestFriction.toFixed(1)} (${bestStrength}). 
                Highest Friction: ${highestFriction.toFixed(1)} (${worstArea}).
            </p>
        </div>
    `;

    guidanceReportEl.innerHTML = reportHTML;
}

function saveState() {
    localStorage.setItem('checkMyStrengthState', JSON.stringify(userState));
}

resetBtn.addEventListener('click', () => {
    if (confirm('Reset all progress?')) {
        localStorage.removeItem('checkMyStrengthState');
        userState = { completedIds: [], history: [], streakStart: null, lastActionDate: null };
        init();
        guidanceReportEl.classList.add('hidden');
    }
});

// Run
init();

// Parallax
// Spotlight Effect
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.challenge-card, .glass-card, .stat-box, .secondary-btn, .cta-btn');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});
