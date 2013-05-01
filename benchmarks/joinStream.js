var levelup = require("levelup");
var levelgraph = require("../");

var tmp = require("tmp");

tmp.dir(function(err, dir) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  var db = levelgraph(levelup(dir));

  var startCounts = 100000;
  var counts = startCounts;

  var startTime;
  var endTime;

  var vertexes = ["a", "b"];

  var doWrites = function() {
    if(--counts === 0) {
      startTime = new Date();
      doReads();
      return;
    }

    var triple = { 
      subject: vertexes[0],
      predicate: "p",
      object: vertexes[1]
    };

    vertexes.pop();
    vertexes.unshift("v" + counts);

    db.put(triple, doWrites);
  };

  var doReads = function() {

    var stream = db.joinStream([{
      subject: db.v("a"),
      predicate: "p",
      object: db.v("b")
    }, {
      subject: db.v("b"),
      predicate: "p",
      object: db.v("c")
    }]);

    stream.on("data", function() {
      counts++;
    });
    stream.on("end", function() {
      endTime = new Date();
      var totalTime = endTime - startTime;
      console.log("total time", totalTime);
      console.log("total data", counts);
      console.log("join result/s", startCounts / totalTime * 1000);
      db.close();
    });
  };

  doWrites();
});
