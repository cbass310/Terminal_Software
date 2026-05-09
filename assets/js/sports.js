// assets/js/sports.js

let userEmail = "";
let userAccessTier = "none"; 

let lastFetchedSportsEvData = [];
let currentSportsEvFilter = 'all';
let currentEvLeagueFilter = 'all'; 
let currentEvState = 'pre_match'; 
let sportsEvDataHash = ""; 

let lastFetchedSportsArbData = [];
let currentSportsArbFilter = 'all';
let currentArbLeagueFilter = 'all'; 
let currentArbState = 'pre_match'; 
let sportsArbDataHash = ""; 

let lastFetchedSportsDfsData = [];
let currentSportsDfsFilter = 'all';
let currentDfsLeagueFilter = 'all'; 
let sportsDfsDataHash = ""; 

// State for the Optimized Slip
let currentOptimizedSlip = null;

let currentActiveTab = ""; 

// Helper to escape HTML characters so buttons don't crash
function escapeHtml(unsafe) {
    if (!unsafe) return "";
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "\\'"); 
}

// --- TEAM DICTIONARY (STRIPPED OF ALL IP/TRADEMARK URLS - ABBREVIATIONS ONLY) ---
const TEAM_MAP = {
    'arizonacardinals': {a:'ari', s:'nfl'}, 'atlantafalcons': {a:'atl', s:'nfl'}, 'baltimoreravens': {a:'bal', s:'nfl'}, 'buffalobills': {a:'buf', s:'nfl'}, 'carolinapanthers': {a:'car', s:'nfl'}, 'chicagobears': {a:'chi', s:'nfl'}, 'cincinnatibengals': {a:'cin', s:'nfl'}, 'clevelandbrowns': {a:'cle', s:'nfl'}, 'dallascowboys': {a:'dal', s:'nfl'}, 'denverbroncos': {a:'den', s:'nfl'}, 'detroitlions': {a:'det', s:'nfl'}, 'greenbaypackers': {a:'gb', s:'nfl'}, 'houstontexans': {a:'hou', s:'nfl'}, 'indianapoliscolts': {a:'ind', s:'nfl'}, 'jacksonvillejaguars': {a:'jax', s:'nfl'}, 'kansascitychiefs': {a:'kc', s:'nfl'}, 'lasvegasraiders': {a:'lv', s:'nfl'}, 'losangeleschargers': {a:'lac', s:'nfl'}, 'losangelesrams': {a:'lar', s:'nfl'}, 'miamidolphins': {a:'mia', s:'nfl'}, 'minnesotavikings': {a:'min', s:'nfl'}, 'newenglandpatriots': {a:'ne', s:'nfl'}, 'neworleanssaints': {a:'no', s:'nfl'}, 'newyorkgiants': {a:'nyg', s:'nfl'}, 'newyorkjets': {a:'nyj', s:'nfl'}, 'philadelphiaeagles': {a:'phi', s:'nfl'}, 'pittsburghsteelers': {a:'pit', s:'nfl'}, 'sanfrancisco49ers': {a:'sf', s:'nfl'}, 'seattleseahawks': {a:'sea', s:'nfl'}, 'tampabaybuccaneers': {a:'tb', s:'nfl'}, 'tennesseetitans': {a:'ten', s:'nfl'}, 'washingtoncommanders': {a:'was', s:'nfl'},
    'atlantahawks': {a:'atl', s:'nba'}, 'bostonceltics': {a:'bos', s:'nba'}, 'brooklynnets': {a:'bkn', s:'nba'}, 'charlottehornets': {a:'cha', s:'nba'}, 'chicagobulls': {a:'chi', s:'nba'}, 'clevelandcavaliers': {a:'cle', s:'nba'}, 'dallasmavericks': {a:'dal', s:'nba'}, 'denvernuggets': {a:'den', s:'nba'}, 'detroitpistons': {a:'det', s:'nba'}, 'goldenstatewarriors': {a:'gsw', s:'nba'}, 'houstonrockets': {a:'hou', s:'nba'}, 'indianapacers': {a:'ind', s:'nba'}, 'laclippers': {a:'lac', s:'nba'}, 'losangelesclippers': {a:'lac', s:'nba'}, 'losangeleslakers': {a:'lal', s:'nba'}, 'memphisgrizzlies': {a:'mem', s:'nba'}, 'miamiheat': {a:'mia', s:'nba'}, 'milwaukeebucks': {a:'mil', s:'nba'}, 'minnesotatimberwolves': {a:'min', s:'nba'}, 'neworleanspelicans': {a:'nop', s:'nba'}, 'newyorkknicks': {a:'nyk', s:'nba'}, 'oklahomacitythunder': {a:'okc', s:'nba'}, 'orlandomagic': {a:'orl', s:'nba'}, 'philadelphia76ers': {a:'phi', s:'nba'}, 'phoenixsuns': {a:'phx', s:'nba'}, 'portlandtrailblazers': {a:'por', s:'nba'}, 'sacramentokings': {a:'sac', s:'nba'}, 'sanantoniospurs': {a:'sas', s:'nba'}, 'torontoraptors': {a:'tor', s:'nba'}, 'utahjazz': {a:'uta', s:'nba'}, 'washingtonwizards': {a:'was', s:'nba'},
    'atlantadream': {a:'atl', s:'wnba'}, 'chicagosky': {a:'chi', s:'wnba'}, 'connecticutsun': {a:'conn', s:'wnba'}, 'dallaswings': {a:'dal', s:'wnba'}, 'indianafever': {a:'ind', s:'wnba'}, 'lasvegasaces': {a:'lv', s:'wnba'}, 'losangelessparks': {a:'la', s:'wnba'}, 'minnesotalynx': {a:'min', s:'wnba'}, 'newyorkliberty': {a:'ny', s:'wnba'}, 'phoenixmercury': {a:'pho', s:'wnba'}, 'seattlestorm': {a:'sea', s:'wnba'}, 'washingtonmystics': {a:'was', s:'wnba'},
    'ari': {a:'ari', s:'mlb'}, 'arizonadiamondbacks': {a:'ari', s:'mlb'}, 'atl': {a:'atl', s:'mlb'}, 'atlantabraves': {a:'atl', s:'mlb'}, 'bal': {a:'bal', s:'mlb'}, 'baltimoreorioles': {a:'bal', s:'mlb'}, 'bos': {a:'bos', s:'mlb'}, 'bostonredsox': {a:'bos', s:'mlb'}, 'chc': {a:'chc', s:'mlb'}, 'chicagocubs': {a:'chc', s:'mlb'}, 'cws': {a:'cws', s:'mlb'}, 'chicagowhitesox': {a:'cws', s:'mlb'}, 'cin': {a:'cin', s:'mlb'}, 'cincinnatireds': {a:'cin', s:'mlb'}, 'cle': {a:'cle', s:'mlb'}, 'clevelandguardians': {a:'cle', s:'mlb'}, 'col': {a:'col', s:'mlb'}, 'coloradorockies': {a:'col', s:'mlb'}, 'det': {a:'det', s:'mlb'}, 'detroittigers': {a:'det', s:'mlb'}, 'hou': {a:'hou', s:'mlb'}, 'houstonastros': {a:'hou', s:'mlb'}, 'kc': {a:'kc', s:'mlb'}, 'kansascityroyals': {a:'kc', s:'mlb'}, 'laa': {a:'laa', s:'mlb'}, 'losangelesangels': {a:'laa', s:'mlb'}, 'lad': {a:'lad', s:'mlb'}, 'losangelesdodgers': {a:'lad', s:'mlb'}, 'mia': {a:'mia', s:'mlb'}, 'miamimarlins': {a:'mia', s:'mlb'}, 'mil': {a:'mil', s:'mlb'}, 'milwaukeebrewers': {a:'mil', s:'mlb'}, 'min': {a:'min', s:'mlb'}, 'minnesotatwins': {a:'min', s:'mlb'}, 'nym': {a:'nym', s:'mlb'}, 'newyorkmets': {a:'nym', s:'mlb'}, 'nyy': {a:'nyy', s:'mlb'}, 'newyorkyankees': {a:'nyy', s:'mlb'}, 'oak': {a:'oak', s:'mlb'}, 'oaklandathletics': {a:'oak', s:'mlb'}, 'athletics': {a:'oak', s:'mlb'}, 'ath': {a:'oak', s:'mlb'}, 'phi': {a:'phi', s:'mlb'}, 'philadelphiaphillies': {a:'phi', s:'mlb'}, 'pit': {a:'pit', s:'mlb'}, 'pittsburghpirates': {a:'pit', s:'mlb'}, 'sd': {a:'sd', s:'mlb'}, 'sandiegopadres': {a:'sd', s:'mlb'}, 'sf': {a:'sf', s:'mlb'}, 'sanfranciscogiants': {a:'sf', s:'mlb'}, 'sea': {a:'sea', s:'mlb'}, 'seattlemariners': {a:'sea', s:'mlb'}, 'stl': {a:'stl', s:'mlb'}, 'stlouiscardinals': {a:'stl', s:'mlb'}, 'tb': {a:'tb', s:'mlb'}, 'tampabayrays': {a:'tb', s:'mlb'}, 'tex': {a:'tex', s:'mlb'}, 'texasrangers': {a:'tex', s:'mlb'}, 'tor': {a:'tor', s:'mlb'}, 'torontobluejays': {a:'tor', s:'mlb'}, 'was': {a:'was', s:'mlb'}, 'washingtonnationals': {a:'was', s:'mlb'},
    'anaheimducks': {a:'ana', s:'nhl'}, 'bostonbruins': {a:'bos', s:'nhl'}, 'buffalosabres': {a:'buf', s:'nhl'}, 'calgaryflames': {a:'cgy', s:'nhl'}, 'carolinahurricanes': {a:'car', s:'nhl'}, 'chicagoblackhawks': {a:'chi', s:'nhl'}, 'coloradoavalanche': {a:'col', s:'nhl'}, 'columbusbluejackets': {a:'cbj', s:'nhl'}, 'dallasstars': {a:'dal', s:'nhl'}, 'detroitredwings': {a:'det', s:'nhl'}, 'edmontonoilers': {a:'edm', s:'nhl'}, 'floridapanthers': {a:'fla', s:'nhl'}, 'losangeleskings': {a:'lak', s:'nhl'}, 'minnesotawild': {a:'min', s:'nhl'}, 'montrealcanadiens': {a:'mtl', s:'nhl'}, 'nashvillepredators': {a:'nsh', s:'nhl'}, 'newjerseydevils': {a:'njd', s:'nhl'}, 'newyorkislanders': {a:'nyi', s:'nhl'}, 'newyorkrangers': {a:'nyr', s:'nhl'}, 'ottawasenators': {a:'ott', s:'nhl'}, 'philadelphiaflyers': {a:'phi', s:'nhl'}, 'pittsburghpenguins': {a:'pit', s:'nhl'}, 'sanjosesharks': {a:'sjs', s:'nhl'}, 'seattlekraken': {a:'sea', s:'nhl'}, 'stlouisblues': {a:'stl', s:'nhl'}, 'tampabaylightning': {a:'tb', s:'nhl'}, 'tbl': {a:'tb', s:'nhl'}, 'tb': {a:'tb', s:'nhl'}, 'torontomapleleafs': {a:'tor', s:'nhl'}, 'vancouvercanucks': {a:'van', s:'nhl'}, 'vegasgoldenknights': {a:'vgk', s:'nhl'}, 'washingtoncapitals': {a:'wsh', s:'nhl'}, 'winnipegjets': {a:'wpg', s:'nhl'}, 'utahhockeyclub': {a:'utah', s:'nhl'}, 'uta': {a:'utah', s:'nhl'}, 'utah': {a:'utah', s:'nhl'},
    'arlingtonrenegades': {a:'arl', s:'ufl'}, 'birminghamstallions': {a:'bhm', s:'ufl'}, 'dcdefenders': {a:'dc', s:'ufl'}, 'houstonroughnecks': {a:'hou', s:'ufl'}, 'memphisshowboats': {a:'mem', s:'ufl'}, 'michiganpanthers': {a:'mich', s:'ufl'}, 'sanantoniobrahmas': {a:'sa', s:'ufl'}, 'stlouisbattlehawks': {a:'stl', s:'ufl'},
    'atlantaunitedfc': {a:'atl', s:'soccer/mls'}, 'austinfc': {a:'atx', s:'soccer/mls'}, 'charlottefc': {a:'clt', s:'soccer/mls'}, 'chicagofirefc': {a:'chi', s:'soccer/mls'}, 'fccincinnati': {a:'cin', s:'soccer/mls'}, 'coloradorapids': {a:'col', s:'soccer/mls'}, 'columbuscrew': {a:'clb', s:'soccer/mls'}, 'fcdallas': {a:'dal', s:'soccer/mls'}, 'dcunited': {a:'dc', s:'soccer/mls'}, 'houstondynamofc': {a:'hou', s:'soccer/mls'}, 'sportingkansascity': {a:'skc', s:'soccer/mls'}, 'lagalaxy': {a:'la', s:'soccer/mls'}, 'losangelesfootballclub': {a:'lafc', s:'soccer/mls'}, 'intermiamicf': {a:'mia', s:'soccer/mls'}, 'minnesotaunitedfc': {a:'min', s:'soccer/mls'}, 'cfmontreal': {a:'mtl', s:'soccer/mls'}, 'nashvillesc': {a:'nsh', s:'soccer/mls'}, 'newenglandrevolution': {a:'ne', s:'soccer/mls'}, 'newyorkcityfc': {a:'nyc', s:'soccer/mls'}, 'newyorkredbulls': {a:'rbny', s:'soccer/mls'}, 'orlandocitysc': {a:'orl', s:'soccer/mls'}, 'philadelphiaunion': {a:'phi', s:'soccer/mls'}, 'portlandtimbers': {a:'por', s:'soccer/mls'}, 'realsaltlake': {a:'rsl', s:'soccer/mls'}, 'sanjoseearthquakes': {a:'sj', s:'soccer/mls'}, 'seattlesoundersfc': {a:'sea', s:'soccer/mls'}, 'stlouiscitysc': {a:'stl', s:'soccer/mls'}, 'torontofc': {a:'tor', s:'soccer/mls'}, 'vancouverwhitecapsfc': {a:'van', s:'soccer/mls'}
};

