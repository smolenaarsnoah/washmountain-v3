/* ===== Washmountain Arcade & Games Engine ===== */

document.addEventListener('DOMContentLoaded', () => {
    initGameTabs();
    initC1Racer();
    initPitstopGame();
    initMemoryGame();
    initQuizGame();
    updateHallOfFameDisplay();
});

/* ===== Game Tabs Switcher ===== */
function initGameTabs() {
    const tabs = document.querySelectorAll('.game-tab-btn');
    const sections = document.querySelectorAll('.game-section-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-game');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            sections.forEach(sec => {
                if (sec.id === `game-${target}`) {
                    sec.style.display = 'block';
                } else {
                    sec.style.display = 'none';
                }
            });

            // Pause / resume specific game loops if needed
            if (target === 'c1' && !c1State.running && !c1State.gameOver) {
                // ready
            }
        });
    });
}

/* ===================================================
   GAME 1: C1 CIRCUIT SPRINT (Zolder 2D Racer)
   =================================================== */
let c1Canvas, c1Ctx;
let c1State = {
    running: false,
    gameOver: false,
    score: 0,
    speed: 5,
    maxSpeed: 12,
    playerX: 360,
    playerWidth: 44,
    playerHeight: 74,
    roadOffset: 0,
    keys: { left: false, right: false },
    obstacles: [],
    coins: [],
    lastObstacleSpawn: 0,
    lastCoinSpawn: 0,
    animFrame: null
};

function initC1Racer() {
    c1Canvas = document.getElementById('c1-canvas');
    if (!c1Canvas) return;
    c1Ctx = c1Canvas.getContext('2d');

    // Canvas coordinate space
    c1Canvas.width = 720;
    c1Canvas.height = 450;

    c1State.playerX = c1Canvas.width / 2 - c1State.playerWidth / 2;

    // Controls
    window.addEventListener('keydown', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') c1State.keys.left = true;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') c1State.keys.right = true;
        if ((e.code === 'Space' || e.code === 'Enter') && (!c1State.running || c1State.gameOver)) {
            startC1Racer();
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') c1State.keys.left = false;
        if (e.code === 'ArrowRight' || e.code === 'KeyD') c1State.keys.right = false;
    });

    // Touch buttons for mobile
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');
    const btnStart = document.getElementById('c1-btn-start');

    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); c1State.keys.left = true; });
        btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); c1State.keys.left = false; });
        btnLeft.addEventListener('mousedown', () => { c1State.keys.left = true; });
        btnLeft.addEventListener('mouseup', () => { c1State.keys.left = false; });
    }
    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); c1State.keys.right = true; });
        btnRight.addEventListener('touchend', (e) => { e.preventDefault(); c1State.keys.right = false; });
        btnRight.addEventListener('mousedown', () => { c1State.keys.right = true; });
        btnRight.addEventListener('mouseup', () => { c1State.keys.right = false; });
    }
    if (btnStart) {
        btnStart.addEventListener('click', startC1Racer);
    }

    // Initial render
    drawC1WelcomeScreen();
}

function startC1Racer() {
    c1State.running = true;
    c1State.gameOver = false;
    c1State.score = 0;
    c1State.speed = 5.5;
    c1State.playerX = c1Canvas.width / 2 - c1State.playerWidth / 2;
    c1State.obstacles = [];
    c1State.coins = [];
    c1State.lastObstacleSpawn = Date.now();
    c1State.lastCoinSpawn = Date.now();

    const startBtn = document.getElementById('c1-btn-start');
    if (startBtn) startBtn.innerText = 'Herstart Race';

    if (c1State.animFrame) cancelAnimationFrame(c1State.animFrame);
    c1Loop();
}

function c1Loop() {
    if (!c1State.running) return;

    updateC1();
    drawC1();

    if (!c1State.gameOver) {
        c1State.animFrame = requestAnimationFrame(c1Loop);
    } else {
        drawC1GameOver();
    }
}

