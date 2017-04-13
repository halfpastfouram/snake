/**
 * halfpastfour.am/snake
 * @constructor
 */
function Snake()
{
  var self    = this,
      scene   = document.getElementById('scene'),
      context = scene.getContext('2d'),
      dead    = false,
      timeout = null,
      foodPosition,
      score   = 0;

  if (scene.dataset.init) {
    throw new Error("Already instanced!");
  }

  /**
   * The game's settings.
   */
  var settings = {
    canvasSize: {
      width:  520,
      height: 520
    }, pixelSize: {
      width:  20,
      height: 20
    }, startPosition: {
        x: 0,
        y: 0
    }, startLength: 3,
    speed: 500,
    maxSpeed: 200,
    speedIncrement: 5,
    scoreIncrement: 100
  };

  /**
   *  The prototype used for populating the snake's body.
   * @type {{x: number, y: number}}
   */
  var bodyPrototype = { x: 0, y: 0 };

  /**
   *
   * @type {Array}
   */
  var snakeBody = [];

  /**
   * Initialize the game.
   */
  this.init = function() {
    'use strict';

    scene.dataset.init = true;

    window.addEventListener('keydown', keyListener, false);

    // Set the scene dimensions
    scene.width = settings.canvasSize.width;
    scene.height = settings.canvasSize.height;

    // Determine the starting position.
    var maxPixels = {
      x: settings.canvasSize.width / settings.pixelSize.width,
      y: settings.canvasSize.height / settings.pixelSize.height
    };

    settings.startPosition.x = Math.floor((maxPixels.x / 2 ) * settings.pixelSize.width);
    settings.startPosition.y = Math.floor((maxPixels.y / 2 ) * settings.pixelSize.height);

    // Fill the array snakeBody with the desired amount of body parts; first part is its head.
    for (var i=1; i<=settings.startLength; i++) {
      var newBodyPart = new Utils().clone(bodyPrototype);

      newBodyPart.x = settings.startPosition.x;
      newBodyPart.y = settings.startPosition.y + (i * settings.pixelSize.height);
      snakeBody.push(newBodyPart);
    }

    drawScene();
    drawSnake();
    spawnFood();

    // Draw instructions on screen
    context.textAlign = 'center';
    context.font      = settings.pixelSize.height + "px Arial";
    context.fillText('Press ENTER to start', settings.canvasSize.width / 2, settings.canvasSize.height / 2);
  };

  /**
   * Clear the scene of any drawings.
   */
  function clearScene() {
    'use strict';

    context.clearRect(0,0,scene.width,scene.height);
    context.beginPath();
  }

  /**
   * Draw the scene.
   */
  function drawScene() {
    'use strict';

    // Draw a rectangle, the play field.
    context.rect(
      settings.pixelSize.width,
      settings.pixelSize.height,
      settings.canvasSize.width - settings.pixelSize.width * 2,
      settings.canvasSize.height - settings.pixelSize.height * 2
    );

    context.textAlign = 'left';
    context.font = settings.pixelSize.height + "px Arial";
    context.fillText("Score: " + score, settings.pixelSize.width, settings.pixelSize.height-2);
    context.fillText("Length: " + snakeBody.length, settings.canvasSize.width / 2, settings.pixelSize.height-2);

    context.stroke();
  }

  /**
   * Draw the snake body
   */
  function drawSnake() {
    'use strict';

    var length = snakeBody.length;
    for (var i=0; i<length; i++) {
      var currentPart = snakeBody[i];

      context.rect(
        currentPart.x,
        currentPart.y,
        settings.pixelSize.width,
        settings.pixelSize.height
      );
      context.fillRect(
        currentPart.x,
        currentPart.y,
        settings.pixelSize.width,
        settings.pixelSize.height
      );
    }

    context.stroke();
  }

  /**
   * Detect collisions and return details.
   * @param {{x:number, y:number}} newPosition
   * @return {{collision: boolean, collisionType: string}}
   */
  function detectCollision(newPosition)
  {
    'use strict';

    var collisionType;

    // Check borders
    if (newPosition.x < settings.pixelSize.width
      || newPosition.y < settings.pixelSize.height
      || newPosition.x > settings.canvasSize.width - settings.pixelSize.width * 2
      || newPosition.y > settings.canvasSize.height - settings.pixelSize.height * 2
    ) {
      collisionType = 'border';
      die();
    }

    // Check snake body
    var snakeBodyLength = snakeBody.length;
    for (var i=0; i<snakeBodyLength; i++) {
      var currentPart = snakeBody[i];

      if (newPosition.x === currentPart.x && newPosition.y === currentPart.y) {
        collisionType = 'body';
        die();
        break;
      }
    }

    // Check food
    if (foodPosition && foodPosition.x === newPosition.x && foodPosition.y === newPosition.y) {
      collisionType = 'food';
    }

    return {
      collision:     !! collisionType,
      collisionType: collisionType
    };
  }

  /**
   * The current direction the snake should move in.
   * @type {string}
   */
  var direction = 'up';

  /**
   * Calculate new position and move the last body part to the new position.
   */
  this.move = function() {
    'use strict';

    if (dead) return;

    // First, clear the canvas and redraw the scene.
    clearScene();
    drawScene();
    drawFood();

    var currentHead    = snakeBody[0],
        newPosition    = {
          x: currentHead.x,
          y: currentHead.y
        };


    // Calculate the new position coordinates.
    switch (direction) {
      case 'up':
        newPosition.y -= settings.pixelSize.height;
        break;
      case 'down':
        newPosition.y += settings.pixelSize.height;
        break;
      case 'left':
        newPosition.x -= settings.pixelSize.width;
        break;
      case 'right':
        newPosition.x += settings.pixelSize.width;
        break;
      default:
        console.error('Invalid movement direction');
        return;
    }

    // Check collision detection
    var collision = detectCollision(newPosition);

    if (dead) {
      if(confirm("Game over! The snake collided with the " + collision.collisionType + ".\n\nRestart the game?")){
        window.location.reload();
      }
    } else {
      if (collision.collisionType === 'food') {
        // Register that the snake has eaten the food.
        eat();
      }

      // Pop off the last part of the body
      var currentTailEnd = snakeBody.pop();

      // Set new position to the object.
      currentTailEnd.x = newPosition.x;
      currentTailEnd.y = newPosition.y;

      // Move the tail end to the first position in the array.
      snakeBody.unshift(currentTailEnd);
    }

    // Draw the snake.
    drawSnake();
  };

  /**
   * Draw the food on the scene.
   */
  function drawFood() {
    'use strict';

    if(foodPosition) {
      context.fillStyle = '#ffffff';
      context.fillRect(
        foodPosition.x,
        foodPosition.y,
        foodPosition.w,
        foodPosition.h
      );
      context.fillStyle = '#000000';

      context.stroke();
    }
  }

  /**
   * Spawn one food in the scene and destroy the previous one.
   */
  function spawnFood() {
    'use strict';

    var newX = new Utils().range(settings.pixelSize.width, settings.canvasSize.width - settings.pixelSize.width*2),
        newY = new Utils().range(settings.pixelSize.height, settings.canvasSize.height - settings.pixelSize.height*2);

    if (newX < 0) newX *= -1;
    if (newY < 0) newY *= -1;

    // Normalize to grid
    foodPosition = {
      x: Math.ceil(newX / settings.pixelSize.width) * settings.pixelSize.width,
      y: Math.ceil(newY / settings.pixelSize.height) * settings.pixelSize.height,
      w: settings.pixelSize.width,
      h: settings.pixelSize.height
    };

    var snakeBodyLength = snakeBody.length;
    for (var i=0; i<snakeBodyLength; i++) {
      var currentPart = snakeBody[i];
      // Recalculate as long as the new food is underneath the snake's body
      if (foodPosition.x === currentPart.x && foodPosition.y === currentPart.y) {
        spawnFood();
        return;
      }
    }

    drawFood();
  }

  /**
   * Eat food.
   */
  function eat() {
    'use strict';

    // Spawn new food.
    spawnFood();

    // Gain one pixel length.
    var currentTailEnd = snakeBody[snakeBody.length - 1];
    var newTailEnd     = new Utils().clone(bodyPrototype);

    // Copy position from current tail end.
    newTailEnd.x = currentTailEnd.x;
    newTailEnd.y = currentTailEnd.y;

    // Push the new tail end to the end of the body.
    snakeBody.push(newTailEnd);

    // Adjust speed.
    if (settings.speed > settings.maxSpeed + settings.speedIncrement) {
      settings.speed -= settings.speedIncrement;
    }

    console.info("Speed is now", settings.speed);
    if (settings.speed === settings.maxSpeed) {
      console.info("Full speed achieved!");
    }

    score += settings.scoreIncrement;
    drawAll();
  }

  function drawAll() {
    "use strict";
    clearScene();
    drawScene();
    drawSnake();
    drawFood();
  }

  /**
   * Start the game.
   */
  this.start = function() {
      timeout = setTimeout(function(){
        self.move();
        self.start();
      }, settings.speed);
  };

  /**
   * Die like a loser.
   */
  function die() {
    'use strict';
    dead = true;
    clearTimeout(timeout);
  }

  /**
   * Reacts to key press events.
   * @param {Event} event
   */
  function keyListener(event) {
    'use strict';

    switch(event.keyCode) {
      case 87:
      case 38:
        if (direction !== 'down') {
          direction = 'up';
        }
        break;
      case 83:
      case 40:
        if (direction !== 'up') {
          direction = 'down';
        }
        break;
      case 65:
      case 37:
        if (direction !== 'right') {
          direction = 'left';
        }
        break;
      case 68:
      case 39:
        if (direction !== 'left') {
          direction = 'right';
        }
        break;
      case 13:
        self.start();
        break;
      case 27:
        clearTimeout(timeout);
        break;
    }
  }
}

/**
 * Utilities
 * @constructor
 */
function Utils()
{
  'use strict';

  /**
   * http://stackoverflow.com/a/728694/540812
   */
  this.clone = function (obj) {
    if (null === obj || "object" !== typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  };

  /**
   * Generate a random number between the given x and y parameter.
   * @param {number} x
   * @param {number} y
   * @return {number}
   */
  this.range = function(x, y) {
    return Math.floor(Math.random() * y) - x;
  };
}