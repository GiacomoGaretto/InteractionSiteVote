let pallini = [];
let flockingEnabled = false;
let numGrigi = 0;
let numBlu = 0;
let numArancioni = 0;
let customFont;
let animatingPallini = [];
const animationDuration = 1500; // 1.5 seconds
const targetAreaSize = 200; // 20px x 20px area

const ws = new WebSocket('wss://connessione-ws-voting.glitch.me', {
    headers: {
        "user-agent": "Mozilla"
    }
});

ws.onopen = function() {
    console.log('Connected to the server');
};

ws.onmessage = function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        const command = reader.result;
        console.log(`Received command: ${command}`);
        handleCommand(command);
    };
    reader.readAsText(event.data); // Legge il Blob come testo
};

ws.onerror = function(error) {
    console.error('WebSocket Error: ', error);
};

ws.onclose = function() {
    console.log('WebSocket connection closed');
};

function sendCommand(command) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(command);
    } else {
        console.log('WebSocket is not open');
    }
}

function handleCommand(command) {
    try {
        const parsedCommand = JSON.parse(command);
        console.log(`Handling command: ${parsedCommand}`);
        
        switch (parsedCommand.action) { // Usa parsedCommand.action
            case 'addGrigi':
                console.log('Adding grigi pallini');
                addPallini();
                break;
            case 'toggleFlocking':
                console.log('Toggling flocking');
                toggleFlocking();
                break;
            case 'selectBlu':
                console.log('Selecting blu pallini');
                selectBlu();
                break;
            case 'selectArancione':
                console.log('Selecting arancione pallini');
                selectArancione();
                break;
            case 'removeBlu':
                console.log('Removing blu pallini');
                removeBlu();
                break;
            case 'removeArancione':
                console.log('Removing arancione pallini');
                removeArancione();
                break;
            case 'resetCanvas':
                console.log('Resetting canvas');
                resetCanvas();
                break;
            case 'selectRandomPallino':
                console.log('Selecting random pallino');
                selectRandomPallino();
                break;
            default:
                console.log('Unknown command:', parsedCommand);
        }
    } catch (e) {
        console.error('Failed to parse command:', command);
    }
}

function preload() {
    customFont = loadFont('FONT/ABCDiatypeRoundedEdu-Medium.woff');
}

function setup() {
    let canvasContainer = document.getElementById('canvas-container');
    let canvas = createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    canvas.parent('canvas-container');
    noStroke();
    window.addEventListener('resize', resizeCanvasToContainer);
    document.addEventListener('keydown', keyPressed);
    clear();
    console.log('Setup complete');

    resizeCanvasToContainer();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
}

function resizeCanvasToContainer() {
    let canvasContainer = document.getElementById('canvas-container');
    resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
}

function handleFullscreenChange() {
    if (!document.fullscreenElement) {
        resizeCanvasToContainer();
    }
}

function draw() {
    background(243);

    // Disegna la scritta con il font personalizzato e il colore specificato
    fill('#000000'); // Sostituisci con il colore desiderato
    textFont(customFont);
    textSize(150);
    textAlign(LEFT, TOP);
    text('SUSHI o PIZZA?', 25, 40);

    textFont(customFont);
    textSize(35);
    textAlign(LEFT, TOP);
    text('GIORNO 1', 25, 15);

    fill(0);
    textSize(10);
    textAlign(LEFT, TOP);

    for (let p of pallini) {
        if (flockingEnabled) {
            p.flock(pallini);
        }
        p.update();
        p.display();
    }

    for (let anim of animatingPallini) {
        let elapsedTime = millis() - anim.startTime;
        if (elapsedTime < animationDuration) {
            let scale = 1 + (5 * sin((PI * elapsedTime) / animationDuration));
            anim.pallino.diametro = anim.pallino.originalDiametro * scale;
        } else {
            anim.pallino.diametro = anim.pallino.originalDiametro;
            animatingPallini = animatingPallini.filter(a => a !== anim); // Rimuovi l'animazione completata
        }
    }
}

function addPallini() {
    console.log('Adding 10 grigi pallini');
    for (let i = 0; i < 10; i++) {
        let newColore = color(217);
        numGrigi++;
        let newPallino = new Pallino(random(width), random(height), newColore);
        pallini.push(newPallino);
        console.log(`Added pallino at (${newPallino.x}, ${newPallino.y})`);
    }
}

function toggleFlocking() {
    flockingEnabled = !flockingEnabled;
}

function selectBlu() {
    let selectedPallino = selectPallino(color(217));
    if (selectedPallino != null) {
        numGrigi--;
        numBlu++;
        selectedPallino.setColor(color(0, 148, 255));
    }
}

function selectArancione() {
    let selectedPallino = selectPallino(color(217));
    if (selectedPallino != null) {
        numGrigi--;
        numArancioni++;
        selectedPallino.setColor(color(255, 156, 40));
    }
}

function removeBlu() {
    pallini = pallini.filter(p => p.getColor().toString() !== color(0, 148, 255).toString());
    numBlu = 0;
}

