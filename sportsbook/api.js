// api.js - Terminal Software: Core Data & Game Engine
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🚨 SECURE CREDENTIALS
const SUPABASE_URL = 'https://pkyvpckvpnfksykhuqew.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBreXZwY2t2cG5ma3N5a2h1cWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzY2MzUsImV4cCI6MjA5MjE1MjYzNX0.k1dOad6WRSmTnuc1__cWDEtZCHN89vDQvOyyH5OWUHo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------
// THE MASTER LEDGER (Game State)
// ----------------------------------------------------
export const GameState = {
    bankroll: 250000, 
    activeLines: {},  // True real-world lines from Supabase
    playerLines: {},  // Lines currently offered by the player
    liabilities: {}   // Track total exposure
};

// UI Elements
const terminalLog = document.getElementById('terminal-log');
const statusText = document.getElementById('connection-status');
const marketBoard = document.getElementById('market-board');
const uiBankroll = document.getElementById('ui-bankroll');
const uiLiability = document.getElementById('ui-liability');

// ----------------------------------------------------
// UTILITY: LOGGING & MATH
// ----------------------------------------------------
function logToTerminal(message, colorClass = "text-slate-400") {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    terminalLog.innerHTML += `<div class="${colorClass}">[${time}] ${message}</div>`;
    terminalLog.scrollTop = terminalLog.scrollHeight;
}

function americanToImplied(odds) {
    let num = parseInt(odds);
    if (num > 0) return 100 / (num + 100);
    return Math.abs(num) / (Math.abs(num) + 100);
}

function shiftOdds(currentOdds, direction) {
    let odds = parseInt(currentOdds);
    if (isNaN(odds)) return currentOdds;

    if (direction === 'up') {
        if (odds >= -105 && odds < 100) return 100;
        return odds + 5;
    } else {
        if (odds <= 105 && odds > -100) return -105;
        return odds - 5;
    }
}

// ----------------------------------------------------
// UI RENDERING & PLAYER ACTION
// ----------------------------------------------------
function renderActionConsole() {
    marketBoard.innerHTML = ''; 

    Object.keys(GameState.playerLines).forEach(id => {
        const game = GameState.playerLines[id];
        const trueOdds = GameState.activeLines[id].odds; 
        
        const row = document.createElement('div');
        row.className = "flex justify-between items-center bg-[#111111] p-3 border-l-2 border-neon hover:bg-[#1a1a1a] transition-colors";
        
        row.innerHTML = `
            <div class="flex flex-col truncate pr-4">
                <span class="text-white font-bold truncate">${game.match_name}</span>
                <span class="text-slate-500 text-xs">${game.market} | ${game.target}</span>
            </div>
            <div class="flex items-center space-x-3 shrink-0">
                <div class="flex flex-col text-right mr-2">
                    <span class="text-slate-600 text-[10px] uppercase">True Line</span>
                    <span class="text-slate-400 text-xs">${trueOdds > 0 ? '+' + trueOdds : trueOdds}</span>
                </div>
                <button onclick="adjustLine('${id}', 'down')" class="px-3 py-1 bg-slate-800 hover:bg-redAccent text-white transition-colors">-</button>
                <span class="text-neon font-bold w-12 text-center text-lg" id="player-line-${id}">
                    ${game.odds > 0 ? '+' + game.odds : game.odds}
                </span>
                <button onclick="adjustLine('${id}', 'up')" class="px-3 py-1 bg-slate-800 hover:bg-neon hover:text-black text-white transition-colors">+</button>
            </div>
        `;
        marketBoard.appendChild(row);
    });
}

// Attach to window so inline HTML onclick works
window.adjustLine = function(gameId, direction) {
    const currentLine = GameState.playerLines[gameId].odds;
    const newLine = shiftOdds(currentLine, direction);
    
    GameState.playerLines[gameId].odds = newLine;
    const displayLine = newLine > 0 ? `+${newLine}` : newLine;
    
    document.getElementById(`player-line-${gameId}`).innerText = displayLine;
    logToTerminal(`> LINE SHIFT: [${gameId}] adjusted to ${displayLine}`);
};

