// /hardwood/game.js
// Terminal Software - Hardwood 82-0 Engine

let activeMode = 'classic';
let database = {};
let availableTeams = [];
let currentRoll = null;
let reRollsLeft = 2;
let finalWins = 0;
let finalLosses = 0;

let currentLbMode = 'classic';
let currentLbTime = 'all_time';

// Basketball Starting 5
const roster = { PG: null, SG: null, SF: null, PF: null, C: null };

const spinnerDisplay = document.getElementById('slot-machine-display');
const btnSpin = document.getElementById('btn-spin');
const btnReroll = document.getElementById('btn-reroll');
const rerollCounter = document.getElementById('reroll-counter');
const draftOptionsContainer = document.getElementById('draft-options-container');
const playerButtonsContainer = document.getElementById('player-buttons');
const btnSimulate = document.getElementById('btn-simulate');
const projectedRecordDisplay = document.getElementById('projected-record');

const screenLobby = document.getElementById('screen-lobby');
const screenGame = document.getElementById('screen-game');
const screenResults = document.getElementById('screen-results');
const screenLeaderboard = document.getElementById('screen-leaderboard');

const podiumContainer = document.getElementById('leaderboard-podium');
const leaderboardBody = document.getElementById('leaderboard-body');

// --- IP PROTECTION MASK ---
function stripMascot(fullName) {
    if (!fullName) return "UNKNOWN";
    const parts = fullName.split(' ');
    if (parts.length > 2) {
        parts.pop();
        return parts.join(' ');
    }
    return fullName;
}

async function initGame() {
    try {
        // Points to our new basketball database
        const response = await fetch('basketball_data.json');
        database = await response.json();
        availableTeams = Object.keys(database);
        btnSpin.addEventListener('click', handleSpin);
        btnReroll.addEventListener('click', handleSpin);
        btnSimulate.addEventListener('click', runSimulation);
    } catch (error) {
        spinnerDisplay.innerHTML = `<span class="text-redAccent">ERROR: DATABASE OFFLINE</span>`;
    }
}

window.startGame = function(mode) {
    activeMode = mode;
    screenLobby.classList.add('hidden');
    screenResults.classList.add('hidden');
    screenLeaderboard.classList.add('hidden');
    screenGame.classList.remove('hidden');
    
    if (activeMode === 'hoopiq') {
        btnSpin.className = "bg-neon text-background font-black px-6 py-3 rounded-xl uppercase text-sm tracking-widest hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(57,255,20,0.4)]";
    } else if (activeMode === 'duel') {
        btnSpin.className = "bg-redAccent text-white font-black px-6 py-3 rounded-xl uppercase text-sm tracking-widest hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]";
    } else {
        btnSpin.className = "bg-amberAccent text-background font-black px-6 py-3 rounded-xl uppercase text-sm tracking-widest hover:bg-orange-400 transition-colors shadow-[0_0_15px_rgba(249,115,22,0.4)]";
    }
}

window.resetGame = function() {
    reRollsLeft = 2;
    currentRoll = null;
    for (let key in roster) roster[key] = null;
    
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
    
    const slots = ['PG', 'SG', 'SF', 'PF', 'C'];
    slots.forEach(slot => {
        document.querySelector(`[data-slot="${slot}"]`).innerHTML = `
            <span class="text-slate-500 w-8">${slot}</span>
            <span class="text-slate-600 empty-slot">EMPTY</span>
        `;
    });

    btnSimulate.disabled = true;
    btnSimulate.innerText = "Draft Incomplete";
    btnSimulate.className = "w-full mt-6 bg-slate-800 text-slate-500 font-black py-3 rounded-xl uppercase text-sm tracking-widest cursor-not-allowed transition-colors";

    screenResults.classList.add('hidden');
    screenGame.classList.add('hidden');
    screenLeaderboard.classList.add('hidden');
    screenLobby.classList.remove('hidden');
}

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
        
        spinnerDisplay.innerHTML = `<span class="spinning-text">${stripMascot(randomTeam)}</span>`;
        spinCount++;

        if (spinCount > 15) {
            clearInterval(spinInterval);
            currentRoll = randomTeam; 
            let themeColor = activeMode === 'hoopiq' ? 'text-neon' : (activeMode === 'duel' ? 'text-redAccent' : 'text-amberAccent');
            
            spinnerDisplay.innerHTML = `<span class="locked-in ${themeColor}">${stripMascot(currentRoll)}</span>`;
            
            if (reRollsLeft > 0) btnReroll.classList.remove('hidden');
            renderDraftOptions(currentRoll);
        }
    }, 60);
}

