/* ===== JS SOUNDS (NO FILES) ===== */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function beep(freq, duration = 0.12) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + duration
    );
    osc.stop(audioCtx.currentTime + duration);
}

const clickSound = () => beep(600, 0.05);
const winSound   = () => beep(900, 0.4);
const drawSound  = () => beep(300, 0.3);

/* ===== ELEMENTS ===== */
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const modeSelect = document.getElementById("mode");
const diffSelect = document.getElementById("difficulty");
const restartBtn = document.getElementById("restart");
const themeBtn = document.getElementById("themeToggle");

const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const playAgain = document.getElementById("playAgain");

/* CONFETTI */
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

/* ===== GAME STATE ===== */
let board, currentPlayer, gameActive;
let confetti = [], anim;

const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

startGame();

/* EVENTS */
cells.forEach(c =>
    c.addEventListener("click", () => handleMove(c.dataset.i))
);
restartBtn.onclick = startGame;
playAgain.onclick = startGame;

themeBtn.onclick = () => {
    document.body.classList.toggle("dark");
};

/* GAME SETUP */
function startGame() {
    board = Array(9).fill("");
    currentPlayer = "X";
    gameActive = true;
    statusText.textContent = "Player X's Turn";
    cells.forEach(c => c.textContent = "");
    popup.classList.add("hidden");
    stopConfetti();
}

/* HANDLE MOVE */
function handleMove(i) {
    if (!gameActive || board[i]) return;

    clickSound();
    makeMove(i, currentPlayer);

    if (modeSelect.value === "cpu" && currentPlayer === "O" && gameActive) {
        setTimeout(cpuMove, 300);
    }
}

/* PLACE MARK */
function makeMove(i, player) {
    board[i] = player;
    cells[i].textContent = player;

    if (checkWin(player)) {
        endGame(`${player === "X" ? "Player X" : "Player O"} Wins!`, true);
        return;
    }

    if (board.every(v => v)) {
        endGame("It's a Draw!", false);
        return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusText.textContent = `Player ${currentPlayer}'s Turn`;
}

/* CPU MOVE */
function cpuMove() {
    if (!gameActive) return;

    let move;
    const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);

    if (diffSelect.value === "easy") {
        move = empty[Math.floor(Math.random()*empty.length)];
    } else if (diffSelect.value === "medium") {
        move = Math.random() < 0.5
            ? empty[Math.floor(Math.random()*empty.length)]
            : smartMove();
    } else {
        move = smartMove();
    }

    clickSound();
    makeMove(move, "O");
}

/* SMART MOVE */
function smartMove() {
    for (let w of wins) {
        const line = w.map(i => board[i]);
        if (line.filter(v=>v==="O").length === 2 && line.includes(""))
            return w[line.indexOf("")];
    }
    for (let w of wins) {
        const line = w.map(i => board[i]);
        if (line.filter(v=>v==="X").length === 2 && line.includes(""))
            return w[line.indexOf("")];
    }
    return board.findIndex(v => v === "");
}

/* CHECK WIN */
function checkWin(p) {
    return wins.some(w => w.every(i => board[i] === p));
}

/* END GAME */
function endGame(msg, win) {
    gameActive = false;
    popupText.textContent = msg;
    popup.classList.remove("hidden");

    if (win) {
        winSound();
        startConfetti();
    } else {
        drawSound();
    }
}

/* ===== CONFETTI LOGIC ===== */
function startConfetti() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    confetti = Array.from({length: 150}, () => ({
        x: Math.random()*canvas.width,
        y: Math.random()*canvas.height,
        r: Math.random()*6+2,
        d: Math.random()*4+2
    }));
    drawConfetti();
}

function drawConfetti() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    confetti.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `hsl(${Math.random()*360},100%,50%)`;
        ctx.fill();
        p.y += p.d;
        if (p.y > canvas.height) p.y = 0;
    });
    anim = requestAnimationFrame(drawConfetti);
}

function stopConfetti() {
    cancelAnimationFrame(anim);
    ctx.clearRect(0,0,canvas.width,canvas.height);
}
