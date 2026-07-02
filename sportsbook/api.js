// api.js - Terminal Software: Core Data Engine
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// TODO: Replace with your actual Terminal project keys
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------
// THE MASTER LEDGER (Game State)
// ----------------------------------------------------
export const GameState = {
    bankroll: 250000, // Player starts with $250k
    activeLines: {},  // The real-world lines we pull from Supabase
    playerLines: {},  // The odds the player is actively offering
    liabilities: {}   // Track exposure on each side of a bet
};

const terminalLog = document.getElementById('terminal-log');
const statusText = document.getElementById('connection-status');

function logToTerminal(message, colorClass = "text-slate-400") {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    terminalLog.innerHTML += `<div class="${colorClass}">[${time}] ${message}</div>`;
    terminalLog.scrollTop = terminalLog.scrollHeight; // Auto-scroll
}

// ----------------------------------------------------
// INITIALIZATION & WEBSOCKETS
// ----------------------------------------------------
async function bootEngine() {
    logToTerminal("> Booting Market Simulator...", "text-neon");

    // 1. Fetch initial active slate
    const { data, error } = await supabase
        .from('ev_live_data')
        .select('*')
        .eq('status', 'active')
        .limit(25); // Keep the first batch manageable

    if (error) {
        logToTerminal(`> CRITICAL ERROR: ${error.message}`, "text-redAccent");
        return;
    }

    logToTerminal(`> Pulled ${data.length} active edges into the matrix.`);
    
    // Populate Initial State
    data.forEach(game => {
        GameState.activeLines[game.id] = game;
        // Default player lines to match the real-world opening lines
        GameState.playerLines[game.id] = { ...game }; 
    });

    // 2. Establish Realtime Feed
    supabase.channel('public:ev_live_data')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'ev_live_data' },
            (payload) => handleMarketMovement(payload.new, 'INSERT')
        )
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'ev_live_data' },
            (payload) => handleMarketMovement(payload.new, 'UPDATE')
        )
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                statusText.innerText = "[ PIPELINE SECURE: REALTIME TELEMETRY ACTIVE ]";
                statusText.className = "text-neon font-bold mb-4";
                logToTerminal("> WebSocket connected. Awaiting sharp action...", "text-neon");
            }
        });
}

// ----------------------------------------------------
// THE PHYSICS ENGINE (Reactivity)
// ----------------------------------------------------
function handleMarketMovement(newRow, eventType) {
    if (newRow.status !== 'active') return;

    // Update our ground-truth ledger
    GameState.activeLines[newRow.id] = newRow;

    logToTerminal(`> MARKET SHIFT [${eventType}]: ${newRow.match_name} | ${newRow.target} moved to ${newRow.odds}`);
    
    // Trigger custom event so the UI and Sharp Bots know the true line just moved
    document.dispatchEvent(new CustomEvent('TrueLineMoved', { detail: newRow }));
}

// Ignite
bootEngine();