function removeArancione() {
    pallini = pallini.filter(p => p.getColor().toString() !== color(255, 156, 40).toString());
    numArancioni = 0;
}

function resetCanvas() {
    pallini = [];
    numGrigi = 0;
    numBlu = 0;
    numArancioni = 0;
    clear();
}

function selectPallino(col) {
    for (let p of pallini) {
        if (p.getColor().toString() === col.toString()) {
            return p;
        }
    }
    return null;
}

function keyPressed(event) {
    // Se il tasto premuto è il tasto Enter (codice 13)
    if (event.keyCode === 13) {
        // Esegui l'azione desiderata, ad esempio fare clic sul pulsante "Aggiungi Grigio"
        addPallini();
    }
    // Se il tasto premuto è il tasto B (codice 66)
    else if (event.keyCode === 66) {
        // Esegui l'azione desiderata, ad esempio fare clic sul pulsante "Aggiungi Blu"
        selectBlu();
    }
    // Se il tasto premuto è il tasto A (codice 65)
    else if (event.keyCode === 65) {
        // Esegui l'azione desiderata, ad esempio fare clic sul pulsante "Aggiungi Arancione"
        selectArancione();
    }
}

function selectRandomPallino() {
    let nonAnimatingPallini = pallini.filter(p => !animatingPallini.some(a => a.pallino === p));
    if (nonAnimatingPallini.length > 0) {
        let randomPallino = random(nonAnimatingPallini);
        randomPallino.originalDiametro = randomPallino.diametro;
        animatingPallini.push({ pallino: randomPallino, startTime: millis() });
    }
}

class Pallino {
    constructor(x, y, colore) {
        this.x = x;
        this.y = y;
        this.velocita = createVector(random(-3, 3), random(-3, 3));
        this.colore = colore;
        this.diametro = (colore.toString() === color(217).toString()) ? 7 : 9.6; // Imposta il diametro in base al colore
        this.maxSpeed = 5;
    }

    update() {
        this.x += this.velocita.x;
        this.y += this.velocita.y;

        // Rimbalzo sui bordi
        if (this.x - this.diametro / 2 < 0 || this.x + this.diametro / 2 > width) {
            this.velocita.x *= -1;
        }
        if (this.y - this.diametro / 2 < 0 || this.y + this.diametro / 2 > height) {
            this.velocita.y *= -1;
        }
        
    }

    display() {
        fill(this.colore);
        ellipse(this.x, this.y, this.diametro, this.diametro);
    }

    setColor(c) {
        this.colore = c;
        // Aggiorna il diametro quando viene cambiato il colore
        this.diametro = (this.colore.toString() === color(217).toString()) ? 7 : 9.6;

        // Aggiorna i contatori dei pallini
        if (this.colore.toString() === color(0, 148, 255).toString()) {
            numBlu++;
        } else if (this.colore.toString() === color(255, 156, 40).toString()) {
            numArancioni++;
        }
    }

    getColor() {
        return this.colore;
    }

    flock(pallini) {
        // Definizione delle aree di attrazione
        let targetX, targetY;
        let areaSize = targetAreaSize;
    
        if (this.colore.toString() === color(0, 148, 255).toString()) {
            // Area di attrazione per i pallini blu
            if (numGrigi === 0) {
                areaSize += 0.5 * Math.floor(numBlu);
                targetX = width / 4 + random(-targetAreaSize / 2, targetAreaSize / 2);
                targetY = height / 2 + random(-targetAreaSize / 2, targetAreaSize / 2);
            } else {
                areaSize += 0.5 * Math.floor(numBlu);
                targetX = width / 5 + random(-areaSize / 2, areaSize / 2);
                targetY = height / 2 + random(-areaSize / 2, areaSize / 2);
            }
        } else if (this.colore.toString() === color(255, 156, 40).toString()) {
            // Area di attrazione per i pallini arancioni
            if (numGrigi === 0) {
                areaSize += 0.5 * Math.floor(numArancioni);
                targetX = 3 * width / 4 + random(-targetAreaSize / 2, targetAreaSize / 2);
                targetY = height / 2 + random(-targetAreaSize / 2, targetAreaSize / 2);
            } else {
                areaSize += 0.5 * Math.floor(numArancioni);
                targetX = 4 * width / 5 + random(-areaSize / 2, areaSize / 2);
                targetY = height / 2 + random(-areaSize / 2, areaSize / 2);
            }
        } else if (this.colore.toString() === color(217).toString()) {
            // Area di attrazione per i pallini grigi
            targetX = width / 2 + random(-areaSize / 2, areaSize / 2);
            targetY = height / 2 + random(-areaSize / 2, areaSize / 2);
        }
    
        // Calcoliamo la forza di attrazione verso il target
        let attrazione = createVector(targetX - this.x, targetY - this.y);
        attrazione.setMag(0.1); // Modifica la forza di attrazione
    
        // Applichiamo la forza di attrazione
        this.velocita.add(attrazione);
    
        // Limitiamo la velocità massima
        this.velocita.limit(this.maxSpeed);
    }
}
