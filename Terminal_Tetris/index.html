<!DOCTYPE html>
<html lang="en" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="Terminal Software: Execute Your Vision. Play the classic block puzzle.">
    <title>Terminal Tetris | Execute Your Vision</title>
    
    <link rel="icon" type="image/png" href="/assets/images/favicon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#000000">
    <link rel="apple-touch-icon" href="/assets/images/terminal-icon-192.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">

    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        background: '#000000', terminal: '#002200', neon: '#39ff14', dim: '#004400',
                        studio: '#050505'
                    },
                    fontFamily: {
                        mono: ['Space Mono', 'monospace', 'Courier New', 'Courier'],
                    }
                }
            }
        }
    </script>
    <style>
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 34, 0, 0.5); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(57, 255, 20, 0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(57, 255, 20, 0.5); }
        
        @keyframes blink { 50% { opacity: 0; } }
        .cursor-blink { animation: blink 1s step-end infinite; }
    </style>

    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        if (localStorage.getItem('terminal_cookie_consent') === 'granted') loadGA4();
        
        function loadGA4() {
            const script = document.createElement('script');
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-75T58KCS89'; 
            script.async = true;
            document.head.appendChild(script);
            gtag('js', new Date());
            gtag('config', 'G-75T58KCS89'); 
        }
        
        function acceptCookies() {
            localStorage.setItem('terminal_cookie_consent', 'granted');
            document.getElementById('cookie-banner').style.display = 'none';
            loadGA4();
        }

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch((err) => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }
    </script>
