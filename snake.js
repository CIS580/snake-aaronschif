'use strict';
var oldTime = performance.now();

let controller = new Controller();
controller.attach();
let input = controller.input;


class World {
    constructor() {
        this._actors = [];
        this.canvas = document.createElement('canvas');
        this.canvas.width = 902;
        this.canvas.height = 542;
        this.frontBuffer = this.canvas.getContext('2d');
        let bb = document.createElement('canvas');
        bb.width = this.canvas.width;
        bb.height = this.canvas.height;
        this.backBuffer = bb.getContext('2d');
        this.running = false;
        this.points = 0;
        this.highScore = Number(window.localStorage.highScore) || 0;
    }

    install(id) {
        let elem = document.getElementById(id);
        elem.appendChild(this.canvas);
    }

    tick(newTime) {
        var dt = newTime - oldTime;
        oldTime = newTime;
        this.update(dt);
        this.render();
        if (this.running) {
            window.requestAnimationFrame(this.tick.bind(this));
        }
    }

    start() {
        this.running = true;
        window.requestAnimationFrame(this.tick.bind(this));
    }

    checkCollisions() {
        let points = {};
        this._actors = this._actors.filter((e)=>{return e.remove !== true});
        for (let actor of this._actors) {
            for (let section of actor.sections) {
                let key = section.x + ' ' + section.y;
                points[key] = points[key] || [];
                if (points[key].length !== 0) {
                        // this.endGame();
                        for (let otherActor of points[key]) {
                            actor.onCollision && actor.onCollision({world: this, actor: otherActor});
                            otherActor.onCollision && otherActor.onCollision({world: this, actor: actor});
                        }
                        break;
                    }

                if (section.x < 0 || section.x >= this.canvas.width ||
                    section.y < 0 || section.y >= this.canvas.height) {
                    (actor.onOutOfWorld || (()=>{}))({world: world});
                    break;
                }

                points[key].push(actor);
            }
        }
    }

    update(dt) {
        for (let actor of this._actors) {
            actor.update(dt);
        }

        this.checkCollisions();

        if (Math.random() < .01) {
            // let x = 10 + Math.floor(this.canvas.width / 18) * Math.floor(Math.random() * 18) - 7,
            //     y = 10 + Math.floor(this.canvas.height / 18) * Math.floor(Math.random() * 18) - 7;
            let x = 10 + Math.floor(Math.floor(this.canvas.width / 18) * Math.random()) * 18,
                y = 10 + Math.floor(Math.floor(this.canvas.height / 18) * Math.random()) * 18;
            // console.log(this.canvas.width);
            // console.log({x: x, y: y});
                // y = 10 + Math.floor(this.canvas.height / 18) * 18 - 7;
            // let x = 2 + ,
            //     y = 20;

            this._actors.push(new Apple({x: x, y: y, bad:Math.random()<.1}));
        }

        this.highScore = Math.max(this.points, this.highScore);
        window.localStorage.setItem('highScore', this.highScore);
    }

    render() {
        this.backBuffer.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let actor of this._actors) {
            actor.render(this.backBuffer);
        }
        this.backBuffer.fillStyle = 'rgba(255, 0, 0, 0.8)';
        this.backBuffer.font = '20px badaboom_bbregular'
        this.backBuffer.fillText(this.points + " points / high score : " + this.highScore, 700, 20);
        this.frontBuffer.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.frontBuffer.drawImage(this.backBuffer.canvas, 0, 0);
    }

    endGame() {
        if (this.running === false) return;
        this.running = false;
        window.requestAnimationFrame(()=>{
            // this.frontBuffer.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.backBuffer.fillStyle = 'rgba(255, 0, 0, 0.3)';
            this.backBuffer.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.backBuffer.font = '150px  badaboom_bbregular'
            this.backBuffer.fillText("Game over.", 10, 200);
            this.frontBuffer.drawImage(this.backBuffer.canvas, 0, 0);
        });
    }
}

class Apple {
    constructor(args) {
        let {x, y, bad=false} = args;
        this.remove = false;
        this.size = 4;
        this.bad = bad;
        this.sections = [{x: x, y: y, size: 4}];
    }

    update(dt) {

    }

    render(ctx) {
        let section = this.sections[0];
        ctx.beginPath();
        ctx.arc(section.x, section.y, this.size/2, 0, 2 * Math.PI, false);
        if (this.bad) {
            ctx.fillStyle = 'black';
        } else {
            ctx.fillStyle = 'red';
        }
        ctx.fill();
    }
}

class Snake {
    constructor() {
        this.x = 10;
        this.y = 10;
        this.size = 16;
        this.heading = {x: 0, y: 1};
        this.padding = 2;
        this.tick = 0;
        this.addSections = 2;
        this.sections = [];
    }

    update(dt) {
        this.tick++;

        if (input.up && this.heading.y !== 1) {
            this.heading.y = -1;
            this.heading.x = 0;
        } else if (input.down && this.heading.y !== -1) {
            this.heading.y = 1;
            this.heading.x = 0;
        } else if (input.right && this.heading.x !== -1) {
            this.heading.y = 0;
            this.heading.x = 1;
        } else if (input.left && this.heading.x !== 1) {
            this.heading.y = 0;
            this.heading.x = -1;
        }

        if (this.tick % 8 == 0) {
            this.y += (this.size + this.padding) * this.heading.y;
            this.x += (this.size + this.padding) * this.heading.x;
            this.sections.push({x: this.x, y: this.y, size: this.size});
            if (this.addSections > 0) {
                this.addSections--;
            } else {
                this.sections.shift();
            }
        }
    }

    onCollision(args) {
        let {world, actor} = args;
        if (actor.constructor === Apple) {
            this.addSections ++;
            actor.remove = true;
            if (actor.bad) {
                world.endGame();
            } else {
                world.points++;
            }
            return;
        }
        world.endGame();
    }

    onOutOfWorld(args) {
        let {world} = args;
        world.endGame();
    }

    render(ctx) {
        for (let section of this.sections) {
            ctx.beginPath();
            ctx.arc(section.x, section.y, this.size/2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'green';
            ctx.fill();
        }
    }
}

class Foo {
    constructor() {
        this.ticks = 0;
        this.arcpos = 0;
        this.x = 400;
        this.y = 400;
        this.radius = 30;
        this.clockwise = 1;
        this.size = 6;
        this.sections = [];
    }

    update(dt) {
        this.ticks+=4;

        if (this.ticks % 8 == 0) {
            this.arcpos += this.clockwise/4;
            let p = this.arcpos;

            let x = Math.sin(p)*this.radius+this.x,
                y = Math.cos(p)*this.radius+this.y;
            this.sections.push({x: x, y: y});
            if (this.sections.length > 7) this.sections.shift();
            // ctx.fillRect(x, y, 6, 6);

            if (Math.abs(this.arcpos) > Math.PI*2*Math.random()&& Math.random()>.8) {
                x = Math.sin(p)*2*this.radius+this.x,
                y = Math.cos(p)*2*this.radius+this.y;
                this.clockwise *= -1;
                this.arcpos += Math.PI * this.clockwise;
                this.x = x;
                this.y = y;
            }
        }
    }

    render(ctx) {
        for (let section of this.sections) {
            ctx.beginPath();
            ctx.arc(section.x, section.y, this.size/2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'green';
            ctx.fill();
        }
    }
}

let world = new World();
world.install("gameContainer");
world._actors.push(new Snake());
// world._actors.push(new Foo());
world.start();
