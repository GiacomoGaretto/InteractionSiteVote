let pallini = [];
let flockingEnabled = false;
let numGrigi = 0;
let numBlu = 0;
let numArancioni = 0;

// Inizializza WebSocket una sola volta
let ws;

function initWebSocket() {
    ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = () => {
        console.log('WebSocket connection opened');
    };

    ws.onmessage = (event) => {
        const message = event.data;
        if (typeof window[message] === "function") {
            window[message]();
        }
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed. Reconnecting...');
        setTimeout(initWebSocket, 1000); // Prova a riconnettersi dopo 1 secondo
    };

    ws.onerror = (error) => {
        console.log('WebSocket error:', error);
    };
}

initWebSocket(); // Inizializza la connessione WebSocket

// Funzione per inviare messaggi WebSocket
function sendMessage(action) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(action);
    } else {
        console.log('WebSocket is not open. ReadyState:', ws.readyState);
    }
    if (typeof window[action] === "function") {
        window[action]();
    }
}

function setup() {
    let canvasContainer = document.getElementById('canvas-container');
    let canvas = createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    canvas.parent('canvas-container');
    noStroke();
    window.addEventListener('resize', resizeCanvasToContainer);
    document.addEventListener('keydown', keyPressed);
}

function draw() {
    background(255);

    fill(0);
    textSize(10);
    textAlign(LEFT, TOP);
    text(`Pallini totali: ${pallini.length}`, 10, 10);
    text(`Grigi: ${numGrigi}`, 10, 20);
    text(`Blu: ${numBlu}`, 10, 30);
    text(`Arancioni: ${numArancioni}`, 10, 40);

    for (let p of pallini) {
        if (flockingEnabled) {
            p.flock(pallini);
        }
        p.update();
        p.display();
    }
}

function resizeCanvasToContainer() {
    let canvasContainer = document.getElementById('canvas-container');
    resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
}

function addPallini() {
    for (let i = 0; i < 10; i++) {
        let newColore = color(217);
        numGrigi++;
        let newPallino = new Pallino(random(width), random(height), newColore);
        pallini.push(newPallino);
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
    if (event.keyCode === 13) {
        sendMessage('addPallini');
    } else if (event.keyCode === 66) {
        sendMessage('selectBlu');
    } else if (event.keyCode === 65) {
        sendMessage('selectArancione');
    }
}

class Pallino {
    constructor(x, y, colore) {
        this.x = x;
        this.y = y;
        this.velocita = createVector(random(-3, 3), random(-3, 3));
        this.colore = colore;
        this.diametro = (colore.toString() === color(217).toString()) ? 7 : 9.6;
        this.maxSpeed = 5;
    }

    update() {
        this.x += this.velocita.x;
        this.y += this.velocita.y;

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
        this.diametro = (this.colore.toString() === color(217).toString()) ? 7 : 9.6;
    }

    getColor() {
        return this.colore;
    }

    flock(pallini) {
        if (this.colore.toString() === color(217).toString()) {
            return;
        }

        let targetX = this.colore.toString() === color(0, 148, 255).toString() ? width / 4 : 3 * width / 4;
        let targetY = height / 2;
        let attractionDirection = this.x < width / 2 ? 1 : -1;
        let attrazione = createVector(targetX - this.x, targetY - this.y);
        attrazione.setMag(0.1);
        this.velocita.add(attrazione);

        if ((attractionDirection > 0 && this.x < width / 2) || (attractionDirection < 0 && this.x > width / 2)) {
            for (let other of pallini) {
                if (other !== this && (other.getColor().toString() === color(0, 148, 255).toString() || other.getColor().toString() === color(255, 156, 40).toString())) {
                    let d = dist(this.x, this.y, other.x, other.y);
                    if (d < 20) {
                        let separation = createVector(this.x - other.x, this.y - other.y);
                        separation.setMag(0.1);
                        this.velocita.add(separation);
                    }
                }
            }
        }

        this.velocita.limit(this.maxSpeed);
    }
}


        this.velocita.limit(this.maxSpeed);
    }
}