function updateC1() {
    // Road boundaries
    const roadLeft = 140;
    const roadRight = c1Canvas.width - 140 - c1State.playerWidth;

    // Movement
    if (c1State.keys.left) c1State.playerX -= 7;
    if (c1State.keys.right) c1State.playerX += 7;

    // Constrain to road
    if (c1State.playerX < roadLeft) c1State.playerX = roadLeft;
    if (c1State.playerX > roadRight) c1State.playerX = roadRight;

    // Road scroll
    c1State.roadOffset = (c1State.roadOffset + c1State.speed) % 80;

    // Gradually speed up
    c1State.speed = Math.min(c1State.maxSpeed, 5.5 + c1State.score / 500);
    c1State.score += Math.floor(c1State.speed / 2);

    // Update HUD
    const hudScore = document.getElementById('c1-score');
    const hudSpeed = document.getElementById('c1-speed');
    if (hudScore) hudScore.innerText = c1State.score;
    if (hudSpeed) hudSpeed.innerText = Math.round(c1State.speed * 18) + ' km/u';

    // Spawn Obstacles (traffic / cones)
    const now = Date.now();
    const spawnInterval = Math.max(900, 2200 - c1State.score * 1.5);
    if (now - c1State.lastObstacleSpawn > spawnInterval) {
        const laneWidth = (c1Canvas.width - 280) / 3;
        const lane = Math.floor(Math.random() * 3);
        const obsX = roadLeft + lane * laneWidth + (laneWidth - 44) / 2;
        const types = ['cone', 'car', 'oil'];
        const type = types[Math.floor(Math.random() * types.length)];

        c1State.obstacles.push({
            x: obsX,
            y: -100,
            width: type === 'cone' ? 36 : 44,
            height: type === 'cone' ? 36 : 70,
            type: type,
            color: type === 'car' ? (Math.random() > 0.5 ? '#ef4444' : '#10b981') : '#f59e0b'
        });
        c1State.lastObstacleSpawn = now;
    }

    // Spawn DrPepper / Coin powerups
    if (now - c1State.lastCoinSpawn > 2500) {
        const roadCenter = roadLeft + Math.random() * (c1Canvas.width - 280 - 32);
        c1State.coins.push({
            x: roadCenter,
            y: -50,
            width: 32,
            height: 32,
            collected: false
        });
        c1State.lastCoinSpawn = now;
    }

    // Move & collide obstacles
    for (let i = c1State.obstacles.length - 1; i >= 0; i--) {
        const obs = c1State.obstacles[i];
        obs.y += c1State.speed;

        // Collision check
        if (checkCollision(
            { x: c1State.playerX + 6, y: c1Canvas.height - 110, width: c1State.playerWidth - 12, height: c1State.playerHeight - 8 },
            { x: obs.x + 4, y: obs.y + 4, width: obs.width - 8, height: obs.height - 8 }
        )) {
            c1State.gameOver = true;
            c1State.running = false;
            saveC1Highscore(c1State.score);
            return;
        }

        if (obs.y > c1Canvas.height + 100) {
            c1State.obstacles.splice(i, 1);
        }
    }

    // Move & collect coins
    for (let i = c1State.coins.length - 1; i >= 0; i--) {
        const coin = c1State.coins[i];
        coin.y += c1State.speed;

        if (checkCollision(
            { x: c1State.playerX, y: c1Canvas.height - 110, width: c1State.playerWidth, height: c1State.playerHeight },
            coin
        )) {
            c1State.score += 150; // DrPepper turbo bonus
            c1State.coins.splice(i, 1);
            continue;
        }

        if (coin.y > c1Canvas.height + 50) {
            c1State.coins.splice(i, 1);
        }
    }
}

function checkCollision(r1, r2) {
    return !(
        r1.x > r2.x + r2.width ||
        r1.x + r1.width < r2.x ||
        r1.y > r2.y + r2.height ||
        r1.y + r1.height < r2.y
    );
}

