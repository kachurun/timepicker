/*
TimePicker, v0.1.2
Created by Maksim Kachurin, 2015
github.com/kachurun/timepicker
See Demo at kachurun.github.io/timepicker
*/
/* jshint expr: true */
(function( $ ){

    // Template`s
    var template = [    '<div class="timepicker" style="opacity:0">',
                            '<div id="timepicker-time" class="time">',
                                '<span id="timepicker-hour" class="hour"></span>',
                                ':',
                                '<span id="timepicker-minute" class="minute"></span>',
                            '</div>',
                            '<div id="timepicker-canvas" class="canvas">',
                                '<div id="timepicker-faceH" class="faceH"></div>',
                                '<div id="timepicker-faceM" class="faceM"></div>',
                            '</div>',
                        '</div>'
                   ].join('');
    
    var btnsTpl = [    '<div id="timepicker-buttons" class="buttons">',
                                    '<span id="timepicker-cancel-button" class="cancel-button"></span>',
                                    '<span id="timepicker-done-button" class="done-button"></span>',
                                    '</div>'                                        ].join('');
    var amPmTpl = [     '<div id="am_pm" class="am_pm">',
                        '<span id="ampm_button" class="ampm_button"></span>',
                        '</div>'                                                    ].join('');
    
    // Global variations
    var delay = 400,
        dividerIn = 3.5,
        dividerOut = 2.5,
        innerR,outerR;
    
    // Get random ID
    var randomId = function(n){
        return parseInt(n+Math.random()*n);
    };
    
    // Add leading Zero
    var addZero = function(n) {
        n = n.toString();
        return (n.length < 2 && n < 10) ? '0'+n : n;
    };
    
    // Touch screen support for dragging
    var touchSupported = 'ontouchstart' in window,
		mousedownEvent = 'mousedown'+( touchSupported ? ' touchstart' : ''),
		mousemoveEvent = 'mousemove'+( touchSupported ? ' touchmove' : ''),
		mouseupEvent = 'mouseup' + ( touchSupported ? ' touchend' : '');
    
    // Vibrate support
    var vibrate = 'vibrate' in navigator,
        vibrateTimeout;
    
    // startVibrate(lenght, timeout)
    var startVibrate = function(n,t) {
        
        n = n || 50;
        t = t || 150;
        
        clearTimeout(vibrateTimeout);
        vibrateTimeout = setTimeout(function(){
    
            if (vibrate) navigator.vibrate(n);
            
        },t);
    
    };
    
    // Obj Constructor
    var TimePicker = function(e,settings) {
        var obj = this,
            fragment = $(template),
            ampm = $(amPmTpl),
            isInput = e.prop('tagName') === 'INPUT',
            time_h = fragment.find('span#timepicker-hour'),
            time_m = fragment.find('span#timepicker-minute'),
            face_canvas = fragment.find('#timepicker-canvas'),
            face_h = fragment.find('#timepicker-faceH'),
            face_m = fragment.find('#timepicker-faceM'),
			input = isInput ? e : e.find('input'),
            diameter = parseInt(face_canvas.css('width'),10);
        
        this.id = randomId(1000);
        this.time_h = time_h;
        this.time_m = time_m;
        this.face_canvas = face_canvas;
        this.face_h = face_h;
        this.face_m = face_m;
        this.arrow = null;
        this.meridiem = 'AM';
        this.isOpen = false;
        this.isCreated = false;
        this.isRotated = false;
        this.ampm = ampm;
        this.currentView = '';
        this.settings = settings;
        this.input = input;            
        this.fragment = fragment;
        this.e = e;
        
        // Buttons
        if (settings.enable_buttons) {
        
            var btns = $(btnsTpl);
            
            btns.find('#timepicker-done-button')
                .html(settings.done_text)
                .on('click.done_'+this.id,$.proxy(this.done,this));
            
            !settings.always_show && btns.find('#timepicker-cancel-button')
                                            .html(settings.cancel_text)
                                            .on('click.cancel_'+this.id,$.proxy(this.hide,this));
            
            btns.appendTo(fragment);
            
        }
        
        // Twelve Hour AM\PM buttons
        if (settings.twelve_hour) {
            
            ampm.appendTo(fragment.find('#timepicker-time'));
            ampm.find('#ampm_button').html(obj.meridiem)
                                        .on("click.ampm_"+this.id,function(){ 
                obj.meridiem = (obj.meridiem == 'AM') ? 'PM' : 'AM';
                $(this).html(obj.meridiem);
                
            });
            
        }
        
        // Theme tweaks
        
        if (settings.theme == 'dark') {
            fragment.addClass('timepicker-dark');
        }
        
        // Show automatically when "always_show" is used, or event on click\focus to input
        if (settings.always_show) this.show();
        else input.on('click.timepicker_'+this.id+' focusin.timepicker_'+this.id,$.proxy(this.show,this));
        
    };
    
    // Default settings
    TimePicker.default = {
        'time': '06:00',
        'autohide':false,
        'autotogle':true,
        'enable_head':true,
        'enable_buttons':true,
        'always_show':false,
        'twelve_hour':false,
        'position': 'bottom',
        'float':'center',
        'margin': 15,
        'theme':'light',
        'done_text':'Done',
        'cancel_text':'Cancel'
    };
    
    // Show (create) Picker, events for hide by press ESC and space outside picker
    TimePicker.prototype.show = function() {
        this.callback(this.settings.beforeShow);
        var obj = this,
            time = [],
            date;
        
        if (this.isOpen) return;
 
        // Prepare data from input / settings
        if (this.settings.time == 'now') {
        
            date = new Date();
            time[0] = addZero(date.getHours());
            time[1] = addZero(date.getMinutes());
            
            if (this.settings.twelve_hour) {
                
                this.meridiem = (time[0] > 11 ) ? 'PM' : 'AM';
                time[0] = (time[0] > 12 || time[0] === 0) ? Math.abs(time[0]-12) : time[0];
               
            }
        
        } else {
            
            time = this.input.val() || this.settings.time;
            // time from input valid? if not, use default. 12:56, 3:4, 17:55 AM is valid
            if (!/^[0-9]{1,2}:[0-9]{1,2}(?: [A,P]M)?$/.test(time)) time = this.settings.time;
            
            time = time.split(/[\:\ \-]/);
            
            // if meridean set, add to obj
            if (time[2] == 'AM' || time[2] == 'PM') this.meridiem = time[2];
            //CHECK
            // hour > 24
            if (time[0]>24) time[0] -=24;
            // minute > 60
            if (time[1]>60) time[1] -=60;
            // 24-hour, if field in 12h. 02:00 PM = 14:00 
            if (!this.settings.twelve_hour && this.meridiem == 'PM' && time[0] < 13) {
                time[0] = parseInt(time[0]) + 12;
            }
            // 12-hour, if in field 24h. 14:00 = 02:00 PM 
            if (this.settings.twelve_hour && time[0] > 12) {
                time[0] = parseInt(time[0] - 12);
                this.meridiem = 'PM';
            }
            
            time[0] = addZero(time[0]);
            time[1] = addZero(time[1]);
        }
            
        
        if (!this.isCreated) {
            (this.fragment).appendTo('body').addClass("timepicker_"+this.id);
            this.drawNum();
            this.isCreated = true;
            this.time_h.on("click.timeH_"+this.id, $.proxy(this.toggleView,this,'hour',true));
            this.time_m.on("click.timeM_"+this.id, $.proxy(this.toggleView,this,'minute',true));
            $( window ).on('resize.timepicker_'+this.id, $.proxy(this.position,this));
        }
                            
        // make time
        
        this.time_h.html(time[0]);
        this.time_m.html(time[1]);
        this.ampm.find('#ampm_button').html(this.meridiem);
        
        // open hour view
        this.toggleView('hour');
        this.fragment.css({display:'block'}).animate({opacity:'1'},delay);
        this.position();
        this.isOpen = true;
        
        // close if clicked out of the picker
        if (!this.settings.always_show) {
            
            $(document).on('mousedown.document.timepicker_'+this.id,function(e){
                // Click to any location on the screen, except picker and input
                // only if arrow not rotated
                if (!obj.input.is(e.target) && !obj.fragment.is(e.target) && obj.fragment.has(e.target).length === 0 && !obj.isRotated){
                    obj.hide();
                }
            });
            
            // close picker if ESC key is pressed and done if Return is pressed
            $(document).on("keyup", function(e) {
                if (e.keyCode == 27) obj.hide();
                if (e.keyCode == 13) obj.done();
            });
            
        }
    this.callback(this.settings.afterShow);    
    };
    
    // Hide picker, destroy document.mousedown event
    TimePicker.prototype.hide = function(){
        var obj = this;
        this.fragment.animate({opacity:'0'},delay);
        setTimeout(function(){obj.fragment.css({display:'none'});},delay);
        this.isOpen = false;
        $(document).off('mousedown.document.timepicker_'+this.id);
        this.callback(this.settings.afterHide);
    };
    
    // Position relative to the calling element
    TimePicker.prototype.position = function(){
        var
            input = this.input,
            position = this.settings.position,
            float = this.settings.float,
            margin = this.settings.margin,
            iot = input.offset().top,
            iol = input.offset().left,
            iw = input.outerWidth(),
            ih = input.outerHeight(),
            ph = this.fragment.outerHeight(),
            pw = this.fragment.outerWidth(),
            top,
            left;

        switch (position) {
            case 'bottom':
                top = iot + ih + margin;
                break;
            case 'top':
                top = iot - ph - margin;
                break;
            case 'left':
                left = iol - pw - margin;
                break;
            case 'right':
                left = iol + iw + margin;
                break;

            default:
                top = iot + ih + margin;
                break;
        }
        
        switch (float) {
            case 'bottom':
                top = iot;
                break;
            case 'top':
                top = iot - ph + ih;
                break;
            case 'left':
                left = iol;
                break;
            case 'right':
                left = iol - pw + iw;
                break;
            case 'center':
                if (position === 'top' || position === 'bottom') {
                    left = iol + (iw - pw)/2;
                } else {
                    top = iot + (ih - ph)/2;
                }
                break;
            default:
                left = iol + (iw - pw)/2;
                break;
        }
        
        this.fragment.css({'top':top, 'left':left});
    };
    
    // Draw numbers on the dial, create arrow, click and drag event
    TimePicker.prototype.drawNum = function() {
        
        var obj = this,
            width = this.face_canvas.width(),
            height = this.face_canvas.height(),
            width_num = width/8,
            height_num = height/8,
            leftPosition,topPosition,$num,divider,i;
        
        // draw dial hour 12
        if (this.settings.twelve_hour) {
            
            for (i = 1; i < 13; i++) {

                divider = dividerOut;

                topPosition = -Math.cos(i * Math.PI / 6) * height/divider + height/2 - (height_num/2);
                leftPosition = Math.sin(i * Math.PI / 6) * width/divider + width/2 - (width_num/2);

                $num = $('<span data='+i+'>'+i+'</span>').css({'top':topPosition+'px',
                                                'left':leftPosition+'px',
                                                'width':width_num+'px',
                                                'line-height':height_num+'px'
                                                });
                this.face_h.append($num);

            }
            
        // draw dial hour 24
        } else {
            
            for (i = 0; i < 24; i++) {

                divider = (i === 0 || i > 12) ? dividerOut : dividerIn;

                topPosition = -Math.cos(i * Math.PI / 6) * height/divider + height/2 - (height_num/2);
                leftPosition = Math.sin(i * Math.PI / 6) * width/divider + width/2 - (width_num/2);

                $num = $('<span data='+i+'>'+i+'</span>').css({'top':topPosition+'px',
                                                'left':leftPosition+'px',
                                                'width':width_num+'px',
                                                'line-height':height_num+'px'
                                                });
                if (i === 0 || i > 12) $num.addClass('outerH');
                this.face_h.append($num);

            }
            
        }
        // draw dial minutes
        for (i = 0;i < 60; i+=5) {
            
            divider = dividerOut;
            topPosition = -Math.cos(i * Math.PI / 30) * height/divider + height/2 - (height_num/2);
            leftPosition = Math.sin(i * Math.PI / 30) * width/divider + width/2 - (width_num/2);
            $num = $('<span data='+i+'>'+i+'</span>').css({'top':topPosition+'px',
                                            'left':leftPosition+'px',
                                            'width':width_num+'px',
                                            'line-height':height_num+'px'
                                            });
            this.face_m.append($num);
            
        }
        
        // Compute inner, outer radiuses [min,max]
        innerR = [ (width/dividerIn - width_num/2) , (width/dividerIn + width_num/2) ];
        outerR = [ (width/dividerOut - width_num/2), (width/dividerOut + width_num/2) ];
        
        // create arrow and append to obj if not exist
        this.arrow = this.face_canvas.children().is('.arrow') ? this.face_canvas.find('.arrow') : $('<div class="arrow" style="opacity:0"></div>').appendTo(this.face_canvas);
        
        // click or move on canvas event
        this.face_canvas.on(mousedownEvent+".canvas_"+this.id,function(e){
           
            obj.moveArrow(e);
            if (!obj.isRotated) $( document ).on(mousemoveEvent+".document_"+obj.id,$.proxy(obj.moveArrow,obj));
            obj.isRotated = true;
            
        });
        
        $( document ).on(mouseupEvent+".document_"+this.id, function(){
            
            $( document ).off(mousemoveEvent+".document_"+obj.id);
            if (obj.isRotated && obj.settings.autotogle) obj.toggleView('auto');
            obj.isRotated = false;

        });
    };
    
    // rotates the arrow depending on the coordinates of the mouse.
    TimePicker.prototype.moveArrow = function(e){
        e.preventDefault();
        var touch = /^touch/.test(e.type),
            canvas = this.face_canvas,
            width = canvas.width(),
            height = canvas.height(),
            x0,y0,x,y,
            angle,r,on,hour,minute;
        
        x0 = canvas.offset().left + width/2;
        y0 = canvas.offset().top + height/2;
        x = (touch ? e.originalEvent.touches[0] : e).pageX - x0;
        y = (touch ? e.originalEvent.touches[0] : e).pageY - y0;
        r = Math.sqrt(x*x + y*y);
        
        // Click on inner or outer radius?
        if ( r > innerR[0] && r < innerR[1] ) on = 'inner';
        else if ( r > outerR[0] ) on = 'outer';
        else return;
        
        // Calculate the angle, convert to [0; 2pi], takes place on the 90deg (0 top 180 below)
        angle = Math.atan2(y,x) * 180 / Math.PI;
        angle = (angle < 0) ? angle+=360 : angle;
        angle = (angle>270) ? angle - 270 : angle + 90;
        
        if (this.currentView == 'hour' && !this.settings.twelve_hour) {
            
            if (on == 'inner') {
                
                hour = Math.round(angle/30);
                hour = (hour === 0) ? 12 : hour;
                this.drawArrow(innerR[0],'hour',hour);
                
            } else {
                
                hour = Math.round(angle/30)+12;
                hour = (hour == 24 || hour == 12) ?  0 : hour;
                this.drawArrow(outerR[0],'hour',hour);
                
            }
            
            this.time_h.html(addZero(hour));
            
               
        }
        
        else if (this.currentView == 'hour' && this.settings.twelve_hour) {
                             
            hour = Math.round(angle/30);
            hour = (hour === 0 ) ?  12 : hour;
            this.drawArrow(outerR[0],'hour12',hour);
            this.time_h.html(addZero(hour));
            
        }
        
        else if (this.currentView == 'minute') {
            
            minute = Math.round(angle/6);
            minute = (minute == 60) ? 0 : minute;
            this.drawArrow(outerR[0],'minute',minute);
            this.time_m.html(addZero(minute));
         
        }
        
        startVibrate(50,150);

    };
    
    // Redraws the arrow. Called by moveArrow() each time. Vibrate the device
    TimePicker.prototype.drawArrow = function(size,type,num) {
        var 
            factor = 1,
            angle;
        
        if (type == 'angle')  factor = 1;
        if (type == 'hour' || type == 'hour12')   factor = 30;
        if (type == 'minute') factor = 6;
            
        angle = num*factor;
        size = parseInt(size);
        
        this.arrow.css({'margin-top':'-'+size+'px','padding-top':size+'px',transform:'rotate('+angle+'deg)'});
        
    };
    
    // done function. insert the resulting value into input and hide()
    TimePicker.prototype.done = function(){
        var time = this.time_h.html()+":"+this.time_m.html();
        this.settings.twelve_hour ? this.input.val(time+' '+this.meridiem) : this.input.val(time);
        
        if (!this.settings.always_show) this.hide();
        this.callback(this.settings.afterDone);
    };
    
    // toggle view (hour, minute)
    TimePicker.prototype.toggleView = function(newview,isVibrate){
        this.callback(this.settings.beforeToggleView);
        var obj = this,
            hourText = parseInt( this.time_h.html() ),
            minuteText = parseInt( this.time_m.html() ),
            radius;
        
        if (newview == this.currentView) return;
        
        if (isVibrate) startVibrate(50,50);
        
        if (newview == 'toggle') {
            this.currentView == 'hour' ? this.toggleView('minute') : this.toggleView('hour');
        }
        
        if (newview == 'auto') {
            
            if (this.currentView == 'hour') {
                this.toggleView('minute');
            }
            else if (this.currentView == 'minute') {
                if (this.settings.autohide) this.done();
            }
                
            return;
        }
            
        if (newview == 'hour') {
            
            if (this.settings.twelve_hour) {
                radius = outerR;
            } else {
                radius = (hourText > 12) ? outerR : innerR;
            }
            
            // ANIMATIONS
            setTimeout(function() {obj.face_m.css({'z-index':1});
                                   obj.drawArrow(radius, 'hour', hourText);
                                   obj.arrow.animate({opacity:1},delay);
                                  },delay);
            // Minutes View fade out and zoom out
            this.face_m.animate({transform:'scale(5)',
                                 opacity:0},delay);
            this.arrow.animate({opacity:0},delay);
            
            
            // Hour View fade in and zoom in
            this.face_h.css({'z-index':10})
                            .animate({transform:'scale(1)',
                                      opacity:1},delay);
            
            // toggle active class 
            this.time_m.removeClass('active');
            this.time_h.addClass('active');
                   
            this.currentView = 'hour';
        } 
        
        if (newview == 'minute') {
            
            // ANIMATIONS
            setTimeout(function(){obj.face_h.css({'z-index':1});
                                  obj.drawArrow(outerR, 'minute', minuteText);
                                  obj.arrow.animate({opacity:1},delay);
                                 },delay);
            
            // Hour View fade out and zoom out
            this.face_h.animate({transform:'scale(5)',opacity:0},delay);
            this.arrow.animate({opacity:0},delay);
            
            // Minute View fade in and zoom in
            this.face_m.css({'z-index':10})
                            .animate({transform:'scale(1)',
                                      opacity:1},delay);
            
            this.time_h.removeClass('active');
            this.time_m.addClass('active');
            
            this.currentView = 'minute';
        }
     this.callback(this.settings.afterToggleView);
    };
    
    // remove picker
    TimePicker.prototype.destroy = function() {
        this.callback(this.settings.beforeDestroy);
        if (this.isOpen) this.hide();
        
        this.input.off('click.timepicker_'+this.id+' focusin.timepicker_'+this.id);
        $( window ).off('resize.timepicker_'+this.id);

        this.fragment.remove();

        if (this.isCreated) this.fragment.remove();
        this.e.removeData();
        this.callback(this.settings.afterDestroy);
    };
    
    // Callbacks
    TimePicker.prototype.callback = function(cb) {
        if (cb && typeof(cb) === 'function') {
            cb();
        }
    };
    
    // initialize jQuery plugin
    $.fn.timePicker = function( options ) {  
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            var $this = $(this),
                data = $this.data('timepicker');
            
			if (! data) {
				var settings = $.extend({}, TimePicker.default, $this.data(), typeof options == 'object' && options);
				$this.data('timepicker', new TimePicker($this, settings));
			} else {
				if (typeof data[options] === 'function') {
					data[options].apply(data, args);
				}
            }
        }); 
    };
})( jQuery );