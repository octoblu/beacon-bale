var noble = require('noble');

// only scan for devices advertising these service UUID's (default or empty array => any peripherals
var serviceUuids = ['b1a6752152eb4d36e13e357d7c225466'];

// allow duplicate peripheral to be returned (default false) on discovery event
var allowDuplicates = false;

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning(serviceUuids, allowDuplicates);
  } else {
    noble.stopScanning();
  }
});



noble.on('discover', function(peripheral) {
  peripheral.connect(function(error) {
    console.log('connected to peripheral: ' + peripheral.uuid);
    peripheral.discoverServices(['b1a6752152eb4d36e13e357d7c225466'], function(error, services) {
      //console.log("SERVICES:", services);
      var baleService = services[0];
      console.log('discovered Bale service');

      baleService.discoverCharacteristics(['4b842c60ddd611e38b680800200c9a66'], function(error, characteristics) {
        var baleLevelCharacteristic = characteristics[0];
        console.log('discovered Bale count characteristic');

        baleLevelCharacteristic.on('read', function(data, isNotification) {
          console.log('bale count is: ', data.toString() );
        });

        // true to enable notify
        baleLevelCharacteristic.notify(true, function(error) {
          console.log('bale level notification on');
        });
      });
    });
  });
});
