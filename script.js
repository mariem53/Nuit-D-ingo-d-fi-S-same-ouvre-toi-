// Variables du jeu principal
let canvas, ctx;
let player = { x: 50, y: 200, radius: 15, speed: 5 };
let destinations = [];
let currentDestinationIndex = 0;
let reachedDestinations = 0;
let gameCompleted = false;
let keys = {};
let playerName = '';
let playerPassword = '';

// Variables du jeu Snake Nokia
let snakeNokiaGame = null;

// Initialiser le jeu principal
function initGame() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // Définir les destinations
    destinations = [
        { x: 150, y: 150, radius: 20, id: 1, label: 'Nom d\'utilisateur', completed: false },
        { x: 300, y: 250, radius: 20, id: 2, label: 'Mot de passe', completed: false },
        { x: 450, y: 150, radius: 20, id: 3, label: 'Vérification Snake', completed: false }
    ];
    
    // Réinitialiser l'état
    player.x = 50;
    player.y = 200;
    currentDestinationIndex = 0;
    reachedDestinations = 0;
    gameCompleted = false;
    
    // Mettre à jour les marqueurs
    updateMarkers();
    
    // Démarrer la boucle de jeu
    requestAnimationFrame(gameLoop);
}

// Gestion des touches pour le jeu principal
document.addEventListener('keydown', function(e) {
    // Si le jeu Snake est en cours, laisser le jeu Snake gérer les touches
    if (snakeNokiaGame && snakeNokiaGame.gameRunning) {
        return;
    }
    
    keys[e.key] = true;
    
    // Empêcher le défilement avec les flèches
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', function(e) {
    // Si le jeu Snake est en cours, laisser le jeu Snake gérer les touches
    if (snakeNokiaGame && snakeNokiaGame.gameRunning) {
        return;
    }
    
    keys[e.key] = false;
});

// Boucle du jeu principal
function gameLoop() {
    if (gameCompleted) return;
    
    // Déplacer le joueur
    movePlayer();
    
    // Vérifier les collisions avec les destinations
    checkCollisions();
    
    // Dessiner
    draw();
    
    // Continuer la boucle
    requestAnimationFrame(gameLoop);
}

// Déplacer le joueur principal
function movePlayer() {
    if (keys['ArrowUp'] || keys['Up']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['Down']) player.y += player.speed;
    if (keys['ArrowLeft'] || keys['Left']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['Right']) player.x += player.speed;
    
    // Garder le joueur dans les limites
    player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
}

// Vérifier les collisions avec les destinations
function checkCollisions() {
    // Vérifier la destination actuelle
    const dest = destinations[currentDestinationIndex];
    
    if (!dest.completed) {
        const dx = dest.x - player.x;
        const dy = dest.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Si collision
        if (distance < player.radius + dest.radius) {
            dest.completed = true;
            reachedDestinations++;
            
            // Mettre à jour le marqueur
            const marker = document.getElementById(`marker${dest.id}`);
            if (marker) marker.className = 'destination-marker completed';
            
            // Afficher le popup pour cette destination
            showPopup(dest);
            
            // Si c'est la dernière destination
            if (reachedDestinations === destinations.length) {
                gameCompleted = true;
            } else {
                // Passer à la destination suivante
                currentDestinationIndex++;
                updateMarkers();
            }
        }
    }
}

// Mettre à jour les marqueurs
function updateMarkers() {
    for (let i = 1; i <= 3; i++) {
        const marker = document.getElementById(`marker${i}`);
        if (marker) {
            if (i-1 === currentDestinationIndex && !destinations[currentDestinationIndex]?.completed) {
                marker.className = 'destination-marker active';
            } else if (i-1 < currentDestinationIndex || destinations[i-1]?.completed) {
                marker.className = 'destination-marker completed';
            } else {
                marker.className = 'destination-marker pending';
            }
        }
    }
}