function drawC1() {
    const w = c1Canvas.width;
    const h = c1Canvas.height;

    // Grass
    c1Ctx.fillStyle = '#14532d';
    c1Ctx.fillRect(0, 0, w, h);

    // Track asphalt
    const roadLeft = 140;
    const roadWidth = w - 280;
    c1Ctx.fillStyle = '#1e293b';
    c1Ctx.fillRect(roadLeft, 0, roadWidth, h);

    // Curbs (Red & White curbs)
    const curbWidth = 14;
    for (let y = -80 + c1State.roadOffset; y < h; y += 40) {
        const isRed = Math.floor(y / 40) % 2 === 0;
        c1Ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';
        // Left curb
        c1Ctx.fillRect(roadLeft - curbWidth, y, curbWidth, 40);
        // Right curb
        c1Ctx.fillRect(roadLeft + roadWidth, y, curbWidth, 40);
    }

    // White dashed lane markers
    c1Ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const laneWidth = roadWidth / 3;
    for (let l = 1; l < 3; l++) {
        const lx = roadLeft + l * laneWidth;
        for (let y = -80 + c1State.roadOffset; y < h; y += 40) {
            c1Ctx.fillRect(lx - 2, y, 4, 20);
        }
    }

    // Draw Coins (DrPepper Cans)
    c1State.coins.forEach(coin => {
        c1Ctx.fillStyle = '#dc2626'; // DrPepper red
        c1Ctx.beginPath();
        c1Ctx.roundRect(coin.x, coin.y, coin.width, coin.height, 8);
        c1Ctx.fill();
        c1Ctx.fillStyle = '#ffffff';
        c1Ctx.font = 'bold 12px sans-serif';
        c1Ctx.textAlign = 'center';
        c1Ctx.fillText('DP', coin.x + coin.width / 2, coin.y + coin.height / 2 + 4);
    });

    // Draw Obstacles
    c1State.obstacles.forEach(obs => {
        if (obs.type === 'cone') {
            c1Ctx.fillStyle = '#ea580c';
            c1Ctx.beginPath();
            c1Ctx.moveTo(obs.x + obs.width / 2, obs.y);
            c1Ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            c1Ctx.lineTo(obs.x, obs.y + obs.height);
            c1Ctx.closePath();
            c1Ctx.fill();
            // White stripe
            c1Ctx.fillStyle = '#ffffff';
            c1Ctx.fillRect(obs.x + 8, obs.y + 18, obs.width - 16, 6);
        } else if (obs.type === 'oil') {
            c1Ctx.fillStyle = '#0f172a';
            c1Ctx.beginPath();
            c1Ctx.ellipse(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, obs.height / 3, 0, 0, Math.PI * 2);
            c1Ctx.fill();
        } else {
            // Rival Car
            drawCar(obs.x, obs.y, obs.width, obs.height, obs.color);
        }
    });

    // Draw Player's Citroën C1
    drawCar(c1State.playerX, h - 110, c1State.playerWidth, c1State.playerHeight, '#3b82f6', true);
}

function drawCar(x, y, w, h, bodyColor, isPlayer = false) {
    c1Ctx.save();

    // Shadow
    c1Ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    c1Ctx.beginPath();
    c1Ctx.roundRect(x - 2, y + 4, w + 4, h + 2, 8);
    c1Ctx.fill();

    // Tires
    c1Ctx.fillStyle = '#020617';
    c1Ctx.fillRect(x - 4, y + 8, 5, 16);
    c1Ctx.fillRect(x + w - 1, y + 8, 5, 16);
    c1Ctx.fillRect(x - 4, y + h - 22, 5, 16);
    c1Ctx.fillRect(x + w - 1, y + h - 22, 5, 16);

    // Car Body
    c1Ctx.fillStyle = bodyColor;
    c1Ctx.beginPath();
    c1Ctx.roundRect(x, y, w, h, 10);
    c1Ctx.fill();

    // Windshields
    c1Ctx.fillStyle = '#1e293b';
    c1Ctx.fillRect(x + 5, y + 16, w - 10, 14); // Front
    c1Ctx.fillRect(x + 5, y + h - 24, w - 10, 10); // Rear

    // Roof
    c1Ctx.fillStyle = isPlayer ? '#1d4ed8' : '#334155';
    c1Ctx.fillRect(x + 6, y + 32, w - 12, h - 58);

    // Lights
    c1Ctx.fillStyle = isPlayer ? '#fef08a' : '#ef4444';
    c1Ctx.fillRect(x + 4, y + 2, 8, 4);
    c1Ctx.fillRect(x + w - 12, y + 2, 8, 4);

    if (isPlayer) {
        // C1 Badge on roof
        c1Ctx.fillStyle = '#ffffff';
        c1Ctx.font = 'bold 9px sans-serif';
        c1Ctx.textAlign = 'center';
        c1Ctx.fillText('C1', x + w / 2, y + 44);
    }

    c1Ctx.restore();
}

