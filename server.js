var express = require('express');
var app = express();

app.get('/wiki/:title', require('./app/index'));
app.get('*', function(req, res) {
    res.sendFile(__dirname + '/app/index.html');
});

app.listen(process.env.PORT || 8000, process.env.IP || 'localhost', function() {
    console.log("Express server is up");
})