// ----------------------------------------------------
// THE MARKET PHYSICS (Sharp AI Loop)
// ----------------------------------------------------
function bootMarketSimulation() {
    logToTerminal("> 🤖 AI Betting Syndicates Online.", "text-yellow-500");
    
    // Global market ticks every 4 seconds
    setInterval(() => {
        processIncomingBets();
    }, 4000);
}

function processIncomingBets() {
    const activeGameIds = Object.keys(GameState.playerLines);
    if (activeGameIds.length === 0) return;

    // Target a random game
    const randomGameId = activeGameIds[Math.floor(Math.random() * activeGameIds.length)];
    const playerLine = GameState.playerLines[randomGameId];
    const trueLine = GameState.activeLines[randomGameId];

    const playerProb = americanToImplied(playerLine.odds);
    const trueProb = americanToImplied(trueLine.odds);
    const edge = playerProb - trueProb; 

    // Decision Matrix
    if (edge < -0.02) {
        simulateBet(randomGameId, "SQUARE", 50, "text-green-500");
    } 
    else if (edge > 0.03) {
        simulateBet(randomGameId, "SHARP_SYNDICATE", 5000, "text-redAccent font-bold bg-red-900/20 p-1");
        logToTerminal(`🚨 EXPLOIT: Sharp action hammering ${playerLine.target}! Move your lines!`, "text-redAccent font-bold");
    } 
    else {
        simulateBet(randomGameId, "RETAIL", 250, "text-slate-400");
    }
}

function simulateBet(gameId, bettorType, baseAmount, cssClass) {
    const wager = Math.floor(baseAmount * (0.5 + Math.random()));
    
    GameState.bankroll += wager; 
    GameState.liabilities[gameId] = (GameState.liabilities[gameId] || 0) + wager;
    
    // Calculate total liability
    const totalLiab = Object.values(GameState.liabilities).reduce((a, b) => a + b, 0);

    uiBankroll.innerText = `$${GameState.bankroll.toLocaleString()}`;
    uiLiability.innerText = `$${totalLiab.toLocaleString()}`;
    
    const targetName = GameState.playerLines[gameId].target;
    logToTerminal(`> [${bettorType}] Wager: $${wager} on ${targetName}`, cssClass);
}

// ----------------------------------------------------
// INITIALIZATION & SUPABASE PIPELINE
// ----------------------------------------------------
function handleMarketMovement(newRow, eventType) {
    if (newRow.status !== 'active') return;

    // Update Ground Truth
    GameState.activeLines[newRow.id] = newRow;
    logToTerminal(`> MARKET SHIFT: ${newRow.match_name} true line moved to ${newRow.odds}`, "text-cyan-400");
    
    // Re-render the console to dim/update true odds without destroying player state
    renderActionConsole();
}

async function bootEngine() {
    logToTerminal("> Booting Market Simulator...", "text-neon");

    // 1. Fetch initial active slate
    const { data, error } = await supabase
        .from('ev_live_data')
        .select('*')
        .eq('status', 'active')
        .limit(10); // Keep scope tight for UI testing

    if (error) {
        logToTerminal(`> CRITICAL ERROR: ${error.message}`, "text-redAccent");
        statusText.innerText = "[ DATALINK FAILED ]";
        statusText.className = "text-redAccent font-bold text-sm";
        return;
    }

    logToTerminal(`> Pulled ${data.length} active edges into the matrix.`);
    
    // Populate Initial State
    data.forEach(game => {
        GameState.activeLines[game.id] = game;
        GameState.playerLines[game.id] = { ...game }; 
    });

    renderActionConsole();

    // 2. Establish Realtime Feed
    supabase.channel('public:ev_live_data')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ev_live_data' }, (payload) => handleMarketMovement(payload.new, 'INSERT'))
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ev_live_data' }, (payload) => handleMarketMovement(payload.new, 'UPDATE'))
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                statusText.innerText = "[ PIPELINE SECURE: REALTIME TELEMETRY ACTIVE ]";
                statusText.className = "text-neon font-bold text-sm";
                logToTerminal("> WebSocket connected. Market is live.", "text-neon");
                
                // Ignite the AI Loop
                bootMarketSimulation();
            }
        });
}

// Ignite
bootEngine();