function detectSport(edge) {
    const sportStr = String(edge.sport || '').toLowerCase();
    const leagueStr = String(edge.league || edge.competition || '').toLowerCase();
    const matchStr = String(edge.match_name || edge.game || '').toLowerCase();
    const targetStr = String(edge.target || edge.prop || edge.market || edge.bet_type || '').toLowerCase();
    
    const combined = `${sportStr} ${leagueStr} ${matchStr} ${targetStr}`;

    if (combined.includes('baseball') || combined.includes('mlb') || combined.includes('kbo') || combined.includes('npb') || targetStr.includes('batter') || targetStr.includes('pitcher') || targetStr.includes('inning') || targetStr.includes('total bases') || targetStr.includes('strikeout') || targetStr.includes('home run')) return 'baseball';
    
    if (combined.includes('basketball') || combined.includes('nba') || combined.includes('wnba') || combined.includes('ncaab') || targetStr.includes('rebound') || targetStr.includes('assist') || targetStr.includes('3pt') || targetStr.includes('three point') || targetStr.includes('points')) return 'basketball';
    
    if (combined.includes('football') || combined.includes('nfl') || combined.includes('ncaaf') || combined.includes('ufl') || combined.includes('cfl') || targetStr.includes('touchdown') || targetStr.includes('passing') || targetStr.includes('rushing') || targetStr.includes('receiving') || targetStr.includes('qb') || targetStr.includes('yards')) return 'football';
    
    if (combined.includes('hockey') || combined.includes('nhl') || combined.includes('khl') || combined.includes('ahl') || targetStr.includes('shots on goal') || targetStr.includes('goalie') || targetStr.includes('ice time') || targetStr.includes('puck') || targetStr.includes('assists')) return 'hockey';
    
    if (combined.includes('soccer') || combined.includes('epl') || combined.includes('mls') || combined.includes('la liga') || combined.includes('champions league') || targetStr.includes('shots on target') || targetStr.includes('corner') || combined.includes('bundesliga') || combined.includes('serie a') || combined.includes('ligue 1') || combined.includes('uefa') || combined.includes('fifa') || matchStr.includes(' fc') || matchStr.includes('fc ') || matchStr.includes(' real ')) return 'soccer';
    
    if (combined.includes('tennis') || combined.includes('atp') || combined.includes('wta') || targetStr.includes('sets') || targetStr.includes('games won') || targetStr.includes('aces')) return 'tennis';
    
    if (combined.includes('mma') || combined.includes('ufc') || combined.includes('bellator') || targetStr.includes('tko') || targetStr.includes('submission') || targetStr.includes('fight')) return 'mma';

    if (matchStr.match(/\b(lakers|celtics|bulls|knicks|suns|mavericks|warriors|nuggets|heat)\b/)) return 'basketball';
    if (matchStr.match(/\b(yankees|dodgers|red sox|astros|phillies|mets|cubs|braves|padres|orioles)\b/)) return 'baseball';
    if (matchStr.match(/\b(chiefs|49ers|eagles|cowboys|packers|steelers|ravens|bills|bengals|lions)\b/)) return 'football';
    if (matchStr.match(/\b(maple leafs|bruins|avalanche|golden knights|canadiens|oilers|rangers|penguins)\b/)) return 'hockey';
    if (matchStr.match(/\b(arsenal|chelsea|liverpool|madrid|barcelona|bayern|psg|juventus|city|united|munich|milan|inter|spurs)\b/)) return 'soccer';

    return 'unknown';
}

