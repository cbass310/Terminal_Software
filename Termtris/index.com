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
        }

        /* Small canvases for Hold and Next pieces */
        .preview-canvas {
            width: 80px;
            height: 80px;
            margin: 0 auto;
            display: block;
        }

        /* Mobile Controls Overlay - Hidden on Desktop */
        .mobile-controls {
            display: none;
            width: 100%;
            justify-content: space-between;
            margin-top: 20px;
        }

        .mobile-btn {
            background: transparent;
            color: var(--terminal-green);
            border: 1px solid var(--terminal-green);
            font-family: inherit;
            font-size: 1.5rem;
            padding: 15px 20px;
            cursor: pointer;
            user-select: none;
        }

        .mobile-btn:active {
            background: var(--terminal-green);
            color: var(--terminal-bg);
        }

        @media (max-width: 768px) {
            .game-wrapper {
                flex-direction: column;
                align-items: center;
                border: none;
                box-shadow: none;
                padding: 10px;
            }
            .side-panel {
                flex-direction: row;
                width: 100%;
                justify-content: space-around;
            }
            .mobile-controls {
                display: flex;
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
            
            <div style="font-size: 0.8rem; text-align: center; margin-top: auto;">
                > EXECUTE<br>_YOUR VISION
            </div>
        </div>

        <div>
            <canvas id="gameCanvas" width="300" height="600"></canvas>
            
            <div class="mobile-controls">
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

    <script>
        // Game engine and logic will go here
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Initial setup for the grid look
        ctx.strokeStyle = '#004400'; // Dim green for the grid lines
        for(let i = 0; i < 300; i += 30) {
            for(let j = 0; j < 600; j += 30) {
                ctx.strokeRect(i, j, 30, 30);
            }
        }
    </script>
</body>
</html>