function drawC1WelcomeScreen() {
    c1Ctx.fillStyle = '#0f172a';
    c1Ctx.fillRect(0, 0, c1Canvas.width, c1Canvas.height);

    c1Ctx.fillStyle = '#ffffff';
    c1Ctx.font = 'bold 30px Poppins, sans-serif';
    c1Ctx.textAlign = 'center';
    c1Ctx.fillText('🏁 C1 Circuit Sprint — Zolder', c1Canvas.width / 2, 170);

    c1Ctx.fillStyle = '#94a3b8';
    c1Ctx.font = '15px Poppins, sans-serif';
    c1Ctx.fillText('Klim in de Citroën C1 van Mr. Worldwide en scheur over het circuit!', c1Canvas.width / 2, 210);
    c1Ctx.fillText('Gebruik [Pijltjestoetsen] of [A / D] om te sturen.', c1Canvas.width / 2, 235);
    c1Ctx.fillText('Pak DrPepper blikjes (DP) voor bonuspunten!', c1Canvas.width / 2, 260);

    c1Ctx.fillStyle = '#3b82f6';
    c1Ctx.font = 'bold 18px Poppins, sans-serif';
    c1Ctx.fillText('Druk op SPATIE of klik op "Start Race" om te beginnen', c1Canvas.width / 2, 320);
}

function drawC1GameOver() {
    c1Ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    c1Ctx.fillRect(0, 0, c1Canvas.width, c1Canvas.height);

    c1Ctx.fillStyle = '#ef4444';
    c1Ctx.font = 'bold 36px Poppins, sans-serif';
    c1Ctx.textAlign = 'center';
    c1Ctx.fillText('💥 CRASH! Race Over', c1Canvas.width / 2, 180);

    c1Ctx.fillStyle = '#ffffff';
    c1Ctx.font = 'bold 22px Poppins, sans-serif';
    c1Ctx.fillText(`Eindscore: ${c1State.score} punten`, c1Canvas.width / 2, 230);

    const high = getC1Highscore();
    c1Ctx.fillStyle = '#60a5fa';
    c1Ctx.font = '16px Poppins, sans-serif';
    c1Ctx.fillText(`Persoonlijk Record: ${high} punten`, c1Canvas.width / 2, 265);

    c1Ctx.fillStyle = '#ffffff';
    c1Ctx.font = 'bold 16px Poppins, sans-serif';
    c1Ctx.fillText('Druk op SPATIE of klik op Herstart Race', c1Canvas.width / 2, 320);
}

function getC1Highscore() {
    return parseInt(localStorage.getItem('wm_c1_highscore') || '0', 10);
}

function saveC1Highscore(score) {
    const current = getC1Highscore();
    if (score > current) {
        localStorage.setItem('wm_c1_highscore', score.toString());
        updateHallOfFameDisplay();
    }
}

/* ===================================================
   GAME 2: PITSTOP REACTION TEST (F1/DTM Lights)
   =================================================== */
let pitstopState = {
    status: 'idle', // idle, countdown, ready, false_start, finished
    lightIndex: 0,
    startTime: 0,
    timerId: null,
    timeoutId: null
};

function initPitstopGame() {
    const actionArea = document.getElementById('pitstop-action');
    if (!actionArea) return;

    actionArea.addEventListener('click', handlePitstopAction);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && document.getElementById('game-pitstop')?.style.display !== 'none') {
            e.preventDefault();
            handlePitstopAction();
        }
    });
}