// Afficher un popup pour la destination
function showPopup(destination) {
    const popupOverlay = document.getElementById('popupOverlay');
    const popupContent = document.getElementById('popupContent');
    
    if (!popupOverlay || !popupContent) return;
    
    let popupHTML = '';
    
    if (destination.id === 1) {
        popupHTML = `
            <h3 class="popup-title">Saisie du nom d'utilisateur</h3>
            <div class="form-group">
                <label for="usernameInput">Nom d'utilisateur:</label>
                <input type="text" id="usernameInput" class="form-control" placeholder="Votre identifiant MECI">
            </div>
            <div class="btn-container">
                <button class="btn btn-primary" onclick="saveUsername()">Continuer</button>
            </div>
        `;
    } else if (destination.id === 2) {
        popupHTML = `
            <h3 class="popup-title">Saisie du mot de passe</h3>
            <div class="form-group">
                <label for="passwordInput">Mot de passe:</label>
                <input type="password" id="passwordInput" class="form-control" placeholder="Votre mot de passe sécurisé">
            </div>
            <div class="btn-container">
                <button class="btn btn-primary" onclick="savePassword()">Continuer</button>
            </div>
        `;
    } else if (destination.id === 3) {
        popupHTML = `
            <h3 class="popup-title">Vérification Snake Nokia</h3>
            <div class="snake-nokia-container">
                <div class="nokia-instructions">
                    <p>Déplacez le serpent avec les flèches et mangez le point pour prouver que vous êtes humain !</p>
                    <p><strong>Vous devez manger un seul point pour réussir la vérification.</strong></p>
                </div>
                <div style="text-align: center; margin-bottom: 25px;">
                    <canvas id="snakeNokiaCanvas" width="320" height="320"></canvas>
                    <div id="snakeScore">Score: 0</div>
                </div>
                <div class="nokia-controls">
                    <div class="nokia-key up" onclick="simulateKeyPress('ArrowUp')">↑</div>
                    <div class="nokia-key left" onclick="simulateKeyPress('ArrowLeft')">←</div>
                    <div class="nokia-key down" onclick="simulateKeyPress('ArrowDown')">↓</div>
                    <div class="nokia-key right" onclick="simulateKeyPress('ArrowRight')">→</div>
                </div>
                <p>Utilisez les touches fléchées ou cliquez sur les boutons</p>
            </div>
        `;
    }
    
    popupContent.innerHTML = popupHTML;
    popupOverlay.style.display = 'flex';
    
    // Si c'est l'étape 3 (Snake Nokia), démarrer le jeu
    if (destination.id === 3) {
        setTimeout(() => {
            startSnakeNokiaGame();
        }, 100);
    }
}

// Simuler une touche pressée (pour les contrôles tactiles)
function simulateKeyPress(key) {
    const event = new KeyboardEvent('keydown', { key: key });
    document.dispatchEvent(event);
}

// Fermer le popup
function closePopup() {
    const popupOverlay = document.getElementById('popupOverlay');
    if (popupOverlay) popupOverlay.style.display = 'none';
    
    // Arrêter le jeu Snake s'il est en cours
    if (snakeNokiaGame) {
        snakeNokiaGame.gameRunning = false;
        snakeNokiaGame = null;
    }
}

// Sauvegarder le nom d'utilisateur
function saveUsername() {
    const usernameInput = document.getElementById('usernameInput');
    if (!usernameInput || usernameInput.value.trim() === '') {
        showMessage('Veuillez saisir un nom d\'utilisateur', 'error');
        return;
    }
    
    playerName = usernameInput.value.trim();
    closePopup();
    updateMarkers();
    
    // Afficher un message de confirmation
    showMessage(`Nom d'utilisateur enregistré: ${playerName}`, 'success');
}

// Sauvegarder le mot de passe
function savePassword() {
    const passwordInput = document.getElementById('passwordInput');
    if (!passwordInput || passwordInput.value.trim() === '') {
        showMessage('Veuillez saisir un mot de passe', 'error');
        return;
    }
    
    playerPassword = passwordInput.value.trim();
    closePopup();
    updateMarkers();
    
    // Afficher un message de confirmation
    showMessage('Mot de passe enregistré avec succès', 'success');
}

