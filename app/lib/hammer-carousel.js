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
function Carousel(element, bgElement)
{
  var self = this;
  element = $(element);
  bgElement = $(bgElement);

  var container = $(">ul", element);
  var panes = $(">ul>li", element);

  var pane_width = 0;
  var pane_count = panes.length;

  var current_pane = 0;


  /**
   * initial
   */
  this.init = function() {
    setPaneDimensions();

    $(window).on("load resize orientationchange", function() {
      setPaneDimensions();
      //updateOffset();
    })
  };


  /**
   * set the pane dimensions and scale the container
   */
  function setPaneDimensions() {
    pane_width = element.width();
    panes.each(function() {
      $(this).width(pane_width);
    });
    container.width(pane_width * pane_count);
  };


  /**
   * show pane by index
   * @param   {Number}    index
   */
  this.showPane = function(index) {
    // between the bounds
    index = Math.max(0, Math.min(index, pane_count - 1));
    current_pane = index;

    var offset = -((100 / pane_count) * current_pane);

    self.setContainerOffset(container, 1, offset, true);
    self.setContainerOffset(bgElement, 3, offset, true);
  };


  this.setContainerOffset = function(moveingElement, swipeDelta, percent, animate) {
    moveingElement.removeClass("animate");

    var transformedPercent = percent / swipeDelta;

    if(animate) {
      moveingElement.addClass("animate");
    }

    if(Modernizr.csstransforms3d) {
      moveingElement.css("transform", "translate3d(" + transformedPercent + "%,0,0) scale3d(1,1,1)");
    }
    else if(Modernizr.csstransforms) {
      moveingElement.css("transform", "translate(" + transformedPercent + "%,0)");
    }
    else {
      var px = ((pane_width*pane_count) / 100) * transformedPercent;
      moveingElement.css("left", px + "px");
    }
  }

  this.next = function() { return this.showPane(current_pane + 1, true); };
  this.prev = function() { return this.showPane(current_pane - 1, true); };



  this.handleHammer = function(ev) {
    // console.log(ev);
    // disable browser scrolling
    ev.gesture.preventDefault();

    switch(ev.type) {
      case 'dragright':
      case 'dragleft':
        // stick to the finger
        var pane_offset = -(100/pane_count)*current_pane;
        var drag_offset = ((100/pane_width)*ev.gesture.deltaX) / pane_count;

        // slow down at the first and last pane
        if((current_pane == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
            (current_pane == pane_count - 1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
            drag_offset *= .4;
        }

        self.setContainerOffset(container, 1, drag_offset + pane_offset);
        self.setContainerOffset(bgElement, 3, drag_offset + pane_offset);
        break;

      case 'swipeleft':
        self.next();
        ev.gesture.stopDetect();
        break;

      case 'swiperight':
        self.prev();
        ev.gesture.stopDetect();
        break;

      case 'release':
        // more then 50% moved, navigate
        if(Math.abs(ev.gesture.deltaX) > pane_width / 2) {
            if(ev.gesture.direction == 'right') {
                self.prev();
            } else {
                self.next();
            }
        }
        else {
            self.showPane(current_pane, true);
        }
        break;
    }
  }

  element.hammer({ drag_lock_to_axis: true })
    .on("release dragleft dragright swipeleft swiperight", self.handleHammer);
}