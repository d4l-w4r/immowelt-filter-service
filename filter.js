const _ = require('underscore');
const request = require('request');

const areas = {
	"byName": {
		"Alsterdorf": ["20251", "22297", "22335", "22337"],
		"Altona-Altstadt": ["20357", "20359", "22765", "22767", "22769"],
		"Altona-Nord": ["20257", "20357", "22765", "22769"],
		"Bahrenfeld": ["22525", "22605", "22607", "22761", "22769"],
		"Barmbek-Nord": ["22297", "22303", "22305", "22307", "22309"],
		"Barmbek-Süd": ["22081", "22083", "22085", "22305"],
		"Borgfelde": ["20535", "20537"],
		"Dulsberg": ["22049"],
		"Eilbek": ["22087", "22089"],
		"Eimsbüttel": ["20144", "20253", "20255", "20257", "20259", "20357", "22525", "22527", "22769"],
		"Eppendorf": ["20249", "20251", "22529"],
		"Groß Borstel": ["22297", "22335", "22453", "22529"],
		"Groß Flottbek": ["22605", "22607", "22609"],
		"HafenCity": ["20457", "20539"],
		"Hamburg-Altstadt": ["20095", "20099", "20457", "20459"],
		"Hamm": ["20537", "20535", "22087", "22089", "20537"],
		"Hammerbrook": ["20097", "20537"],
		"Harvesthude": ["20144", "20146", "20148", "20149", "20249", "20253"],
		"Hoheluft-Ost": ["20144", "20249", "20251", "20253"],
		"Hoheluft-West": ["20253", "20255", "22529"],
		"Hohenfelde": ["22087", "22089"],
		"Kleiner Grasbrook": ["20457", "20539"],
		"Klostertor": ["20095", "20097", "20457"],
		"Lokstedt": ["20253", "20255", "22527", "22529"],
		"Marienthal": ["22041", "22043", "22089"],
		"Neustadt": ["20354", "20355", "20359", "20457", "20459"],
		"Othmarschen": ["22605", "22607", "22609", "22763"],
		"Ottensen": ["22763", "22765", "22767"],
		"Rothenburgsort": ["20539"],
		"Rotherbaum": ["20144", "20146", "20148", "20149", "20354", "20357"],
		"Sankt Georg": ["20095", "20097", "20099"],
		"Sankt Pauli": ["20354", "20355", "20357", "20359", "20459", "22767", "22769"],
		"Sternschanze": ["20357"],
		"Uhlenhorst": ["22081", "22085", "22087"],
		"Veddel": ["22539", "21109"],
		"Wandsbek": ["22041", "22047", "22049", "22089"],
		"Wilhelmsburg": ["20539", "21107", "21109"],
		"Winterhude": ["20249", "22297", "22299", "22301", "22303", "22305"]
	},
	"byZip": {
		"20099": "Sankt Georg",
		"20251": "Hoheluft-Ost",
		"22609": "Othmarschen",
		"22453": "Groß Borstel",
		"22607": "Othmarschen",
		"22605": "Othmarschen",
		"22305": "Winterhude",
		"20095": "Sankt Georg",
		"20097": "Sankt Georg",
		"20357": "Eimsbüttel",
		"20355": "Sankt Pauli",
		"20354": "Rotherbaum",
		"22299": "Winterhude",
		"22529": "Hoheluft-West",
		"22527": "Eimsbüttel",
		"22297": "Groß Borstel",
		"20359": "Sankt Pauli",
		"22525": "Eimsbüttel",
		"21107": "Wilhelmsburg",
		"22303": "Winterhude",
		"20253": "Hoheluft-West",
		"22767": "Sankt Pauli",
		"20257": "Eimsbüttel",
		"20255": "Hoheluft-West",
		"22081": "Barmbek-Süd",
		"21109": "Veddel",
		"22083": "Barmbek-Süd",
		"22301": "Winterhude",
		"22085": "Barmbek-Süd",
		"22307": "Barmbek-Nord",
		"22087": "Hamm",
		"20459": "Sankt Pauli",
		"22089": "Hamm",
		"22309": "Barmbek-Nord",
		"20537": "Hamm",
		"22761": "Bahrenfeld",
		"20535": "Hamm",
		"22763": "Othmarschen",
		"20146": "Rotherbaum",
		"22765": "Altona-Altstadt",
		"20144": "Eimsbüttel",
		"20457": "Hamburg-Altstadt",
		"22769": "Eimsbüttel",
		"20148": "Rotherbaum",
		"20149": "Rotherbaum",
		"20539": "Wilhelmsburg",
		"22047": "Wandsbek",
		"20259": "Eimsbüttel",
		"22041": "Wandsbek",
		"22043": "Marienthal",
		"22049": "Dulsberg",
		"20249": "Hoheluft-Ost",
		"22337": "Alsterdorf",
		"22539": "Veddel",
		"22335": "Groß Borstel"
	}
};

module.exports.CriteriaFilter = function(storeObj) {

  var resultStore = storeObj;

  var getRawData = function() {
    return new Promise(function(resolve, reject) {

      request("http://localhost:1234/api/entries", (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }
        if (response.statusCode !== 200) {
          reject(`Invalid response: ${response.statusCode}`);
          return;
        }

        resolve(JSON.parse(body));
      });
    });
  };

  var isPriceInBudget = function(parameters, base, total) {
    var checkTotal = !_.isNull(total);
    if (checkTotal) {
      return total < parameters['maxRent'];
    }
    return base < parameters['maxRent'];
  }

  var entrySatisfiesCriteria = function(entry, parameters) {
    return entry['rooms'] >= parameters["minRooms"] && isPriceInBudget(parameters, entry['rentBase'], entry['rentTotal']) && _.contains(_.keys(areas['byZip']), entry['postalCode']);
  }

  this.filter = function(subscriberId, criteria = {"maxRent": 1900, "minRooms": 4}) {
		console.log("Start filtering for subscriberId: " + subscriberId);
    getRawData().then(function(data) {
      var filteredData = _.filter(data, function(entry) { return entrySatisfiesCriteria(entry, criteria); });
			console.log("Found " + filteredData.length + " items matching criteria");
      storeObj.updateResultQueue(subscriberId, filteredData)
    }).catch(
    function(error) {
      console.log(error);
      return;
    });
  };
};
