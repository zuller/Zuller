/**
* super simple carousel
* animation between panes happens with css transitions
*/
function VerticalCarousel(element)
{
  var self = this;
  var carouselEnable;

  element = $(element);
  var container = $(">ul", element);
  var panes = $(">ul>li", element);

  var pane_height = 0;
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
    self.enable()
  };

  /**
   * set the pane dimensions and scale the container
   */
  function setPaneDimensions() {
    pane_height = element.height();
    panes.each(function() {
      $(this).height(pane_height);
    });
    container.height(pane_height * pane_count);
  };

  /**
   * show pane by index
   * @param   {Number}    index
   */
  this.showPane = function(index, animate) {
    // between the bounds
    animate = typeof animate !== 'undefined' ? animate : true;
    index = Math.max(0, Math.min(index, pane_count - 1));
    current_pane = index;

    var offset = -((100 / pane_count)*current_pane);
    setContainerOffset(offset, animate);
  };

  this.showCurrentPane = function() {
    self.showPane(current_pane, true);
  }

  function setContainerOffset(percent, animate) {
    container.removeClass("animate");

    var transformedPercent = percent;

    if(animate) {
      container.addClass("animate");
    }

    if(Modernizr.csstransforms3d) {
      container.css("transform", "translate3d(0," + transformedPercent + "%,0) scale3d(1,1,1)");
    }
    else if(Modernizr.csstransforms) {
      container.css("transform", "translate(0," + transformedPercent + "%)");
    }
    else {
      var px = ((pane_height * pane_count) / 100) * transformedPercent;
      container.css("top", px + "px");
    }
  }

  this.next = function() { return this.showPane(current_pane+1, true); };
  this.prev = function() { return this.showPane(current_pane-1, true); };

  function handleHammer(ev) {
    // disable browser scrolling
    ev.gesture.preventDefault();

    if (!carouselEnable) {
      if (ev.type === 'release') {
        self.showPane(current_pane, true);
      }
      return;
    }
    switch(ev.type) {
      case 'dragup': {}
      case 'dragdown': {
        // stick to the finger
        var pane_offset = -(100 / pane_count) * current_pane;
        var drag_offset = ((100 / pane_height) * ev.gesture.deltaY) / pane_count;

        // slow down at the first and last pane
        if((current_pane == 0 && ev.gesture.direction == Hammer.DIRECTION_DOWN) ||
          (current_pane == pane_count - 1 && ev.gesture.direction == Hammer.DIRECTION_UP)) {
          drag_offset *= .1;
        }

        setContainerOffset(drag_offset + pane_offset);
        break;
      }

      case 'swipedown': {
        self.prev();
        ev.gesture.stopDetect();
        break;
      }

      case 'swipeup': {
        self.next();
        ev.gesture.stopDetect();
        break;
      }

      case 'release': {
        // more then 50% moved, navigate
        if(Math.abs(ev.gesture.deltaY) > pane_height / 2) {
          if(ev.gesture.direction == Hammer.DIRECTION_UP) {
            self.next();
          } else if(ev.gesture.direction == Hammer.DIRECTION_DOWN) {
            self.prev();
          }
          else {
            self.showPane(current_pane, true);
          }
        }
        else {
          self.showPane(current_pane, true);
        }
        break;
      }
    }
  }


  element.hammer({ drag_lock_to_axis: true })
    .on("release dragdown dragup swipedown swipeup", handleHammer);

  this.enable = function() {
    carouselEnable = true;
  }

  this.disable = function() {
    carouselEnable = false;
  }
}
