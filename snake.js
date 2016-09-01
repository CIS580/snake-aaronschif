'use strict';
var frontBuffer = document.getElementById('snake');
var frontCtx = frontBuffer.getContext('2d');
var backBuffer = document.createElement('canvas');
backBuffer.width = frontBuffer.width;
backBuffer.height = frontBuffer.height;
var backCtx = backBuffer.getContext('2d');
var oldTime = performance.now();

let controller = new Controller();
controller.attach();
let input = controller.input;

class Snake {
    constructor() {
        this.x = 18;
        this.y = 18;
        this.size = 16;
        this.padding = 2;
        this.tick = 0;
        this.sections = [{x: this.x, y: this.y*2}, {x: this.x, y: this.y}];
    }

    update(dt) {
        let hasMoved = false;
        this.tick++;
        if (this.tick % 8 == 0) {
            if (input.up) {
                hasMoved = true;
                this.y -= this.size + this.padding;
            }
            if (input.right) {
                hasMoved = true;
                this.x += this.size + this.padding;
            }
            if (input.left) {
                hasMoved = true;
                this.x -= this.size + this.padding;
            }
            if (input.down) {
                hasMoved = true;
                this.y += this.size + this.padding;
            }
        }
        if (hasMoved) {
            this.sections.push({x: this.x, y: this.y});
            this.sections.shift();
        }
    }

    render(ctx) {
        // ctx.fillRect(this.x, this.y, this.size, this.size)
        for (let section of this.sections) {
            ctx.beginPath();
            ctx.arc(section.x, section.y, this.size/2, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'green';
            ctx.fill();
            // ctx.fillRect(section.x, section.y, this.size, this.size);
        }
    }
}

let snake = new Snake();


function loop(newTime) {
  var elapsedTime = newTime - oldTime;
  oldTime = newTime;

  update(elapsedTime);
  render(elapsedTime);

  frontCtx.clearRect(0, 0, backBuffer.width, backBuffer.height);
  frontCtx.drawImage(backBuffer, 0, 0);

  window.requestAnimationFrame(loop);
}

function update(elapsedTime) {

    snake.update(elapsedTime);
  // TODO: Spawn an apple periodically
  // TODO: Grow the snake periodically
  // TODO: Move the snake
  // TODO: Determine if the snake has moved out-of-bounds (offscreen)
  // TODO: Determine if the snake has eaten an apple
  // TODO: Determine if the snake has eaten its tail
  // TODO: [Extra Credit] Determine if the snake has run into an obstacle

}

function render(elapsedTime) {
  backCtx.clearRect(0, 0, backBuffer.width, backBuffer.height);

  snake.render(backCtx);
}

window.requestAnimationFrame(loop);
