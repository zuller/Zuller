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
function HorizontalCarousel(element, bgElement, verticalCarousel)
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

    self.showPane(1, false);
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
  this.showPane = function(index, animate) {
    animate = typeof animate !== 'undefined' ? animate : true;

    // between the bounds
    index = Math.max(0, Math.min(index, pane_count - 1));
    current_pane = index;

    if (current_pane === 1) {
      verticalCarousel.enable()
    } else {
      verticalCarousel.disable()
    }

    var offset = -((100 / pane_count) * current_pane);

    self.setContainerOffset(container, 1, offset, animate);
    self.setContainerOffset(bgElement, 1.5, offset, animate);
  };

  this.setContainerOffset = function(movingElement, swipeDelta, percent, animate) {
    movingElement.removeClass("animate");

    var transformedPercent = percent / swipeDelta;

    if(animate) {
      movingElement.addClass("animate");
    }

    if(Modernizr.csstransforms3d) {
      movingElement.css("transform", "translate3d(" + transformedPercent + "%, 0, 0) scale3d(1, 1, 1)");
    }
    else if(Modernizr.csstransforms) {
      movingElement.css("transform", "translate(" + transformedPercent + "%, 0)");
    }
    else {
      var px = ((pane_width * pane_count) / 100) * transformedPercent;
      movingElement.css("left", px + "px");
    }
  }

  this.next = function() { return this.showPane(current_pane + 1, true); };
  this.prev = function() { return this.showPane(current_pane - 1, true); };

  function handleHammer(ev) {
    // disable browser scrolling
    ev.gesture.preventDefault();

    switch(ev.type) {
      // horizontal gestures
      case 'dragright': {}
      case 'dragleft': {
        // stick to the finger
        var pane_offset = -(100 / pane_count) * current_pane;
        var drag_offset = ((100 / pane_width) * ev.gesture.deltaX) / pane_count;

        // slow down at the first and last pane
        if((current_pane == 0 && ev.gesture.direction == Hammer.DIRECTION_RIGHT) ||
            (current_pane == pane_count - 1 && ev.gesture.direction == Hammer.DIRECTION_LEFT)) {
            drag_offset *= .4;
        }

        self.setContainerOffset(container, 1, drag_offset + pane_offset);
        self.setContainerOffset(bgElement, 1.5, drag_offset + pane_offset);
        break;
      }

      case 'swipeleft': {
        verticalCarousel.showCurrentPane()
        self.next();
        ev.gesture.stopDetect();
        break;
      }

      case 'swiperight': {
        verticalCarousel.showCurrentPane()
        self.prev();
        ev.gesture.stopDetect();
        break;
      }

      case 'release': {
        // more then 50% moved, navigate
        if(Math.abs(ev.gesture.deltaX) > pane_width / 2) {
          if(ev.gesture.direction == Hammer.DIRECTION_RIGHT) {
            self.prev();
          } else if(ev.gesture.direction == Hammer.DIRECTION_LEFT) {
            self.next();
          } else {
            self.showPane(current_pane, true);
          }
        } else {
          self.showPane(current_pane, true);
        };
        break;
      }
    }
  }

  element.hammer({ drag_lock_to_axis: true })
    .on("release dragleft dragright swipeleft swiperight", handleHammer);
}