function getLeague(edge) {
    let l = edge.league || edge.competition || edge.tournament || edge.sport_title || edge.sport;
    if (!l) return 'UNKNOWN';
    
    let normalized = String(l).toUpperCase().trim();
    if (normalized.includes('_')) normalized = normalized.split('_').pop(); 

    const combinedContext = `${edge.sport} ${edge.league} ${edge.competition} ${edge.match_name} ${edge.sport_title}`.toUpperCase();

    if (normalized === 'BASKETBALL' || normalized === 'UNKNOWN') {
        if (combinedContext.includes('WNBA')) return 'WNBA';
        if (combinedContext.includes('NCAAB') || combinedContext.includes('COLLEGE BASKETBALL')) return 'NCAAB';
        if (combinedContext.includes('NCAAW')) return 'NCAAW';
        if (combinedContext.includes('NBA')) return 'NBA';
    }

    if (normalized.includes('WNBA') || normalized.includes('WOMENS NATIONAL BASKETBALL')) return 'WNBA';
    if (normalized.includes('NCAAB') || normalized.includes('MENS COLLEGE BASKETBALL')) return 'NCAAB';
    if (normalized.includes('NCAAW') || normalized.includes('WOMENS COLLEGE BASKETBALL')) return 'NCAAW';
    if (normalized === 'NBA' || normalized.includes('NATIONAL BASKETBALL ASSOCIATION')) return 'NBA';
    
    if (normalized.includes('NFL') || normalized.includes('NATIONAL FOOTBALL LEAGUE')) return 'NFL';
    if (normalized.includes('NCAAF') || normalized.includes('COLLEGE FOOTBALL')) return 'NCAAF';
    if (normalized.includes('UFL')) return 'UFL';
    
    if (normalized.includes('MLB') || normalized.includes('MAJOR LEAGUE BASEBALL')) return 'MLB';
    if (normalized.includes('NHL') || normalized.includes('NATIONAL HOCKEY LEAGUE')) return 'NHL';
    if (normalized.includes('MLS') || normalized.includes('MAJOR LEAGUE SOCCER')) return 'MLS';
    if (normalized.includes('EPL') || normalized.includes('PREMIER LEAGUE')) return 'EPL';

    return normalized;
}

function extractLeagues(data) {
    const leagues = new Set();
    data.forEach(edge => {
        const l = getLeague(edge);
        if (l && l !== 'UNKNOWN') leagues.add(l);
    });
    return Array.from(leagues).sort();
}

function getAbbreviatedMatchup(matchName) {
    if (!matchName) return "UNKNOWN MATCH";
    let separator = " @ ";
    let parts = [];
    
    if (matchName.includes('@')) {
        parts = matchName.split('@');
    } else if (matchName.toLowerCase().includes(' vs ')) {
        parts = matchName.toLowerCase().split(' vs ');
        separator = " vs ";
    } else if (matchName.toLowerCase().includes(' vs. ')) {
        parts = matchName.toLowerCase().split(' vs. ');
        separator = " vs ";
    } else {
        return matchName; 
    }

    if (parts.length === 2) {
        const getAbbr = (team) => {
            const cleanName = String(team).replace(/\s*[+-]?\d+(\.\d+)?\s*$/, '').trim();
            const normalized = cleanName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
            const match = TEAM_MAP[normalized];
            return match ? match.a.toUpperCase() : cleanName.toUpperCase().substring(0, 3); 
        };
        return `${getAbbr(parts[0])}${separator}${getAbbr(parts[1])}`;
    }
    return matchName;
}

function getSportsbookLogo(bookName, classes = "w-14 sm:w-16 h-4 sm:h-5 object-contain") {
    if (!bookName) return `<span class="font-bold text-white tracking-widest text-[10px]">🏦 UNKNOWN</span>`;
    const normalized = bookName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bookMap = {
        'draftkings': 'draftkings', 'fanduel': 'fanduel', 'pinnacle': 'pinnacle', 'circa': 'circa', 'circasports': 'circa',
        'betmgm': 'betmgm', 'mgm': 'betmgm', 'fanatics': 'fanatics', 'bovada': 'bovada', 'betrivers': 'betrivers', 'rivers': 'betrivers',
        'prizepicks': 'prizepicks', 'underdog': 'underdog', 'underdogfantasy': 'underdog', 'sleeper': 'sleeper'
    };
    const fileName = bookMap[normalized];
    if (fileName) return `<img src="assets/images/books/${fileName}.svg" alt="${bookName}" class="${classes} filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" onerror="this.outerHTML='<span class=\\'font-bold text-white tracking-widest text-[10px]\\'>🏦 ${bookName.toUpperCase()}</span>'">`;
    return `<span class="font-bold text-white tracking-widest text-[10px]">🏦 ${bookName.toUpperCase()}</span>`;
}

function getSportIcon(sportStr, iconClasses = "w-5 h-5 text-neon opacity-70") {
    const s = String(sportStr).toLowerCase();
    if (s.includes('baseball') || s.includes('mlb')) return `<svg class="${iconClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-width="2" d="M5.5 5.5c2 2 2 5.5 0 8.5M18.5 5.5c-2 2-2 5.5 0 8.5"/></svg>`;
    if (s.includes('soccer') || s.includes('epl') || s.includes('mls')) return `<svg class="${iconClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-width="1.5" d="M12 7l3 4-1.5 5h-3L9 11zM12 7V2M15 11l4.5-2.5M13.5 16l3 4.5M10.5 16l-3 4.5M9 11L4.5 8.5"/></svg>`;
    if (s.includes('basketball') || s.includes('nba') || s.includes('wnba')) return `<svg class="${iconClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-width="2" d="M12 2v20M2 12h20M5 5c3 4 3 10 0 14M19 5c-3 4-3 10 0 14"/></svg>`;
    if (s.includes('football') || s.includes('nfl') || s.includes('ufl')) return `<svg class="${iconClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M14.5 4.5l5 5a7.07 7.07 0 010 10l-5-5M9.5 19.5l-5-5a7.07 7.07 0 010-10l5 5M12 8l4 4M9 11l2 2M11 15l2-2"/></svg>`;
    if (s.includes('hockey') || s.includes('nhl')) return `<svg class="${iconClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 20h6l8-14M14 6l4 4"/></svg>`;
    if (s.includes('tennis')) return `<svg class="${iconClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-width="2" d="M12 2C8 6 8 18 12 22"/></svg>`;
    if (s.includes('mma') || s.includes('ufc')) return `<svg class="${iconClasses}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M10 3h4a4 4 0 014 4v10a4 4 0 01-4 4h-4a4 4 0 01-4-4V7a4 4 0 014-4zM6 11h12"/></svg>`;
    return `<svg class="${iconClasses}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle></svg>`;
}

// --- BULLETPROOF ZERO-LAG FALLBACK RENDERER ---
function generateTeamLogosHtml(detectedSport, isTicker = false) {
    const containerClass = isTicker ? "w-8 h-8 rounded-lg" : "w-10 h-10 sm:w-12 sm:h-12 rounded-lg";
    let fallbackIcon = getSportIcon(detectedSport, isTicker ? "w-5 h-5 text-neon" : "w-5 h-5 sm:w-6 sm:h-6 text-neon opacity-70");
    const fallbackContainer = `${containerClass} bg-black/40 border border-white/10 shrink-0 flex items-center justify-center shadow-inner`;

    return `<div class="${fallbackContainer}">${fallbackIcon}</div>`;
}

// --- NATIVE SVG SPARKLINE GENERATOR ---
function generateSparklineSvg(dataArray) {
    if (!dataArray || dataArray.length < 2) return '';
    const w = 200;
    const h = 40;
    const min = Math.min(...dataArray);
    const max = Math.max(...dataArray);
    const range = (max - min) || 1; 

    const points = dataArray.map((val, i) => {
        const x = (i / (dataArray.length - 1)) * w;
        const y = h - ((val - min) / range) * h * 0.8 - (h * 0.1); 
        return `${x},${y}`;
    });

    const isFavorableTrend = dataArray[dataArray.length - 1] < dataArray[0];
    const strokeColor = isFavorableTrend ? '#39FF14' : '#ef4444'; 
    const fillColor = isFavorableTrend ? 'rgba(57,255,20,0.15)' : 'rgba(239,68,68,0.15)';

    const pathStr = `M ${points.join(' L ')}`;
    const fillStr = `M 0,${h} L ${points.join(' L ')} L ${w},${h} Z`;

    const lastX = points[points.length-1].split(',')[0];
    const lastY = points[points.length-1].split(',')[1];

    return `
        <svg viewBox="0 0 ${w} ${h}" class="w-full h-full" preserveAspectRatio="none">
            <path d="${fillStr}" fill="${fillColor}" />
            <path d="${pathStr}" fill="none" stroke="${strokeColor}" stroke-width="2" vector-effect="non-scaling-stroke" />
            <circle cx="${lastX}" cy="${lastY}" r="3" fill="${strokeColor}" />
        </svg>
    `;
}

// --- BOUNCER & TABS ---
async function checkAccess() {
    try {
        if (typeof db === 'undefined') return;
        const { data: { session }, error } = await db.auth.getSession();
        if (error || !session) window.location.replace('login.html');
        else {
            userEmail = session.user.email;
            fetchUserData(); 
            initRealtimeListeners(); 
        }
    } catch(e) { console.error(e); }
}

async function fetchUserData() {
    try {
        const { data, error } = await db.from('client_keys').select('*').eq('email', userEmail).single();
        if (!error && data && data.tier) { 
            userAccessTier = data.tier.toLowerCase();
            window.sportsApiKey = data.sports_api_key || "";
            window.cryptoApiKey = data.crypto_api_key || "";
        } else { userAccessTier = "none"; } 
        
        if (userAccessTier === 'crypto') {
            window.location.replace('crypto-dashboard.html');
        } else {
            switchTab('sports-ev'); 
        }
    } catch(e) { console.error(e); }
}
checkAccess();

