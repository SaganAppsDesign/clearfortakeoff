var router = require("express").Router();
var restler = require("restler");
var request = require("request");
var predictor = require("../R-integration/flight-predict");
var _ = require("underscore");

// var key_backup = 'christikaes'
// var secret_backup = 'bf80780c69a92619b60df68ed730e4ba45b01df1'

var fxml_url = "http://flightxml.flightaware.com/json/FlightXML2/";
var username = "sugaroverflow";
var apiKey = '321682929bae540c26ce3ff63cd0f1021748db1c';

function findClosestFlight(time, flightArray) {
	// filter on actualdeparturetime = 0		
	var flightsThatHaveNotLeftYet = _.filter(flightArray, function(fl) {
		return fl.actualdeparturetime == 0;
	});

	return _.min(flightsThatHaveNotLeftYet, function(fl) {
		return fl.filed_departuretime;
	});
}

function createWundergroudUrl(flight) {
    var date = convertUnixToDate(flight.filed_departuretime)
    var datesplit = date.split('/');
    var year = datesplit[0];
    var month = datesplit[1];
    var day = datesplit[2];

    //https://www.wunderground.com/history/airport/KLAX/%202016,25,4/CustomHistory.html?dayend=4&monthend=25&yearend=2016&format=1
    //https://www.wunderground.com/history/airport/KLAX/2016/4/23/CustomHistory.html?dayend=23&monthend=4&yearend=2016&format=1
    var wunderground_api = "https://www.wunderground.com/history/airport/";
    var airport_code= flight.destination;
    var date_url = "/" + date + "/";
    var more_url = "CustomHistory.html";
    var day_url = "?dayend=" + day;
    var month_url = "&monthend=" + month;
    var year_url = "&yearend=" + year;
    var finish_url = "&format=1";
    var query = airport_code + date_url + more_url + day_url + month_url + year_url + finish_url;
    return wunderground_api + query;
}

router.get('/:flightnumber', function(req, res) {
    restler.get(fxml_url + "FlightInfo", {
        username: username,
        password: apiKey,
        query: { 
            ident: req.params.flightnumber
        }
    }).on("success", function(f_result, f_response) {
        // flight#
        // origin => IATA
        // destination => IATA
        // pass in weather data as well

        //to find the closest flight time
        //get the current time
        var closestFlight = findClosestFlight(current_time(), f_result.FlightInfoResult.flights);
        var wundergroundUrl = createWundergroudUrl(closestFlight);
        console.log(closestFlight);
        console.log(wundergroundUrl);
       	request(wundergroundUrl, function(error, response, body) {
           predictor({
               flightNumber: req.params.flightnumber,
               origin: f_result.FlightInfoResult.flights[0].origin,
               destination: f_result.FlightInfoResult.flights[0].destination
           }, function(output) {
               res.send(output);
           });

       		// if (error) console.log(error);
       		// console.log(body);
       	});
/*
         predictor({
             flightNumber: req.params.flightnumber,
             origin: f_result.FlightInfoResult.flights[0].origin,
             destination: f_result.FlightInfoResult.flights[0].destination
         }, function(output) {
             res.send(output);
         });

	         */
    });
});

//find current time

function current_time(){
  var date = new Date();
  return date
}
//find the closest date




function convertUnixToDate(unix_time) {
    // console.log(unix_time)
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    var date = new Date(unix_time * 1000);
    // console.log(date)

    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();

    var formattedTime = year + '/' + month + '/' + day;
    // console.log(formattedTime)
    return formattedTime

}

module.exports = router;
