			function showInstructions() {
        var instructions = document.getElementById("instructions");
        if (instructions.style.display === "block") {
            instructions.style.display = "none";
        } else {
            instructions.style.display = "block";
        }
    }
        // Variables du jeu
        let score = 0;
        let lives = 3;
        let gameInterval;
        let objectInterval;
        let gameActive = false;
        let basketPosition = 160;
        
        // Éléments du DOM
        const gameContainer = document.getElementById('game-container');
        const basket = document.getElementById('basket');
        const scoreDisplay = document.getElementById('score');
        const livesDisplay = document.getElementById('lives');
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const gameOverScreen = document.getElementById('game-over');
        const finalScoreDisplay = document.getElementById('final-score');
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        
        // Configuration des contrôles tactiles
        let leftPressed = false;
        let rightPressed = false;
        
        leftBtn.addEventListener('touchstart', () => leftPressed = true);
        leftBtn.addEventListener('touchend', () => leftPressed = false);
        rightBtn.addEventListener('touchstart', () => rightPressed = true);
        rightBtn.addEventListener('touchend', () => rightPressed = false);
        
        // Déplacement du panier avec clavier
        document.addEventListener('keydown', (e) => {
            if (!gameActive) return;
            
            if (e.key === 'ArrowLeft' && basketPosition > 0) {
                basketPosition -= 20;
            } else if (e.key === 'ArrowRight' && basketPosition < gameContainer.offsetWidth - 80) {
                basketPosition += 20;
            }
            
            basket.style.left = `${basketPosition}px`;
        });
        
        // Déplacement du panier avec boutons tactiles
        function handleTouchControls() {
            if (!gameActive) return;
            
            if (leftPressed && basketPosition > 0) {
                basketPosition -= 10;
            }
            
            if (rightPressed && basketPosition < gameContainer.offsetWidth - 80) {
                basketPosition += 10;
            }
            
            basket.style.left = `${basketPosition}px`;
        }
        
        // Démarrer le jeu
        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', startGame);
        
        function startGame() {
            // Réinitialiser les variables
            score = 0;
            lives = 3;
            basketPosition = (gameContainer.offsetWidth - 80) / 2;
            basket.style.left = `${basketPosition}px`;
            
            // Mettre à jour l'affichage
            scoreDisplay.textContent = score;
            livesDisplay.textContent = lives;
            
            // Cacher l'écran de game over et le bouton start
            gameOverScreen.style.display = 'none';
            startBtn.style.display = 'none';
            
            // Nettoyer le conteneur de jeu
            const objects = document.querySelectorAll('.object');
            objects.forEach(object => object.remove());
            
            // Démarrer le jeu
            gameActive = true;
            
            // Intervalles pour la création d'objets et le mouvement
            objectInterval = setInterval(createObject, 1000);
            gameInterval = setInterval(updateGame, 20);
        }
        
        function createObject() {
            if (!gameActive) return;
            
            const object = document.createElement('div');
            object.classList.add('object');
            
            // Types d'objets avec probabilités différentes
            const objectTypes = ['apple', 'mango', 'bomb'];
            const weights = [0.4, 0.4, 0.2];
            
            let randomType = getWeightedRandom(objectTypes, weights);
            object.classList.add(randomType);
            
            // Ajouter un emoji pour identifier facilement l'objet
            if (randomType === 'apple') {
                object.textContent = '🍎';
            } else if (randomType === 'mango') {
                object.textContent = '🥭';
            } else {
                object.textContent = '💣';
            }
            
            // Position horizontale aléatoire
            const leftPosition = Math.floor(Math.random() * (gameContainer.offsetWidth - 40));
            object.style.left = `${leftPosition}px`;
            object.style.top = '0px';
            
            gameContainer.appendChild(object);
            
            // Animation de chute
            let fallInterval = setInterval(() => {
                if (!gameActive) {
                    clearInterval(fallInterval);
                    return;
                }
                
                const topPosition = parseInt(object.style.top || 0);
                
                if (topPosition > gameContainer.offsetHeight) {
                    // Objet manqué
                    if (!object.classList.contains('bomb')) {
                        // Manquer un fruit fait perdre une vie
                        loseLife();
                    }
                    clearInterval(fallInterval);
                    object.remove();
                } else {
                    object.style.top = `${topPosition + 2}px`;
                    
                    // Détection de collision
                    if (isColliding(object, basket)) {
                        clearInterval(fallInterval);
                        
                        if (object.classList.contains('bomb')) {
                            // Bombe attrapée = perte de vie
                            loseLife();
                        } else {
                            // Fruit attrapé = gain de points
                            score += 10;
                            scoreDisplay.textContent = score;
                        }
                        
                        object.remove();
                    }
                }
            }, 12);
        }
        
        function isColliding(obj1, obj2) {
            const rect1 = obj1.getBoundingClientRect();
            const rect2 = obj2.getBoundingClientRect();
            
            return !(
                rect1.top > rect2.bottom ||
                rect1.bottom < rect2.top ||
                rect1.right < rect2.left ||
                rect1.left > rect2.right
            );
        }
        
        function loseLife() {
            lives--;
            livesDisplay.textContent = lives;
            
            if (lives <= 0) {
                endGame();
            }
        }
        
        function endGame() {
            gameActive = false;
            clearInterval(gameInterval);
            clearInterval(objectInterval);
            
            // Afficher l'écran de fin de jeu
            finalScoreDisplay.textContent = score;
            gameOverScreen.style.display = 'flex';
            startBtn.style.display = 'block';
        }
        
        function updateGame() {
            handleTouchControls();
        }
        
        // Fonction utilitaire pour obtenir une valeur aléatoire pondérée
        function getWeightedRandom(values, weights) {
            let totalWeight = weights.reduce((a, b) => a + b, 0);
            let random = Math.random() * totalWeight;
            
            for (let i = 0; i < values.length; i++) {
                if (random < weights[i]) {
                    return values[i];
                }
                random -= weights[i];
            }
            
            return values[values.length - 1];
        }