</head>
<body class="bg-background text-neon font-mono antialiased min-h-screen flex flex-col relative overflow-x-hidden selection:bg-neon selection:text-background uppercase">

    <div id="cookie-banner" class="fixed bottom-0 left-0 w-full bg-studio/95 backdrop-blur-xl border-t border-neon/30 z-[100] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-10px_30px_rgba(57,255,20,0.1)]" style="display: none;">
        <div class="text-sm text-neon/80 font-medium tracking-wide">
            We use cookies and telemetry to analyze traffic and optimize your experience. <a href="/privacy.html" class="text-neon hover:underline underline-offset-4 font-bold">Learn more</a>.
        </div>
        <button onclick="acceptCookies()" class="bg-neon/10 hover:bg-neon text-neon hover:text-background border border-neon font-black px-6 py-2 rounded-lg text-xs tracking-widest transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(57,255,20,0.2)]">
            Initialize Trackers
        </button>
    </div>
    <script>
        if (!localStorage.getItem('terminal_cookie_consent')) {
            document.getElementById('cookie-banner').style.display = 'flex';
        }
    </script>

    <nav id="global-nav" class="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-neon/20"></nav>

    <main class="flex-grow container mx-auto px-4 py-8 max-w-5xl relative z-10 flex flex-col items-center justify-center">
        
        <div class="flex flex-col md:flex-row gap-6 p-4 md:p-8 border border-neon shadow-[0_0_20px_rgba(57,255,20,0.15)] bg-studio">
            
            <div class="flex flex-row md:flex-col justify-between md:w-32">
                <div class="border border-dashed border-neon p-2 text-center w-full">
                    <h2 class="text-xs tracking-widest mb-2 border-b border-neon pb-1">Hold [C]</h2>
                    <canvas id="holdCanvas" class="w-[80px] h-[80px] mx-auto block bg-background"></canvas>
                </div>
                
                <div class="hidden md:block text-[10px] leading-relaxed text-center mt-auto tracking-widest text-neon">
                    > TERMINAL<br>
                    > SOFTWARE<br>
                    > EXECUTE<br>
                    _ YOUR VISION <span class="cursor-blink font-black">█</span>
                </div>
            </div>

            <div class="relative">
                <canvas id="gameCanvas" width="300" height="600" class="border-2 border-neon bg-background block"></canvas>
                
                <div id="gameOverScreen" class="hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/95 border-2 border-neon p-6 text-center z-10 w-64 shadow-[0_0_30px_rgba(57,255,20,0.4)] backdrop-blur-sm">
                    <h2 class="text-xl font-bold mb-2 text-red-500 tracking-widest">SYSTEM FAILURE</h2>
                    <p class="text-sm mb-4">SCORE SAVED TO DB</p>
                    <button onclick="resetGame()" class="w-full bg-transparent text-neon border border-neon font-bold py-3 hover:bg-neon hover:text-background transition-colors tracking-widest">[ REBOOT ]</button>
                </div>

                <div class="flex md:hidden w-full justify-between mt-4 flex-wrap gap-2">
                    <button class="flex-1 bg-transparent text-neon border border-neon py-3 active:bg-neon active:text-background font-bold text-lg text-center" id="btnHold">[ C ]</button>
                    <button class="flex-1 bg-transparent text-neon border border-neon py-3 active:bg-neon active:text-background font-bold text-lg text-center" id="btnLeft">[ &lt; ]</button>
                    <button class="flex-1 bg-transparent text-neon border border-neon py-3 active:bg-neon active:text-background font-bold text-lg text-center" id="btnRotate">[ ↻ ]</button>
                    <button class="flex-1 bg-transparent text-neon border border-neon py-3 active:bg-neon active:text-background font-bold text-lg text-center" id="btnRight">[ &gt; ]</button>
                    <button class="flex-1 bg-transparent text-neon border border-neon py-3 active:bg-neon active:text-background font-bold text-lg text-center" id="btnDrop">[ V ]</button>
                </div>
            </div>

            <div class="flex flex-row md:flex-col justify-between gap-4 md:w-32">
                <div class="border border-dashed border-neon p-2 text-center w-full">
                    <h2 class="text-xs tracking-widest mb-2 border-b border-neon pb-1">Next</h2>
                    <canvas id="nextCanvas" class="w-[80px] h-[80px] mx-auto block bg-background"></canvas>
                </div>
                
                <div class="flex flex-col gap-4 w-full">
                    <div class="border border-dashed border-neon p-2 text-center">
                        <h2 class="text-xs tracking-widest mb-1 border-b border-neon pb-1">Score</h2>
                        <div id="scoreDisplay" class="font-bold text-lg">0</div>
                    </div>
                    <div class="border border-dashed border-neon p-2 text-center">
                        <h2 class="text-xs tracking-widest mb-1 border-b border-neon pb-1">Level</h2>
                        <div id="levelDisplay" class="font-bold text-lg">1</div>
                    </div>
                    <div class="border border-dashed border-neon p-2 text-center">
                        <h2 class="text-xs tracking-widest mb-1 border-b border-neon pb-1">Lines</h2>
                        <div id="linesDisplay" class="font-bold text-lg">0</div>
                    </div>
                </div>
            </div>

        </div>
    </main>

    <footer id="global-footer" class="bg-background py-8 border-t border-neon/20 mt-auto relative z-20"></footer>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="../assets/js/auth.js"></script>
    <script src="../assets/js/components.js"></script>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof renderGlobalComponents === 'function') renderGlobalComponents();
            if (typeof setupSmartNavbar === 'function') setupSmartNavbar();
        });

        // --- Game Engine Variables ---
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const nextCtx = document.getElementById('nextCanvas').getContext('2d');
        const holdCtx = document.getElementById('holdCanvas').getContext('2d');
        
        const COLS = 10, ROWS = 20, BLOCK_SIZE = 30;
        const BRAND_COLOR = '#39ff14'; // Matches Tailwind 'neon'
        const DIM_COLOR = '#004400';

        let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        let score = 0, level = 1, lines = 0;
        let gameOver = false, animationId;
        
        const TETROMINOES = {
            'I': [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
            'J': [[1,0,0], [1,1,1], [0,0,0]],
            'L': [[0,0,1], [1,1,1], [0,0,0]],
            'O': [[1,1], [1,1]],
            'S': [[0,1,1], [1,1,0], [0,0,0]],
            'T': [[0,1,0], [1,1,1], [0,0,0]],
            'Z': [[1,1,0], [0,1,1], [0,0,0]]
        };
        const SHAPES = Object.keys(TETROMINOES);

        let currentPiece = null, nextPiece = null, holdPiece = null, canHold = true; 

        // --- Core Functions ---
        function drawBlock(context, x, y, size = BLOCK_SIZE, color = BRAND_COLOR) {
            context.strokeStyle = color;
            context.lineWidth = 2;
            context.strokeRect(x * size, y * size, size, size);
            context.lineWidth = 1;
            context.strokeRect(x * size + 4, y * size + 4, size - 8, size - 8);
        }

        function drawBoard() {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = DIM_COLOR;
            ctx.lineWidth = 1;
            for(let r = 0; r < ROWS; r++) {
                for(let c = 0; c < COLS; c++) {
                    ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (board[r][c]) drawBlock(ctx, c, r);
                }
            }
        }

        function updatePreviews() {
            nextCtx.fillStyle = '#000000'; nextCtx.fillRect(0, 0, 80, 80);
            holdCtx.fillStyle = '#000000'; holdCtx.fillRect(0, 0, 80, 80);

            if (nextPiece) drawMatrix(nextCtx, nextPiece, BRAND_COLOR);
            if (holdPiece) drawMatrix(holdCtx, holdPiece, canHold ? BRAND_COLOR : DIM_COLOR);
        }

        function drawMatrix(context, piece, color) {
            const size = 20;
            const offsetX = (80 - piece.matrix[0].length * size) / 2;
            const offsetY = (80 - piece.matrix.length * size) / 2;
            piece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        context.strokeStyle = color;
                        context.strokeRect(offsetX + x * size, offsetY + y * size, size, size);
                        context.strokeRect(offsetX + x * size + 3, offsetY + y * size + 3, size - 6, size - 6);
                    }
                });
            });
        }

        function spawnPiece() {
            const type = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            return {
                type: type, matrix: TETROMINOES[type],
                x: Math.floor(COLS / 2) - Math.floor(TETROMINOES[type][0].length / 2),
                y: 0
            };
        }

        function collide(board, piece, moveX = 0, moveY = 0) {
            const matrix = piece.matrix;
            for (let y = 0; y < matrix.length; y++) {
                for (let x = 0; x < matrix[y].length; x++) {
                    if (matrix[y][x] !== 0) {
                        let newX = piece.x + x + moveX;
                        let newY = piece.y + y + moveY;
                        if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX] !== 0)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function merge(board, piece) {
            piece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0 && piece.y + y >= 0) {
                        board[piece.y + y][piece.x + x] = value;
                    }
                });
            });
        }

        function clearLines() {
            let linesCleared = 0;
            outer: for (let y = ROWS - 1; y >= 0; y--) {
                for (let x = 0; x < COLS; x++) {
                    if (board[y][x] === 0) continue outer;
                }
                const row = board.splice(y, 1)[0].fill(0);
                board.unshift(row);
                y++; linesCleared++;
            }

            if (linesCleared > 0) {
                lines += linesCleared;
                document.getElementById('linesDisplay').innerText = lines;
                const lineScores = [0, 40, 100, 300, 1200];
                score += lineScores[linesCleared] * level;
                document.getElementById('scoreDisplay').innerText = score;

                if (lines >= level * 10) {
                    level++;
                    document.getElementById('levelDisplay').innerText = level;
                    dropInterval = Math.max(100, 1000 - (level - 1) * 100);
                }
            }
        }

        function playerHold() {
            if (!canHold) return;
            if (holdPiece === null) {
                holdPiece = { ...currentPiece, x: 0, y: 0 };
                currentPiece = nextPiece;
                nextPiece = spawnPiece();
            } else {
                const temp = { ...currentPiece, x: 0, y: 0 };
                currentPiece = { ...holdPiece, x: Math.floor(COLS / 2) - Math.floor(holdPiece.matrix[0].length / 2), y: 0 };
                holdPiece = temp;
            }
            canHold = false;
            updatePreviews();
            dropCounter = 0;
        }

        function rotate(matrix) {
            for (let y = 0; y < matrix.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
                }
            }
            matrix.forEach(row => row.reverse());
        }

        function playerRotate() {
            const pos = currentPiece.x;
            let offset = 1;
            rotate(currentPiece.matrix);
            while (collide(board, currentPiece)) {
                currentPiece.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > currentPiece.matrix[0].length) {
                    rotate(currentPiece.matrix); rotate(currentPiece.matrix); rotate(currentPiece.matrix);
                    currentPiece.x = pos; return;
                }
            }
        }

        function playerMove(offset) {
            if (!collide(board, currentPiece, offset, 0)) currentPiece.x += offset;
        }

        async function handleGameOver() {
            gameOver = true;
            document.getElementById('gameOverScreen').style.display = 'block';
            
            // Supabase integration based on existing auth.js session
            try {
                if (typeof supabase !== 'undefined') {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        await supabase.from('tetris_scores').insert({
                            user_id: session.user.id,
                            score: score,
                            level: level,
                            lines_cleared: lines
                        });
                        console.log("Score successfully logged to terminal database.");
                    }
                }
            } catch (error) {
                console.error("Database sync failed:", error);
            }
        }

        function playerDrop() {
            if (!collide(board, currentPiece, 0, 1)) {
                currentPiece.y++;
            } else {
                merge(board, currentPiece);
                clearLines();
                currentPiece = nextPiece;
                nextPiece = spawnPiece();
                canHold = true; 
                updatePreviews();
                
                if (collide(board, currentPiece)) handleGameOver();
            }
            dropCounter = 0;
        }

        // --- Game Loop ---
        let dropCounter = 0, dropInterval = 1000, lastTime = 0;

        function update(time = 0) {
            if (gameOver) return;
            const deltaTime = time - lastTime;
            lastTime = time;
            dropCounter += deltaTime;

            if (dropCounter > dropInterval) playerDrop();

            drawBoard();
            currentPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) drawBlock(ctx, currentPiece.x + x, currentPiece.y + y);
                });
            });

            animationId = requestAnimationFrame(update);
        }

        function resetGame() {
            board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
            score = 0; level = 1; lines = 0; dropInterval = 1000; gameOver = false;
            
            document.getElementById('scoreDisplay').innerText = score;
            document.getElementById('levelDisplay').innerText = level;
            document.getElementById('linesDisplay').innerText = lines;
            document.getElementById('gameOverScreen').style.display = 'none';
            
            currentPiece = spawnPiece(); nextPiece = spawnPiece(); holdPiece = null; canHold = true;
            
            updatePreviews(); update();
        }

        // --- Input Listeners ---
        document.addEventListener('keydown', event => {
            if (gameOver) return;
            switch(event.key) {
                case 'ArrowLeft': case 'a': case 'A': playerMove(-1); break;
                case 'ArrowRight': case 'd': case 'D': playerMove(1); break;
                case 'ArrowDown': case 's': case 'S': playerDrop(); break;
                case 'ArrowUp': case 'w': case 'W': playerRotate(); break;
                case 'c': case 'C': playerHold(); break;
                case ' ': while(!collide(board, currentPiece, 0, 1)) currentPiece.y++; playerDrop(); break;
            }
        });

        document.getElementById('btnLeft').addEventListener('click', () => playerMove(-1));
        document.getElementById('btnRight').addEventListener('click', () => playerMove(1));
        document.getElementById('btnRotate').addEventListener('click', playerRotate);
        document.getElementById('btnHold').addEventListener('click', playerHold);
        document.getElementById('btnDrop').addEventListener('click', () => {
            while(!collide(board, currentPiece, 0, 1)) currentPiece.y++; playerDrop(); 
        });

        // Initialize Boot
        currentPiece = spawnPiece();
        nextPiece = spawnPiece();
        updatePreviews();
        update();

    </script>
</body>
</html>
