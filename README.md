# TimePicker

##Simple jquery plugin to select time in android style dial pad

Requires jquery only, work perfectly in all major browsers and IE >9. Also it work with mobile devices.

[See Examples and Demo](http://kachurun.github.io/timepicker/)

![timepicker-light](https://kachurun.github.io/timepicker/assets/light.png) ![timepicker-dark](https://kachurun.github.io/timepicker/assets/dark.png)

## Usage

*   Download from GitHub or install with bower (`bower install timepicker.dial`)
*   Link timepicker.js and timepicker.css to your project
*   Use the .timePicker(); method to connect timepiker to element. Caution! The element must be Input type=text or contain a child input
*   Set picker options using the properties of .timePicker method or data-* HTML5 attributes

```javascript
        $('#example').timePicker({'time':'07:30','position':'left','float':'bottom','autohide':true});
```

```html
<div id="example" data-time="now" data-theme="dark"> 
    <input type="text"/>
</div>    
```

For more details, see examples and options.


## Options

| Option | Default | Available | Description |
| --- | --- | --- | --- |
| time | 06:00 | Default time | |
| autohide | false | true, false | Hide and paste data into input after choosing the minutes |
| autotoggle | true | true, false | Auto toggle view to minutes when hour is select |
| enable_buttons | true | true, false | Enable or Disable buttons |
| always_show | false | true, false | Show timepicker automaticaly and disable hide |
| twelve_hour | false | true, false | Use 12-hour time format |
| position | bottom | top, bottom,left,right | Default timepicker position |
| float | center | center,top,bottom,left,right | Specify the edge of the element which bind picker |
| margin | 15 | | Timepicker margin |
| theme | light | light, dark | Color theme of timepicker |
| done_text | 'Done' | | Set Done button text |
| done_cancel | 'Cancel' | | Set Cancel button text |

## Manual actions

Note! If picker not created, function call will create picker. Not use remove() function twice to avoid problems

| Function | Description |
| --- | --- |
| show() | Show TimePicker |
| hide() | Hide TimePicker |
| destroy() | Destroy TimePicker. Removes all objects, data and layout |
| toggleView(view) | Available view: ('toggle','auto','hour','minute'). 'toggle' change between hour and minutes, 'auto' call done after minute select. |
| position() | Auto adjust timepicker position |

## Callbacks

| Callback | Description |
| --- | --- |
| beforeShow | Before Show |
| afterShow | After Show |
| afterHide | After Hide |
| afterDone | After Done |
| beforeToggleView | Before choose hour or minutes |
| afterToggleView | After choose hour or minutes |
| beforeDestroy | Before remove timepicker |
| afterDestroy | After remove timepicker |