function renderDraftOptions(teamName) {
    const players = database[teamName];
    playerButtonsContainer.innerHTML = '';
    let hasAvailablePlayers = false;

    players.forEach((player, index) => {
        if (!isPositionAvailable(player.position)) return;
        hasAvailablePlayers = true;
        
        const displayWS = activeMode === 'hoopiq' ? '??' : player.ws_score;
        let colorAccent = 'amberAccent';
        if (activeMode === 'hoopiq') colorAccent = 'neon';
        if (activeMode === 'duel') colorAccent = 'redAccent';

        // Staggered delay logic for the hardware-accelerated "Series X" waterfall animation
        const delay = index * 80;

        const btn = document.createElement('button');
        btn.className = `w-full text-left bg-black/40 border border-white/5 hover:border-${colorAccent} hover:bg-${colorAccent}/5 p-3 rounded-xl transition-all group flex justify-between items-center active:scale-95 animate-waterfall transform-gpu will-change-transform`;
        btn.style.animationDelay = `${delay}ms`;
        btn.innerHTML = `
            <div><span class="font-bold text-white text-sm lg:text-base group-hover:text-${colorAccent} transition-colors">${player.name}</span> <span class="text-slate-500 ml-2 font-mono text-[10px] lg:text-xs">${player.position}</span></div>
            <div class="font-mono text-[10px] lg:text-xs text-slate-400">WS: ${displayWS}</div>
        `;
        btn.onclick = () => draftPlayer(player);
        playerButtonsContainer.appendChild(btn);
    });

    if (!hasAvailablePlayers) {
        playerButtonsContainer.innerHTML = `<div class="text-slate-500 text-center py-4 font-mono text-xs">All positions for this era are already filled on your roster. Re-roll required.</div>`;
    }
    draftOptionsContainer.classList.remove('hidden');
}

function isPositionAvailable(pos) {
    return roster[pos] === null;
}

function draftPlayer(player) {
    let assignedSlot = player.position;
    roster[assignedSlot] = player;

    const ledgerWS = activeMode === 'hoopiq' ? '??' : player.ws_score;
    let colorAccent = 'amberAccent';
    if (activeMode === 'hoopiq') colorAccent = 'neon';
    if (activeMode === 'duel') colorAccent = 'redAccent';

    document.querySelector(`[data-slot="${assignedSlot}"]`).innerHTML = `
        <span class="text-slate-500 w-8">${assignedSlot}</span>
        <span class="text-white font-bold text-right">${player.name} <span class="text-${colorAccent} ml-2 text-[10px]">WS:${ledgerWS}</span></span>
    `;

    draftOptionsContainer.classList.add('hidden');
    btnReroll.classList.add('hidden');
    
    if (isRosterFull()) {
        spinnerDisplay.innerHTML = `<span class="text-${colorAccent}">DRAFT COMPLETE</span>`;
        btnSpin.classList.add('hidden');
        btnSimulate.disabled = false;
        
        btnSimulate.classList.replace('bg-slate-800', `bg-${colorAccent}`);
        btnSimulate.classList.replace('text-slate-500', activeMode === 'duel' ? 'text-white' : 'text-background');
        btnSimulate.classList.replace('cursor-not-allowed', 'hover:brightness-110');
        btnSimulate.innerText = activeMode === 'duel' ? "Execute 1v1 Duel" : "Simulate Season";
    } else {
        spinnerDisplay.innerHTML = `<span class="text-slate-600">AWAITING SPIN...</span>`;
        btnSpin.classList.remove('hidden');
        btnSpin.innerText = "Next Round";
    }
}

function isRosterFull() {
    return Object.values(roster).every(slot => slot !== null);
}

