
var five = require("johnny-five");
var board = new five.Board();
var bleno = require('bleno');

var SERVICE_UUID = 'b1a6752152eb4d36e13e357d7c225466';
var CHAR_UUID = '4b842c60ddd611e38b680800200c9a66';
var DEVICE_NAME = 'BaleCounter';

var bales = 0;
var prev;

board.on("ready", function() {
  // Assuming a button is attached to pin 9

  var encoder0Pos = 0;
  var encoder0PinALast = 0;
  var n = 0;
  var b;
  var oldPos = 0;
  var count = 0;
  this.pinMode(4, five.Pin.INPUT);
  this.pinMode(5, five.Pin.INPUT);
  this.digitalRead(4, function(value) {
    console.log("pin 4: ", value);
    b = value;
  });
  this.digitalRead(5, function(value) {
    console.log("pin 5: ", value);
    n = value;
  });

  this.loop(5, function() {

    if ((encoder0PinALast == 0) && (n == 1)) {
      if (b == 0) {
        encoder0Pos--;
        count --;
      } else {
        encoder0Pos++;
        count++;
      }

    }

    encoder0PinALast = n;
    if(encoder0Pos != oldPos){
      console.log("position", encoder0Pos);
    }

    oldPos = encoder0Pos;

    if(count == 20){
      count = 0;
      prev = bales;
      bales++;
      //console.log("CHRISTIAN HAS BALED : ", bales);
    }


  });


});


bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);
  if (state === 'poweredOn') {
    bleno.startAdvertising(DEVICE_NAME,[SERVICE_UUID]);
  } else {
    bleno.stopAdvertising();
  }
});


bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
  if (!error) {
    console.log("set services");
    bleno.setServices([
      new bleno.PrimaryService({
        uuid : SERVICE_UUID,
        characteristics : [
          new bleno.Characteristic({
            uuid : CHAR_UUID,
            properties : ['notify'],
            onSubscribe : function(maxValueSize, updateValueCallback) {
              // check on interval if the value changed
              setInterval(function() {
                if(bales != prev){
                  console.log("Sent");
                  prev = value;
                  // Sending a buffer with the value and a string attached
                  // to anyone listening to broadcast
                  updateValueCallback(new Buffer(bales + " bales"));
                }
              }, 900);
              // close interval
            }
          })

        ]
      })
    ]);
  }
});
