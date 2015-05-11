(function( $ ){

    var template = [    '<div id="timepicker" style="opacity:0">',
                            '<div id="timepicker-time">',
                                '<span id="timepicker-hour"></span>',
                                ':',
                                '<span id="timepicker-minute"></span>',
                            '</div>',
                            '<div id="timepicker-canvas">',
                                '<div id="timepicker-faceH"></div>',
                                '<div id="timepicker-faceM"></div>',
                            '</div>',
                        '</div>'].join('');
    
    var dividerIn = 3.5,
        dividerOut = 2.5,
        innerR,outerR;
    
    var randomId = function(n){
        return parseInt(n+Math.random()*n);
    }
    
    var addZero = function(n) {
        return (n < 10) ? '0'+n : n;
    }
    
    var TimePicker = function(e,settings) {
        var obj = this,
            fragment = $(template),
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
        this.arrow;
        this.isOpen = false;
        this.isCreated = false;
        this.currentView = '';
        this.settings = settings;
        this.input = input;            
        this.fragment = fragment;
        

        
        // make buttons
        if (!settings.autohide) {
            var btnsTpl = [    '<div id="timepicker-buttons">',
                                    '<span id="timepicker-cancel-button"></span>',
                                    '<span id="timepicker-done-button"></span>',
                                '</div>'
                            ].join('');
            btns = $(btnsTpl);
            if (!settings.always_show) btns.find('#timepicker-cancel-button')
                                            .html(settings.cancelText)
                                            .on('click.cancel_'+this.id,$.proxy(this.toggle,this,'hide'));
            btns.find('#timepicker-done-button')
                .html(settings.doneText)
                .on('click.done_'+this.id,$.proxy(this.done,this));
            btns.appendTo(fragment);
        }
   
        // Show automatically when "always_show" is used, or event on input-click
        if (settings.always_show) this.show();
        else input.on('click.timepicker_'+this.id+' focusin.timepicker_'+this.id,$.proxy(this.show,this));

    }
    
    TimePicker.default = {
        'default_time': '06:00',
        'autohide':false,
        'always_show':false,
        'position': 'bottom',
        'float':'center',
        'margin': 15,
        'theme':'light',
        'doneText':'Done',
        'cancelText':'Cancel'
    }
    
    TimePicker.prototype.show = function() {
        var 
            time = this.input.val() ? this.input.val().split(':') : this.settings.default_time.split(':');
        
        if (this.isOpen) {
            return;
        }
        
        if (!this.isCreated) {
            (this.fragment).appendTo('body').addClass("timepicker_"+this.id);
            this.drawNum();
            this.isCreated = true;
            this.time_h.on("click.timeH_"+this.id, $.proxy(this.toggleView,this,'hour'));
            this.time_m.on("click.timeM_"+this.id, $.proxy(this.toggleView,this,'minute'));
            $( window ).on('resize.timepicker_'+this.id, $.proxy(this.position,this));
        }
                            
        // make time
        
        this.time_h.html(time[0]);
        this.time_m.html(time[1]);
        
        //display automaticaly if always_show key setted
        // enable close only if always_show not setted
        if (!this.settings.always_show) {
            
            $(document).on('click.document.timepicker_'+this.id,function(e){
                // click on document, no input, picker
                if (!this.input.is(e.target) && !this.fragment.is(e.target)
                      && this.fragment.has(e.target).length === 0){
                    this.hide();
                }
            }.bind(this));
            
        }
        
        this.toggleView('hour');
        this.fragment.css({display:'block'}).animate({opacity:'1'},500);
        this.position();
        this.isOpen = true;
        
    }
    
    TimePicker.prototype.hide = function(){
        
        this.fragment.animate({opacity:'0'},500);
        setTimeout(function(){this.fragment.css({display:'none'});}.bind(this),500)
        this.isOpen = false;
        $(document).off('click.document.timepicker_'+this.id);
        
    }
    
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
        };
        
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
        };
        
        this.fragment.css({'top':top, 'left':left});
    }
    
    TimePicker.prototype.drawNum = function() {
        var width = this.face_canvas.width(),
            height = this.face_canvas.height(),
            width_num = width/10,
            height_num = height/10,
            leftPosition,topPosition,$num,divider;
        // draw
        for (var i = 0; i < 24; i++) {
            divider = (i == 0 || i > 12) ? dividerOut : dividerIn;
            
            topPosition = -Math.cos(i * Math.PI / 6) * height/divider + height/2 - (height_num/2);
            leftPosition = Math.sin(i * Math.PI / 6) * width/divider + width/2 - (width_num/2);
                        
            $num = $('<span data='+i+'>'+i+'</span>').css({'top':topPosition+'px',
                                            'left':leftPosition+'px',
                                            'width':width_num+'px',
                                            'line-height':height_num+'px'
                                            });
            if (i == 0 || i > 12) $num.addClass('outerH');
            this.face_h.append($num).css({'display':'none'});
            
        }
        for (var i = 0;i < 60; i+=5) {
            divider = 2.5;
            topPosition = -Math.cos(i * Math.PI / 30) * height/divider + height/2 - (height_num/2);
            leftPosition = Math.sin(i * Math.PI / 30) * width/divider + width/2 - (width_num/2);
            $num = $('<span data='+i+'>'+i+'</span>').css({'top':topPosition+'px',
                                            'left':leftPosition+'px',
                                            'width':width_num+'px',
                                            'line-height':height_num+'px'
                                            });
            this.face_m.append($num).css({display:'none'});
        }
        
        // Set radiuses
        innerR = [ (width/dividerIn - width_num/2) , (width/dividerIn + width_num/2) ];
        outerR = [ (width/dividerOut - width_num/2), (width/dividerOut + width_num/2) ];
        
        // create arrow and append to obj if not exist
        this.arrow = this.face_canvas.children().is('#arrow') ? this.face_canvas.find('#arrow') : $('<div id="arrow" style="opacity:0"></div>').appendTo(this.face_canvas);
        
        // click or move on canvas event
        this.face_canvas.on("mousedown.canvas_"+this.id,function(e){
            e.preventDefault();
            this.moveArrow(e);
            this.face_canvas.on("mousemove.canvas_"+this.id,$.proxy(this.moveArrow,this));
        }.bind(this));
        
        this.face_canvas.on("mouseup.canvas_"+this.id, function(){
                this.face_canvas.off("mousemove.canvas_"+this.id);
                this.toggleView('auto');
        }.bind(this));
    }
    
    TimePicker.prototype.moveArrow = function(e){
        var 
            canvas = this.face_canvas,
            width = canvas.width(),
            height = canvas.height(),
            x0,y0,x,y,
            angle,r,on,hour,minute;
            
        x0 = canvas.offset().left + width/2;
        y0 = canvas.offset().top + height/2;
        x = e.pageX - x0;
        y = e.pageY - y0;
        r = Math.sqrt(x*x + y*y);
        
        
        // Нажатия по большому, или малому радиусу?
        if ( r > innerR[0] && r < innerR[1] ) on = 'inner';
        else if ( r > outerR[0] && r < outerR[1] ) on = 'outer';
        else return;
        
        // Вычисляем угол, преобразуем к [0;2pi], разворачиваем на 90deg (0 сверху, 180 снизу)
        angle = Math.atan2(y,x) * 180 / Math.PI;
        angle = (angle < 0) ? angle+=360 : angle;
        angle = (angle>270) ? angle - 270 : angle + 90;
        
        if (this.currentView == 'hour') {
            
            if (on == 'inner') {
                
                hour = Math.round(angle/30);
                hour = (hour == 0) ? 12 : hour;
                this.drawArrow(innerR[0],'hour',hour);
                
            } else {
                
                hour = Math.round(angle/30)+12;
                hour = (hour == 24 || hour == 12) ?  0 : hour;
                this.drawArrow(outerR[0],'hour',hour);
            }
            
            this.time_h.html(addZero(hour));
            
        } else
        if (this.currentView == 'minute') {
            
            if (on == 'outer') {
                minute = Math.round(angle/6);
                minute = (minute == 60) ? 0 : minute;
                this.drawArrow(outerR[0],'minute',minute);
                this.time_m.html(addZero(minute));
                
                
            }            
            
        }
        
    }
    
    TimePicker.prototype.drawArrow = function(size,type,num) {
        var 
            factor = 1,
            angle;
        
        if (type == 'angle')  factor = 1;
        if (type == 'hour')   factor = 30;
        if (type == 'minute') factor = 6;
            
        angle = num*factor;
        size = parseInt(size);
        
        this.arrow.css({'margin-top':'-'+size+'px','padding-top':size+'px',transform:'rotate('+angle+'deg)'});

    }
    
    TimePicker.prototype.done = function(){
        var time = this.time_h.html()+":"+this.time_m.html();
        this.input.val(time);
        
        if (this.settings.always_show) return;
                
        this.hide();
    }
    
    TimePicker.prototype.toggleView = function(newview){
        var hourText = parseInt( this.time_h.html() ),
            minuteText = parseInt( this.time_m.html() ),
            delay = 400,
            radius;
        
        if (newview == this.currentView) return;
        
        if (newview == 'auto') {
            if (this.currentView == 'hour') this.toggleView('minute');
            else if (this.currentView == 'minute') {
                this.settings.autohide && this.done();
            }
                
            
        }
            
        if (newview == 'hour') {
            radius = (hourText > 12) ? outerR : innerR;
            
            // ANIMATIONS
            setTimeout(function() {this.face_m.css({display:'none'});
                                   this.drawArrow(radius, 'hour', hourText);
                                   this.arrow.animate({opacity:1},delay);
                                  }.bind(this),delay);
            // Minutes View fade out and zoom out
            this.face_m.animate({transform:'scale(5)',
                                 opacity:0},delay);
            this.arrow.animate({opacity:0},delay);
            
            
            // Hour View fade in and zoom in
            this.face_h.css({display:'block'})
                            .animate({transform:'scale(1)',
                                      opacity:1},delay);
            
            // toggle active class 
            this.time_m.removeClass('active');
            this.time_h.addClass('active');
                   
            this.currentView = 'hour';
        } 
        
        if (newview == 'minute') {
            
            // ANIMATIONS
            setTimeout(function(){this.face_h.css({display:'none'});
                                  this.drawArrow(outerR, 'minute', minuteText);
                                  this.arrow.animate({opacity:1},delay);
                                 }.bind(this),delay);
            
            // Hour View fade out and zoom out
            this.face_h.animate({transform:'scale(5)',opacity:0},delay);
            this.arrow.animate({opacity:0},delay);
            
            // Minute View fade in and zoom in
            this.face_m.css({display:'block'})
                            .animate({transform:'scale(1)',
                                      opacity:1},delay);
            
            this.time_h.removeClass('active');
            this.time_m.addClass('active');
            
            this.currentView = 'minute';
        }
        
        
    }
    
    $.fn.timePicker = function( options ) {  
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            var $this = $(this),
                data = $this.data('timepicker');
            
			if (! data) {
				var settings = $.extend({}, TimePicker.default, $this.data(), typeof options == 'object' && options);
				$this.data('clockpicker', new TimePicker($this, settings));
			} else {
				if (typeof data[option] === 'function') {
					data[option].apply(data, args);
				}
            }
        }); 
    };
})( jQuery );