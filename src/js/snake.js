/**
 * halfpastfour.am/snake
 * @constructor
 */
function Snake()
{
  var self    = this,
      canvas  = document.getElementById('scene'),
      scene,
      camera,
      light,
      renderer,
      dead    = false,
      timeout,
      foodPosition,
      score   = 0;

  if (canvas.dataset.init) {
    throw new Error("Already instanced!");
  }

  var cameraSettings = {
    fieldOfView: 75,
    aspectRatio: window.innerWidth / window.innerHeight,
    near: 1,
    far: 1000
  };

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
        y: 0,
        z: 0
    }, startLength: 3,
    speed: 500,
    maxSpeed: 50,
    speedIncrement: 5,
    scoreIncrement: 100
  };

  /**
   *  The prototype used for populating the snake's body.
   * @type {{x: number, y: number, z: number}}
   */
  var bodyPrototype = { x: 0, y: 0, z: 0 };

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

    canvas.dataset.init = true;

    // Add event listeners
    window.addEventListener('keydown', keyListener, false);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('mousemove', onMouseMove, false);

    // Setup the scene, camera and a renderer
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      cameraSettings.fieldOfView,
      cameraSettings.aspectRatio,
      cameraSettings.near,
      cameraSettings.far
    );

    // Set camera position
    camera.position.z = 500;
    camera.lookAt({x: 0, y:0, z:0 });
    scene.add(camera);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({canvas: canvas, alpha: true});
    renderer.shadowMap.enabled = true;

    drawScene();
    addLighting();

    // Fill the array snakeBody with the desired amount of body parts; first part is its head.
    for (var i=1; i<=settings.startLength; i++) {
      var newBodyPart = new Utils().clone(bodyPrototype);

      newBodyPart.x = settings.startPosition.x;
      newBodyPart.y = settings.startPosition.y + (i * settings.pixelSize.height);
      newBodyPart.z = 100;
      snakeBody.push(newBodyPart);
    }

    drawSnake();

    onWindowResize();
    render();
    return;

    // Determine the starting position.
    var maxPixels = {
      x: settings.canvasSize.width / settings.pixelSize.width,
      y: settings.canvasSize.height / settings.pixelSize.height
    };

    settings.startPosition.x = Math.floor((maxPixels.x / 2 ) * settings.pixelSize.width);
    settings.startPosition.y = Math.floor((maxPixels.y / 2 ) * settings.pixelSize.height);
    spawnFood();

    // Draw instructions on screen
    context.textAlign = 'center';
    context.font      = settings.pixelSize.height + "px Arial";
    context.fillText('Press ENTER to start', settings.canvasSize.width / 2, settings.canvasSize.height / 2);
  };

  /**
   * Render
   */
  function render() {
    requestAnimationFrame(render);

    renderer.render(scene, camera);
  }

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
    var field = new THREE.Mesh(
      new THREE.BoxGeometry(520, 520, 20),
      new THREE.MeshLambertMaterial({color: 0xeeeeee, transparent: true, opacity: 5})
    );

    field.receiveShadow = true;
    scene.add(field);

    var loader = new THREE.FontLoader();
    loader.load( 'js/fonts/Rubik Black_Regular.json', function ( font ) {
      var scoreGeometry = new THREE.TextGeometry("Score: " + score, {
        font: font,
        size: 20,
        height: 15
      });

      var scoreElement = new THREE.Mesh(
        scoreGeometry,
        new THREE.MeshPhysicalMaterial({color: 0x999999})
      );

      scoreElement.position.x = -260;
      scoreElement.position.y = 260;
      scoreElement.position.z = 0;
      scoreElement.castShadow = true;
      scoreElement.receiveShadow = true;

      scene.add(scoreElement);

      var lengthGeometry = new THREE.TextGeometry("Length: " + snakeBody.length, {
        font: font,
        size: 20,
        height: 15
      });

      lengthGeometry.align = 'right';

      var lengthElement = new THREE.Mesh(
        lengthGeometry,
        new THREE.MeshPhysicalMaterial({color: 0x999999})
      );

      lengthElement.position.x = 120;
      lengthElement.position.y = 260;
      lengthElement.position.z = 0;
      lengthElement.castShadow = true;
      lengthElement.receiveShadow = true;

      scene.add(lengthElement);
    });
  }

  /**
   * Add lighting to the scene
   */
  function addLighting() {
    console.log("Adding lighting...");

    // Add a directional light
    light = new THREE.DirectionalLight(0xffffff, .50);
    light.position.z = 500;
    light.castShadow = true;
    scene.add(light);

    // scene.add(new THREE.CameraHelper(light.shadow.camera));
  }

  /**
   * Set the camera and light position.
   * @param {object} coords
   */
  function setCameraPosition(coords) {
    // Adjust camera
    camera.position.x = -coords.x / 100;
    camera.position.y = coords.y / 100;
    camera.lookAt({x: 0, y: 0, z: 0});

    // Adjust light
    light.position.x = -coords.x / 50;
    light.position.y = coords.y / 50;
  }

  /**
   * Handle the resize event
   */
  function onWindowResize() {
    console.log("Handling resize event...");

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Mouse position storage
   * @type {{x: number, y: number}}
   */
  var currentMousePos = {x: 0, y: 0};

  /**
   * Handle the mouse move event
   * @param {Event} event
   */
  function onMouseMove(event) {
    currentMousePos.x = event.clientX - window.innerWidth / 2;
    currentMousePos.y = event.clientY - window.innerHeight / 2;

    setCameraPosition(currentMousePos);
  }

  /**
   * Draw the snake body
   */
  function drawSnake() {
    'use strict';

    var length = snakeBody.length;
    for (var i=0; i<length; i++) {
      var currentPart = snakeBody[i];

      var newElement = new THREE.Mesh(
        new THREE.BoxGeometry(20, 20, 20),
        new THREE.MeshLambertMaterial({color: 0x999999})
      );

      newElement.position.x = currentPart.x;
      newElement.position.y = currentPart.y;
      newElement.position.z = currentPart.z;
      scene.add(newElement);
    //
    //   context.lineJoin = true;
    //   context.rect(
    //     currentPart.x,
    //     currentPart.y,
    //     settings.pixelSize.width,
    //     settings.pixelSize.height
    //   );
    //   context.fillRect(
    //     currentPart.x,
    //     currentPart.y,
    //     settings.pixelSize.width,
    //     settings.pixelSize.height
    //   );
    }

    // context.stroke();
    // context.strokeStyle = '#000000';
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

    // If spawned outside of the top or left border, place it at the border.
    if (newX < settings.pixelSize.width) newX = settings.pixelSize.width;
    if (newY < settings.pixelSize.height) newY = settings.pixelSize.height;

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
  function start() {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      self.move();
      start();
    }, settings.speed);
  }

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
        if (!timeout) {
          start();
        }
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