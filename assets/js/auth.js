// --- 1. GLOBAL SUPABASE INITIALIZATION ---
// This creates the database connection and exposes it globally so ALL your HTML pages can use it.
const supabaseUrl = 'https://pkyvpckvpnfksykhuqew.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBreXZwY2t2cG5ma3N5a2h1cWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzY2MzUsImV4cCI6MjA5MjE1MjYzNX0.k1dOad6WRSmTnuc1__cWDEtZCHN89vDQvOyyH5OWUHo';

// Attach to window object to guarantee it is available to the inline scripts in dashboard.html & portal.html
window.db = window.supabase.createClient(supabaseUrl, supabaseKey);
const db = window.db;

// --- 2. BULLETPROOF SIGN OUT LOGIC ---
// Fixes the race condition by forcing the browser to wait for the server before redirecting
async function handleSignOut(e) {
    if (e) e.preventDefault(); // Stop any default button clicks
    
    try {
        if (typeof db !== 'undefined') {
            await db.auth.signOut(); // Browser waits here until the server confirms the token is dead
        }
        
        // Wipe local storage to ensure a clean slate for the next user session
        localStorage.removeItem('ts_active_books');
        localStorage.removeItem('ts_default_bankroll');
        
        // Safely redirect to the homepage
        window.location.replace('index.html');
    } catch (error) {
        console.error('Fatal Sign Out Error:', error);
        // Force the redirect anyway just in case the API hangs
        window.location.replace('index.html'); 
    }
}
// Expose it globally so the inline HTML buttons can access it
window.handleSignOut = handleSignOut;


// --- 3. GLOBAL SMART NAVBAR LOGIC ---
// This checks if the user is logged in and updates the top navigation bar accordingly.
async function setupSmartNavbar() {
    const authNavDesktop = document.getElementById('dynamic-auth-nav');
    const authNavMobile = document.getElementById('dynamic-auth-nav-mobile');
    
    try {
        const { data: { session } } = await db.auth.getSession();

        if (session) {
            // USER IS LOGGED IN
            if(authNavDesktop) authNavDesktop.innerHTML = `
                <a href="dashboard.html" class="text-sm font-black text-brand tracking-wide uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">Enter Portal</a>
                <button onclick="handleSignOut(event)" class="text-xs font-bold bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-white/10 hover:border-red-500/50 py-2 px-4 rounded-lg transition-all uppercase tracking-widest ml-4 focus:outline-none cursor-pointer">Sign Out</button>
            `;
            if(authNavMobile) authNavMobile.innerHTML = `
                <a href="dashboard.html" class="block px-4 py-3 rounded-xl text-base font-black text-background bg-brand hover:bg-yellow-400 uppercase tracking-wide transition shadow-lg text-center">Enter Portal</a>
                <button onclick="handleSignOut(event)" class="block w-full mt-2 px-4 py-3 rounded-xl text-base font-black text-red-400 bg-red-500/10 border border-red-500/30 uppercase tracking-wide transition text-center focus:outline-none cursor-pointer">Sign Out</button>
            `;
        } else {
            // USER IS LOGGED OUT
            if(authNavDesktop) authNavDesktop.innerHTML = `
                <a href="login.html" class="text-xs font-black bg-brand hover:bg-yellow-400 text-background px-6 py-2 rounded-lg transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.3)]">Sign In / Register</a>
            `;
            if(authNavMobile) authNavMobile.innerHTML = `
                <a href="login.html" class="block px-4 py-3 rounded-xl text-base font-black text-background bg-brand hover:bg-yellow-400 uppercase tracking-wide transition shadow-lg text-center">Sign In / Register</a>
            `;
        }
    } catch(e) { 
        console.error("Smart Nav Error:", e); 
    }
}

// Expose globally so components.js can trigger it on page load
window.setupSmartNavbar = setupSmartNavbar;
