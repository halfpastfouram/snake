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

  var bodyPrototype = { x: 0, y: 0, drawn: false },
      snakeBody = [];

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

      if (! currentPart.drawn) {
        console.log(
          "Drawing body part",
          currentPart
        );
        context.rect(
          currentPart.x,
          currentPart.y,
          settings.pixelSize.width,
          settings.pixelSize.height
        );
      }
    }
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