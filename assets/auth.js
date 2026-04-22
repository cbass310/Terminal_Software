// assets/js/auth.js

// 1. Initialize Supabase
const supabaseUrl = 'https://pkyvpckvpnfksykhuqew.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBreXZwY2t2cG5ma3N5a2h1cWV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzY2MzUsImV4cCI6MjA5MjE1MjYzNX0.k1dOad6WRSmTnuc1__cWDEtZCHN89vDQvOyyH5OWUHo';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. Smart Navbar Logic
async function setupSmartNavbar() {
    const authNavDesktop = document.getElementById('dynamic-auth-nav');
    const authNavMobile = document.getElementById('dynamic-auth-nav-mobile');
    
    // Check if we are in a subdirectory (like /tutorials/) to fix link paths
    const isInSubdir = window.location.pathname.includes('/tutorials/');
    const pathPrefix = isInSubdir ? '../' : '';
    
    try {
        const { data: { session } } = await db.auth.getSession();

        if (session) {
            if(authNavDesktop) authNavDesktop.innerHTML = `
                <a href="${pathPrefix}dashboard.html" class="text-sm font-black text-brand tracking-wide uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">Enter Portal</a>
                <button onclick="db.auth.signOut(); window.location.reload();" class="text-xs font-bold bg-white/10 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-white/10 hover:border-red-500/50 py-2 px-4 rounded-lg transition-all uppercase tracking-widest ml-4">Sign Out</button>
            `;
            if(authNavMobile) authNavMobile.innerHTML = `
                <a href="${pathPrefix}dashboard.html" class="block px-4 py-3 rounded-xl text-base font-black text-background bg-brand hover:bg-yellow-400 uppercase tracking-wide transition shadow-lg text-center">Enter Portal</a>
                <button onclick="db.auth.signOut(); window.location.reload();" class="block w-full mt-2 px-4 py-3 rounded-xl text-base font-black text-red-400 bg-red-500/10 border border-red-500/30 uppercase tracking-wide transition text-center">Sign Out</button>
            `;
        } else {
            if(authNavDesktop) authNavDesktop.innerHTML = `
                <a href="${pathPrefix}login.html" class="text-xs font-black bg-brand hover:bg-yellow-400 text-background px-6 py-2 rounded-lg transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.3)]">Sign In / Register</a>
            `;
            if(authNavMobile) authNavMobile.innerHTML = `
                <a href="${pathPrefix}login.html" class="block px-4 py-3 rounded-xl text-base font-black text-background bg-brand hover:bg-yellow-400 uppercase tracking-wide transition shadow-lg text-center">Sign In / Register</a>
            `;
        }
    } catch(e) { console.error("Smart Nav Error:", e); }
}

// 3. Execute on Page Load
document.addEventListener("DOMContentLoaded", () => {
    setupSmartNavbar();
});
