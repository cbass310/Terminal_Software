// /gridiron/game.js
// Terminal Software - Gridiron 17-0 Engine

// --- STATE MANAGEMENT ---
let activeMode = 'classic';
let database = {};
let availableTeams = [];
let currentRoll = null;
let reRollsLeft = 2;

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
    
    // Hide Lobby, Show Game Console
    document.getElementById('screen-lobby').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');
    
    // Apply styling tweaks based on mode
    if (activeMode === 'gridironiq') {
        btnSpin.classList.replace('bg-amberAccent', 'bg-neon');
        btnSpin.classList.replace('hover:bg-amber-400', 'hover:bg-green-400');
    }
}

// --- DRAFTING LOGIC ---
function handleSpin() {
    if (isRosterFull()) return;

    // Deduct re-roll if using the re-roll button
    if (this.id === 'btn-reroll') {
        if (reRollsLeft <= 0) return;
        reRollsLeft--;
        rerollCounter.innerText = reRollsLeft;
        if (reRollsLeft === 0) {
            btnReroll.classList.add('opacity-50', 'cursor-not-allowed');
            btnReroll.disabled = true;
        }
    }

    // UI Updates for spinning
    btnSpin.classList.add('hidden');
    draftOptionsContainer.classList.add('hidden');
    spinnerDisplay.innerHTML = `<span class="spinning-text">CALCULATING ERA...</span>`;
    
    let spinCount = 0;
    const spinInterval = setInterval(() => {
        // Flash random teams for the slot machine effect
        const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        spinnerDisplay.innerHTML = `<span class="spinning-text">${randomTeam}</span>`;
        spinCount++;

        // Stop the wheel after ~1 second
        if (spinCount > 15) {
            clearInterval(spinInterval);
            currentRoll = randomTeam;
            
            // Lock in glitch effect
            spinnerDisplay.innerHTML = `<span class="locked-in text-neon">${currentRoll}</span>`;
            
            if (reRollsLeft > 0) {
                btnReroll.classList.remove('hidden');
            }
            
            renderDraftOptions(currentRoll);
        }
    }, 60);
}

function renderDraftOptions(teamName) {
    const players = database[teamName];
    playerButtonsContainer.innerHTML = '';
    
    let hasAvailablePlayers = false;

    players.forEach(player => {
        // Check if the player's position is already filled
        if (!isPositionAvailable(player.position)) return;
        
        hasAvailablePlayers = true;
        
        // Hide stats if GridironIQ is active
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
    if (pos === 'WR1' || pos === 'WR2') {
        return roster['WR1'] === null || roster['WR2'] === null;
    }
    return roster[pos] === null;
}

function draftPlayer(player) {
    // Assign to roster object
    let assignedSlot = player.position;
    
    // Handle the dual-WR slots seamlessly
    if (player.position === 'WR1' || player.position === 'WR2') {
        if (roster['WR1'] === null) {
            assignedSlot = 'WR1';
        } else {
            assignedSlot = 'WR2';
        }
    }
    
    roster[assignedSlot] = player;

    // Mask the ledger stats if GridironIQ is active
    const ledgerAV = activeMode === 'gridironiq' ? '??' : player.av_score;

    // Update the Sidebar UI Ledger
    const slotDOM = document.querySelector(`[data-slot="${assignedSlot}"]`);
    slotDOM.innerHTML = `
        <span class="text-slate-500 w-8">${assignedSlot}</span>
        <span class="text-white font-bold text-right">${player.name} <span class="text-neon ml-2 text-xs">AV:${ledgerAV}</span></span>
    `;

    // Reset Console UI
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

// --- SIMULATION ALGORITHM ---
function runSimulation() {
    btnSimulate.disabled = true;
    btnSimulate.innerText = "SIMULATING...";
    btnSimulate.classList.add('animate-pulse');

    setTimeout(() => {
        // Algorithm Weights
        const weights = {
            "QB": 0.38, 
            "DST": 0.22, 
            "RB": 0.14, 
            "WR1": 0.12, 
            "WR2": 0.09, 
            "TE": 0.05
        };
        
        let totalWeightedScore = 0;
        
        for (const [pos, player] of Object.entries(roster)) {
            totalWeightedScore += player.av_score * weights[pos];
        }

        const maxExpectedScore = 19.0;
        let winPercentage = totalWeightedScore / maxExpectedScore;
        
        // Cap it
        if (winPercentage > 1) winPercentage = 1;

        let wins = Math.round(winPercentage * 17);
        
        // RNG variation
        const rng = Math.random();
        if (rng > 0.85 && wins < 17) wins += 1;
        if (rng < 0.15 && wins > 0) wins -= 1;

        const losses = 17 - wins;
        
        // Output to DOM
        projectedRecordDisplay.innerText = `${wins} - ${losses}`;
        
        if (wins === 17) {
            projectedRecordDisplay.classList.replace('text-slate-600', 'text-neon');
            spinnerDisplay.innerHTML = `<span class="text-neon locked-in">PERFECT SEASON</span>`;
        } else if (wins >= 12) {
            projectedRecordDisplay.classList.replace('text-slate-600', 'text-cyanAccent');
            spinnerDisplay.innerHTML = `<span class="text-cyanAccent locked-in">PLAYOFF CONTENDER</span>`;
        } else {
            projectedRecordDisplay.classList.replace('text-slate-600', 'text-redAccent');
            spinnerDisplay.innerHTML = `<span class="text-redAccent locked-in">REBUILD REQUIRED</span>`;
        }

        btnSimulate.innerText = "DRAFT AGAIN";
        btnSimulate.classList.remove('animate-pulse');
        btnSimulate.onclick = () => location.reload();
        btnSimulate.disabled = false;
        
    }, 1500);
}

// Boot the game
window.addEventListener('DOMContentLoaded', initGame);
