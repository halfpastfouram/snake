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
    }
  };

  /**
   * Initialize the game
   */
  this.init = function(){
    'use strict'
    console.log('Initializing...');

    scene.width = settings.canvasSize.width;
    scene.height = settings.canvasSize.height;

    drawScene();

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();
  };

  /**
   * Handle the resize event
   */
  function onWindowResize() {
    console.log("Handling resize event...");
  }

  /**
   * Draw the scene
   */
  function drawScene(){
    'use strict'
    console.log('Drawing scene...');

    context.rect(
      settings.pixelSize.width,
      settings.pixelSize.height,
      settings.canvasSize.width - settings.pixelSize.width * 2,
      settings.canvasSize.height - settings.pixelSize.height * 2
    );
    context.stroke();
  }
}

window.addEventListener('load', function(){
  'use strict'
  window.Snake = new Snake();
  window.Snake.init();
});