function handlePitstopAction() {
    const actionArea = document.getElementById('pitstop-action');
    const label = document.getElementById('pitstop-label');
    const result = document.getElementById('pitstop-result');

    if (pitstopState.status === 'idle' || pitstopState.status === 'finished' || pitstopState.status === 'false_start') {
        // Start sequence
        startPitstopSequence();
    } else if (pitstopState.status === 'countdown') {
        // Jump start!
        pitstopState.status = 'false_start';
        clearTimeout(pitstopState.timerId);
        clearTimeout(pitstopState.timeoutId);
        setAllBulbs(false, true); // flash red
        label.innerText = '🚨 Valse start! Je klikte vóórdat de lichten uitgingen.';
        result.innerText = 'Ongeldig';
        result.style.color = '#ef4444';
    } else if (pitstopState.status === 'ready') {
        // Success!
        const reactionTime = Date.now() - pitstopState.startTime;
        pitstopState.status = 'finished';
        label.innerText = getReactionComment(reactionTime);
        result.innerText = `${reactionTime} ms`;
        result.style.color = reactionTime < 250 ? '#10b981' : '#60a5fa';

        saveReactionBest(reactionTime);
    }
}

function startPitstopSequence() {
    pitstopState.status = 'countdown';
    pitstopState.lightIndex = 0;

    const label = document.getElementById('pitstop-label');
    const result = document.getElementById('pitstop-result');
    label.innerText = 'Wacht tot alle 5 lichten aangaan en plotseling DOVEN...';
    result.innerText = '--- ms';
    result.style.color = '#60a5fa';

    resetAllBulbs();

    // Turn on 1 light every 800ms
    function turnOnNextLight() {
        if (pitstopState.lightIndex < 5) {
            setLightUnitRed(pitstopState.lightIndex, true);
            pitstopState.lightIndex++;
            pitstopState.timerId = setTimeout(turnOnNextLight, 800);
        } else {
            // All 5 red. Random delay between 1.2s and 3.5s before lights out!
            const randomDelay = Math.floor(1200 + Math.random() * 2300);
            pitstopState.timeoutId = setTimeout(() => {
                if (pitstopState.status === 'countdown') {
                    resetAllBulbs();
                    pitstopState.status = 'ready';
                    pitstopState.startTime = Date.now();
                    label.innerText = '🔥 GO GO GO! KLIK NU!';
                }
            }, randomDelay);
        }
    }

    turnOnNextLight();
}

function setLightUnitRed(colIdx, isRed) {
    const col = document.getElementById(`gantry-col-${colIdx}`);
    if (!col) return;
    const bulbs = col.querySelectorAll('.gantry-bulb');
    bulbs.forEach(b => {
        if (isRed) b.classList.add('red-lit');
        else b.classList.remove('red-lit');
    });
}

function resetAllBulbs() {
    for (let i = 0; i < 5; i++) {
        setLightUnitRed(i, false);
    }
}

function setAllBulbs(green = false, red = false) {
    const all = document.querySelectorAll('.gantry-bulb');
    all.forEach(b => {
        b.className = 'gantry-bulb';
        if (green) b.classList.add('green-lit');
        if (red) b.classList.add('red-lit');
    });
}

function getReactionComment(ms) {
    if (ms < 190) return '⚡ Buitenaards snel! F1-coureur niveau!';
    if (ms < 240) return '🏎️ Geweldig! Sneller dan het DTM-veld!';
    if (ms < 300) return '👍 Prima reactietijd! Scherp aan de start.';
    if (ms < 400) return '☕ Even koffie halen? Iets aan de trage kant.';
    return '🐢 Was je in slaap gevallen op de grid?';
}

function saveReactionBest(ms) {
    const current = parseInt(localStorage.getItem('wm_reaction_best') || '9999', 10);
    if (ms < current) {
        localStorage.setItem('wm_reaction_best', ms.toString());
        updateHallOfFameDisplay();
    }
}

/* ===================================================
   GAME 3: WASHMOUNTAIN MEMORY CHALLENGE
   =================================================== */
const MEMORY_ITEMS = [
    { name: 'Noah', img: 'images/files/Noah profielfoto.jpeg', label: 'President' },
    { name: 'Tygo', img: 'images/files/Tygo profielfoto.jpeg', label: 'Burgemeester' },
    { name: 'Caspar', img: 'images/files/Caspar profielfoto.jpeg', label: 'Penningmeester' },
    { name: 'Vica', img: 'images/files/Vica profielfoto.jpeg', label: 'Chauffeur' },
    { name: 'Robert', img: 'images/files/Robert profielfoto.jpeg', label: 'Advocaat' },
    { name: 'Martijn', img: 'images/files/Martijn profielfoto.jpeg', label: 'Bewaker' },
    { name: 'C1', img: 'images/evenementen/c1-zolder.jpeg', label: 'Citroën C1' },
    { name: 'Logo', img: 'images/Website logo linksboven url.png', label: 'Washmountain' }
];

