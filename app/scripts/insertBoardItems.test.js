var inserter = require('./insertBoardItems');
var fs = require('fs');

fs.readFile('testFiles/lines1.csv', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }

  inserter.insertBoardItems(data);
});

