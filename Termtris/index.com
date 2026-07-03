<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Terminal Software | Execute Your Vision</title>
    <style>
        :root {
            --terminal-bg: #000000;
            --terminal-green: #00FF00;
            --terminal-dim: #004400;
        }

        body {
            background-color: var(--terminal-bg);
            color: var(--terminal-green);
            font-family: 'Courier New', Courier, monospace;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
            text-transform: uppercase;
        }

        .game-wrapper {
            display: flex;
            gap: 20px;
            padding: 20px;
            border: 1px solid var(--terminal-green);
            box-shadow: 0 0 10px var(--terminal-dim);
        }

        .side-panel {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            width: 120px;
        }

        .panel-box {
            border: 1px dashed var(--terminal-green);
            padding: 10px;
            text-align: center;
            margin-bottom: 20px;
        }

        .panel-box h2 {
            font-size: 1rem;
            margin: 0 0 10px 0;
            border-bottom: 1px solid var(--terminal-green);
            padding-bottom: 5px;
        }

        canvas {
            background-color: var(--terminal-bg);
            border: 2px solid var(--terminal-green);
            display: block;
        }

        .preview-canvas {
            width: 80px;
            height: 80px;
            margin: 0 auto;
        }

        .branding {
            font-size: 0.8rem;
            text-align: center;
            margin-top: auto;
            line-height: 1.4;
        }

        /* Mobile Controls Overlay - Hidden on Desktop */
        .mobile-controls {
            display: none;
            width: 100%;
            justify-content: space-between;
            margin-top: 15px;
            flex-wrap: wrap;
            gap: 5px;
        }

        .mobile-btn {
            background: transparent;
            color: var(--terminal-green);
            border: 1px solid var(--terminal-green);
            font-family: inherit;
            font-size: 1.2rem;
            padding: 10px 15px;
            cursor: pointer;
            user-select: none;
            flex-grow: 1;
            text-align: center;
        }

        .mobile-btn:active {
            background: var(--terminal-green);
            color: var(--terminal-bg);
        }

        #gameOverScreen {
            display: none;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid var(--terminal-green);
            padding: 30px;
            text-align: center;
            z-index: 10;
        }

        @media (max-width: 768px) {
            .game-wrapper {
                flex-direction: column;
                align-items: center;
                border: none;
                box-shadow: none;
                padding: 10px;
                height: 100vh;
                justify-content: center;
            }
            .side-panel {
                flex-direction: row;
                width: 300px;
                justify-content: space-between;
                margin-bottom: 10px;
            }
            .panel-box {
                margin-bottom: 0;
                padding: 5px;
            }
            .branding {
                display: none; /* Hide on small screens to save space */
            }
            .mobile-controls {
                display: flex;
                width: 300px;
            }
        }
    </style>
