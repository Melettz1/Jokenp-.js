document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        playerScore: document.getElementById('player-score'),
        computerScore: document.getElementById('computer-score'),
        resultMessage: document.getElementById('result-message'),
        choices: document.querySelectorAll('.choice'),
        resetButton: document.getElementById('reset-button'),
        playerChoiceIcon: document.getElementById('player-choice-icon'),
        computerChoiceIcon: document.getElementById('computer-choice-icon'),
        playerChoiceDisplay: document.querySelector('.player-choice-display'),
        computerChoiceDisplay: document.querySelector('.computer-choice-display'),
        versusText: document.getElementById('versus-text'),
        title: document.getElementById('main-title'),
    };

    const sounds = {
        click: document.getElementById('click-sound'),
        win: document.getElementById('win-sound'),
        lose: document.getElementById('lose-sound'),
    };

    const state = {
        playerScore: 0,
        computerScore: 0,
        winStreak: 0,
        isGameActive: true,
        titleText: "JOKENPÔ",
        titleIndex: 0,
        typeWriterTimeout: null,
    };

    const choiceMap = { rock: 'Pedra', paper: 'Papel', scissors: 'Tesoura' };

    function init() {
        loadScores();
        updateScoreboard();
        startTitleTypeWriter();
        elements.choices.forEach(choice => choice.addEventListener('click', handlePlayerChoice));
        elements.resetButton.addEventListener('click', resetGame);
        setupParticles();
    }

    function handlePlayerChoice(e) {
        if (!state.isGameActive) return;
        state.isGameActive = false;
        sounds.click.play();
        const playerChoice = e.currentTarget.id;
        handleRound(playerChoice);
    }

    function handleRound(playerChoice) {
        const computerChoice = getComputerChoice();
        
        resetRoundUI();
        
        elements.playerChoiceDisplay.classList.add('filled');
        elements.playerChoiceIcon.innerHTML = getIcon(playerChoice);
        
        elements.computerChoiceDisplay.classList.add('filled');
        elements.computerChoiceIcon.innerHTML = getIcon(computerChoice);
        
        elements.versusText.style.transform = 'scale(1)';
        elements.resultMessage.textContent = '...';

        setTimeout(() => {
            const winner = determineWinner(playerChoice, computerChoice);
            updateUI(winner, playerChoice, computerChoice);
            state.isGameActive = true;
        }, 700);
    }

    function getComputerChoice() {
        const choices = ['rock', 'paper', 'scissors'];
        return choices[Math.floor(Math.random() * 3)];
    }

    function determineWinner(player, computer) {
        if (player === computer) return 'draw';
        return ((player === 'rock' && computer === 'scissors') ||
                (player === 'paper' && computer === 'rock') ||
                (player === 'scissors' && computer === 'paper')) ? 'player' : 'computer';
    }

    function updateUI(winner, playerChoice, computerChoice) {
        if (winner === 'player') {
            state.playerScore++;
            state.winStreak++;
            elements.resultMessage.textContent = `${choiceMap[playerChoice]} vence ${choiceMap[computerChoice]}. Você ganhou!`;
            updateVisuals('win', elements.playerChoiceDisplay, elements.computerChoiceDisplay);
            if (state.winStreak >= 3) confetti();
        } else if (winner === 'computer') {
            state.computerScore++;
            state.winStreak = 0;
            elements.resultMessage.textContent = `${choiceMap[computerChoice]} vence ${choiceMap[playerChoice]}. Você perdeu!`;
            updateVisuals('lose', elements.computerChoiceDisplay, elements.playerChoiceDisplay);
        } else {
            state.winStreak = 0;
            elements.resultMessage.textContent = 'Um empate!';
            updateVisuals('draw');
        }

        if (navigator.vibrate) navigator.vibrate(100);
        updateScoreboard();
        saveScores();
        elements.resetButton.classList.add('visible');
    }
    
    function updateVisuals(outcome, winnerEl, loserEl) {
        const color = `var(--${outcome}-color)`;
        elements.resultMessage.style.color = color;
        if (outcome === 'draw') {
            elements.playerChoiceDisplay.style.borderColor = color;
            elements.computerChoiceDisplay.style.borderColor = color;
        } else {
            winnerEl.style.borderColor = `var(--win-color)`;
            loserEl.style.borderColor = `var(--lose-color)`;
            sounds[outcome === 'win' ? 'win' : 'lose'].play();
        }
    }

    function updateScoreboard() {
        elements.playerScore.textContent = state.playerScore;
        elements.computerScore.textContent = state.computerScore;
        animateScore(elements.playerScore);
        animateScore(elements.computerScore);
    }

    function animateScore(scoreEl) {
        scoreEl.classList.add('score-updated');
        setTimeout(() => scoreEl.classList.remove('score-updated'), 300);
    }

    function resetRoundUI() {
        elements.playerChoiceDisplay.classList.remove('filled');
        elements.computerChoiceDisplay.classList.remove('filled');
        elements.playerChoiceDisplay.style.borderColor = 'var(--bg-light)';
        elements.computerChoiceDisplay.style.borderColor = 'var(--bg-light)';
        elements.resultMessage.style.color = 'var(--text-color)';
    }

    function resetGame() {
        state.playerScore = 0;
        state.computerScore = 0;
        state.winStreak = 0;
        updateScoreboard();
        resetRoundUI();
        elements.resultMessage.textContent = 'Escolha uma opção para começar!';
        elements.resetButton.classList.remove('visible');
        localStorage.removeItem('jokenpoScores');
    }

    function saveScores() {
        localStorage.setItem('jokenpoScores', JSON.stringify({
            player: state.playerScore,
            computer: state.computerScore
        }));
    }

    function loadScores() {
        const scores = JSON.parse(localStorage.getItem('jokenpoScores'));
        if (scores) {
            state.playerScore = scores.player;
            state.computerScore = scores.computer;
        }
    }

    function getIcon(choice) {
        const iconElement = document.getElementById(choice).querySelector('img').cloneNode(true);
        return iconElement.outerHTML;
    }

    function startTitleTypeWriter() {
        if (state.typeWriterTimeout) clearTimeout(state.typeWriterTimeout);
        elements.title.innerHTML = "";
        state.titleIndex = 0;
        type();
    }

    function type() {
        if (state.titleIndex < state.titleText.length) {
            elements.title.innerHTML += state.titleText.charAt(state.titleIndex);
            state.titleIndex++;
            state.typeWriterTimeout = setTimeout(type, 150);
        } else {
            state.typeWriterTimeout = setTimeout(() => {
                elements.title.innerHTML = "";
                state.titleIndex = 0;
                type();
            }, 3000); 
        }
    }

    function setupParticles() {
        particlesJS('particles-js', {
            particles: {
                number: { value: 60, density: { enable: true, value_area: 800 } },
                color: { value: '#ffffff' },
                shape: { type: 'circle' },
                opacity: { value: 0.5, random: true },
                size: { value: 2, random: true },
                line_linked: { enable: false },
                move: { enable: true, speed: 1, direction: 'none', random: true, straight: false, out_mode: 'out' }
            },
            interactivity: { detect_on: 'canvas', events: { onhover: { enable: false }, onclick: { enable: false } } },
            retina_detect: true
        });
    }

    init();
});