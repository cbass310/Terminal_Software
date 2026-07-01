// /gridiron/game.js
// Terminal Software - Gridiron 17-0 Engine

// --- STATE MANAGEMENT ---
let activeMode = 'classic';
let database = {};
let availableTeams = [];
let currentRoll = null;
let reRollsLeft = 2;
let finalWins = 0;
let finalLosses = 0;

const roster = {
    QB: null,
    RB: null,
    WR1: null,
    WR2: null,
    TE: null,
    DST: null
};

// --- DOM ELEMENTS ---
const spinnerDisplay = document.getElementById('slot-machine-display');
const btnSpin = document.getElementById('btn-spin');
const btnReroll = document.getElementById('btn-reroll');
const rerollCounter = document.getElementById('reroll-counter');
const draftOptionsContainer = document.getElementById('draft-options-container');
const playerButtonsContainer = document.getElementById('player-buttons');
const btnSimulate = document.getElementById('btn-simulate');
const projectedRecordDisplay = document.getElementById('projected-record');

// Post-Game Elements
const screenLobby = document.getElementById('screen-lobby');
const screenGame = document.getElementById('screen-game');
const screenResults = document.getElementById('screen-results');

// --- INITIALIZATION ---
async function initGame() {
    try {
        const response = await fetch('football_data.json');
        database = await response.json();
        availableTeams = Object.keys(database);
        
        btnSpin.addEventListener('click', handleSpin);
        btnReroll.addEventListener('click', handleSpin);
        btnSimulate.addEventListener('click', runSimulation);
    } catch (error) {
        spinnerDisplay.innerHTML = `<span class="text-redAccent">ERROR: DATABASE OFFLINE</span>`;
        console.error("Failed to load football_data.json", error);
    }
}

// --- ROUTING LOGIC ---
window.startGame = function(mode) {
    if (mode === 'duel') {
        alert("1v1 Duel Engine is currently in development. Deploying soon.");
        return;
    }
    
    activeMode = mode;
    
    screenLobby.classList.add('hidden');
    screenResults.classList.add('hidden');
    screenGame.classList.remove('hidden');
    
    // Apply styling tweaks based on mode
    if (activeMode === 'gridironiq') {
        btnSpin.classList.replace('bg-amberAccent', 'bg-neon');
        btnSpin.classList.replace('hover:bg-amber-400', 'hover:bg-green-400');
    } else {
        btnSpin.classList.replace('bg-neon', 'bg-amberAccent');
        btnSpin.classList.replace('hover:bg-green-400', 'hover:bg-amber-400');
    }
}

window.resetGame = function() {
    // Zero out the state
    reRollsLeft = 2;
    currentRoll = null;
    for (let key in roster) roster[key] = null;
    
    // Reset UI
    rerollCounter.innerText = reRollsLeft;
    btnReroll.disabled = false;
    btnReroll.classList.remove('opacity-50', 'cursor-not-allowed', 'hidden');
    
    spinnerDisplay.innerHTML = `<span class="animate-pulse">AWAITING SPIN...</span>`;
    btnSpin.classList.remove('hidden');
    btnSpin.innerText = "Spin Wheel";
    
    draftOptionsContainer.classList.add('hidden');
    projectedRecordDisplay.innerText = "-- / --";
    projectedRecordDisplay.classList.remove('text-neon', 'text-cyanAccent', 'text-redAccent');
    projectedRecordDisplay.classList.add('text-slate-600');
    
    // Clear ledger
    const slots = ['QB', 'RB', 'WR1', 'WR2', 'TE', 'DST'];
    slots.forEach(slot => {
        document.querySelector(`[data-slot="${slot}"]`).innerHTML = `
            <span class="text-slate-500 w-8">${slot}</span>
            <span class="text-slate-600 empty-slot">EMPTY</span>
        `;
    });

    btnSimulate.disabled = true;
    btnSimulate.innerText = "Draft Incomplete";
    btnSimulate.className = "w-full mt-8 bg-slate-800 text-slate-500 font-black py-4 rounded-xl uppercase tracking-widest cursor-not-allowed transition-colors";

    // Route back to lobby
    screenResults.classList.add('hidden');
    screenGame.classList.add('hidden');
    screenLobby.classList.remove('hidden');
}

// --- DRAFTING LOGIC ---
function handleSpin() {
    if (isRosterFull()) return;

    if (this.id === 'btn-reroll') {
        if (reRollsLeft <= 0) return;
        reRollsLeft--;
        rerollCounter.innerText = reRollsLeft;
        if (reRollsLeft === 0) {
            btnReroll.classList.add('opacity-50', 'cursor-not-allowed');
            btnReroll.disabled = true;
        }
    }

    btnSpin.classList.add('hidden');
    draftOptionsContainer.classList.add('hidden');
    spinnerDisplay.innerHTML = `<span class="spinning-text">CALCULATING ERA...</span>`;
    
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        spinnerDisplay.innerHTML = `<span class="spinning-text">${randomTeam}</span>`;
        spinCount++;

        if (spinCount > 15) {
            clearInterval(spinInterval);
            currentRoll = randomTeam;
            
            spinnerDisplay.innerHTML = `<span class="locked-in text-neon">${currentRoll}</span>`;
            
            if (reRollsLeft > 0) btnReroll.classList.remove('hidden');
            renderDraftOptions(currentRoll);
        }
    }, 60);
}

