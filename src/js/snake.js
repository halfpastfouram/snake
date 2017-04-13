/**
 *
 *
 * @constructor
 */
function Snake()
{
  var self = this,
      scene = document.getElementById('scene'),
      context = scene.getContext('2d');

  /**
   * The technical settings
   */
  var settings = {
    canvasSize: {
      width: 500,
      height: 500
    }, pixelSize: {
      width: 20,
      height: 20
    }, startPosition: {
        x: 0,
        y: 0
    }, startLength: 3
  };

  var bodyPrototype = { x: 0, y: 0 },
      snakeBody = [];

  this.getSnakeBody = function(){
    'use strict'
    return snakeBody;
  };

  /**
   * Initialize the game
   */
  this.init = function() {
    'use strict'
    console.log('Initializing...');

    // Set the scene dimensions
    scene.width = settings.canvasSize.width;
    scene.height = settings.canvasSize.height;

    // Determine the starting position
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

    context.stroke();
  };

  function clearScene() {
    'use strict'
    context.clearRect(0,0,scene.width,scene.height);
    context.beginPath();
  }

  /**
   * Draw the scene
   */
  function drawScene() {
    'use strict'
    console.log('Drawing scene...');

    // Draw a rectangle, the play field.
    context.rect(
      settings.pixelSize.width,
      settings.pixelSize.height,
      settings.canvasSize.width - settings.pixelSize.width * 2,
      settings.canvasSize.height - settings.pixelSize.height * 2
    );
  }

  /**
   * Draw the snake body
   */
  function drawSnake() {
    'use strict'
    console.log('Drawing snake...');

    var length = snakeBody.length;
    for (var i=0; i<length; i++) {
      var currentPart = snakeBody[i];

      context.rect(
        currentPart.x,
        currentPart.y,
        settings.pixelSize.width,
        settings.pixelSize.height
      );
    }
  }

  var directionOptions = [
    'up',
    'down',
    'left',
    'right'
  ];

  this.direction = directionOptions[0];

  /**
   * Calculate new position and move the last body part to the new position
   */
  this.move = function() {
    'use strict'

    // First, clear the canvas and redraw the scene
    clearScene();
    drawScene();

    var currentHead    = snakeBody[0],
        currentTailEnd = snakeBody.pop(),
        newPosition    = {
          x: currentHead.x,
          y: currentHead.y
        };

    switch (self.direction) {
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

    currentTailEnd.x = newPosition.x;
    currentTailEnd.y = newPosition.y;
    console.log('New position:', newPosition);

    // Move the tail end to the first position in the array
    snakeBody.unshift(currentTailEnd);

    drawSnake();
    context.stroke();
  }
}

function Utils()
{
  'use strict'

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
  }
}

window.addEventListener('load', function(){
  'use strict'
  window.Snake = new Snake();
  window.Snake.init();
});