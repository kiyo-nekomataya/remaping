/**
 * Longpress is a jQuery plugin that makes it easy to support long press
 * events on mobile devices and desktop borwsers.
 *
 * @name longpress
 * @version 0.1.2
 * @requires jQuery v1.2.3+
 * @author Vaidik Kapoor
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, check out the README at:
 * http://github.com/vaidik/jquery-longpress/
 *
 * Copyright (c) 2008-2013, Vaidik Kapoor (kapoor [*dot*] vaidik -[at]- gmail [*dot*] com)
 * コード追加修正 ボタンダウンポイントを記録して一定以下の移動量ならムーブ時の動作キャンセルを行わない機能を追加 2023 1103 
 */

(function($) {
    $.fn.longpress = function(longCallback, shortCallback, duration, range) {
        if (typeof duration == "undefined") {
            duration = 500;
        }
        if (typeof range == "undefined") {
            range    = 2;
        }

        return this.each(function() {
            var $this = $(this);

            // to keep track of how long something was pressed
            var mouse_down_time;
            var mouse_down_point = [0,0];
            var timeout;

            // mousedown or touchstart callback
            function mousedown_callback(e) {
                mouse_down_time = new Date().getTime();
                mouse_down_point = [e.clientX,e.clientY];
                var context = $(this);

                // set a timeout to call the longpress callback when time elapses
                timeout = setTimeout(function() {
                    if (typeof longCallback === "function") {
                        longCallback.call(context, e);
                    } else {
                        $.error('Callback required for long press. You provided: ' + typeof longCallback);
                    }
                }, duration);
            }

            // mouseup or touchend callback
            function mouseup_callback(e) {
                var press_time = new Date().getTime() - mouse_down_time;
                if (press_time < duration) {
                    // cancel the timeout
                    clearTimeout(timeout);

                    // call the shortCallback if provided
                    if (typeof shortCallback === "function") {
                        shortCallback.call($(this), e);
                    } else if (typeof shortCallback === "undefined") {
                        ;
                    } else {
                        $.error('Optional callback for short press should be a function.');
                    }
                }
            }

            // cancel long press event if the finger or mouse was moved
            function move_callback(e) {
                if(
                    (Math.abs(mouse_down_point[0]-e.clientX) > range)||
                    (Math.abs(mouse_down_point[1]-e.clientY) > range)
                ) clearTimeout(timeout);
            }
            // Pointer Support
            $this.on('pointerdown', mousedown_callback);
            $this.on('pointerup', mouseup_callback);
            $this.on('pointermove', move_callback);

            // Browser Support
            $this.on('mousedown', mousedown_callback);
            $this.on('mouseup', mouseup_callback);
            $this.on('mousemove', move_callback);

            // Mobile Support
            $this.on('touchstart', mousedown_callback);
            $this.on('touchend', mouseup_callback);
            $this.on('touchmove', move_callback);
        });
    };
}(jQuery));
