const fs = require('fs');
const _ = require('underscore')


/*
* Quick and dirty "database" implementation based on a json file as backend.
* Supports simply adding and deleting of entries
*/
module.exports.Store = function() {
  /* Private fields */
  var storePath = "./storage/storage.json";
  var store = {};

  /*Private methods*/
  var saveDB = function() {
    fs.writeFile(storePath, JSON.stringify(store), function (err) {
      if (err) return console.log(err);
    });
  };

  var initDB = function() {
    store = {'db': {}, 'iterator': []};

    if (fs.existsSync(storePath)) {
      data = fs.readFileSync(storePath, {"encoding": "utf8"});
      if (data != "") {
        store = JSON.parse(data);
      }
    }
    saveDB();
  }();

  var writeEntry = function (entry) {
    store.db[entry['id']] = entry;
    store.iterator.push(entry);
  }

  var updateEntry = function(entry) {
    store.db[entry['id']] = entry;
  }

  /* Public methods */
  this.getStorage = function() {
    return store;
  };

  this.addEntry = function(entry) {
    _id = entry['id'];
    if(_.has(store.db, _id)) {
      console.log("Subscriber already exists!");
      return;
    } else {
      writeEntry(entry);
    }
    saveDB();
  };

  this.updateResultQueue = function(id, results) {
    var storedEntry = store.db[id];
    var newEntries = _.chain(results).reject(function(element) {
      return _.contains(_.pluck(storedEntry['resultQueue'], 'id'), element['id']);
    }).value();
    storedEntry['resultQueue'] = _.union(storedEntry['resultQueue'], newEntries);
    saveDB();
  }

  this.getEntry = function(id) {
    return JSON.parse(JSON.stringify(store.db[id]));
  }
};
