//Selectors
let splashScreen = document.getElementById('start-page');
let playBtnStart = document.querySelectorAll('.play-btn-start');
let playBtn = document.querySelectorAll('.play-btn');
let playBtnNext = document.querySelectorAll('.play-btn-next');
let gameOverScreen = document.getElementById('game-over-page');
let selectPlayerScreen = document.getElementById('select-player-page');
let virusBtn = document.getElementById('virusPlayer');
let bacteriaBtn = document.getElementById('bacteriaPlayer');
let nanovirusBtn = document.getElementById('nanovirusPlayer');
let protozoaBtn = document.getElementById('protozoaPlayer');
let gameoverImg = document.getElementById('virus-gameover');
let winScreen = document.getElementById('win-page');
let highScoreList = document.getElementById('highScoreTable');
let highScoreScreen = document.getElementById('high-score-page');
//Variables
let pickedPathogen = null;
let mainPlayer = 0;
let intervalId = 0;
let upArrow = false;
let downArrow = false;
let leftArrow = false;
let rightArrow = false;
let points = 0;
let pointsRestart = 0;
let lives = 2;
let enemies = [];
let outOfBox = 0;
let highScores = [];
let namePlayer = "";
let gameOver = false;
//Boss variables
let mainPlayerBoss = 0;
let intervalBoss = 0;
let shooting = [];
let bossEnemy = 0;
let bossHealth = 360;
let shootingBoss = [];
let intervalBossShoot = 0;
//Images
//Classes
const virusImg = new Image();
virusImg.src = "../images/virus.png";
const bacteriaImg = new Image();
bacteriaImg.src = "../images/bacteria.png";
const protozoaImg = new Image();
protozoaImg.src = "../images/protozoa.png";
const nanovirusImg = new Image();
nanovirusImg.src = "../images/nanovirus.png";
//Collectables
const humanImg = new Image();
humanImg.src = "../images/human.png";
const mutationImg = new Image();
mutationImg.src = "../images/mutation.png";
//Enemy
const vaccineImg = new Image();
vaccineImg.src = "../images/vaccine.png";
const vaccineImgDeath = new Image();
vaccineImgDeath.src = "../images/vaccineDead.png";
//BossLevel
//Shooting
const shootingVirus = new Image();
shootingVirus.src = '../images/shootingVirus.png';
const enemyDoctor = new Image();
enemyDoctor.src = '../images/plagueDoctor.png';
const shootingVaccine = new Image();
shootingVaccine.src = '../images/shootingVaccine.png';
//Audios
let backgroundMusic = new Audio('../audio/arcade_music.wav');
let losingLifeAudio = new Audio('../audio/lifeLostPlayer.wav');
let gameStartBtnAudio = new Audio('../audio/game_start.wav');
let gameOverAudio = new Audio('../audio/game_over.wav');
let winAudio = new Audio('../audio/win_sound.mp3');
let playerMovingAudio = new Audio('../audio/player_moving.mp3');
let playerSelectAudio = new Audio('../audio/player_select.mp3');
let ghostScaredAudio = new Audio('../audio/ghostScaredFalse.wav');
let bossLevelAudio = new Audio('../audio/bossLevelBg.wav');
let coughShootAudio = new Audio('../audio/coughSound.mp3');
let enemyShootAudio = new Audio('../audio/shootEnemySound.wav');
let bossPainAudio = new Audio('../audio/bossPainAudio.wav');
//Canvas
const mycanvas = document.getElementById('my-canvas');
let ctx = mycanvas.getContext('2d');
//Classes
class Wall {
    constructor(x, y, width, height, color, gate){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.gate = gate;
    };
    draw(){
        ctx.lineWidth = 3;
        ctx.strokeStyle = this.color;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    };
};
class Collectable {
    constructor(img, x, y, width, height) {
        this.img = img;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.collected = false;
        this.notScored = true;
        this.mutate = false;
    };
    draw(){
        this.img.onload = ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    };
    checkcollision(object) {
        return (
          this.x < object.x + object.width &&
          this.x + this.width > object.x &&
          this.y < object.y + object.height &&
          this.y + this.height > object.y
        );
    };
    collect(object){
        if (this.checkcollision(object)) {
            this.collected = true;
            ctx.clearRect(this.x, this.y, this.width, this.height);
            ctx.fillStyle = "black";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            this.mutate = true;
        };
    };
    updateScore(object, score){
        if ((this.checkcollision(object)) && (this.notScored === true)){
            points += score;
            pointsRestart += score;
            this.notScored = false;
            playerMovingAudio.play();
            playerMovingAudio.volume = 0.6;
        };
    };
};
class Player extends Collectable {
    constructor(img, x, y){
        super(img, x, y);
        this.width = 36;
        this.height = 36;
        this.speedX = 4;
        this.speedY = 4;
    };
    moveRight(objects) {
        this.x += this.speedX;
        objects.forEach(object => {
            if (this.checkcollision(object)) {
                this.x -= this.speedX;
            } else if (this.x >= 976){
                this.x = 0;
            };
        });
      };
    moveLeft(objects) {
        this.x -= this.speedX;
        objects.forEach(object => {
            if (this.checkcollision(object)) {
                this.x += this.speedX;
            } else if (this.x <= 0){
                this.x = 975;
            };
        });
    };
    moveUp(objects) {
        this.y -= this.speedY;
        objects.forEach(object => {
            if (this.checkcollision(object)) this.y += this.speedY;
        });
    };
    moveDown(objects) {
        this.y += this.speedY;
        objects.forEach(object => {
            if (this.checkcollision(object)) this.y -= this.speedY;
        });
    };
};
class Enemy extends Player {
    constructor(img, x, y){
        super(img, x, y);
        this.width = 36;
        this.height = 36;
        this.speedX = 0.4;
        this.speedY = 0.4;
        this.dx = 0;
        this.dy = 0;
        this.distance = 0;
        this.angle = 0;
        this.home = true;
        this.scared = false;
        this.dead = false;
    };
    updateAngleX(player, objects){
        this.dx = player.x - this.x;
        this.dy = player.y - this.y;
        this.distance = Math.sqrt((this.dx*this.dx) + (this.dy*this.dy));
        this.angle = Math.atan2(this.dy,this.dx);
        this.x += Math.cos(this.angle) * this.speedX;
        objects.forEach(object => {
            if ((this.dead === false || object.color === "blue") && this.checkcollision(object)){
                if (this.dy > 0){
                    this.y += this.speedY;
                    this.x -= Math.cos(this.angle) * this.speedX;
                    if (this.checkcollision(object)) this.y -= this.speedY;
                } else if (this.dy < 0){
                    this.y -= this.speedY;
                    this.x -= Math.cos(this.angle) * this.speedX;
                    if (this.checkcollision(object)) this.y += this.speedY;
                };
            };
        });
    };
    updateAngleY(player, objects){
        this.dx = player.x - this.x;
        this.dy = player.y - this.y;
        this.distance = Math.sqrt((this.dx*this.dx) + (this.dy*this.dy));
        this.angle = Math.atan2(this.dy,this.dx);
        this.y += Math.sin(this.angle) * this.speedY;
        objects.forEach(object => {
            if ((this.dead === false || object.color === "blue") && this.checkcollision(object)){
                if (this.dx > 0){
                    this.x += this.speedX;
                    this.y -= Math.sin(this.angle) * this.speedY;
                    if (this.checkcollision(object)) this.x -= this.speedX;
                } else if (this.dx < 0){
                    this.x -= this.speedX;
                    this.y -= Math.sin(this.angle) * this.speedY;
                    if (this.checkcollision(object)) this.x += this.speedX;
                };
            };
        });
    };
    updateAngleScaredX(player, objects){
        this.dx = this.x - player.x;
        this.dy = this.y - player.y;
        this.distance = Math.sqrt((this.dx*this.dx) + (this.dy*this.dy));
        this.angle = Math.atan2(this.dy,this.dx);
        this.x += Math.cos(this.angle) * this.speedX;
        objects.forEach(object => {
            if ((this.dead === false || object.gate === false) && this.checkcollision(object)){
                if (this.dy > 0){
                    this.y += this.speedY;
                    this.x -= Math.cos(this.angle) * this.speedX;
                    if (this.checkcollision(object)) this.y -= this.speedY;
                } else if (this.dy < 0){
                    this.y -= this.speedY;
                    this.x -= Math.cos(this.angle) * this.speedX;
                    if (this.checkcollision(object)) this.y += this.speedY;
                };
            };
        });
    };
    updateAngleScaredY(player, objects){
        this.dx = this.x - player.x;
        this.dy = this.y - player.y;
        this.distance = Math.sqrt((this.dx*this.dx) + (this.dy*this.dy));
        this.angle = Math.atan2(this.dy,this.dx);
        this.y += Math.sin(this.angle) * this.speedY;
        objects.forEach(object => {
            if ((this.dead === false || object.gate === false) && this.checkcollision(object)){
                if (this.dx > 0){
                    this.x += this.speedX;
                    this.y -= Math.sin(this.angle) * this.speedY;
                    if (this.checkcollision(object)) this.x -= this.speedX;
                } else if (this.dx < 0){
                    this.x -= this.speedX;
                    this.y -= Math.sin(this.angle) * this.speedY;
                    if (this.checkcollision(object)) this.x += this.speedX;
                };
            };
        });
    };
    scare(player, objects){
        this.updateAngleScaredX(player, objects);
        this.updateAngleScaredY(player, objects);
    };
    transportHome (){
        this.x = 480;
        this.y = 290;
    };
    death(objects){
        outOfBox = new Player("", 480, 224);
        if (this.x > 481 || this.x < 479 || this.y > 225 || this.y < 223){
            this.img = vaccineImgDeath;
            this.draw();
            this.speedX = 0.8;
            this.speedY = 0.8;
            this.updateAngleX(outOfBox, objects);
            this.updateAngleY(outOfBox, objects);
        } else if (this.x <= 481 && this.x >= 479 && this.y <= 225 && this.y >= 223){
            this.transportHome();
        };
        if (this.x <= 481 && this.x >= 479 && this.y <= 291 && this.y >= 289){
            this.img = vaccineImg;
            this.draw();
            points += 300;
            this.dead = false;
            this.scared = false;
            this.home = true;
            pointsRestart = 0;
            this.speedX = 0.4;
            this.speedY = 0.4;
        };
    };
};
//Boss level classes
class PlayerBoss extends Collectable {
    constructor(img, x, y){
        super(img, x, y);
        this.width = 40;
        this.height = 40;
        this.speedX = 15;
        this.speedY = 15;
    };
    moveRight(objects) {
        this.x += this.speedX;
        objects.forEach(object => {
            if (this.checkcollision(object)) this.x -= this.speedX;
        });
      };
    moveLeft() {
        this.x -= this.speedX;
        if (this.x <= 0) this.x += this.speedX;
    };
    moveUp() {
        this.y -= this.speedY;
        if (this.y <= 400) this.y += this.speedY;
    };
    moveDown() {
        this.y += this.speedY;
        if (this.y >= 670) this.y -= this.speedY;
    };
};
class Shoot extends Collectable{
    constructor(img, x, y){
        super(img, x, y);
        this.width = 10;
        this.height = 10;
    };
};
class Boss extends Collectable {
    constructor(img, x, y){
        super(img, x, y);
        this.width = 240;
        this.height = 240;
        this.speedX = 4;
        this.hit = false;
    };
    randomMovement(objects){
        this.x -= this.speedX;
        objects.forEach(object => {
            if (this.x <= -10){
                this.speedX *= -1;
            } else if (this.checkcollision(object)){
                this.speedX *= -1;
            };
        });
    };
    drawHealthBar() {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "white";
        ctx.strokeRect(mycanvas.width - 380, mycanvas.height - 400, 360, 50);
        ctx.fillStyle = "black";
        ctx.fillRect(mycanvas.width - 380, mycanvas.height - 400, 360, 50);
        if (bossHealth >= 252){
            ctx.fillStyle = "green";
        } else if (bossHealth >= 144){
            ctx.fillStyle = "orange";
        } else {
            ctx.fillStyle = "red";
        };
        ctx.fillRect(mycanvas.width - 380, mycanvas.height - 400, bossHealth, 50);
      };
      decreaseHealth(){
          if (this.hit === true){
            bossHealth -= 20;
            points += 200;
            bossPainAudio.play();
            if (this.speedX < 0){
                this.speedX -= 0.2;
            } else if (this.speedX > 0){
                this.speedX += 0.2;
            };            
            this.hit = false;
          };
      };
};
//Walls
const outerWallThickness = 10;
const walls = [
    //Outer walls
    new Wall(0, 0, mycanvas.width - 400, outerWallThickness, "blue", false),
    new Wall(0, mycanvas.height - outerWallThickness, mycanvas.width - 400, outerWallThickness, "blue", false),
    new Wall(0, 0, outerWallThickness, 210, "blue", false),
    new Wall(mycanvas.width - outerWallThickness - 400, 0, outerWallThickness, 210, "blue", false),
    new Wall(0, 210 - outerWallThickness, 200, outerWallThickness, "blue", false),
    new Wall(800, 210 - outerWallThickness, 200, outerWallThickness, "blue", false),
    new Wall(0, 420, outerWallThickness, 280, "blue", false),
    new Wall(mycanvas.width - outerWallThickness - 400, 420, outerWallThickness, 280, "blue", false),
    new Wall(0, 420, 200, outerWallThickness, "blue", false),
    new Wall(800, 420, 200, outerWallThickness, "blue", false),
    new Wall(200 - outerWallThickness, 210 - outerWallThickness, outerWallThickness, 90, "blue", false),
    new Wall(800, 210 - outerWallThickness, outerWallThickness, 90, "blue", false),
    new Wall(200 - outerWallThickness, 340, outerWallThickness, 90, "blue", false),
    new Wall(800, 340, outerWallThickness, 90, "blue", false),
    new Wall(0, 280, 200, outerWallThickness, "blue", false),
    new Wall(800, 280, 200, outerWallThickness, "blue", false),
    new Wall(0, 340, 200, outerWallThickness, "blue", false),
    new Wall(800, 340, 200, outerWallThickness, "blue", false),
    //Inner walls
    new Wall(60, 60, 140, 30, "blue", false),
    new Wall(480, 0, 40, 90, "blue", false),
    new Wall(250, 60, 180, 30, "blue", false),
    new Wall(800, 60, 140, 30, "blue", false),
    new Wall(570, 60, 180, 30, "blue", false),
    new Wall(60, 140, 140, 10, "blue", false),
    new Wall(800, 140, 140, 10, "blue", false),
    new Wall(250, 140, 60, 150, "blue", false),
    new Wall(690, 140, 60, 150, "blue", false),
    new Wall(250, 200, 160, 20, "blue", false),
    new Wall(590, 200, 160, 20, "blue", false),
    new Wall(360, 140, 280, 10, "blue", false),
    new Wall(460, 140, 80, 80, "blue", false),
    new Wall(250, 340, 60, 90, "blue", false),
    new Wall(690, 340, 60, 90, "blue", false),
    new Wall(360, 400, 280, 30, "blue", false),
    new Wall(460, 400, 80, 90, "blue", false),
    new Wall(250, 480, 160, 10, "blue", false),
    new Wall(590, 480, 160, 10, "blue", false),
    new Wall(60, 480, 140, 10, "blue", false),
    new Wall(800, 480, 140, 10, "blue", false),
    new Wall(140, 480, 60, 100, "blue", false),
    new Wall(800, 480, 60, 100, "blue", false),
    new Wall(0, 540, 90, 40, "blue", false),
    new Wall(910, 540, 90, 40, "blue", false),
    new Wall(60, 630, 350, 10, "blue", false),
    new Wall(590, 630, 350, 10, "blue", false),
    new Wall(250, 540, 60, 100, "blue", false),
    new Wall(690, 540, 60, 100, "blue", false),
    new Wall(360, 540, 280, 40, "blue", false),
    new Wall(460, 540, 80, 100, "blue", false),
    new Wall(360, 270, 10, 80, "blue", false),
    new Wall(630, 270, 10, 80, "blue", false),
    new Wall(360, 270, 115, 10, "blue", false),
    new Wall(525, 270, 115, 10, "blue", false),
    new Wall(474, 270, 50, 10, "yellow", true),
    new Wall(360, 340, 280, 10, "blue", false)
];
const bossLevelWall = [
    new Wall(mycanvas.width - outerWallThickness - 400, 0, outerWallThickness, mycanvas.height, "blue", false)
]
// Collectables
const specialCollects = [
    new Collectable(mutationImg, 20, 60, 30, 30),
    new Collectable(mutationImg, 950, 60, 30, 30),
    new Collectable(mutationImg, 20, 500, 30, 30),
    new Collectable(mutationImg, 950, 500, 30, 30)
];
const collects = [
    new Collectable(humanImg, 30, 22, 15, 20),
    new Collectable(humanImg, 60, 22, 15, 20),
    new Collectable(humanImg, 90, 22, 15, 20),
    new Collectable(humanImg, 120, 22, 15, 20),
    new Collectable(humanImg, 150, 22, 15, 20),
    new Collectable(humanImg, 180, 22, 15, 20),
    new Collectable(humanImg, 210, 22, 15, 20),
    new Collectable(humanImg, 240, 22, 15, 20),
    new Collectable(humanImg, 270, 22, 15, 20),
    new Collectable(humanImg, 300, 22, 15, 20),
    new Collectable(humanImg, 330, 22, 15, 20),
    new Collectable(humanImg, 360, 22, 15, 20),
    new Collectable(humanImg, 390, 22, 15, 20),
    new Collectable(humanImg, 420, 22, 15, 20),
    new Collectable(humanImg, 450, 22, 15, 20),
    new Collectable(humanImg, 540, 22, 15, 20),
    new Collectable(humanImg, 570, 22, 15, 20),
    new Collectable(humanImg, 600, 22, 15, 20),
    new Collectable(humanImg, 630, 22, 15, 20),
    new Collectable(humanImg, 660, 22, 15, 20),
    new Collectable(humanImg, 690, 22, 15, 20),
    new Collectable(humanImg, 720, 22, 15, 20),
    new Collectable(humanImg, 750, 22, 15, 20),
    new Collectable(humanImg, 780, 22, 15, 20),
    new Collectable(humanImg, 810, 22, 15, 20),
    new Collectable(humanImg, 840, 22, 15, 20),
    new Collectable(humanImg, 870, 22, 15, 20),
    new Collectable(humanImg, 900, 22, 15, 20),
    new Collectable(humanImg, 930, 22, 15, 20),
    new Collectable(humanImg, 960, 22, 15, 20),
    new Collectable(humanImg, 30, 102, 15, 20),
    new Collectable(humanImg, 60, 102, 15, 20),
    new Collectable(humanImg, 90, 102, 15, 20),
    new Collectable(humanImg, 120, 102, 15, 20),
    new Collectable(humanImg, 150, 102, 15, 20),
    new Collectable(humanImg, 180, 102, 15, 20),
    new Collectable(humanImg, 210, 102, 15, 20),
    new Collectable(humanImg, 240, 102, 15, 20),
    new Collectable(humanImg, 270, 102, 15, 20),
    new Collectable(humanImg, 300, 102, 15, 20),
    new Collectable(humanImg, 330, 102, 15, 20),
    new Collectable(humanImg, 360, 102, 15, 20),
    new Collectable(humanImg, 390, 102, 15, 20),
    new Collectable(humanImg, 420, 102, 15, 20),
    new Collectable(humanImg, 450, 102, 15, 20),
    new Collectable(humanImg, 480, 102, 15, 20),
    new Collectable(humanImg, 510, 102, 15, 20),
    new Collectable(humanImg, 540, 102, 15, 20),
    new Collectable(humanImg, 570, 102, 15, 20),
    new Collectable(humanImg, 600, 102, 15, 20),
    new Collectable(humanImg, 630, 102, 15, 20),
    new Collectable(humanImg, 660, 102, 15, 20),
    new Collectable(humanImg, 690, 102, 15, 20),
    new Collectable(humanImg, 720, 102, 15, 20),
    new Collectable(humanImg, 750, 102, 15, 20),
    new Collectable(humanImg, 780, 102, 15, 20),
    new Collectable(humanImg, 810, 102, 15, 20),
    new Collectable(humanImg, 840, 102, 15, 20),
    new Collectable(humanImg, 870, 102, 15, 20),
    new Collectable(humanImg, 900, 102, 15, 20),
    new Collectable(humanImg, 930, 102, 15, 20),
    new Collectable(humanImg, 960, 102, 15, 20),
    new Collectable(humanImg, 30, 162, 15, 20),
    new Collectable(humanImg, 60, 162, 15, 20),
    new Collectable(humanImg, 90, 162, 15, 20),
    new Collectable(humanImg, 120, 162, 15, 20),
    new Collectable(humanImg, 150, 162, 15, 20),
    new Collectable(humanImg, 180, 162, 15, 20),
    new Collectable(humanImg, 210, 162, 15, 20),
    new Collectable(humanImg, 330, 162, 15, 20),
    new Collectable(humanImg, 360, 162, 15, 20),
    new Collectable(humanImg, 390, 162, 15, 20),
    new Collectable(humanImg, 420, 162, 15, 20),
    new Collectable(humanImg, 570, 162, 15, 20),
    new Collectable(humanImg, 600, 162, 15, 20),
    new Collectable(humanImg, 630, 162, 15, 20),
    new Collectable(humanImg, 660, 162, 15, 20),
    new Collectable(humanImg, 780, 162, 15, 20),
    new Collectable(humanImg, 810, 162, 15, 20),
    new Collectable(humanImg, 840, 162, 15, 20),
    new Collectable(humanImg, 870, 162, 15, 20),
    new Collectable(humanImg, 900, 162, 15, 20),
    new Collectable(humanImg, 930, 162, 15, 20),
    new Collectable(humanImg, 960, 162, 15, 20),
    new Collectable(humanImg, 30, 444, 15, 20),
    new Collectable(humanImg, 60, 444, 15, 20),
    new Collectable(humanImg, 90, 444, 15, 20),
    new Collectable(humanImg, 120, 444, 15, 20),
    new Collectable(humanImg, 150, 444, 15, 20),
    new Collectable(humanImg, 180, 444, 15, 20),
    new Collectable(humanImg, 210, 444, 15, 20),
    new Collectable(humanImg, 240, 444, 15, 20),
    new Collectable(humanImg, 270, 444, 15, 20),
    new Collectable(humanImg, 300, 444, 15, 20),
    new Collectable(humanImg, 330, 444, 15, 20),
    new Collectable(humanImg, 360, 444, 15, 20),
    new Collectable(humanImg, 390, 444, 15, 20),
    new Collectable(humanImg, 420, 444, 15, 20),
    new Collectable(humanImg, 570, 444, 15, 20),
    new Collectable(humanImg, 600, 444, 15, 20),
    new Collectable(humanImg, 630, 444, 15, 20),
    new Collectable(humanImg, 660, 444, 15, 20),
    new Collectable(humanImg, 690, 444, 15, 20),
    new Collectable(humanImg, 720, 444, 15, 20),
    new Collectable(humanImg, 750, 444, 15, 20),
    new Collectable(humanImg, 780, 444, 15, 20),
    new Collectable(humanImg, 810, 444, 15, 20),
    new Collectable(humanImg, 840, 444, 15, 20),
    new Collectable(humanImg, 870, 444, 15, 20),
    new Collectable(humanImg, 900, 444, 15, 20),
    new Collectable(humanImg, 930, 444, 15, 20),
    new Collectable(humanImg, 960, 444, 15, 20),
    new Collectable(humanImg, 60, 502, 15, 20),
    new Collectable(humanImg, 90, 502, 15, 20),
    new Collectable(humanImg, 120, 502, 15, 20),
    new Collectable(humanImg, 210, 502, 15, 20),
    new Collectable(humanImg, 240, 502, 15, 20),
    new Collectable(humanImg, 270, 502, 15, 20),
    new Collectable(humanImg, 300, 502, 15, 20),
    new Collectable(humanImg, 330, 502, 15, 20),
    new Collectable(humanImg, 360, 502, 15, 20),
    new Collectable(humanImg, 390, 502, 15, 20),
    new Collectable(humanImg, 420, 502, 15, 20),
    new Collectable(humanImg, 450, 502, 15, 20),
    new Collectable(humanImg, 540, 502, 15, 20),
    new Collectable(humanImg, 570, 502, 15, 20),
    new Collectable(humanImg, 600, 502, 15, 20),
    new Collectable(humanImg, 630, 502, 15, 20),
    new Collectable(humanImg, 660, 502, 15, 20),
    new Collectable(humanImg, 690, 502, 15, 20),
    new Collectable(humanImg, 720, 502, 15, 20),
    new Collectable(humanImg, 750, 502, 15, 20),
    new Collectable(humanImg, 780, 502, 15, 20),
    new Collectable(humanImg, 870, 502, 15, 20),
    new Collectable(humanImg, 900, 502, 15, 20),
    new Collectable(humanImg, 930, 502, 15, 20),
    new Collectable(humanImg, 30, 594, 15, 20),
    new Collectable(humanImg, 60, 594, 15, 20),
    new Collectable(humanImg, 90, 594, 15, 20),
    new Collectable(humanImg, 120, 594, 15, 20),
    new Collectable(humanImg, 150, 594, 15, 20),
    new Collectable(humanImg, 180, 594, 15, 20),
    new Collectable(humanImg, 210, 594, 15, 20),
    new Collectable(humanImg, 330, 594, 15, 20),
    new Collectable(humanImg, 360, 594, 15, 20),
    new Collectable(humanImg, 390, 594, 15, 20),
    new Collectable(humanImg, 420, 594, 15, 20),
    new Collectable(humanImg, 570, 594, 15, 20),
    new Collectable(humanImg, 600, 594, 15, 20),
    new Collectable(humanImg, 630, 594, 15, 20),
    new Collectable(humanImg, 660, 594, 15, 20),
    new Collectable(humanImg, 780, 594, 15, 20),
    new Collectable(humanImg, 810, 594, 15, 20),
    new Collectable(humanImg, 840, 594, 15, 20),
    new Collectable(humanImg, 870, 594, 15, 20),
    new Collectable(humanImg, 900, 594, 15, 20),
    new Collectable(humanImg, 930, 594, 15, 20),
    new Collectable(humanImg, 960, 594, 15, 20),
    new Collectable(humanImg, 30, 654, 15, 20),
    new Collectable(humanImg, 60, 654, 15, 20),
    new Collectable(humanImg, 90, 654, 15, 20),
    new Collectable(humanImg, 120, 654, 15, 20),
    new Collectable(humanImg, 150, 654, 15, 20),
    new Collectable(humanImg, 180, 654, 15, 20),
    new Collectable(humanImg, 210, 654, 15, 20),
    new Collectable(humanImg, 240, 654, 15, 20),
    new Collectable(humanImg, 270, 654, 15, 20),
    new Collectable(humanImg, 300, 654, 15, 20),
    new Collectable(humanImg, 330, 654, 15, 20),
    new Collectable(humanImg, 360, 654, 15, 20),
    new Collectable(humanImg, 390, 654, 15, 20),
    new Collectable(humanImg, 420, 654, 15, 20),
    new Collectable(humanImg, 450, 654, 15, 20),
    new Collectable(humanImg, 480, 654, 15, 20),
    new Collectable(humanImg, 510, 654, 15, 20),
    new Collectable(humanImg, 540, 654, 15, 20),
    new Collectable(humanImg, 570, 654, 15, 20),
    new Collectable(humanImg, 600, 654, 15, 20),
    new Collectable(humanImg, 630, 654, 15, 20),
    new Collectable(humanImg, 660, 654, 15, 20),
    new Collectable(humanImg, 690, 654, 15, 20),
    new Collectable(humanImg, 720, 654, 15, 20),
    new Collectable(humanImg, 750, 654, 15, 20),
    new Collectable(humanImg, 780, 654, 15, 20),
    new Collectable(humanImg, 810, 654, 15, 20),
    new Collectable(humanImg, 840, 654, 15, 20),
    new Collectable(humanImg, 870, 654, 15, 20),
    new Collectable(humanImg, 900, 654, 15, 20),
    new Collectable(humanImg, 930, 654, 15, 20),
    new Collectable(humanImg, 960, 654, 15, 20),
    new Collectable(humanImg, 210, 62, 15, 20),
    new Collectable(humanImg, 450, 62, 15, 20),
    new Collectable(humanImg, 540, 62, 15, 20),
    new Collectable(humanImg, 770, 62, 15, 20),
    new Collectable(humanImg, 106, 544, 15, 20),
    new Collectable(humanImg, 210, 544, 15, 20),
    new Collectable(humanImg, 330, 544, 15, 20),
    new Collectable(humanImg, 660, 544, 15, 20),
    new Collectable(humanImg, 770, 544, 15, 20),
    new Collectable(humanImg, 880, 544, 15, 20),
    new Collectable(humanImg, 210, 200, 15, 20),
    new Collectable(humanImg, 210, 240, 15, 20),
    new Collectable(humanImg, 210, 280, 15, 20),
    new Collectable(humanImg, 210, 320, 15, 20),
    new Collectable(humanImg, 210, 360, 15, 20),
    new Collectable(humanImg, 210, 400, 15, 20),
    new Collectable(humanImg, 770, 200, 15, 20),
    new Collectable(humanImg, 770, 240, 15, 20),
    new Collectable(humanImg, 770, 280, 15, 20),
    new Collectable(humanImg, 770, 320, 15, 20),
    new Collectable(humanImg, 770, 360, 15, 20),
    new Collectable(humanImg, 770, 400, 15, 20)
];
// Highscores
highScores = [
    {
        name: 'EEE',
        score: 00000
    },
    {
        name: 'LLL',
        score: 00000
    },
    {
        name: 'III',
        score: 00000
    }
];
//Shooting from enemy boss
if (intervalBossShoot){
    clearInterval(intervalBossShoot);
};
intervalBossShoot = setInterval(() => {
    shootingBoss.push(new Shoot(shootingVaccine, bossEnemy.x + 120, bossEnemy.y + 220));
}, 400);
//Run game
window.addEventListener('load', () => {
    startSplashScreen();
    playBtn.forEach(e => {
        e.addEventListener('click', () => {
            clearInterval(intervalId);
            cancelAnimationFrame(intervalId);
            clearInterval(intervalBoss);
            cancelAnimationFrame(intervalBoss);
            if (pickedPathogen === null) {
                alert('Please pick a pathogen!');
            } else {
                gameScreen();
            };
        });
    });
    document.addEventListener("keydown", (event) => {
        switch (event.keyCode) {
          case 38:
            upArrow = true;
            downArrow = false;
            leftArrow = false;
            rightArrow = false;
            break;
          case 40:
            upArrow = false;
            downArrow = true;
            leftArrow = false;
            rightArrow = false;
            break;
          case 37:
            upArrow = false;
            downArrow = false;
            leftArrow = true;
            rightArrow = false;
            break;
          case 39:
            upArrow = false;
            downArrow = false;
            leftArrow = false;
            rightArrow = true;
            break;
          case 32:
            coughShootAudio.play();
            shooting.push(new Shoot(shootingVirus, mainPlayerBoss.x + 16, mainPlayerBoss.y));
        };
    });
    playBtnStart.forEach(e => {
        e.addEventListener('click', () => {
            //Audios
            gameStartBtnAudio.play();
            //Display page
            splashScreen.style.display = 'none';
            gameOverScreen.style.display = 'none';
            winScreen.style.display = 'none';
            selectPlayerScreen.style.display = 'block';
            gameOver = false;
        });
    });
    playBtnNext.forEach(e => {
        e.addEventListener('click', () => {
            if (gameOver === true){
                //Audios
                gameStartBtnAudio.play();
                gameOverAudio.play();
                // Display page
                highScoreScreen.style.display = 'none';
                splashScreen.style.display = 'none';
                gameOverScreen.style.display = 'block';
            } else {
                //Audios
                gameStartBtnAudio.play();
                winAudio.play();
                //Display page
                highScoreScreen.style.display = 'none';
                splashScreen.style.display = 'none';
                winScreen.style.display = 'block';
            };
        });
    });
    virusBtn.addEventListener('click', () => {
        pickedPathogen = 'virusPl';
        playerSelectAudio.play();
    });
    bacteriaBtn.addEventListener('click', () => {
        pickedPathogen = 'bacteriaPl';
        playerSelectAudio.play();
    });
    nanovirusBtn.addEventListener('click', () => {
        pickedPathogen = 'nanovirusPl';
        playerSelectAudio.play();
    });
    protozoaBtn.addEventListener('click', () => {
        pickedPathogen = 'protozoaPl';
        playerSelectAudio.play();
    });
});