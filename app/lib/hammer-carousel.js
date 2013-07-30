

var debug_el = $("#debug");
function debug(text) {
  debug_el.text(text);
}

/**
 * requestAnimationFrame and cancel polyfill
 */
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame =
      window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },
        timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());



/**
* super simple carousel
* animation between panes happens with css transitions
*/
function Carousel(element, horizontalBgElement, verticalBgElement)
{
  var self = this;
  element = $(element);
  horizontalBgElement = $(horizontalBgElement);
  verticalBgElement = $(verticalBgElement);

  var horizontalContainer = $(">ul.horizontal", element);
  var horizontalPanes = $(">ul.horizontal>li", element);
  var verticalContainer = $(">ul.vertical", element);
  var verticalPanes = $(">ul.vertical>li", element);

  var horizontalPaneWidth = 0;
  var horizontalPaneCount = horizontalPanes.length;
  var verticalPaneHeight = 0;
  var verticalPaneCount = verticalPanes.length;

  var currentHorizontalPane = 0;
  var currentVerticalPane = 0;

  /**
   * initial
   */
  this.init = function() {
    setPaneDimensions();

    $(window).on("load resize orientationchange", function() {
      setPaneDimensions();
      //updateOffset();
    })

    self.showHorizontalPane(1, false);
  };

  /**
   * set the pane dimensions and scale the horizontalContainer
   */
  function setPaneDimensions() {
    horizontalPaneWidth = element.width();
    horizontalPanes.each(function() {
      $(this).width(horizontalPaneWidth);
    });
    horizontalContainer.width(horizontalPaneWidth * horizontalPaneCount);

    verticalPaneHeight = element.height();
    verticalPanes.each(function() {
      $(this).height(verticalPaneHeight);
    });
    verticalContainer.height(verticalPaneHeight * verticalPaneCount);
  };

  /**
   * show pane by index
   * @param   {Number}    index
   */
  this.showHorizontalPane = function(index, isAnimate) {
    // between the bounds
    isAnimate = typeof isAnimate !== 'undefined' ? isAnimate : true;
    index = Math.max(0, Math.min(index, horizontalPaneCount - 1));
    currentHorizontalPane = index;

    var offset = -((100 / horizontalPaneCount) * currentHorizontalPane);

    self.setContainerOffset(horizontalContainer, 1, true, offset, isAnimate);
    self.setContainerOffset(horizontalBgElement, 1.5, true, offset, isAnimate);
  };

  this.showVerticalPane = function(index) {
    // between the bounds
    index = Math.max(0, Math.min(index, verticalPaneCount - 1));
    currentVerticalPane = index;

    var offset = -((100 / verticalPaneCount) * currentVerticalPane);

    self.setContainerOffset(verticalContainer, 1, false, offset, true);
    self.setContainerOffset(verticalBgElement, 1.5, false, offset, true);
  };

  this.setContainerOffset = function(movingElement, swipeDelta, horizontal, percent, animate) {
    movingElement.removeClass("animate");

    var transformedPercent = percent / swipeDelta;

    if(animate) {
      movingElement.addClass("animate");
    }

    if(Modernizr.csstransforms3d) {
      if (horizontal) {
        movingElement.css("transform", "translate3d(" + transformedPercent + "%, 0, 0) scale3d(1, 1, 1)");
      } else {
        movingElement.css("transform", "translate3d(0, " + transformedPercent + "%, 0) scale3d(1, 1, 1)");
      }
    }
    else if(Modernizr.csstransforms) {
      if (horizontal) {
        movingElement.css("transform", "translate(" + transformedPercent + "%, 0)");
      } else {
        movingElement.css("transform", "translate(0, " + transformedPercent + "%)");
      }
    }
    else {
      if (horizontal) {
        var px = ((horizontalPaneWidth * horizontalPaneCount) / 100) * transformedPercent;
        movingElement.css("left", px + "px");
      }
      else {
        var px = ((verticalPaneHeight * verticalPaneCount) / 100) * transformedPercent;
        movingElement.css("top", px + "px");
      }
    }
  }

  this.nextHorizontal = function() { return this.showHorizontalPane(currentHorizontalPane + 1, true); };
  this.prevHorizontal = function() { return this.showHorizontalPane(currentHorizontalPane - 1, true); };
  this.nextVertical = function() { return this.showVerticalPane(currentVerticalPane + 1, true); };
  this.prevVertical = function() { return this.showVerticalPane(currentVerticalPane - 1, true); };

  this.handleHammer = function(ev) {
    // console.log(ev);
    // disable browser scrolling
    ev.gesture.preventDefault();

    switch(ev.type) {
      // horizontal gestures
      case 'dragright':
      case 'dragleft':
        if(currentVerticalPane !== 0) {
          break;
        }
        // stick to the finger
        var pane_offset = -(100 / horizontalPaneCount) * currentHorizontalPane;
        var drag_offset = ((100 / horizontalPaneWidth) * ev.gesture.deltaX) / horizontalPaneCount;

        // slow down at the first and last pane
        if((currentHorizontalPane == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
            (currentHorizontalPane == horizontalPaneCount - 1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
            drag_offset *= .4;
        }

        self.setContainerOffset(horizontalContainer, 1, true, drag_offset + pane_offset);
        self.setContainerOffset(horizontalBgElement, 1.5, true, drag_offset + pane_offset);
        break;

      case 'swipeleft':
        if(currentVerticalPane !== 0) {
            break;
          }
        self.nextHorizontal();
        ev.gesture.stopDetect();
        break;

      case 'swiperight':
        if(currentVerticalPane !== 0) {
            break;
          }
        self.prevHorizontal();
        ev.gesture.stopDetect();
        break;

      // vertical gestures
      case 'dragup':
      case 'dragdown':
        if (currentHorizontalPane === 1) {
          var pane_offset = -(100 / verticalPaneCount) * currentVerticalPane;
          var drag_offset = ((100 / verticalPaneHeight) * ev.gesture.deltaY) / verticalPaneCount;

          // slow down at the first and last pane
          if((currentVerticalPane == 0 && ev.gesture.direction == Hammer.DIRECTION_UP) ||
            (currentVerticalPane == verticalPaneCount - 1 && ev.gesture.direction == Hammer.DIRECTION_DOWN)) {
            drag_offset *= .4;
          }
          self.setContainerOffset(verticalContainer, 1, false, drag_offset + pane_offset);
          self.setContainerOffset(verticalBgElement, 1.5, false, drag_offset + pane_offset);
        }
        break;

      case 'swipeup':
        if(currentHorizontalPane === 1) {
          self.nextVertical();
          ev.gesture.stopDetect();
        }
        break;

      case 'swipedown':
        if(currentHorizontalPane === 1) {
          self.prevVertical();
          ev.gesture.stopDetect();
        }
        break;

      case 'release':
        var direction = ev.gesture.direction;
        // horizontal diraction
        if (direction == Hammer.DIRECTION_LEFT || direction == Hammer.DIRECTION_RIGHT) {
          if (currentVerticalPane === 0) {
            // more then 50% moved, navigate
            if(Math.abs(ev.gesture.deltaX) > horizontalPaneWidth / 2) {
              if(direction == Hammer.DIRECTION_RIGHT) {
                self.prevHorizontal();
              } else {
                self.nextHorizontal();
              }
            }
            else {
              self.showHorizontalPane(currentHorizontalPane, true);
            }
          }
        }
        else { // vertical diraction
          if (currentHorizontalPane === 1) {
            // more then 50% moved, navigate
            if(Math.abs(ev.gesture.deltaY) > verticalPaneHeight / 2) {
              if(direction == Hammer.DIRECTION_DOWN) {
                self.prevVertical();
              } else {
                self.nextVertical();
              }
            }
            else {
              self.showVerticalPane(currentVerticalPane, true);
            }
          }
        }
        break;
    }
  }

  element.hammer({ drag_lock_to_axis: true })
    .on("release dragleft dragright dragup dragdown swipeleft swiperight swipeup swipedown", self.handleHammer);
}