function renderDraftOptions(teamName) {
    const players = database[teamName];
    playerButtonsContainer.innerHTML = '';
    
    let hasAvailablePlayers = false;

    players.forEach(player => {
        if (!isPositionAvailable(player.position)) return;
        hasAvailablePlayers = true;
        
        const displayAV = activeMode === 'gridironiq' ? '??' : player.av_score;
        const colorAccent = activeMode === 'gridironiq' ? 'neon' : 'amberAccent';

        const btn = document.createElement('button');
        btn.className = `w-full text-left bg-black/40 border border-white/5 hover:border-${colorAccent} hover:bg-${colorAccent}/5 p-4 rounded-xl transition-all group flex justify-between items-center`;
        btn.innerHTML = `
            <div><span class="font-bold text-white text-lg group-hover:text-${colorAccent} transition-colors">${player.name}</span> <span class="text-slate-500 ml-2 font-mono text-sm">${player.position}</span></div>
            <div class="font-mono text-sm text-slate-400">AV: ${displayAV}</div>
        `;
        
        btn.onclick = () => draftPlayer(player);
        playerButtonsContainer.appendChild(btn);
    });

    if (!hasAvailablePlayers) {
        playerButtonsContainer.innerHTML = `<div class="text-slate-500 text-center py-4 font-mono text-sm">All positions for this era are already filled on your roster. Re-roll required.</div>`;
    }

    draftOptionsContainer.classList.remove('hidden');
}

function isPositionAvailable(pos) {
    if (pos === 'WR1' || pos === 'WR2') return roster['WR1'] === null || roster['WR2'] === null;
    return roster[pos] === null;
}

function draftPlayer(player) {
    let assignedSlot = player.position;
    if (player.position === 'WR1' || player.position === 'WR2') {
        assignedSlot = roster['WR1'] === null ? 'WR1' : 'WR2';
    }
    
    roster[assignedSlot] = player;

    const ledgerAV = activeMode === 'gridironiq' ? '??' : player.av_score;

    const slotDOM = document.querySelector(`[data-slot="${assignedSlot}"]`);
    slotDOM.innerHTML = `
        <span class="text-slate-500 w-8">${assignedSlot}</span>
        <span class="text-white font-bold text-right">${player.name} <span class="text-neon ml-2 text-xs">AV:${ledgerAV}</span></span>
    `;

    draftOptionsContainer.classList.add('hidden');
    btnReroll.classList.add('hidden');
    
    if (isRosterFull()) {
        spinnerDisplay.innerHTML = `<span class="text-amberAccent">DRAFT COMPLETE</span>`;
        btnSpin.classList.add('hidden');
        btnSimulate.disabled = false;
        btnSimulate.classList.replace('bg-slate-800', 'bg-neon');
        btnSimulate.classList.replace('text-slate-500', 'text-black');
        btnSimulate.classList.replace('cursor-not-allowed', 'hover:bg-green-400');
        btnSimulate.innerText = "Simulate Season";
    } else {
        spinnerDisplay.innerHTML = `<span class="text-slate-600">AWAITING SPIN...</span>`;
        btnSpin.classList.remove('hidden');
        btnSpin.innerText = "Next Round";
    }
}

function isRosterFull() {
    return Object.values(roster).every(slot => slot !== null);
}

