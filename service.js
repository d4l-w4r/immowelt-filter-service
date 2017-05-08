// Node dependencies
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const _ = require('underscore');

// Local dependencies
const store = require('./storage/store');
const filter = require('./filter');


// configuration
var app = express();
var storeObj = new store.Store();
var filterObj = new filter.CriteriaFilter(storeObj);
var filterTasks = [];


app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

// routes
// add a new subscriber and start populating its filter
app.post('/api/subscriber/subscribe', function(req, res) {
  var id = req.body.subscriberId;
  storeObj.addEntry({'id': id, 'resultQueue': []});
  scheduleFilterTask(id);
  res.json({"status": {"state": "success", "message": ""}, "data": []});
});

var scheduleFilterTask = function(subscriberId) {
  var delay3Minutes = 10 * 1000 * 3;
  filterObj.filter(subscriberId);
  //TODO: send filter criteria in body and pass them here
  var filterTask = setInterval(filterObj.filter, delay3Minutes, subscriberId);
  filterTasks.push({'id': subscriberId, 'filterTask': filterTask});
};

// get filtered result queue for subscriber
app.get('/api/subscriber/:subscriberId/results', function(req, res) {
  var filterTask = _.findIndex(filterTasks, function (task) {
    return task['id'] == req.params['subscriberId'];
  });
  if (filterTask >= 0) {
    res.json({"status": {"state": "success", "message": ""}, "data": storeObj.getEntry(req.params['subscriberId'])['resultQueue']});
  } else {
    res.json({"status": {"state": "failed", "message": "You are not currently subscribed to receive news."}, "data": []})
  }

});

// unsubscribe from this subscribers filter task
app.put('/api/subscriber/:subscriberId/unsubscribe', function(req, res) {
  console.log("Stop filtering for subscriberId " + req.params['subscriberId']);
  var filterIndex = _.findIndex(filterTasks, function(task) { return task['id'] == req.params['subscriberId'] });
  clearInterval(filterTasks[filterIndex]['filterTask']);
  filterTasks = _.without(filterTasks, filterTasks[filterIndex]);
  res.json({"status": {"state": "success", "message": ""}, "data": []});
});

// start
app.listen(1235);
console.log("Filter service running on http://localhost:1235");