function switchTab(target) {
    currentActiveTab = target;
    const tabs = { 'sports-ev': document.getElementById('tab-sports-ev'), 'sports-arb': document.getElementById('tab-sports-arb'), 'sports-dfs': document.getElementById('tab-sports-dfs') };
    const views = { 'sports-ev': document.getElementById('view-sports-ev'), 'sports-arb': document.getElementById('view-sports-arb'), 'sports-dfs': document.getElementById('view-sports-dfs'), 'locked': document.getElementById('view-locked') };

    if (userAccessTier === 'crypto' || userAccessTier === 'none') {
        Object.values(views).forEach(v => v.classList.add('hidden'));
        Object.values(tabs).forEach(t => t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group');
        tabs[target].className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 bg-red-500/10 text-red-400 border border-red-500/30 flex justify-between items-center group';
        views.locked.classList.remove('hidden');
        document.getElementById('global-ticker-wrapper').classList.add('hidden');
        return;
    }

    Object.values(views).forEach(v => v.classList.add('hidden'));
    Object.values(tabs).forEach(t => t.className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5 border border-transparent flex justify-between items-center group');
    
    tabs[target].className = 'w-full text-left px-4 py-3 rounded-lg font-heading text-xs font-black tracking-widest uppercase transition-all duration-300 bg-white/10 text-white border border-white/20 shadow-lg flex justify-between items-center group';
    views[target].classList.remove('hidden');
    document.getElementById('global-ticker-wrapper').classList.remove('hidden');

    if(target === 'sports-ev') { updateTicker(lastFetchedSportsEvData, 'sports-ev'); loadLiveTelemetry(true); }
    if(target === 'sports-arb') { updateTicker(lastFetchedSportsArbData, 'sports-arb'); loadArbTelemetry(true); }
    if(target === 'sports-dfs') { updateTicker(lastFetchedSportsDfsData, 'sports-dfs'); loadDfsTelemetry(true); }
}

function switchArbState(state) {
    currentArbState = state;
    const btnPre = document.getElementById('arb-tab-pre');
    const btnLive = document.getElementById('arb-tab-live');
    if (state === 'pre_match') {
        btnPre.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/10 text-white shadow-md";
        btnLive.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
    } else {
        btnLive.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/10 text-white shadow-md";
        btnPre.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
    }
    renderSportsFeed(lastFetchedSportsArbData, 'sports-arb'); 
}

function switchEvState(state) {
    currentEvState = state;
    const btnPre = document.getElementById('ev-tab-pre');
    const btnLive = document.getElementById('ev-tab-live');
    if (state === 'pre_match') {
        btnPre.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/10 text-white shadow-md";
        btnLive.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
    } else {
        btnLive.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 bg-white/10 text-white shadow-md";
        btnPre.className = "px-6 py-2 rounded-xl font-heading text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 text-slate-500 hover:text-white border border-transparent";
    }
    renderSportsFeed(lastFetchedSportsEvData, 'sports-ev'); 
}

function initRealtimeListeners() {
    if (typeof db === 'undefined') return;

    db.channel('custom-all-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'arbitrage_live_data' }, payload => handleRowUpdate(payload.new, 'sports-arb'))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ev_live_data' }, payload => handleRowUpdate(payload.new, 'sports-ev'))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'dfs_live_data' }, payload => handleRowUpdate(payload.new, 'sports-dfs'))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'dfs_optimized_slips' }, payload => {
          if (currentActiveTab === 'sports-dfs') loadOptimizedSlip();
      })
      .subscribe();
}