let memoryCards = [];
let flippedCards = [];
let matchedCount = 0;
let memoryMoves = 0;
let memoryTimer = null;
let memorySeconds = 0;

function initMemoryGame() {
    const startBtn = document.getElementById('memory-restart');
    if (startBtn) startBtn.addEventListener('click', startMemoryGame);
    startMemoryGame();
}

function startMemoryGame() {
    const board = document.getElementById('memory-board');
    if (!board) return;

    board.innerHTML = '';
    flippedCards = [];
    matchedCount = 0;
    memoryMoves = 0;
    memorySeconds = 0;
    clearInterval(memoryTimer);

    document.getElementById('memory-moves').innerText = '0';
    document.getElementById('memory-time').innerText = '00:00';

    // Duplicate and shuffle
    const deck = [...MEMORY_ITEMS, ...MEMORY_ITEMS]
        .sort(() => Math.random() - 0.5);

    memoryTimer = setInterval(() => {
        memorySeconds++;
        const mins = String(Math.floor(memorySeconds / 60)).padStart(2, '0');
        const secs = String(memorySeconds % 60).padStart(2, '0');
        const timeEl = document.getElementById('memory-time');
        if (timeEl) timeEl.innerText = `${mins}:${secs}`;
    }, 1000);

    deck.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.name = item.name;
        card.innerHTML = `
            <span class="card-back-icon">🏔️</span>
            <img src="${item.img}" class="memory-card-img" alt="${item.name}">
        `;

        card.addEventListener('click', () => onMemoryCardClick(card));
        board.appendChild(card);
    });
}

function onMemoryCardClick(card) {
    if (flippedCards.length >= 2 || card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    card.classList.add('flipped');
    card.querySelector('.card-back-icon').style.display = 'none';
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        memoryMoves++;
        document.getElementById('memory-moves').innerText = memoryMoves;

        const [c1, c2] = flippedCards;
        if (c1.dataset.name === c2.dataset.name) {
            // Match
            setTimeout(() => {
                c1.classList.add('matched');
                c2.classList.add('matched');
                flippedCards = [];
                matchedCount++;

                if (matchedCount === MEMORY_ITEMS.length) {
                    clearInterval(memoryTimer);
                    saveMemoryBest(memorySeconds);
                    alert(`🎉 Gefeliciteerd! Alle paren gevonden in ${memoryMoves} zetten en ${memorySeconds} seconden!`);
                }
            }, 300);
        } else {
            // No match
            setTimeout(() => {
                c1.classList.remove('flipped');
                c2.classList.remove('flipped');
                c1.querySelector('.card-back-icon').style.display = 'block';
                c2.querySelector('.card-back-icon').style.display = 'block';
                flippedCards = [];
            }, 800);
        }
    }
}

function saveMemoryBest(seconds) {
    const current = parseInt(localStorage.getItem('wm_memory_best') || '9999', 10);
    if (seconds < current) {
        localStorage.setItem('wm_memory_best', seconds.toString());
        updateHallOfFameDisplay();
    }
}

/* ===================================================
   GAME 4: WASHMOUNTAIN TRIVIA QUIZ
   =================================================== */