// Démarrer le jeu Snake Nokia
function startSnakeNokiaGame() {
    const canvas = document.getElementById("snakeNokiaCanvas");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const scoreDisplay = document.getElementById("snakeScore");

    const GRID_SIZE = 20;
    const TILE_SIZE = canvas.width / GRID_SIZE;

    // Couleurs du thème gaulois
    const SNAKE_COLOR = "#ffd700";
    const FOOD_COLOR = "#ff6b35";
    const GRID_COLOR = "#3cb371";
    const HEAD_COLOR = "#cc3333";

    const snake = {
        body: [{x:10,y:10}, {x:9,y:10}, {x:8,y:10}],
        dx: 1, dy: 0,
        nextDx: 1, nextDy: 0
    };

    let food = generateFood();
    let score = 0;
    let gameRunning = true;
    let gameSpeed = 7;
    let frameCount = 0;

    function generateFood() {
        let newFood;
        let collision = true;
        while(collision){
            newFood = {x: Math.floor(Math.random()*GRID_SIZE), y: Math.floor(Math.random()*GRID_SIZE)};
            collision = snake.body.some(seg => seg.x === newFood.x && seg.y === newFood.y);
        }
        return newFood;
    }

    function drawTile(x,y,color){
        ctx.fillStyle = color;
        ctx.fillRect(x*TILE_SIZE+1, y*TILE_SIZE+1, TILE_SIZE-2, TILE_SIZE-2);
    }

    function drawSnake(){
        snake.body.forEach((segment,index)=>{
            if(index===0){
                ctx.fillStyle = HEAD_COLOR;
                ctx.fillRect(segment.x*TILE_SIZE+2, segment.y*TILE_SIZE+2, TILE_SIZE-4, TILE_SIZE-4);
                
                ctx.fillStyle = "white";
                ctx.fillRect(segment.x*TILE_SIZE+6, segment.y*TILE_SIZE+6, 3, 3);
                ctx.fillRect(segment.x*TILE_SIZE+TILE_SIZE-9, segment.y*TILE_SIZE+6, 3, 3);
            } else {
                drawTile(segment.x,segment.y,SNAKE_COLOR);
                
                ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
                ctx.fillRect(segment.x*TILE_SIZE+4, segment.y*TILE_SIZE+4, TILE_SIZE-8, 2);
            }
        });
    }

    function drawFood(){
        ctx.fillStyle = FOOD_COLOR;
        ctx.beginPath();
        ctx.arc(
            food.x*TILE_SIZE + TILE_SIZE/2, 
            food.y*TILE_SIZE + TILE_SIZE/2, 
            TILE_SIZE/2 - 3, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(
            food.x*TILE_SIZE + TILE_SIZE/2 - 3, 
            food.y*TILE_SIZE + TILE_SIZE/2 - 3, 
            3, 
            0, 
            Math.PI * 2
        );
        ctx.fill();
    }

    function drawGrid(){
        ctx.strokeStyle = GRID_COLOR;
        ctx.lineWidth = 0.5;
        for(let i=0;i<=GRID_SIZE;i++){
            ctx.beginPath();
            ctx.moveTo(i*TILE_SIZE,0);
            ctx.lineTo(i*TILE_SIZE,canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0,i*TILE_SIZE);
            ctx.lineTo(canvas.width,i*TILE_SIZE);
            ctx.stroke();
        }
    }

    function update(){
        if(!gameRunning) return;
        snake.dx = snake.nextDx;
        snake.dy = snake.nextDy;

        const head = snake.body[0];
        const newHead = { 
            x: (head.x + snake.dx + GRID_SIZE) % GRID_SIZE,
            y: (head.y + snake.dy + GRID_SIZE) % GRID_SIZE 
        };

        if(snake.body.some(seg => seg.x === newHead.x && seg.y === newHead.y)){
            gameRunning = false;
            showMessage('Le serpent s\'est mordu ! Réessayez.', 'error');
            setTimeout(() => {
                startSnakeNokiaGame();
            }, 2000);
            return;
        }

        snake.body.unshift(newHead);

        if(newHead.x === food.x && newHead.y === food.y){
            gameRunning = false;
            score += 10;
            if (scoreDisplay) scoreDisplay.textContent = `Score: ${score}`;
            
            if (scoreDisplay) scoreDisplay.style.animation = "scorePulse 0.5s 3";
            
            setTimeout(() => {
                closePopup();
                destinations[2].completed = true;
                const marker = document.getElementById('marker3');
                if (marker) marker.className = 'destination-marker completed';
                showMessage('Vérification Snake réussie !', 'success');
                
                if (destinations.every(dest => dest.completed)) {
                    setTimeout(() => {
                        openFinalInterface();
                    }, 1500);
                }
            }, 1000);
            
            return;
        } else {
            snake.body.pop();
        }
    }

    function draw(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawGrid();
        drawSnake();
        drawFood();
    }

    function gameLoop(){
        frameCount++;
        if(frameCount >= Math.floor(10/(gameSpeed/7))){
            update();
            frameCount=0;
        }
        draw();
        if (gameRunning) {
            requestAnimationFrame(gameLoop);
        }
    }

    function handleSnakeKeydown(e){
        if(!gameRunning) return;
        switch(e.key){
            case "ArrowUp": if(snake.dy===0){snake.nextDx=0;snake.nextDy=-1} e.preventDefault(); break;
            case "ArrowDown": if(snake.dy===0){snake.nextDx=0;snake.nextDy=1} e.preventDefault(); break;
            case "ArrowLeft": if(snake.dx===0){snake.nextDx=-1;snake.nextDy=0} e.preventDefault(); break;
            case "ArrowRight": if(snake.dx===0){snake.nextDx=1;snake.nextDy=0} e.preventDefault(); break;
        }
    }

    document.addEventListener("keydown", handleSnakeKeydown);
    
    snakeNokiaGame = {
        gameRunning: gameRunning,
        stop: function() {
            gameRunning = false;
            document.removeEventListener("keydown", handleSnakeKeydown);
        }
    };
    
    gameLoop();
}

// Ouvrir l'interface finale
function openFinalInterface() {
    closePopup();
    
    const mainContainer = document.getElementById('mainContainer');
    const finalInterface = document.getElementById('finalInterface');
    const finalUsername = document.getElementById('finalUsername');
    const accessDate = document.getElementById('accessDate');
    
    if (mainContainer) mainContainer.style.display = 'none';
    if (finalInterface) finalInterface.style.display = 'flex';
    if (finalUsername) finalUsername.textContent = playerName || "Utilisateur MECI";
    
    if (accessDate) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        accessDate.textContent = now.toLocaleDateString('fr-FR', options);
    }
    
    const sesameMessage = document.getElementById('sesameMessage');
    if (sesameMessage) sesameMessage.style.animation = 'glow 2s infinite alternate';
}