function runSimulation() {
    btnSimulate.disabled = true;
    btnSimulate.innerText = "CALCULATING...";
    btnSimulate.classList.add('animate-pulse');

    setTimeout(async () => {
        // In basketball, Win Shares are cumulative. 
        let teamWS = 0;
        for (const [pos, player] of Object.entries(roster)) {
            teamWS += player.ws_score;
        }

        const rosterGrid = document.getElementById('result-roster-grid');
        const headerText = document.getElementById('result-header-text');
        const gridTitle = document.getElementById('roster-grid-title');
        rosterGrid.innerHTML = '';
        
        let tierHTML = "";
        let messageHtml = "";

        if (activeMode === 'duel') {
            const rivalTeamName = availableTeams[Math.floor(Math.random() * availableTeams.length)];
            const rivalPlayers = database[rivalTeamName];
            let rivalRoster = { PG: null, SG: null, SF: null, PF: null, C: null };
            
            let sortedPlayers = [...rivalPlayers].sort((a, b) => b.ws_score - a.ws_score);
            sortedPlayers.forEach(p => {
                if (!rivalRoster[p.position]) rivalRoster[p.position] = p;
            });

            let rivalWS = 0;
            for (const [pos, player] of Object.entries(rivalRoster)) {
                if (player) rivalWS += player.ws_score;
            }

            let playerFinal = teamWS * (0.9 + (Math.random() * 0.2));
            let rivalFinal = rivalWS * (0.9 + (Math.random() * 0.2));
            const isWin = playerFinal > rivalFinal;
            
            finalWins = isWin ? 1 : 0;
            finalLosses = isWin ? 0 : 1;

            headerText.innerText = "1V1 DUEL OUTCOME";
            document.getElementById('result-record-display').innerText = isWin ? "VICTORY" : "DEFEAT";
            document.getElementById('result-record-display').className = `text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter ${isWin ? 'text-neon' : 'text-redAccent'}`;
            tierHTML = `<span class="text-${isWin ? 'neon' : 'redAccent'}">[⚔️] NEURAL NET MATCHUP</span>`;
            document.getElementById('result-tier-badge').className = `absolute top-0 right-0 bg-${isWin ? 'neon' : 'redAccent'}/10 text-${isWin ? 'neon' : 'redAccent'} font-black px-4 py-1 rounded-bl-xl tracking-widest text-xs border-b border-l border-${isWin ? 'neon' : 'redAccent'}/30`;
            
            messageHtml = `<span class="text-slate-400">vs. Neural Net GM: <span class="text-white font-bold">${stripMascot(rivalTeamName)}</span></span>`;

            gridTitle.innerText = "Head-to-Head Roster Comparison";
            rosterGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 font-mono text-[10px] sm:text-xs";
            
            let dualHtml = `<div><h4 class="text-white mb-3 border-b border-white/10 pb-1.5 uppercase tracking-widest">Your Dynasty</h4>`;
            const slots = ['PG', 'SG', 'SF', 'PF', 'C'];
            slots.forEach(slot => {
                const p = roster[slot];
                dualHtml += `<div class="flex justify-between items-center border-b border-white/5 pb-1.5 mb-1.5"><div class="text-slate-500 w-10">${slot}</div><div class="text-white font-bold">${p.name}</div><div class="text-slate-600 text-[9px]">WS:${p.ws_score}</div></div>`;
            });
            dualHtml += `</div><div><h4 class="text-redAccent mb-3 border-b border-white/10 pb-1.5 uppercase tracking-widest">Rival Syndicate</h4>`;
            slots.forEach(slot => {
                const p = rivalRoster[slot];
                const pName = p ? p.name : 'N/A';
                const pWs = p ? p.ws_score : '0';
                dualHtml += `<div class="flex justify-between items-center border-b border-white/5 pb-1.5 mb-1.5"><div class="text-slate-500 w-10">${slot}</div><div class="text-white font-bold">${pName}</div><div class="text-slate-600 text-[9px]">WS:${pWs}</div></div>`;
            });
            dualHtml += `</div>`;
            rosterGrid.innerHTML = dualHtml;

        } else {
            // THE MATH FIX: We lowered the max expected score to 54 (accounting for a 5-man starter limit)
            // and softened the exponential penalty curve from Math.pow(ratio, 2) down to Math.pow(ratio, 1.35)
            const maxExpectedScore = 54.0;
            let winRatio = teamWS / maxExpectedScore;
            if (winRatio > 1) winRatio = 1;

            let winPercentage = Math.pow(winRatio, 1.35); 
            finalWins = Math.round(winPercentage * 82);
            
            const rng = Math.random();
            if (rng > 0.90 && finalWins < 82) finalWins += Math.floor(Math.random()*4 + 1);
            if (rng < 0.10 && finalWins > 0) finalWins -= Math.floor(Math.random()*4 + 1);
            if (finalWins > 82) finalWins = 82;
            if (finalWins < 0) finalWins = 0;
            finalLosses = 82 - finalWins;

            if (finalWins === 82) {
                tierHTML = `<span class="text-neon">[S] INVINCIBLE LEGEND</span>`;
                messageHtml = `<span class="text-neon">PERFECT 82-0 SEASON ACHIEVED</span>`;
                document.getElementById('result-tier-badge').className = "absolute top-0 right-0 bg-neon/10 text-neon font-black px-4 py-1 rounded-bl-xl tracking-widest text-xs border-b border-l border-neon/30 shadow-[0_0_15px_rgba(57,255,20,0.2)]";
            } else if (finalWins >= 60) {
                tierHTML = `<span class="text-amberAccent">[A] DYNASTY</span>`;
                messageHtml = `<span class="text-amberAccent">ELITE CHAMPIONSHIP CONTENDER</span>`;
                document.getElementById('result-tier-badge').className = "absolute top-0 right-0 bg-amberAccent/10 text-amberAccent font-black px-4 py-1 rounded-bl-xl tracking-widest text-xs border-b border-l border-amberAccent/30";
            } else if (finalWins >= 42) {
                tierHTML = `<span class="text-cyanAccent">[C] PLAYOFF BUBBLE</span>`;
                messageHtml = `<span class="text-cyanAccent">FIRST ROUND EXIT SQUAD</span>`;
                document.getElementById('result-tier-badge').className = "absolute top-0 right-0 bg-cyanAccent/10 text-cyanAccent font-black px-4 py-1 rounded-bl-xl tracking-widest text-xs border-b border-l border-cyanAccent/30";
            } else {
                tierHTML = `<span class="text-redAccent">[F] LOTTERY BOUND</span>`;
                messageHtml = `<span class="text-redAccent">FRONT OFFICE FIRED</span>`;
                document.getElementById('result-tier-badge').className = "absolute top-0 right-0 bg-redAccent/10 text-redAccent font-black px-4 py-1 rounded-bl-xl tracking-widest text-xs border-b border-l border-redAccent/30";
            }

            headerText.innerText = "FINAL SIMULATED RECORD";
            document.getElementById('result-record-display').innerText = `${finalWins}-${finalLosses}`;
            document.getElementById('result-record-display').className = "text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter";
            
            gridTitle.innerText = "Final Starting Five";
            rosterGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 font-mono text-[10px] sm:text-xs";
            const slots = ['PG', 'SG', 'SF', 'PF', 'C'];
            slots.forEach(slot => {
                const p = roster[slot];
                const statDisplay = activeMode === 'hoopiq' ? '??' : p.ws_score;
                rosterGrid.innerHTML += `
                    <div class="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <div class="text-slate-500 w-10">${slot}</div>
                        <div class="text-white font-bold">${p.name}</div>
                        <div class="text-slate-600 text-[9px] font-mono">WS:${statDisplay}</div>
                    </div>
                `;
            });
        }

        document.getElementById('result-tier-badge').innerHTML = tierHTML;
        document.getElementById('result-message-display').innerHTML = messageHtml;

        if (activeMode !== 'duel') {
            const isLoggedIn = await pushToLeaderboard(finalWins, finalLosses, teamWS);
            
            const authCard = document.getElementById('auth-action-card');
            if (!isLoggedIn) {
                if (authCard) authCard.classList.remove('hidden');
            } else {
                if (authCard) authCard.classList.add('hidden');
                document.getElementById('result-message-display').innerHTML += `
                    <div class="mt-4 text-neon text-[10px] sm:text-xs font-mono tracking-widest uppercase flex justify-center items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-neon animate-pulse"></span>
                        Score Synced to Global Ledger
                    </div>
                `;
            }
        }

        screenGame.classList.add('hidden');
        screenResults.classList.remove('hidden');
        
    }, 1500);
}