</head>
<body>

    <div class="game-wrapper">
        <div class="side-panel">
            <div class="panel-box">
                <h2>Hold [C]</h2>
                <canvas id="holdCanvas" class="preview-canvas" width="80" height="80"></canvas>
            </div>
            
            <div class="branding">
                > TERMINAL SOFTWARE<br>
                > EXECUTE<br>
                _ YOUR VISION<br>
                <span style="animation: blink 1s step-end infinite;">█</span>
            </div>
        </div>

        <div style="position: relative;">
            <canvas id="gameCanvas" width="300" height="600"></canvas>
            
            <div id="gameOverScreen">
                <h2>SYSTEM FAILURE</h2>
                <p>CONNECTION LOST</p>
                <button class="mobile-btn" onclick="resetGame()" style="margin-top: 15px;">[ REBOOT ]</button>
            </div>

            <div class="mobile-controls">
                <button class="mobile-btn" id="btnHold">[ C ]</button>
                <button class="mobile-btn" id="btnLeft">[ &lt; ]</button>
                <button class="mobile-btn" id="btnRotate">[ ↻ ]</button>
                <button class="mobile-btn" id="btnRight">[ &gt; ]</button>
                <button class="mobile-btn" id="btnDrop">[ V ]</button>
            </div>
        </div>

        <div class="side-panel">
            <div class="panel-box">
                <h2>Next</h2>
                <canvas id="nextCanvas" class="preview-canvas" width="80" height="80"></canvas>
            </div>
            
            <div class="panel-box">
                <h2>Score</h2>
                <div id="scoreDisplay">0</div>
            </div>

            <div class="panel-box">
                <h2>Level</h2>
                <div id="levelDisplay">1</div>
            </div>

            <div class="panel-box">
                <h2>Lines</h2>
                <div id="linesDisplay">0</div>
            </div>
        </div>
    </div>

    <style>
        @keyframes blink { 50% { opacity: 0; } }
    </style>

    <script>
        // --- 1. Game Constants & State ---
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const nextCtx = document.getElementById('nextCanvas').getContext('2d');
        const holdCtx = document.getElementById('holdCanvas').getContext('2d');
        
        const COLS = 10;
        const ROWS = 20;
        const BLOCK_SIZE = 30;
        const BRAND_COLOR = '#00FF00'; 
        const DIM_COLOR = '#004400';

        let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        let score = 0;
        let level = 1;
        let lines = 0;
        let gameOver = false;
        let animationId;

        // --- 2. Tetromino Matrices ---
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

        let currentPiece = null;
        let nextPiece = null;
        let holdPiece = null;
        let canHold = true; 

        // --- 3. Rendering Engine ---
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
                    if (board[r][c]) {
                        drawBlock(ctx, c, r);
                    }
                }
            }
        }

        function updatePreviews() {
            // Clear preview canvases
            nextCtx.fillStyle = '#000000';
            nextCtx.fillRect(0, 0, 80, 80);
            holdCtx.fillStyle = '#000000';
            holdCtx.fillRect(0, 0, 80, 80);

            // Draw Next Piece
            if (nextPiece) {
                const size = 20;
                const offsetX = (80 - nextPiece.matrix[0].length * size) / 2;
                const offsetY = (80 - nextPiece.matrix.length * size) / 2;
                nextPiece.matrix.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value) {
                            nextCtx.strokeStyle = BRAND_COLOR;
                            nextCtx.strokeRect(offsetX + x * size, offsetY + y * size, size, size);
                            nextCtx.strokeRect(offsetX + x * size + 3, offsetY + y * size + 3, size - 6, size - 6);
                        }
                    });
                });
            }

            // Draw Hold Piece
            if (holdPiece) {
                const size = 20;
                const offsetX = (80 - holdPiece.matrix[0].length * size) / 2;
                const offsetY = (80 - holdPiece.matrix.length * size) / 2;
                holdPiece.matrix.forEach((row, y) => {
                    row.forEach((value, x) => {
                        if (value) {
                            holdCtx.strokeStyle = canHold ? BRAND_COLOR : DIM_COLOR;
                            holdCtx.strokeRect(offsetX + x * size, offsetY + y * size, size, size);
                            holdCtx.strokeRect(offsetX + x * size + 3, offsetY + y * size + 3, size - 6, size - 6);
                        }
                    });
                });
            }
        }

        function spawnPiece() {
            const type = SHAPES[Math.floor(Math.random() * SHAPES.length)];
            return {
                type: type,
                matrix: TETROMINOES[type],
                x: Math.floor(COLS / 2) - Math.floor(TETROMINOES[type][0].length / 2),
                y: 0
            };
        }

        // --- 4. Core Mechanics ---
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
                y++;
                linesCleared++;
            }

            if (linesCleared > 0) {
                lines += linesCleared;
                document.getElementById('linesDisplay').innerText = lines;
                
                // Original Game Boy scoring system
                const lineScores = [0, 40, 100, 300, 1200];
                score += lineScores[linesCleared] * level;
                document.getElementById('scoreDisplay').innerText = score;

                // Level up every 10 lines
                if (lines >= level * 10) {
                    level++;
                    document.getElementById('levelDisplay').innerText = level;
                    dropInterval = Math.max(100, 1000 - (level - 1) * 100); // Speed up
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
                    rotate(currentPiece.matrix); 
                    rotate(currentPiece.matrix);
                    rotate(currentPiece.matrix);
                    currentPiece.x = pos;
                    return;
                }
            }
        }

        function playerMove(offset) {
            if (!collide(board, currentPiece, offset, 0)) {
                currentPiece.x += offset;
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
                
                if (collide(board, currentPiece)) {
                    gameOver = true;
                    document.getElementById('gameOverScreen').style.display = 'block';
                    // Supabase upload logic will go here
                }
            }
            dropCounter = 0;
        }

        // --- 5. Game Loop ---
        let dropCounter = 0;
        let dropInterval = 1000;
        let lastTime = 0;

        function update(time = 0) {
            if (gameOver) return;

            const deltaTime = time - lastTime;
            lastTime = time;
            dropCounter += deltaTime;

            if (dropCounter > dropInterval) {
                playerDrop();
            }

            drawBoard();
            
            // Draw active piece
            currentPiece.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        drawBlock(ctx, currentPiece.x + x, currentPiece.y + y);
                    }
                });
            });

            animationId = requestAnimationFrame(update);
        }

        function resetGame() {
            board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
            score = 0;
            level = 1;
            lines = 0;
            dropInterval = 1000;
            gameOver = false;
            
            document.getElementById('scoreDisplay').innerText = score;
            document.getElementById('levelDisplay').innerText = level;
            document.getElementById('linesDisplay').innerText = lines;
            document.getElementById('gameOverScreen').style.display = 'none';
            
            currentPiece = spawnPiece();
            nextPiece = spawnPiece();
            holdPiece = null;
            canHold = true;
            
            updatePreviews();
            update();
        }

        // --- 6. Inputs ---
        document.addEventListener('keydown', event => {
            if (gameOver) return;
            
            switch(event.key) {
                case 'ArrowLeft': case 'a': case 'A':
                    playerMove(-1); break;
                case 'ArrowRight': case 'd': case 'D':
                    playerMove(1); break;
                case 'ArrowDown': case 's': case 'S':
                    playerDrop(); break;
                case 'ArrowUp': case 'w': case 'W':
                    playerRotate(); break;
                case 'c': case 'C':
                    playerHold(); break;
                case ' ': // Spacebar for hard drop
                    while(!collide(board, currentPiece, 0, 1)) currentPiece.y++;
                    playerDrop();
                    break;
            }
        });

        document.getElementById('btnLeft').addEventListener('click', () => playerMove(-1));
        document.getElementById('btnRight').addEventListener('click', () => playerMove(1));
        document.getElementById('btnRotate').addEventListener('click', playerRotate);
        document.getElementById('btnHold').addEventListener('click', playerHold);
        document.getElementById('btnDrop').addEventListener('click', () => {
            while(!collide(board, currentPiece, 0, 1)) { currentPiece.y++; }
            playerDrop(); 
        });

        // --- Boot Sequence ---
        currentPiece = spawnPiece();
        nextPiece = spawnPiece();
        updatePreviews();
        update();

    </script>
</body>
</html>
