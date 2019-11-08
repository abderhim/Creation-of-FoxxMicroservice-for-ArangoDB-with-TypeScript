
const arangochair = require('arangochair');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
server.listen(3000);

app.use(express.static(__dirname));


const no4 = new arangochair('http://root:root@127.0.0.1:8529/my_test_db');
console.log(no4);
no4.subscribe({collection:'myFoxxCollectionts'});
no4.start();
no4.on('myFoxxCollectionts', (doc, type) => {
    console.log(doc);
    console.log(type);
   // let doc1 = JSON.parse(doc);
  //  console.log(type);
   // console.log(doc);
    io.sockets.emit(type, doc);
});


no4.on('error', (err, httpStatus, headers, body) => {
    // arangochair stops on errors
    // check last http request
    no4.start();
});
