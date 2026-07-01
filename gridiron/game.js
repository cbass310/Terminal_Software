// /gridiron/game.js
// Terminal Software - Gridiron 17-0 Engine

let activeMode = 'classic';
let database = {};
let availableTeams = [];
let currentRoll = null;
let reRollsLeft = 2;
let finalWins = 0;
let finalLosses = 0;

const roster = { QB: null, RB: null, WR1: null, WR2: null, TE: null, DST: null };

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

const tabClassic = document.getElementById('tab-classic');
const tabGridironIQ = document.getElementById('tab-gridironiq');
const podiumContainer = document.getElementById('leaderboard-podium');
const leaderboardBody = document.getElementById('leaderboard-body');

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
    }
}

window.startGame = function(mode) {
    activeMode = mode;
    screenLobby.classList.add('hidden');
    screenResults.classList.add('hidden');
    screenLeaderboard.classList.add('hidden');
    screenGame.classList.remove('hidden');
    
    if (activeMode === 'gridironiq') {
        btnSpin.className = "bg-neon text-background font-black px-8 py-4 rounded-xl uppercase tracking-widest hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(57,255,20,0.4)]";
    } else if (activeMode === 'duel') {
        btnSpin.className = "bg-redAccent text-white font-black px-8 py-4 rounded-xl uppercase tracking-widest hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.4)]";
    } else {
        btnSpin.className = "bg-amberAccent text-background font-black px-8 py-4 rounded-xl uppercase tracking-widest hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.4)]";
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
        spinnerDisplay.innerHTML = `<span class="spinning-text">${randomTeam}</span>`;
        spinCount++;

        if (spinCount > 15) {
            clearInterval(spinInterval);
            currentRoll = randomTeam;
            let themeColor = activeMode === 'gridironiq' ? 'text-neon' : (activeMode === 'duel' ? 'text-redAccent' : 'text-amberAccent');
            spinnerDisplay.innerHTML = `<span class="locked-in ${themeColor}">${currentRoll}</span>`;
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
        let colorAccent = 'amberAccent';
        if (activeMode === 'gridironiq') colorAccent = 'neon';
        if (activeMode === 'duel') colorAccent = 'redAccent';

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
    let colorAccent = 'amberAccent';
    if (activeMode === 'gridironiq') colorAccent = 'neon';
    if (activeMode === 'duel') colorAccent = 'redAccent';

    document.querySelector(`[data-slot="${assignedSlot}"]`).innerHTML = `
        <span class="text-slate-500 w-8">${assignedSlot}</span>
        <span class="text-white font-bold text-right">${player.name} <span class="text-${colorAccent} ml-2 text-xs">AV:${ledgerAV}</span></span>
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

    setTimeout(() => {
        const weights = { "QB": 0.38, "DST": 0.22, "RB": 0.14, "WR1": 0.12, "WR2": 0.09, "TE": 0.05 };
        let playerWeightedScore = 0;
        for (const [pos, player] of Object.entries(roster)) {
            playerWeightedScore += player.av_score * weights[pos];
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
            let rivalRoster = { QB: null, RB: null, WR1: null, WR2: null, TE: null, DST: null };
            
            let sortedPlayers = [...rivalPlayers].sort((a, b) => b.av_score - a.av_score);
            sortedPlayers.forEach(p => {
                if (p.position === 'WR1' || p.position === 'WR2') {
                    if (!rivalRoster['WR1']) rivalRoster['WR1'] = p;
                    else if (!rivalRoster['WR2']) rivalRoster['WR2'] = p;
                } else {
                    if (!rivalRoster[p.position]) rivalRoster[p.position] = p;
                }
            });

            let rivalWeightedScore = 0;
            for (const [pos, player] of Object.entries(rivalRoster)) {
                if (player) rivalWeightedScore += player.av_score * weights[pos];
            }

            let playerFinal = playerWeightedScore * (0.9 + (Math.random() * 0.2));
            let rivalFinal = rivalWeightedScore * (0.9 + (Math.random() * 0.2));
            const isWin = playerFinal > rivalFinal;
            
            finalWins = isWin ? 1 : 0;
            finalLosses = isWin ? 0 : 1;

            headerText.innerText = "1V1 DUEL OUTCOME";
            document.getElementById('result-record-display').innerText = isWin ? "VICTORY" : "DEFEAT";
            document.getElementById('result-record-display').className = `text-7xl md:text-9xl font-black tracking-tighter ${isWin ? 'text-neon' : 'text-redAccent'}`;
            tierHTML = `<span class="text-${isWin ? 'neon' : 'redAccent'}">[⚔️] NEURAL NET MATCHUP</span>`;
            document.getElementById('result-tier-badge').className = `absolute top-0 right-0 bg-${isWin ? 'neon' : 'redAccent'}/10 text-${isWin ? 'neon' : 'redAccent'} font-black px-6 py-2 rounded-bl-2xl tracking-widest border-b border-l border-${isWin ? 'neon' : 'redAccent'}/30`;
            messageHtml = `<span class="text-slate-400">vs. Neural Net GM: <span class="text-white font-bold">${rivalTeamName}</span></span>`;

            gridTitle.innerText = "Head-to-Head Roster Comparison";
            rosterGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 font-mono text-sm";
            
            let dualHtml = `<div><h4 class="text-white mb-4 border-b border-white/10 pb-2 uppercase tracking-widest">Your Dynasty</h4>`;
            const slots = ['QB', 'RB', 'WR1', 'WR2', 'TE', 'DST'];
            slots.forEach(slot => {
                const p = roster[slot];
                dualHtml += `<div class="flex justify-between items-center border-b border-white/5 pb-2 mb-2"><div class="text-slate-500 w-10">${slot}</div><div class="text-white font-bold">${p.name}</div><div class="text-slate-600 text-xs">AV:${p.av_score}</div></div>`;
            });
            dualHtml += `</div><div><h4 class="text-redAccent mb-4 border-b border-white/10 pb-2 uppercase tracking-widest">Rival Syndicate</h4>`;
            slots.forEach(slot => {
                const p = rivalRoster[slot];
                const pName = p ? p.name : 'N/A';
                const pAv = p ? p.av_score : '0';
                dualHtml += `<div class="flex justify-between items-center border-b border-white/5 pb-2 mb-2"><div class="text-slate-500 w-10">${slot}</div><div class="text-white font-bold">${pName}</div><div class="text-slate-600 text-xs">AV:${pAv}</div></div>`;
            });
            dualHtml += `</div>`;
            rosterGrid.innerHTML = dualHtml;

        } else {
            const maxExpectedScore = 19.0;
            let winPercentage = playerWeightedScore / maxExpectedScore;
            if (winPercentage > 1) winPercentage = 1;

            finalWins = Math.round(winPercentage * 17);
            const rng = Math.random();
            if (rng > 0.85 && finalWins < 17) finalWins += 1;
            if (rng < 0.15 && finalWins > 0) finalWins -= 1;
            finalLosses = 17 - finalWins;

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

            headerText.innerText = "FINAL SIMULATED RECORD";
            document.getElementById('result-record-display').innerText = `${finalWins}-${finalLosses}`;
            document.getElementById('result-record-display').className = "text-7xl md:text-9xl font-black text-white tracking-tighter";
            
            gridTitle.innerText = "Final Dynasty Roster";
            rosterGrid.className = "grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 font-mono text-sm";
            const slots = ['QB', 'RB', 'WR1', 'WR2', 'TE', 'DST'];
            slots.forEach(slot => {
                const p = roster[slot];
                const statDisplay = activeMode === 'gridironiq' ? '??' : p.av_score;
                rosterGrid.innerHTML += `
                    <div class="flex justify-between items-center border-b border-white/5 pb-2">
                        <div class="text-slate-500 w-10">${slot}</div>
                        <div class="text-white font-bold">${p.name}</div>
                        <div class="text-slate-600 text-xs font-mono">AV:${statDisplay}</div>
                    </div>
                `;
            });
        }

        document.getElementById('result-message-display').innerHTML = messageHtml;
        document.getElementById('result-tier-badge').innerHTML = tierHTML;

        if (activeMode !== 'duel') {
            pushToLeaderboard(finalWins, finalLosses, playerWeightedScore);
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
        shareText = `🏈 Gridiron 1v1 Duel\nI just ${outcome} the Neural Net GM!\n\nQB: ${roster.QB.name}\nRB: ${roster.RB.name}\nWR1: ${roster.WR1.name}\nWR2: ${roster.WR2.name}\nTE: ${roster.TE.name}\nDST: ${roster.DST.name}\n\nCan you beat the AI? terminalsoftware.online/gridiron`;
    } else {
        const modeName = activeMode === 'gridironiq' ? '🧠 GridironIQ' : '💯 Classic';
        shareText = `🏈 Gridiron Simulator\n🏆 Record: ${finalWins}-${finalLosses}\n${modeName}\n\nQB: ${roster.QB.name}\nRB: ${roster.RB.name}\nWR1: ${roster.WR1.name}\nWR2: ${roster.WR2.name}\nTE: ${roster.TE.name}\nDST: ${roster.DST.name}\n\nCan you beat the math? terminalsoftware.online/gridiron`;
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

async function pushToLeaderboard(wins, losses, totalAV) {
    if (typeof window.db === 'undefined') return;
    try {
        const { data: { session } } = await window.db.auth.getSession();
        if (session && session.user) {
            let opHandle = null;
            if (session.user.user_metadata && session.user.user_metadata.operator_handle) {
                opHandle = session.user.user_metadata.operator_handle;
            }
            const payload = {
                user_email: session.user.email,
                operator_handle: opHandle,
                mode: activeMode,
                wins: wins,
                losses: losses,
                total_av: Math.round(totalAV)
            };
            const { error } = await window.db.from('gridiron_leaderboard').insert([payload]);
            if (error) console.error("Leaderboard Push Failed:", error);
        }
    } catch (err) { console.error("Database connection error:", err); }
}

window.viewLeaderboard = function() {
    screenLobby.classList.add('hidden');
    screenGame.classList.add('hidden');
    screenResults.classList.add('hidden');
    screenLeaderboard.classList.remove('hidden');
    loadLeaderboardData(activeMode === 'duel' ? 'classic' : activeMode);
}

window.loadLeaderboardData = async function(mode) {
    if (mode === 'classic') {
        tabClassic.className = "px-8 py-2.5 border border-amberAccent text-amberAccent bg-amberAccent/10 rounded-xl font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]";
        tabGridironIQ.className = "px-8 py-2.5 border border-slate-600 text-slate-500 rounded-xl font-bold tracking-widest uppercase hover:text-white hover:border-white/30 transition-all";
    } else {
        tabGridironIQ.className = "px-8 py-2.5 border border-neon text-neon bg-neon/10 rounded-xl font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]";
        tabClassic.className = "px-8 py-2.5 border border-slate-600 text-slate-500 rounded-xl font-bold tracking-widest uppercase hover:text-white hover:border-white/30 transition-all";
    }

    podiumContainer.innerHTML = '';
    leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-slate-500 font-mono animate-pulse">QUERYING MATRIX...</td></tr>';

    if (typeof window.db === 'undefined') {
        leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-redAccent font-mono">DATABASE OFFLINE (GUEST MODE)</td></tr>';
        return;
    }

    try {
        const { data, error } = await window.db.from('gridiron_leaderboard').select('*').eq('mode', mode).order('wins', { ascending: false }).order('total_av', { ascending: false }).limit(50);
        if (error) throw error;
        if (!data || data.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-slate-500 font-mono">NO RECORDS FOUND FOR THIS PROTOCOL</td></tr>';
            return;
        }

        const top3 = data.slice(0, 3);
        const rest = data.slice(3);

        const podiumOrder = [
            { player: top3[1], rank: 2, color: 'cyanAccent', bg: 'bg-cyanAccent/10', border: 'border-cyanAccent/50', medal: '🥈', height: 'h-32' },
            { player: top3[0], rank: 1, color: 'amberAccent', bg: 'bg-amberAccent/10', border: 'border-amberAccent/50', medal: '👑', height: 'h-40' },
            { player: top3[2], rank: 3, color: 'purpleAccent', bg: 'bg-purpleAccent/10', border: 'border-purpleAccent/50', medal: '🥉', height: 'h-24' }
        ];

        let podiumHtml = '';
        podiumOrder.forEach(item => {
            if (!item.player) {
                podiumHtml += `<div class="flex flex-col items-center justify-end opacity-20"><div class="w-16 h-16 rounded-full bg-white/5 mb-4"></div><div class="w-full ${item.height} bg-white/5 rounded-t-2xl"></div></div>`;
                return;
            }
            const p = item.player;
            let rawHandle = p.operator_handle || (p.user_email ? p.user_email.split('@')[0] : 'GUEST');
            const handle = rawHandle.length > 15 ? rawHandle.substring(0, 15) + '...' : rawHandle;
            const initials = rawHandle.substring(0, 2).toUpperCase();

            podiumHtml += `
            <div class="flex flex-col items-center justify-end transform transition hover:-translate-y-2">
                <div class="relative mb-3 group cursor-default">
                    <div class="absolute inset-0 ${item.bg} blur-xl rounded-full transition-all group-hover:blur-2xl"></div>
                    <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 ${item.border} bg-studio flex items-center justify-center relative z-10 shadow-[0_0_15px_currentColor] text-${item.color}">
                        <span class="font-black text-xl sm:text-2xl tracking-tighter">${initials}</span>
                        <div class="absolute -top-3 -right-2 text-xl filter drop-shadow-md">${item.medal}</div>
                    </div>
                </div>
                <div class="text-white font-bold text-xs sm:text-sm truncate w-full text-center px-2 mb-1">${handle}</div>
                <div class="text-${item.color} font-mono font-black text-base sm:text-xl leading-none mb-1">${p.wins}-${p.losses}</div>
                <div class="text-slate-500 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest mb-4">AV: ${p.total_av}</div>
                <div class="w-full ${item.height} ${item.bg} border-t border-l border-r ${item.border} rounded-t-2xl flex items-start justify-center pt-4 relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                    <span class="font-black text-3xl sm:text-5xl text-white/20 relative z-10">${item.rank}</span>
                </div>
            </div>`;
        });
        podiumContainer.innerHTML = podiumHtml;

        if (rest.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">No further operators found.</td></tr>';
        } else {
            let tableHtml = '';
            rest.forEach((row, index) => {
                const rank = index + 4;
                const rawHandle = row.operator_handle || (row.user_email ? row.user_email.split('@')[0] : 'GUEST');
                const safeHandle = rawHandle.length > 20 ? rawHandle.substring(0, 20) + '...' : rawHandle;
                
                tableHtml += `
                    <tr class="hover:bg-white/5 transition-colors border-b border-white/5 group">
                        <td class="py-4 px-6 text-slate-500 font-bold w-20 text-center group-hover:text-white transition-colors">#${rank}</td>
                        <td class="py-4 px-6 text-slate-300 font-medium text-left group-hover:text-white transition-colors">${safeHandle}</td>
                        <td class="py-4 px-6 text-cyanAccent font-mono font-bold text-center">${row.wins}-${row.losses}</td>
                        <td class="py-4 px-6 text-slate-500 font-mono text-right text-xs group-hover:text-slate-400 transition-colors">${row.total_av}</td>
                    </tr>
                `;
            });
            leaderboardBody.innerHTML = tableHtml;
        }
    } catch (err) { leaderboardBody.innerHTML = '<tr><td colspan="4" class="py-12 text-center text-redAccent font-mono">CRITICAL ERROR: FAILED TO RETRIEVE TELEMETRY</td></tr>'; }
}

window.addEventListener('DOMContentLoaded', initGame);
