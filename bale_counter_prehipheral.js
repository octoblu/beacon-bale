var bleno = require('bleno');

var SERVICE_UUID = 'b1a6752152eb4d36e13e357d7c225466';
var CHAR_UUID = '4b842c60ddd611e38b680800200c9a66';
var DEVICE_NAME = 'BaleCounter';

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);
  if (state === 'poweredOn') {
    bleno.startAdvertising(DEVICE_NAME,[SERVICE_UUID]);
  } else {
    bleno.stopAdvertising();
  }
});

var value = 0;
var prev;

// Changing value here
setInterval(function() {
  //  test = value + " Bales";
  console.log(value);
  prev = value;
  value++;


}, 1000);

// changing value

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
                if(value != prev){
                  console.log("Sent");
                  prev = value;
                  // Sending a buffer with the value and a string attached
                  // to anyone listening to broadcast
                  updateValueCallback(new Buffer(value + " bales"));
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
