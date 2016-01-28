'use strict';

angular.module('hog')
    .service('Pig',
        function (socketFactory)
        {
            /*var pig = socketFactory()
            pig.forward('error');
            pig.ioSocket = io.connect('localhost:9000/api/pigs');
           
            pig.prefix = 'pig-';*/
             var myIoSocket = io.connect('localhost:9000/api/pigs');

              var pig = socketFactory({
                ioSocket: myIoSocket
              });
            return pig;
  });