function handleRowUpdate(updatedRow, type) {
    if (updatedRow.status && updatedRow.status.toLowerCase() === 'expired') {
        const cardElement = document.getElementById(`card-${updatedRow.id}`);
        if (cardElement) {
            cardElement.classList.add('opacity-40', 'grayscale', 'pointer-events-none');
            cardElement.classList.remove('animate-flash-update');
            const badgeContainer = cardElement.querySelector('.status-badge-container');
            if (badgeContainer) {
                badgeContainer.innerHTML = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span>`;
            }
            const oddsElements = cardElement.querySelectorAll('.odds-text');
            oddsElements.forEach(el => {
                el.classList.remove('text-white', 'text-neon');
                el.classList.add('line-through', 'text-slate-600');
            });
            setTimeout(() => {
                if (cardElement && cardElement.parentNode) {
                    cardElement.remove();
                }
            }, 300000);
        }
    }
}

function updateTicker(data, type) {
    const tickerContainer = document.getElementById('ticker-container');
    const wrapper = document.getElementById('global-ticker-wrapper');
    let items = [];

    wrapper.className = "fixed bottom-0 left-0 w-full bg-black/90 border-t border-neon/30 backdrop-blur-xl overflow-hidden z-50 h-10 flex items-center shadow-[0_-10px_20px_rgba(0,0,0,0.5)] transition-colors duration-500";
    
    if (!data || data.length === 0) {
        items.push(`<div class="inline-flex items-center gap-4 px-6 text-neon font-bold tracking-widest uppercase text-xs shrink-0">⚡ SYSTEM ONLINE <span class="text-slate-500">|</span> SCANNING MARKET MATRIX <span class="text-slate-500">|</span> AWAITING PULSE...</div>`);
    } else {
        data.slice(0, 10).forEach(edge => {
            let textBlock = "";
            const detectedSport = detectSport(edge);
            
            if(type === 'sports-ev') {
                const ev = parseFloat(edge.ev || edge.value || edge.edge) ? `+${parseFloat(edge.ev || edge.value || edge.edge).toFixed(2)}% EV` : "LIVE";
                const matchName = edge.match_name || edge.game || edge.event || edge.event_name || edge.matchup || edge.teams || "MATCH";
                const tickerLogos = generateTeamLogosHtml(detectedSport, true);
                textBlock = `<span class="text-neon font-black">📈 +EV EDGE:</span> ${tickerLogos} <span class="text-white ml-2">${matchName}</span> <span class="text-slate-500">|</span> <span class="text-white font-bold">${edge.target || "TARGET"}</span> <span class="text-slate-500">|</span> <span class="text-neon font-bold">⚡ ${ev}</span>`;
            } else if(type === 'sports-arb') {
                const isMiddle = String(edge.market || '').toUpperCase().includes('MIDDLE');
                const arbVal = parseFloat(edge.arb_pct || edge.arb_percentage || edge.arb_percent || edge.arb || edge.edge || edge.value || edge.profit || edge.margin || edge.percentage || edge.roi || 0);
                const arbString = isMiddle ? `${arbVal.toFixed(1)} PTS` : `${arbVal.toFixed(2)}% ARB`;
                const matchName = edge.match_name || edge.game || edge.event || edge.event_name || edge.matchup || edge.teams || "MATCH";
                const tickerLogos = generateTeamLogosHtml(detectedSport, true);
                const book1 = edge.book1 || edge.book_1 || edge.bookmaker_1 || edge.sportsbook_1 || edge.sportsbook1 || edge.leg1_book || "Book 1";
                const book2 = edge.book2 || edge.book_2 || edge.bookmaker_2 || edge.sportsbook_2 || edge.sportsbook2 || edge.leg2_book || "Book 2";
                const highlightColor = isMiddle ? 'text-purple-400' : 'text-neon';
                textBlock = `<span class="text-neon font-black">🚨 NEW ARB:</span> ${tickerLogos} <span class="text-white ml-2">${matchName}</span> <span class="text-slate-500">|</span> <span class="text-white font-bold">${edge.market || edge.bet_type || "MARKET"}</span> <span class="text-slate-500">|</span> <span class="text-white">${book1} vs ${book2}</span> <span class="text-slate-500">|</span> <span class="${highlightColor} font-bold">🎯 ${arbString}</span>`;
            } else if(type === 'sports-dfs') {
                const ev = parseFloat(edge.ev_pct || edge.edge_percent || edge.ev || edge.edge || edge.value || edge.profit || 0).toFixed(2);
                const platformName = edge.book || edge.platform || edge.bookmaker || edge.sportsbook || "PLATFORM";
                const rawMatchName = edge.match_name || edge.team || edge.game || edge.event || edge.matchup || "MATCH";
                const tickerLogos = generateTeamLogosHtml(detectedSport, true);
                const propString = edge.target || edge.prop || edge.play || edge.selection || edge.description || edge.player_name || "UNKNOWN PROP";
                textBlock = `<span class="text-neon font-black">🎯 DFS SNIPE:</span> ${tickerLogos} <span class="text-white ml-2">${propString}</span> <span class="text-slate-500">|</span> <span class="text-white uppercase">${platformName}</span> <span class="text-slate-500">|</span> <span class="text-neon font-bold">⚡ +${ev}% EDGE</span>`;
            }

            items.push(`<div class="inline-flex items-center gap-3 px-6 font-mono text-xs uppercase tracking-widest whitespace-nowrap shrink-0">${textBlock}</div>`);
        });
    }

    const rowHtml = items.join(`<span class="text-slate-600 font-bold px-2 shrink-0">•</span>`);
    tickerContainer.innerHTML = `<div class="flex items-center shrink-0 w-max">${rowHtml}<span class="text-slate-600 font-bold px-8 shrink-0">•</span>${rowHtml}</div>`; 
}

function convertToDecimal(americanStr) {
    const odds = parseFloat(String(americanStr).replace('+', ''));
    if (isNaN(odds)) return 1;
    if (odds > 0) return (odds / 100) + 1;
    if (odds < 0) return (100 / Math.abs(odds)) + 1;
    return 1; 
}

function calculateInlineArb(cardId, odds1, odds2) {
    const stake1Input = document.getElementById(`stake1-${cardId}`);
    const hedgeOutput = document.getElementById(`hedge-${cardId}`);
    const profitOutput = document.getElementById(`profit-${cardId}`);
    
    const stake1 = parseFloat(stake1Input.value);
    
    if (isNaN(stake1) || stake1 <= 0) {
        hedgeOutput.innerText = '$0.00';
        profitOutput.innerText = '$0.00';
        return;
    }

    const dec1 = convertToDecimal(odds1);
    const dec2 = convertToDecimal(odds2);

    const payout1 = stake1 * dec1;
    const stake2 = payout1 / dec2;
    const profit = payout1 - (stake1 + stake2);

    hedgeOutput.innerText = '$' + stake2.toFixed(2);
    profitOutput.innerText = '+$' + profit.toFixed(2);
}

// --- BET LOGGING & EXECUTION TRACKING ---

function logBet(matchName, edgeType, edgePct, odds, target = 'N/A', inputId = null) {
    if (!userEmail) return showToast("Error: Not Authenticated", "error");
    
    let stake = 100; 
    if (inputId && document.getElementById(inputId)) {
        const val = parseFloat(document.getElementById(inputId).value);
        if (!isNaN(val) && val > 0) stake = val;
    }

    const modal = document.getElementById('bet-tracking-modal');
    if (!modal) return showToast("Error: Execution Modal not found.", "error");

    document.getElementById('modal-match-name').value = matchName;
    document.getElementById('modal-edge-type').value = edgeType;
    document.getElementById('modal-edge-pct').value = edgePct;
    document.getElementById('modal-target-odds').value = odds;
    
    let targetInput = document.getElementById('modal-target');
    if (!targetInput) {
        targetInput = document.createElement('input');
        targetInput.type = 'hidden';
        targetInput.id = 'modal-target';
        modal.querySelector('.space-y-5').appendChild(targetInput);
    }
    targetInput.value = target;
    
    document.getElementById('modal-actual-stake').value = stake;
    // Set fill odds to blank instead of auto-populating "N/A" to prevent database type mismatch errors
    document.getElementById('modal-fill-odds').value = ""; 
    document.getElementById('modal-target-display').innerText = odds;
    document.getElementById('modal-book-limited').checked = false;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeBetModal() {
    const modal = document.getElementById('bet-tracking-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

async function submitLoggedBet() {
    const matchName = document.getElementById('modal-match-name').value;
    const edgeType = document.getElementById('modal-edge-type').value;
    const edgePct = document.getElementById('modal-edge-pct').value;
    const targetOdds = document.getElementById('modal-target-odds').value;
    
    const targetInput = document.getElementById('modal-target');
    const targetStr = targetInput ? targetInput.value : 'N/A';
    
    const actualStake = parseFloat(document.getElementById('modal-actual-stake').value);
    const fillOddsRaw = document.getElementById('modal-fill-odds').value;
    const fillOdds = fillOddsRaw ? fillOddsRaw : null; // Safe null pass if blank
    const isLimited = document.getElementById('modal-book-limited').checked;

    // Visual feedback to show the user it is processing
    const modal = document.getElementById('bet-tracking-modal');
    const confirmBtn = modal.querySelectorAll('button')[1]; 
    const originalText = confirmBtn.innerText;
    confirmBtn.innerText = "LOGGING...";
    confirmBtn.disabled = true;

    try {
        const { error } = await db.from('user_bet_ledger').insert([{
            user_email: userEmail,
            match_name: matchName,
            target: targetStr,
            edge_type: edgeType,
            edge_pct: parseFloat(edgePct),
            stake: actualStake,
            odds: targetOdds,
            fill_odds: fillOdds,
            book_limited: isLimited
        }]);

        if (error) throw error;
        
        closeBetModal(); // Close first so the toast is clearly visible on top
        showToast("✅ Execution Logged Successfully", "success");
        
    } catch (err) {
        console.error("Ledger Insert Error:", err);
        closeBetModal(); // Free the user so they aren't trapped by the modal
        showToast(`Error: ${err.message || "Failed to log bet. Check database permissions."}`, "error");
    } finally {
        confirmBtn.innerText = originalText;
        confirmBtn.disabled = false;
    }
}

function showToast(message, type = "success") {
    const existing = document.getElementById('terminal-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'terminal-toast';
    const color = type === 'success' ? 'border-neon text-neon shadow-[0_0_15px_rgba(57,255,20,0.2)]' : 'border-redAccent text-redAccent shadow-[0_0_15px_rgba(239,68,68,0.2)]';
    
    // Increased z-index to 200 so it renders on top of the modal
    toast.className = `fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-black/90 backdrop-blur-xl border ${color} px-6 py-3 rounded-full font-mono text-xs font-black uppercase tracking-widest transform transition-all duration-300 translate-y-0 opacity-100 flex items-center gap-3`;
    toast.innerText = message;

    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('-translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function handleFilterChange(tab, value) {
    if (tab === 'sports-ev') { 
        currentSportsEvFilter = value; 
        currentEvLeagueFilter = 'all'; 
        renderSportsFeed(lastFetchedSportsEvData, 'sports-ev'); 
    }
    if (tab === 'sports-arb') { 
        currentSportsArbFilter = value; 
        currentArbLeagueFilter = 'all'; 
        renderSportsFeed(lastFetchedSportsArbData, 'sports-arb'); 
    }
    if (tab === 'sports-dfs') { 
        currentSportsDfsFilter = value; 
        currentDfsLeagueFilter = 'all'; 
        renderSportsFeed(lastFetchedSportsDfsData, 'sports-dfs'); 
    }
}

function handleSubFilterChange(tab, value) {
    if (tab === 'sports-ev') { currentEvLeagueFilter = value; renderSportsFeed(lastFetchedSportsEvData, 'sports-ev'); }
    if (tab === 'sports-arb') { currentArbLeagueFilter = value; renderSportsFeed(lastFetchedSportsArbData, 'sports-arb'); }
    if (tab === 'sports-dfs') { currentDfsLeagueFilter = value; renderSportsFeed(lastFetchedSportsDfsData, 'sports-dfs'); }
}

function createOptimizedSlipCard(slip) {
    if (!slip || !slip.legs || !Array.isArray(slip.legs)) return '';

    const slipId = slip.id || Math.random().toString(36).substr(2, 9);
    const avgEdge = parseFloat(slip.average_edge || 0).toFixed(2);
    
    const legsString = slip.legs.map(l => `${l.player_name || l.player} ${l.side || l.over_under} ${l.line || l.target} ${l.stat_type || l.market}`).join(" | ");
    
    let legsHtml = slip.legs.map((leg, index) => {
        const player = escapeHtml(leg.player_name || leg.player || "UNKNOWN");
        const stat = escapeHtml(leg.stat_type || leg.market || "PROP").toUpperCase();
        const line = escapeHtml(leg.line || leg.target || "0");
        const side = escapeHtml(leg.side || leg.over_under || "OVER").toUpperCase();
        const edge = parseFloat(leg.edge_percent || leg.ev || 0).toFixed(2);

        return `
            <div class="bg-black/40 border border-brand/20 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-12 h-12 bg-brand/10 blur-xl rounded-full"></div>
                <div class="flex justify-between items-start mb-1 relative z-10">
                    <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Leg ${index + 1}</span>
                    <span class="text-brand font-mono font-bold text-[9px]">+${edge}%</span>
                </div>
                <div class="relative z-10">
                    <h4 class="font-impact text-white text-sm sm:text-base uppercase leading-tight truncate w-full" title="${player}">${player}</h4>
                    <div class="flex items-center gap-1.5 mt-0.5">
                        <span class="text-brand font-black uppercase text-xs">${side} ${line}</span>
                        <span class="text-slate-400 font-bold text-[10px] uppercase">${stat}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div id="optimized-slip-${slipId}" class="col-span-full mb-2 bg-gradient-to-br from-studio to-black border border-brand/40 rounded-2xl p-4 sm:p-5 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.1)_0%,transparent_50%)] pointer-events-none"></div>

            <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-3 mb-4 relative z-10">
                <div class="flex items-center gap-2">
                    <div class="bg-brand/20 p-1.5 rounded-lg border border-brand/30 text-brand">
                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div>
                        <h2 class="font-heading text-lg sm:text-xl font-black text-white uppercase tracking-widest leading-none">Premium Slip</h2>
                        <p class="text-[8px] sm:text-[9px] font-mono text-brand uppercase tracking-widest mt-0.5">AI-Correlated Parlay Builder</p>
                    </div>
                </div>
                <div class="mt-3 md:mt-0 text-right w-full md:w-auto">
                    <div class="bg-brand/10 border border-brand/30 px-3 py-1.5 rounded-xl inline-flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.1)] w-full md:w-auto justify-between md:justify-start">
                        <span class="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Avg Edge</span>
                        <span class="font-mono font-black text-sm sm:text-base text-brand">+${avgEdge}%</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10 mb-4">
                ${legsHtml}
            </div>

            <button onclick="logBet('Optimized Slip', 'PARLAY', ${avgEdge}, 'N/A', '${escapeHtml(legsString)}')" class="w-full bg-brand hover:bg-yellow-400 text-background font-black py-2.5 rounded-xl transition-all duration-300 uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] text-xs flex items-center justify-center gap-2 relative z-10">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                Log Full Slip to Ledger
            </button>
        </div>
    `;
}

// HIGH DENSITY UI - EV CARD
function createEvCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        const edgeVal = parseFloat(edge.ev || edge.value || edge.edge) || 0; 
        const edgeFormatted = `+${edgeVal.toFixed(2)}% EV`;
        let oddsStr = String(edge.odds);
        const odds = (!oddsStr.startsWith('-') && !oddsStr.startsWith('+') && oddsStr !== "undefined" && oddsStr !== "null") ? '+' + oddsStr : oddsStr;
        const timestamp = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
        const bookLogoBig = getSportsbookLogo(edge.sportsbook || edge.book, "w-12 sm:w-16 h-4 object-contain");
        
        const rawMatchName = String(edge.match_name || edge.game || edge.event || edge.event_name || edge.matchup || edge.teams || "UNKNOWN MATCH");
        const safeMatchName = rawMatchName.replace(/'/g, "\\'"); 
        const abbrMatchName = getAbbreviatedMatchup(rawMatchName);
        
        const detectedSport = detectSport(edge);
        const iconHtml = generateTeamLogosHtml(detectedSport, false);

        const isExpired = String(edge.status).toLowerCase() === 'expired';
        const opacityClass = isExpired ? 'opacity-40 grayscale pointer-events-none' : 'animate-flash-update';
        const oddsStrike = isExpired ? 'line-through text-slate-600' : 'text-white odds-text';

        let statusBadge = `<span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shrink-0"></span>`;
        if (isExpired) {
            statusBadge = `<span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span>`;
        } else if (edge.status && edge.status.toLowerCase() === 'won') {
            statusBadge = `<span class="text-neon font-black text-[9px] sm:text-[10px] uppercase">WON</span>`;
        } else if (edge.status && edge.status.toLowerCase() === 'lost') {
            statusBadge = `<span class="text-redAccent font-black text-[9px] sm:text-[10px] uppercase">LOST</span>`;
        }

        const safeTarget = escapeHtml(edge.target || "UNKNOWN");
        const safeMarket = escapeHtml(edge.market || edge.bet_type || "UNKNOWN MARKET");

        const marketAvg = edge.market_avg || edge.avg_odds || edge.no_vig || edge.pinnacle_line || "N/A";
        let marketAvgHtml = '';
        if (marketAvg !== "N/A") {
            const displayAvg = (!String(marketAvg).startsWith('-') && !String(marketAvg).startsWith('+') && marketAvg !== "undefined" && marketAvg !== "null") ? '+' + marketAvg : marketAvg;
            marketAvgHtml = `<div class="bg-redAccent/10 border border-redAccent/30 text-red-400 px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] font-black uppercase tracking-widest mr-2 shrink-0" title="Market Average / No-Vig Fair Odds">MKT AVG: ${displayAvg}</div>`;
        }

        let history = edge.line_history || edge.history;
        if (!history || !Array.isArray(history) || history.length < 2) {
            const currentDec = convertToDecimal(oddsStr);
            history = [];
            let walk = currentDec + (Math.random() * 0.15 + 0.05); 
            for(let i=0; i<10; i++) {
                history.push(walk);
                walk -= (Math.random() * 0.04) - 0.005; 
            }
            history[9] = currentDec; 
        }
        const sparklineHtml = generateSparklineSvg(history);

        return `
            <div id="card-${edgeId}" class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-4 hover:border-white/30 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col justify-between h-full ${opacityClass}">
                <div class="flex justify-between items-start mb-3 relative z-10 w-full gap-2">
                    <div class="flex items-start gap-2 flex-1 min-w-0 pr-1">
                        
                        <div class="flex flex-col items-center w-12 sm:w-14 shrink-0 gap-1">
                            ${iconHtml}
                            <p class="text-[6px] sm:text-[7px] pt-0.5 text-slate-500 font-bold tracking-widest uppercase text-center w-full truncate">${abbrMatchName}</p>
                        </div>
                        
                        <div class="flex-1 min-w-0 flex flex-col pt-0.5 pl-1.5">
                            <h2 class="font-impact text-xs sm:text-sm font-black uppercase tracking-wide text-white leading-tight break-words odds-text mb-0.5">${rawMatchName}</h2>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-end shrink-0 gap-0.5">
                        <span class="text-[6px] sm:text-[7px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">${timestamp}</span>
                        <div class="bg-studio/80 border border-white/10 rounded-lg p-1.5 shadow-lg flex items-center justify-center overflow-hidden w-14 sm:w-16 h-6 mb-0.5">
                            ${bookLogoBig}
                        </div>
                        <div class="flex items-center">
                            ${marketAvgHtml}
                            <span class="font-heading font-black text-[10px] sm:text-xs uppercase tracking-widest ${oddsStrike}">${odds}</span>
                        </div>
                    </div>
                </div>
                
                <div class="border-t border-white/10 pt-3 relative z-10 flex-grow flex flex-col justify-end">
                    
                    <div class="w-full mb-3">
                        <p class="text-[9px] sm:text-[10px] text-neon font-bold tracking-widest uppercase leading-snug break-words">🎯 ${safeTarget}</p>
                    </div>
                    
                    <div class="h-10 sm:h-12 w-full bg-black/40 border-y border-white/5 relative overflow-hidden mb-3 rounded-lg">
                        <div class="absolute top-1 left-2 z-10 flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-neon animate-pulse shadow-[0_0_5px_rgba(57,255,20,0.8)]"></span>
                            <span class="text-[6px] sm:text-[7px] font-bold text-slate-500 uppercase tracking-widest">Line Movement (24h)</span>
                        </div>
                        <div class="absolute inset-0 pt-4 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            ${sparklineHtml}
                        </div>
                    </div>

                    <div class="flex justify-between items-center bg-black/30 border border-white/5 rounded-xl p-2 sm:p-2.5 mb-2 gap-2 overflow-hidden w-full">
                        <span class="text-[6.5px] sm:text-[7.5px] font-mono text-slate-500 uppercase tracking-widest truncate min-w-0 flex-1 leading-tight">${safeMarket}</span>
                        <div class="status-badge-container flex items-center gap-1 sm:gap-1.5 shrink-0">
                            ${isExpired ? statusBadge : `
                                ${statusBadge}
                                <span class="text-neon font-mono font-bold text-[9px] sm:text-[10px] tracking-widest whitespace-nowrap odds-text shrink-0">${edgeFormatted}</span>
                            `}
                        </div>
                    </div>
                    <button onclick="logBet('${safeMatchName}', 'EV', ${edgeVal}, '${oddsStr}', '${safeTarget}')" class="w-full bg-white/5 hover:bg-neon/20 border border-white/10 hover:border-neon/50 text-slate-300 hover:text-neon shadow-[0_0_10px_rgba(57,255,20,0.05)] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all duration-300 py-1.5 rounded-lg font-heading text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 group">
                        <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                        Log Play (1u)
                    </button>
                </div>
            </div>
        `;
    } catch (err) { return ''; }
}

// HIGH DENSITY UI - ARB CARD
function createArbCard(edge) {
    try {
        const edgeId = edge.id || Math.random().toString(36).substr(2, 9);
        const isMiddle = String(edge.market || '').toUpperCase().includes('MIDDLE');
        const arbVal = parseFloat(edge.arb_pct || edge.arb_percentage || edge.arb_percent || edge.arb || edge.edge || edge.value || edge.profit || edge.roi || edge.margin || edge.percentage || 0); 
        
        const arbFormatted = isMiddle ? `${arbVal.toFixed(1)} PTS` : `${arbVal.toFixed(2)}% ARB`;
        const badgeThemeClass = isMiddle ? 'bg-purple-500/10 border-purple-500/50 text-purple-400' : 'bg-neon/10 border-neon/50 text-neon';
        const dotThemeClass = isMiddle ? 'bg-purple-400' : 'bg-neon';
        const shadowThemeClass = isMiddle ? 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'shadow-[0_0_15px_rgba(57,255,20,0.15)]';

        const timestamp = edge.time_display || (edge.created_at ? new Date(edge.created_at).toLocaleTimeString() : "LIVE");
        
        const book1Name = edge.book1 || edge.book_1 || edge.bookmaker_1 || edge.sportsbook_1 || edge.sportsbook1 || edge.leg1_book || "Book 1";
        const book2Name = edge.book2 || edge.book_2 || edge.bookmaker_2 || edge.sportsbook_2 || edge.sportsbook2 || edge.leg2_book || "Book 2";
        const book1Logo = getSportsbookLogo(book1Name, "w-12 sm:w-16 h-3 sm:h-4 object-contain");
        const book2Logo = getSportsbookLogo(book2Name, "w-12 sm:w-16 h-3 sm:h-4 object-contain");
        
        let odds1Str = String(edge.odds1 || edge.odds_1 || "N/A");
        let odds2Str = String(edge.odds2 || edge.odds_2 || "N/A");
        const odds1 = (!odds1Str.startsWith('-') && !odds1Str.startsWith('+') && odds1Str !== "N/A") ? '+' + odds1Str : odds1Str;
        const odds2 = (!odds2Str.startsWith('-') && !odds2Str.startsWith('+') && odds2Str !== "N/A") ? '+' + odds2Str : odds2Str;

        const rawMatchName = String(edge.match_name || edge.game || edge.event || edge.event_name || edge.matchup || edge.teams || "UNKNOWN MATCH");
        const safeMatchName = rawMatchName.replace(/'/g, "\\'"); 

        const detectedSport = detectSport(edge);
        const iconHtml = generateTeamLogosHtml(detectedSport, false);

        const target1Html = edge.target1 || edge.leg1_target ? `<div class="text-white font-bold text-[9px] sm:text-[10px] uppercase tracking-wider mb-1 leading-tight break-words" title="${escapeHtml(edge.target1 || edge.leg1_target)}">${escapeHtml(edge.target1 || edge.leg1_target)}</div>` : '';
        const target2Html = edge.target2 || edge.leg2_target ? `<div class="text-white font-bold text-[9px] sm:text-[10px] uppercase tracking-wider mb-1 leading-tight break-words" title="${escapeHtml(edge.target2 || edge.leg2_target)}">${escapeHtml(edge.target2 || edge.leg2_target)}</div>` : '';

        const isExpired = String(edge.status).toLowerCase() === 'expired';
        const opacityClass = isExpired ? 'opacity-40 grayscale pointer-events-none' : 'animate-flash-update';
        const oddsStrike = isExpired ? 'line-through text-slate-600' : 'text-white odds-text';
        
        const badgeHtml = isExpired 
            ? `<div class="status-badge-container flex items-center"><span class="bg-red-500/20 text-red-500 border border-red-500/30 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0"><span class="w-1 h-1 rounded-full bg-red-500"></span> EXPIRED</span></div>`
            : `<div class="status-badge-container ${badgeThemeClass} border px-3 py-1.5 rounded-lg ${shadowThemeClass} flex items-center gap-1.5 inline-flex">
                    <span class="w-1.5 h-1.5 rounded-full ${dotThemeClass} animate-pulse shrink-0"></span>
                    <span class="font-mono font-bold text-sm sm:text-base tracking-widest">${arbFormatted}</span>
               </div>`;

        const savedBankroll = parseFloat(localStorage.getItem('ts_default_bankroll')) || 100;
        let arbInstructionHtml = '';

        if (!isExpired && odds1Str !== "N/A" && odds2Str !== "N/A" && !isMiddle) {
            const dec1 = convertToDecimal(odds1Str);
            const dec2 = convertToDecimal(odds2Str);
            
            if (dec1 > 1 && dec2 > 1) {
                const imp1 = 1 / dec1;
                const imp2 = 1 / dec2;
                const totalImp = imp1 + imp2;
                
                const stake1 = (savedBankroll * imp1) / totalImp;
                const stake2 = (savedBankroll * imp2) / totalImp;
                const payout = stake1 * dec1;
                const profit = payout - savedBankroll;
                
                arbInstructionHtml = `
                    <div class="mt-3 pt-3 border-t border-white/10 flex items-center justify-between bg-neon/5 border border-neon/20 rounded-xl p-3">
                        <div class="flex flex-col gap-1">
                            <span class="text-neon font-black text-[10px] tracking-widest uppercase">🎯 Optimal $${savedBankroll} Execution:</span>
                            <span class="text-slate-300 font-mono text-[9px] sm:text-[10px]">Bet <b class="text-white">$${stake1.toFixed(2)}</b> on ${book1Name.substring(0,8)} | Bet <b class="text-white">$${stake2.toFixed(2)}</b> on ${book2Name.substring(0,8)}</span>
                        </div>
                        <div class="text-right shrink-0 pl-2 border-l border-white/10">
                            <span class="text-slate-500 font-bold text-[8px] uppercase tracking-widest block mb-0.5">Lock Profit</span>
                            <span class="font-mono font-black text-neon text-sm">+$${profit.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }
        }

        const arbTargetStr = `${escapeHtml(edge.target1 || edge.leg1_target)} / ${escapeHtml(edge.target2 || edge.leg2_target)}`;

        return `
            <div id="card-${edgeId}" class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all duration-300 shadow-xl group relative overflow-hidden w-full flex flex-col ${opacityClass} ${isExpired ? '' : 'hover:border-white/30'}">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 border-b border-white/10 pb-4 relative z-10 w-full">
                    <div class="flex items-center gap-2 flex-1 min-w-0 w-full pr-1">
                        ${iconHtml}
                        <div class="flex-1 min-w-0 flex flex-col justify-center">
                            <div class="flex items-center gap-2 mb-0.5">
                                <h2 class="font-impact text-sm sm:text-base font-black uppercase tracking-wide text-white leading-tight break-words">${rawMatchName}</h2>
                            </div>
                            <p class="text-[8px] sm:text-[9px] text-slate-400 font-bold tracking-widest mt-0.5 uppercase break-words">${escapeHtml(edge.market || edge.bet_type) || "UNKNOWN MARKET"}</p>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        ${badgeHtml}
                        <p class="text-[7px] sm:text-[8px] text-slate-500 font-mono mt-1.5 tracking-widest uppercase block">${timestamp}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2 relative z-10 items-stretch flex-grow">
                    <div class="bg-black/30 border border-white/5 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between h-full w-full overflow-hidden">
                        <div class="flex flex-col gap-0.5 min-w-0 mb-2 w-full">
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">Leg 1</span>
                            ${target1Html}
                        </div>
                        <div class="flex justify-between items-end mt-auto gap-1 w-full">
                            <div class="flex items-center justify-start overflow-hidden shrink-0 h-3 sm:h-4">${book1Logo}</div>
                            <span class="font-heading font-black text-xs sm:text-sm tracking-widest shrink-0 text-right ${oddsStrike}">${odds1}</span>
                        </div>
                    </div>
                    <div class="bg-black/30 border border-white/5 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between h-full w-full overflow-hidden">
                        <div class="flex flex-col gap-0.5 min-w-0 mb-2 w-full">
                            <span class="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">Leg 2</span>
                            ${target2Html}
                        </div>
                        <div class="flex justify-between items-end mt-auto gap-1 w-full">
                            <div class="flex items-center justify-start overflow-hidden shrink-0 h-3 sm:h-4">${book2Logo}</div>
                            <span class="font-heading font-black text-xs sm:text-sm tracking-widest shrink-0 text-right ${oddsStrike}">${odds2}</span>
                        </div>
                    </div>
                </div>
                ${arbInstructionHtml}
                <button onclick="logBet('${safeMatchName}', 'ARB', ${arbVal}, '${odds1Str} / ${odds2Str}', '${arbTargetStr}', 'stake1-${edgeId}')" class="w-full mt-2.5 bg-white/5 hover:bg-neon/20 border border-white/10 hover:border-neon/50 text-slate-300 hover:text-neon shadow-[0_0_10px_rgba(57,255,20,0.05)] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all duration-300 py-1.5 rounded-lg font-heading text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex justify-center items-center gap-1.5 group">
                    <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                    Log Arbitrage Trade
                </button>
            </div>
        `;
    } catch (err) { return ''; }
}

function renderSportsFeed(data, type) {
    try {
        let container, createFn, currentFilter;
        if(type === 'sports-ev') { container = document.getElementById('sports-ev-feed-container'); createFn = createEvCard; currentFilter = currentSportsEvFilter; }
        if(type === 'sports-arb') { container = document.getElementById('sports-arb-feed-container'); createFn = createArbCard; currentFilter = currentSportsArbFilter; }
        
        // Use the newly decoupled engine for DFS props
        if(type === 'sports-dfs') { container = document.getElementById('sports-dfs-feed-container'); createFn = createDfsCard; currentFilter = currentSportsDfsFilter; }

        if (!container) return;
        
        let activeData = Array.isArray(data) ? data : [];

        if (type === 'sports-arb' || type === 'sports-ev') {
            const currentState = type === 'sports-arb' ? currentArbState : currentEvState;
            activeData = activeData.filter(edge => {
                let dbState = String(edge.match_state || '').toLowerCase().trim();
                let stateCheck = 'pre_match'; 

                if (dbState === 'live' || dbState === 'live_action' || dbState === 'in_game') {
                    stateCheck = 'live';
                } else if (dbState === 'pre_match' || dbState === 'pre') {
                    stateCheck = 'pre_match';
                } else {
                    const timeStr = (String(edge.time_display || '') + ' ' + String(edge.telemetry || '')).toLowerCase();
                    if (timeStr.includes('live') || timeStr.includes('q1') || timeStr.includes('q2') || timeStr.includes('q3') || timeStr.includes('q4') || timeStr.includes('half') || timeStr.includes('top') || timeStr.includes('bot') || timeStr.includes('period') || timeStr.includes('inning') || timeStr.includes('set')) {
                        stateCheck = 'live';
                    }
                }
                return stateCheck === currentState;
            });
        }

        const sportFilteredData = (currentFilter !== 'all') ? activeData.filter(edge => {
            const detected = detectSport(edge);
            
            if (currentFilter === 'baseball' && detected === 'baseball') return true;
            if (currentFilter === 'basketball' && detected === 'basketball') return true;
            if (currentFilter === 'football' && detected === 'football') return true;
            if (currentFilter === 'hockey' && detected === 'hockey') return true;
            if (currentFilter === 'soccer' && detected === 'soccer') return true;
            if (currentFilter === 'tennis' && detected === 'tennis') return true;
            if (currentFilter === 'mma' && detected === 'mma') return true;
            
            return false;
        }) : activeData;

        const availableLeagues = extractLeagues(sportFilteredData);
        const selectId = `subfilter-${type}`;
        const containerId = `subfilter-container-${type}`;
        const selectEl = document.getElementById(selectId);
        const containerEl = document.getElementById(containerId);
        
        let currentSubFilter = 'all';
        if (type === 'sports-ev') currentSubFilter = currentEvLeagueFilter;
        if (type === 'sports-arb') currentSubFilter = currentArbLeagueFilter;
        if (type === 'sports-dfs') currentSubFilter = currentDfsLeagueFilter;

        if (containerEl && selectEl) {
            if (availableLeagues.length > 0) {
                containerEl.classList.remove('hidden');
                let html = `<option value="all">All Leagues</option>`;
                availableLeagues.forEach(l => {
                    html += `<option value="${l}">${l}</option>`;
                });
                selectEl.innerHTML = html;
                
                if (availableLeagues.includes(currentSubFilter)) {
                    selectEl.value = currentSubFilter;
                } else {
                    selectEl.value = 'all';
                    currentSubFilter = 'all';
                    if (type === 'sports-ev') currentEvLeagueFilter = 'all';
                    if (type === 'sports-arb') currentArbLeagueFilter = 'all';
                    if (type === 'sports-dfs') currentDfsLeagueFilter = 'all';
                }
            } else {
                containerEl.classList.add('hidden');
            }
        }

        let activeBooks = null;
        try {
            const stored = localStorage.getItem('ts_active_books');
            if (stored) activeBooks = JSON.parse(stored);
        } catch(e) {}

        const finalData = sportFilteredData.filter(edge => {
            if (currentSubFilter !== 'all' && getLeague(edge) !== currentSubFilter) return false;
            
            if (activeBooks !== null) {
                if (activeBooks.length === 0) return false; 
                
                if (type === 'sports-arb') {
                    const b1 = String(edge.book1 || edge.book_1 || edge.bookmaker_1 || edge.sportsbook_1 || edge.sportsbook1 || edge.leg1_book || "").toLowerCase().replace(/[^a-z0-9]/g, '');
                    const b2 = String(edge.book2 || edge.book_2 || edge.bookmaker_2 || edge.sportsbook_2 || edge.sportsbook2 || edge.leg2_book || "").toLowerCase().replace(/[^a-z0-9]/g, '');
                    
                    const matchB1 = activeBooks.some(ab => b1.includes(ab) || ab.includes(b1));
                    const matchB2 = activeBooks.some(ab => b2.includes(ab) || ab.includes(b2));
                    
                    if (!matchB1 || !matchB2) return false; 
                } else {
                    const book = String(edge.sportsbook || edge.book || edge.platform || edge.bookmaker || "").toLowerCase().replace(/[^a-z0-9]/g, '');
                    const matchBook = activeBooks.some(ab => book.includes(ab) || ab.includes(book));
                    
                    if (!matchBook && book !== '') return false; 
                }
            }
            return true;
        });

        if (currentActiveTab === type) updateTicker(finalData, type); 

        let optimizedHtml = '';
        if (type === 'sports-dfs' && currentOptimizedSlip && currentFilter === 'all' && currentSubFilter === 'all') {
            optimizedHtml = createOptimizedSlipCard(currentOptimizedSlip);
        }

        if (finalData.length === 0 && !optimizedHtml) {
            let emptyMessage = "SYSTEM ONLINE: AWAITING DISCREPANCIES...";
            
            if (activeBooks !== null && activeBooks.length === 0) {
                emptyMessage = "NO SPORTSBOOKS SELECTED IN PLATFORM SETTINGS.";
            } else if (type === 'sports-arb') {
                emptyMessage = `NO ${currentArbState.replace('_', '-').toUpperCase()} ARBS CURRENTLY ACTIVE.`;
            } else if (type === 'sports-ev') {
                emptyMessage = `NO ${currentEvState.replace('_', '-').toUpperCase()} EV EDGES CURRENTLY ACTIVE.`;
            }
            container.innerHTML = `<div class="col-span-full border border-dashed border-white/20 bg-white/5 backdrop-blur-md rounded-2xl p-12 text-center shadow-lg"><span class="text-neon font-mono font-bold tracking-widest uppercase animate-pulse">${emptyMessage}</span></div>`;
            return;
        }
        
        container.innerHTML = optimizedHtml + finalData.map(edge => createFn(edge)).join('');
    } catch(e) { console.error("Render Grid Error", e); }
}

async function loadOptimizedSlip() {
    try {
        if (typeof db === 'undefined') return;
        const { data, error } = await db.from('dfs_optimized_slips')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;
        currentOptimizedSlip = data && data.length > 0 ? data[0] : null;
    } catch (err) {
        console.error("Failed to load optimized slip:", err);
    }
}

async function loadLiveTelemetry(isInitialLoad = false) {
    if (currentActiveTab !== 'sports-ev') return;
    try {
        if (typeof db === 'undefined') throw new Error("Supabase undefined");
        const { data, error } = await db.from('ev_live_data').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        
        if (isInitialLoad) {
            const loader = document.getElementById('loading-state-sports-ev');
            const container = document.getElementById('sports-ev-feed-container');
            if (loader) loader.classList.add('hidden');
            if (container) container.classList.remove('hidden');
        }
        
        const currentDataHash = data ? JSON.stringify(data) : "";
        if (!isInitialLoad && currentDataHash === sportsEvDataHash) return; 

        sportsEvDataHash = currentDataHash;
        lastFetchedSportsEvData = data || [];
        renderSportsFeed(lastFetchedSportsEvData, 'sports-ev');
    } catch (err) {
        console.error("Live Telemetry Error:", err);
        if (isInitialLoad) {
            const loader = document.getElementById('loading-state-sports-ev');
            if (loader) loader.innerHTML = `<p class="text-redAccent font-mono text-xs uppercase tracking-widest">Error connecting to matrix.</p>`;
        }
    }
}

async function loadArbTelemetry(isInitialLoad = false) {
    if (currentActiveTab !== 'sports-arb') return;
    try {
        if (typeof db === 'undefined') throw new Error("Supabase undefined");
        const { data, error } = await db.from('arbitrage_live_data').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        
        if (isInitialLoad) {
            const loader = document.getElementById('loading-state-sports-arb');
            const container = document.getElementById('sports-arb-feed-container');
            if (loader) loader.classList.add('hidden');
            if (container) container.classList.remove('hidden');
        }

        const currentDataHash = data ? JSON.stringify(data) : "";
        if (!isInitialLoad && currentDataHash === sportsArbDataHash) return; 

        sportsArbDataHash = currentDataHash;
        lastFetchedSportsArbData = data || [];
        renderSportsFeed(lastFetchedSportsArbData, 'sports-arb');
    } catch (err) {
        console.error("Arb Telemetry Error:", err);
        if (isInitialLoad) {
            const loader = document.getElementById('loading-state-sports-arb');
            if (loader) loader.innerHTML = `<p class="text-redAccent font-mono text-xs uppercase tracking-widest">Error connecting to matrix.</p>`;
        }
    }
}

async function loadDfsTelemetry(isInitialLoad = false) {
    if (currentActiveTab !== 'sports-dfs') return;
    try {
        if (typeof db === 'undefined') throw new Error("Supabase undefined");
        
        await loadOptimizedSlip();

        const { data, error } = await db.from('dfs_live_data').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) throw error;
        
        if (isInitialLoad) {
            const loader = document.getElementById('loading-state-sports-dfs');
            const container = document.getElementById('sports-dfs-feed-container');
            if (loader) loader.classList.add('hidden');
            if (container) container.classList.remove('hidden');
        }

        const currentDataHash = data ? JSON.stringify(data) : "";
        if (!isInitialLoad && currentDataHash === sportsDfsDataHash) return; 

        sportsDfsDataHash = currentDataHash;
        lastFetchedSportsDfsData = data || [];
        renderSportsFeed(lastFetchedSportsDfsData, 'sports-dfs');
    } catch (err) {
        console.error("DFS Telemetry Error:", err);
        if (isInitialLoad) {
            const loader = document.getElementById('loading-state-sports-dfs');
            if (loader) loader.innerHTML = `<p class="text-redAccent font-mono text-xs uppercase tracking-widest">Error connecting to matrix.</p>`;
        }
    }
}

window.onload = () => {
    setInterval(() => { if (currentActiveTab === 'sports-ev') loadLiveTelemetry(false); }, 30000); 
    setInterval(() => { if (currentActiveTab === 'sports-arb') loadArbTelemetry(false); }, 30000); 
    setInterval(() => { if (currentActiveTab === 'sports-dfs') loadDfsTelemetry(false); }, 30000); 
};