// Aller au tableau de bord (version Node.js)
async function goToDashboard() {
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: playerName,
                password: playerPassword
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Connexion en cours...', 'success');
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1500);
        } else {
            showMessage(data.message || 'Erreur de connexion', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Erreur de connexion. Veuillez réessayer.', 'error');
    }
}

// Redémarrer le jeu
function restartGame() {
    const finalInterface = document.getElementById('finalInterface');
    const mainContainer = document.getElementById('mainContainer');
    const message = document.getElementById('message');
    
    if (finalInterface) finalInterface.style.display = 'none';
    
    playerName = '';
    playerPassword = '';
    
    if (mainContainer) mainContainer.style.display = 'block';
    if (message) message.style.display = 'none';
    
    initGame();
    
    showMessage('Jeu réinitialisé! Guidez le point vers les destinations.', 'success');
}

// Afficher un message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.style.display = 'block';
    
    if (type !== 'success' || !text.includes('Vérification humaine réussie')) {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// Dessiner le jeu principal
function draw() {
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#f5e9d3';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    destinations.forEach(dest => {
        ctx.beginPath();
        ctx.arc(dest.x, dest.y, dest.radius, 0, Math.PI * 2);
        
        if (dest.completed) {
            ctx.fillStyle = '#2a7a2a';
            ctx.strokeStyle = '#1a472a';
        } else if (dest.id === destinations[currentDestinationIndex]?.id && !dest.completed) {
            ctx.fillStyle = '#0066CC';
            ctx.strokeStyle = '#004080';
        } else {
            ctx.fillStyle = '#e0e0e0';
            ctx.strokeStyle = '#b0b0b0';
        }
        
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dest.id, dest.x, dest.y);
        
        ctx.beginPath();
        ctx.arc(dest.x, dest.y, dest.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0066CC';
    ctx.fill();
    
    ctx.strokeStyle = '#004080';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x - 4, player.y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(player.x + 4, player.y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(player.x, player.y + 3, 5, 0.2, Math.PI - 0.2, false);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();
}

// Démarrer le jeu au chargement de la page
window.addEventListener('load', function() {
    // Vérifier si nous sommes sur la page de jeu
    const gameCanvas = document.getElementById('gameCanvas');
    if (gameCanvas) {
        initGame();
        
        window.addEventListener('keydown', function(e) {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        }, false);
    }
});