const QUIZ_QUESTIONS = [
    {
        question: "In welk jaar is de Washmountain officieel opgericht?",
        options: ["2021", "2023", "2024", "2026"],
        correct: 1
    },
    {
        question: "Met welke legendarische bolide racet men op Circuit Zolder?",
        options: ["Porsche 911 GT3", "Citroën C1 van Mr. Worldwide", "Volkswagen Golf Cabrio", "DrPepper Kart"],
        correct: 1
    },
    {
        question: "Wie bekleedt binnen Washmountain de erefunctie van Burgemeester?",
        options: ["Noah Smolenaars", "Caspar van de Hoef", "Tygo Kerckhoffs", "Robert van Rooijen"],
        correct: 2
    },
    {
        question: "Welk iconisch diner hoort traditioneel bij de verjaardag van de Burgemeester?",
        options: ["BBQ van Smol City", "KFC Family Bucket", "Kaasfondue van Lau", "Pannenkoekenfeest"],
        correct: 2
    },
    {
        question: "Wie is de officiële Advocaat van de Washmountain?",
        options: ["Vica Schledz", "Robert van Rooijen", "Martijn Caris", "Mr. Worldwide"],
        correct: 1
    },
    {
        question: "Naar welk internationaal race-evenement gaan de leden in oktober 2026?",
        options: ["DTM Hockenheim", "Formule 1 Spa-Francorchamps", "Le Mans 24h", "Monaco GP"],
        correct: 0
    }
];

let quizCurrentIndex = 0;
let quizScore = 0;

function initQuizGame() {
    renderQuizQuestion();
}

function renderQuizQuestion() {
    const container = document.getElementById('quiz-body');
    if (!container) return;

    if (quizCurrentIndex >= QUIZ_QUESTIONS.length) {
        // Finished
        container.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 60px; margin-bottom: 12px;">🏆</div>
                <h3 style="font-size: 24px; color: #ffffff; margin-bottom: 10px;">Quiz Voltooid!</h3>
                <p style="font-size: 18px; color: #60a5fa; font-weight: 700; margin-bottom: 24px;">
                    Jouw score: ${quizScore} / ${QUIZ_QUESTIONS.length} goed
                </p>
                <p style="color: #94a3b8; margin-bottom: 24px;">
                    ${quizScore === QUIZ_QUESTIONS.length ? '🌟 Ultieme Washmountain Legend! Je weet werkelijk álles!' : 'Mooie prestatie! Speel gerust nog eens.'}
                </p>
                <button onclick="restartQuiz()" class="bento-btn bento-btn-primary">
                    Opnieuw Spelen
                </button>
            </div>
        `;
        return;
    }

    const q = QUIZ_QUESTIONS[quizCurrentIndex];
    container.innerHTML = `
        <div class="quiz-card">
            <div class="quiz-progress">
                <span>Vraag ${quizCurrentIndex + 1} van ${QUIZ_QUESTIONS.length}</span>
                <span>Score: ${quizScore}</span>
            </div>
            <div class="quiz-question-text">${q.question}</div>
            <div class="quiz-options-list">
                ${q.options.map((opt, i) => `
                    <button class="quiz-opt-btn" onclick="handleQuizAnswer(${i}, this)">
                        <span style="opacity: 0.5;">${String.fromCharCode(65 + i)}.</span> ${opt}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

window.handleQuizAnswer = function(chosenIdx, btn) {
    const q = QUIZ_QUESTIONS[quizCurrentIndex];
    const allBtns = document.querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(b => b.disabled = true);

    if (chosenIdx === q.correct) {
        btn.classList.add('correct');
        quizScore++;
    } else {
        btn.classList.add('wrong');
        allBtns[q.correct].classList.add('correct');
    }

    setTimeout(() => {
        quizCurrentIndex++;
        renderQuizQuestion();
    }, 1100);
};

window.restartQuiz = function() {
    quizCurrentIndex = 0;
    quizScore = 0;
    renderQuizQuestion();
};

/* ===== Hall of Fame / Highscore Sync ===== */
function updateHallOfFameDisplay() {
    const c1High = localStorage.getItem('wm_c1_highscore') || '0';
    const reactBest = localStorage.getItem('wm_reaction_best');
    const memoryBest = localStorage.getItem('wm_memory_best');

    const c1El = document.getElementById('hall-c1');
    const reactEl = document.getElementById('hall-reaction');
    const memEl = document.getElementById('hall-memory');

    if (c1El) c1El.innerText = `${c1High} pts`;
    if (reactEl) reactEl.innerText = reactBest ? `${reactBest} ms` : 'Geen';
    if (memEl) memEl.innerText = memoryBest ? `${memoryBest}s` : 'Geen';
}