window.shareSquad = function() {
    const btn = document.getElementById('btn-share');
    let shareText = "";
    if (activeMode === 'duel') {
        const outcome = finalWins === 1 ? "Defeated" : "Destroyed by";
        shareText = `🏀 Hardwood 1v1 Duel\nI just ${outcome} the Neural Net GM!\n\nPG: ${roster.PG.name}\nSG: ${roster.SG.name}\nSF: ${roster.SF.name}\nPF: ${roster.PF.name}\nC: ${roster.C.name}\n\nCan you beat the AI? terminalsoftware.online/hardwood`;
    } else {
        const modeName = activeMode === 'hoopiq' ? '🧠 HoopIQ' : '💯 Classic';
        shareText = `🏀 Hardwood 82-0 Simulator\n🏆 Record: ${finalWins}-${finalLosses}\n${modeName}\n\nPG: ${roster.PG.name}\nSG: ${roster.SG.name}\nSF: ${roster.SF.name}\nPF: ${roster.PF.name}\nC: ${roster.C.name}\n\nCan you beat the math? terminalsoftware.online/hardwood`;
    }

    navigator.clipboard.writeText(shareText).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span>✅</span> Copied!`;
        btn.classList.replace('bg-cyanAccent', 'bg-neon');
        btn.classList.replace('hover:bg-cyan-400', 'hover:bg-green-400');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace('bg-neon', 'bg-cyanAccent');
            btn.classList.replace('hover:bg-green-400', 'hover:bg-cyan-400');
        }, 3000);
    }).catch(err => console.error("Clipboard failed", err));
}

window.createChallenge = function() {
    const btn = document.getElementById('btn-challenge');
    const modeName = activeMode === 'hoopiq' ? '🧠 HoopIQ' : '💯 Classic';
    
    const shareText = `🏀 Hardwood Challenge!\nMy Dynasty went ${finalWins}-${finalLosses} (${modeName}).\n\nPG: ${roster.PG.name}\nSG: ${roster.SG.name}\nSF: ${roster.SF.name}\nPF: ${roster.PF.name}\nC: ${roster.C.name}\n\nThink you can draft a better 82-0 squad? Prove it: terminalsoftware.online/hardwood`;

    navigator.clipboard.writeText(shareText).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = `Copied!`;
        btn.classList.replace('bg-redAccent', 'bg-neon');
        btn.classList.replace('hover:bg-red-500', 'hover:bg-green-400');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace('bg-neon', 'bg-redAccent');
            btn.classList.replace('hover:bg-green-400', 'hover:bg-red-500');
        }, 3000);
    }).catch(err => console.error("Clipboard failed", err));
}

async function pushToLeaderboard(wins, losses, totalWS) {
    if (typeof window.db === 'undefined') {
        return false;
    }

    try {
        const { data: { session }, error: authError } = await window.db.auth.getSession();
        
        if (authError || !session || !session.user) {
            return false;
        }

        let opHandle = null;
        if (session.user.user_metadata && session.user.user_metadata.operator_handle) {
            opHandle = session.user.user_metadata.operator_handle;
        }

        const safeWS = isNaN(totalWS) ? 0 : Math.round(totalWS * 10) / 10; // WS can be decimals

        const payload = {
            user_email: session.user.email,
            operator_handle: opHandle,
            mode: activeMode === 'hoopiq' ? 'gridironiq' : activeMode, // Mapping for DB consistency if needed, or change table
            wins: wins,
            losses: losses,
            total_ws: safeWS
        };

        // Notice: Pointing this to a new table specific for basketball! You'll need to create 'hardwood_leaderboard' in Supabase.
        const { error: dbError } = await window.db.from('hardwood_leaderboard').insert([payload]);
        
        if (dbError) {
            console.error("🚨 Leaderboard Database Push Failed:", dbError);
            return true; 
        } else {
            return true;
        }
    } catch (err) { 
        console.error("🚨 Database connection error:", err); 
        return false;
    }
}

window.viewLeaderboard = function() {
    screenLobby.classList.add('hidden');
    screenGame.classList.add('hidden');
    screenResults.classList.add('hidden');
    screenLeaderboard.classList.remove('hidden');
    
    checkLeaderboardAuth();
    fetchLeaderboardData();
}

async function checkLeaderboardAuth() {
    if (typeof window.db !== 'undefined') {
        const { data: { session } } = await window.db.auth.getSession();
        if (session && session.user) {
            document.getElementById('lb-signup-btn').classList.add('hidden');
        } else {
            document.getElementById('lb-signup-btn').classList.remove('hidden');
        }
    }
}

window.changeLeaderboardMode = function(mode) {
    currentLbMode = mode;
    fetchLeaderboardData();
}

window.changeLeaderboardTime = function(timeRange) {
    currentLbTime = timeRange;
    fetchLeaderboardData();
}

async function fetchLeaderboardData() {
    const tabClassic = document.getElementById('tab-classic');
    const tabHoopIQ = document.getElementById('tab-gridironiq');
    
    if (currentLbMode === 'classic') {
        tabClassic.className = "px-6 py-2 border border-amberAccent text-amberAccent bg-amberAccent/10 rounded-xl font-bold tracking-widest uppercase text-xs transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]";
        tabHoopIQ.className = "px-6 py-2 border border-slate-600 text-slate-500 rounded-xl font-bold tracking-widest uppercase text-xs hover:text-white hover:border-white/30 transition-all";
    } else {
        tabHoopIQ.className = "px-6 py-2 border border-neon text-neon bg-neon/10 rounded-xl font-bold tracking-widest uppercase text-xs transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]";
        tabClassic.className = "px-6 py-2 border border-slate-600 text-slate-500 rounded-xl font-bold tracking-widest uppercase text-xs hover:text-white hover:border-white/30 transition-all";
    }

    const btnAll = document.getElementById('time-all');
    const btnDaily = document.getElementById('time-daily');
    const btnWeekly = document.getElementById('time-weekly');
    
    [btnAll, btnDaily, btnWeekly].forEach(btn => {
        btn.className = "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-slate-500 hover:text-white transition-all";
    });

    if (currentLbTime === 'all_time') btnAll.className = "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/10 text-white transition-all";
    if (currentLbTime === 'daily') btnDaily.className = "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/10 text-white transition-all";
    if (currentLbTime === 'weekly') btnWeekly.className = "px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white/10 text-white transition-all";

    podiumContainer.innerHTML = '';
    leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-slate-500 font-mono animate-pulse">QUERYING MATRIX...</td></tr>';

    if (typeof window.db === 'undefined') {
        leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-redAccent font-mono">DATABASE OFFLINE (GUEST MODE)</td></tr>';
        return;
    }

    try {
        let query = window.db.from('hardwood_leaderboard').select('*').eq('mode', currentLbMode);

        const now = new Date();
        if (currentLbTime === 'daily') {
            const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            query = query.gte('created_at', yesterday.toISOString());
        } else if (currentLbTime === 'weekly') {
            const lastWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
            query = query.gte('created_at', lastWeek.toISOString());
        }

        query = query.order('wins', { ascending: false }).order('total_ws', { ascending: false }).limit(50);
        
        const { data, error } = await query;
        
        if (error) throw error;
        if (!data || data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-slate-500 font-mono">NO RECORDS FOUND FOR THIS TIMEFRAME</td></tr>';
            return;
        }

        const top3 = data.slice(0, 3);
        const rest = data.slice(3);

        const podiumOrder = [
            { player: top3[1], rank: 2, color: 'cyanAccent', bg: 'bg-cyanAccent/10', border: 'border-cyanAccent/50', medal: '🥈', height: 'h-24 sm:h-32' },
            { player: top3[0], rank: 1, color: 'amberAccent', bg: 'bg-amberAccent/10', border: 'border-amberAccent/50', medal: '👑', height: 'h-32 sm:h-40' },
            { player: top3[2], rank: 3, color: 'purpleAccent', bg: 'bg-purpleAccent/10', border: 'border-purpleAccent/50', medal: '🥉', height: 'h-16 sm:h-24' }
        ];

        let podiumHtml = '';
        podiumOrder.forEach(item => {
            if (!item.player) {
                podiumHtml += `<div class="flex flex-col items-center justify-end opacity-20"><div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 mb-3 sm:mb-4"></div><div class="w-full ${item.height} bg-white/5 rounded-t-2xl"></div></div>`;
                return;
            }
            const p = item.player;
            let rawHandle = p.operator_handle || (p.user_email ? p.user_email.split('@')[0] : 'GUEST');
            const handle = rawHandle.length > 15 ? rawHandle.substring(0, 15) + '...' : rawHandle;
            const initials = rawHandle.substring(0, 2).toUpperCase();

            podiumHtml += `
            <div class="flex flex-col items-center justify-end transform transition hover:-translate-y-2">
                <div class="relative mb-2 sm:mb-3 group cursor-default">
                    <div class="absolute inset-0 ${item.bg} blur-xl rounded-full transition-all group-hover:blur-2xl"></div>
                    <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 ${item.border} bg-studio flex items-center justify-center relative z-10 shadow-[0_0_15px_currentColor] text-${item.color}">
                        <span class="font-black text-lg sm:text-xl tracking-tighter">${initials}</span>
                        <div class="absolute -top-2 -right-2 text-base sm:text-xl filter drop-shadow-md">${item.medal}</div>
                    </div>
                </div>
                <div class="text-white font-bold text-[10px] sm:text-xs truncate w-full text-center px-1 mb-1">${handle}</div>
                <div class="text-${item.color} font-mono font-black text-sm sm:text-base leading-none mb-1">${p.wins}-${p.losses}</div>
                <div class="text-slate-500 font-mono text-[8px] sm:text-[9px] uppercase tracking-widest mb-3 sm:mb-4">WS: ${p.total_ws}</div>
                <div class="w-full ${item.height} ${item.bg} border-t border-l border-r ${item.border} rounded-t-xl sm:rounded-t-2xl flex items-start justify-center pt-3 sm:pt-4 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                    <div class="font-black text-2xl sm:text-4xl text-white/20 relative z-10">${item.rank}</div>
                </div>
            </div>`;
        });
        podiumContainer.innerHTML = podiumHtml;

        if (rest.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest">No further operators found.</td></tr>';
        } else {
            let tableHtml = '';
            rest.forEach((row, index) => {
                const rank = index + 4;
                const rawHandle = row.operator_handle || (row.user_email ? row.user_email.split('@')[0] : 'GUEST');
                const safeHandle = rawHandle.length > 20 ? rawHandle.substring(0, 20) + '...' : rawHandle;
                
                tableHtml += `
                    <tr class="hover:bg-white/5 transition-colors border-b border-white/5 group">
                        <td class="py-3 px-4 text-slate-500 font-bold w-16 text-center group-hover:text-white transition-colors">#${rank}</td>
                        <td class="py-3 px-4 text-slate-300 font-medium text-left group-hover:text-white transition-colors">${safeHandle}</td>
                        <td class="py-3 px-4 text-cyanAccent font-mono font-bold text-center">${row.wins}-${row.losses}</td>
                        <td class="py-3 px-4 text-slate-500 font-mono text-right text-[10px] group-hover:text-slate-400 transition-colors">${row.total_ws}</td>
                    </tr>
                `;
            });
            leaderboardBody.innerHTML = tableHtml;
        }
    } catch (err) { 
        console.error("Leaderboard Error:", err);
        leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-redAccent font-mono">CRITICAL ERROR: FAILED TO RETRIEVE TELEMETRY</td></tr>'; 
    }
}

window.addEventListener('DOMContentLoaded', initGame);