// --- SIMULATION ALGORITHM & POST-GAME LEDGER ---
function runSimulation() {
    btnSimulate.disabled = true;
    btnSimulate.innerText = "SIMULATING...";
    btnSimulate.classList.add('animate-pulse');

    setTimeout(() => {
        const weights = { "QB": 0.38, "DST": 0.22, "RB": 0.14, "WR1": 0.12, "WR2": 0.09, "TE": 0.05 };
        let totalWeightedScore = 0;
        
        for (const [pos, player] of Object.entries(roster)) {
            totalWeightedScore += player.av_score * weights[pos];
        }

        const maxExpectedScore = 19.0;
        let winPercentage = totalWeightedScore / maxExpectedScore;
        if (winPercentage > 1) winPercentage = 1;

        finalWins = Math.round(winPercentage * 17);
        const rng = Math.random();
        if (rng > 0.85 && finalWins < 17) finalWins += 1;
        if (rng < 0.15 && finalWins > 0) finalWins -= 1;
        finalLosses = 17 - finalWins;
        
        // --- NEW: SUPABASE LEADERBOARD PUSH ---
        pushToLeaderboard(finalWins, finalLosses, totalWeightedScore);
        // --------------------------------------

        // 1. Determine Tier
        let tierHTML = "";
        let messageHtml = "";
        
        if (finalWins === 17) {
            tierHTML = `<span class="text-neon">[S] INVINCIBLE LEGEND</span>`;
            messageHtml = `<span class="text-neon">PERFECT SEASON ACHIEVED</span>`;
            document.getElementById('result-tier-badge').className = "absolute top-0 right-0 bg-neon/10 text-neon font-black px-6 py-2 rounded-bl-2xl tracking-widest border-b border-l border-neon/30 shadow-[0_0_15px_rgba(57,255,20,0.2)]";
        } else if (finalWins >= 13) {
            tierHTML = `<span class="text-amberAccent">[A] DYNASTY</span>`;
            messageHtml = `<span class="text-amberAccent">ELITE CHAMPIONSHIP CONTENDER</span>`;
            document.getElementById('result-tier-badge').className = "absolute top-0 right-0 bg-amberAccent/10 text-amberAccent font-black px-6 py-2 rounded-bl-2xl tracking-widest border-b border-l border-amberAccent/30";
        } else if (finalWins >= 9) {
            tierHTML = `<span class="text-cyanAccent">[C] WILDCARD</span>`;
            messageHtml = `<span class="text-cyanAccent">PLAYOFF BUBBLE SQUAD</span>`;
            document.getElementById('result-tier-badge').className = "absolute top-0 right-0 bg-cyanAccent/10 text-cyanAccent font-black px-6 py-2 rounded-bl-2xl tracking-widest border-b border-l border-cyanAccent/30";
        } else {
            tierHTML = `<span class="text-redAccent">[F] BUST</span>`;
            messageHtml = `<span class="text-redAccent">FRONT OFFICE FIRED</span>`;
            document.getElementById('result-tier-badge').className = "absolute top-0 right-0 bg-redAccent/10 text-redAccent font-black px-6 py-2 rounded-bl-2xl tracking-widest border-b border-l border-redAccent/30";
        }

        // 2. Populate Results Screen
        document.getElementById('result-record-display').innerText = `${finalWins}-${finalLosses}`;
        document.getElementById('result-tier-badge').innerHTML = tierHTML;
        document.getElementById('result-message-display').innerHTML = messageHtml;

        // 3. Populate Roster Grid
        const rosterGrid = document.getElementById('result-roster-grid');
        rosterGrid.innerHTML = '';
        const slots = ['QB', 'RB', 'WR1', 'WR2', 'TE', 'DST'];
        
        slots.forEach(slot => {
            const p = roster[slot];
            const statDisplay = activeMode === 'gridironiq' ? '??' : p.av_score;
            rosterGrid.innerHTML += `
                <div class="flex justify-between items-center border-b border-white/5 pb-2">
                    <div class="text-slate-500 w-10">${slot}</div>
                    <div class="text-white font-bold">${p.name}</div>
                    <div class="text-slate-600 text-xs">AV:${statDisplay}</div>
                </div>
            `;
        });

        // Transition States
        screenGame.classList.add('hidden');
        screenResults.classList.remove('hidden');
        
    }, 1500);
}

// --- VIRAL LOOP (SHARE) ---
window.shareSquad = function() {
    const btn = document.getElementById('btn-share');
    const modeName = activeMode === 'gridironiq' ? '🧠 GridironIQ' : '💯 Classic';
    
    const shareText = `🏈 Gridiron Simulator\n🏆 Record: ${finalWins}-${finalLosses}\n${modeName}\n\nQB: ${roster.QB.name}\nRB: ${roster.RB.name}\nWR1: ${roster.WR1.name}\nWR2: ${roster.WR2.name}\nTE: ${roster.TE.name}\nDST: ${roster.DST.name}\n\nCan you beat the math? terminalsoftware.online/gridiron`;

    navigator.clipboard.writeText(shareText).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span>✅</span> Copied to Clipboard!`;
        btn.classList.replace('bg-cyanAccent', 'bg-neon');
        btn.classList.replace('hover:bg-cyan-400', 'hover:bg-green-400');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace('bg-neon', 'bg-cyanAccent');
            btn.classList.replace('hover:bg-green-400', 'hover:bg-cyan-400');
        }, 3000);
    }).catch(err => {
        console.error("Clipboard failed", err);
    });
}

// --- LEADERBOARD & DATABASE LOGIC ---
async function pushToLeaderboard(wins, losses, totalAV) {
    // Check if the global Terminal Software database connection exists
    if (typeof window.db === 'undefined') {
        console.warn("User is a guest. Score not submitted to global leaderboard.");
        return;
    }

    try {
        // Grab the active session
        const { data: { session } } = await window.db.auth.getSession();
        
        if (session && session.user) {
            const payload = {
                user_email: session.user.email,
                mode: activeMode,
                wins: wins,
                losses: losses,
                total_av: Math.round(totalAV)
            };

            const { error } = await window.db.from('gridiron_leaderboard').insert([payload]);
            
            if (error) {
                console.error("Leaderboard Push Failed:", error);
            } else {
                console.log("[SYSTEM] Score successfully locked into Supabase Leaderboard.");
            }
        }
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

window.viewLeaderboard = function() {
    alert("Leaderboard UI is currently compiling. Stand by.");
    // We will build a function here to toggle the Leaderboard Screen
}

// Boot the game
window.addEventListener('DOMContentLoaded', initGame);
