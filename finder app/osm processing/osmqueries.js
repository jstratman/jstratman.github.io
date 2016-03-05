var exec = require('child_process').exec,
    child, child2;
var turf = require('./libs/turf.js');
var fs = require('fs');
var playgroundIn; 
 

var firstStep = function() {
var q = new Array();
//q[0] = 'query-overpass queries/playground_center.ql >geojson/playground_center.geojson';
//q[1] = 'query-overpass queries/playground_poly.ql >geojson/playground_poly.geojson';
//q[2] = 'query-overpass queries/picnic_tables.ql >geojson/picnic_tables.geojson';
//q[3] = 'query-overpass queries/toilets_center.ql >geojson/toilets_center.geojson';
q[0] = 'query-overpass queries/all_center.ql >geojson/all_center.geojson';
q[1] = 'query-overpass queries/all_poly.ql >geojson/all_poly.geojson';

/* original method
for (var i = 0; i < q.length; i++) {


};
*/

function hello() {
    var index = 0;
	var counter = 1;

    function loadQ() {
        if (index < q.length) {
            
              child = exec(q[index], {maxBuffer: 1024 * 2500},
   function (error, stdout, stderr) {
	    
       if (error !== null) {
            console.log('exec error: ' + error);
       }
	   console.log(counter+" query complete");
	   if (counter < q.length) {
	     console.log(counter);
	     ++counter;
	   } else if (counter = q.length) {
	     console.log('the end' + counter);
	     secondStep(); //call second function
	   }
	   
 });
			index = index + 1;
			loadQ();
        }
		
    }
    loadQ();
	
};
hello();


/*
 child = exec(q[0], {maxBuffer: 1024 * 2500},
 function (error, stdout, stderr) {
 playgroundIn = stdout;
    // console.log(playgroundIn);
   //  console.log('stderr: ' + stderr);
   console.log('playground_center complete');
     if (error !== null) {
          console.log('exec error: ' + error);
     }
	 secondStep();
 });

child = exec(q[1], {maxBuffer: 1024 * 2500},
 function (error, stdout, stderr) {
	 console.log('playground_poly complete');
     if (error !== null) {
          console.log('exec error: ' + error);
     }
 });
 */
 
 };
 // Still need to time the writing of the geojson to the execution of the parsing!

var secondStep = function(){

var playground_center = JSON.parse(fs.readFileSync('./geojson/playground_center.geojson', 'utf8'));
//var playground = JSON.parse(fs.readFileSync('./geojson/playground_center.geojson', 'utf8'));
var playground_poly = JSON.parse(fs.readFileSync('./geojson/playground_poly.geojson', 'utf8'));
var picnic_tables = JSON.parse(fs.readFileSync('./geojson/picnic_tables.geojson', 'utf8'));
var toilets_center = JSON.parse(fs.readFileSync('./geojson/toilets_center.geojson', 'utf8'));
var all_center = JSON.parse(fs.readFileSync('./geojson/all_center.geojson', 'utf8'));
var all_poly = JSON.parse(fs.readFileSync('./geojson/all_poly.geojson', 'utf8'));
//console.log(playground_poly.features[0].properties);

var playequipment = turf.featurecollection([]); //store for playground equipment
var playground = turf.featurecollection([]); //store for playground centroids

var picnictables = turf.featurecollection([]); //store picnic tables
var picnicsites = turf.featurecollection([]); //store picnic sites
var toilets = turf.featurecollection([]); //store toilets
var bbq = []; //store bbq
var drinking_water = turf.featurecollection([]); //store drinking water
var sport_field = turf.featurecollection([]); //store drinking water

//keyExists(all_center, "playground", playequipment); //load all playground equipment
exactValue(all_center,"leisure","playground",playground); //load all playground centroids
exactValue(all_center,"leisure","pitch",sport_field); //load all playground centroids
exactValue(all_center,"leisure","picnic_table",picnictables); //load all playground centroids
//exactValue(playground_center,"tourism","picnic_site",picnicsites); //load all playground centroids
exactValue(all_center,"amenity","toilets",toilets); //load all playground centroids
exactValue2(all_center,"amenity","bbq",bbq); //load all playground centroids
exactValue(all_center,"amenity","drinking_water",drinking_water); //load all playground centroids
//exactValue(all_center,playground); //load all playground centroids
//exactValue(picnic_tables,picnictables); //load all playground centroids
//exactValue(playground_center,picnicsites); //load all playground centroids
//exactValue(toilets_center,toilets); //load all playground centroids

function keyExists(input, key, output){
  for(var i = 0; i < input.features.length; i++) {
    if(input.features[i].properties[key]) {
      output.features.push(input.features[i]);
  }
}};
//function exactValue(input, output){  
function exactValue(input, key, value, output){
  for(var i = 0; i < input.features.length; i++) {
    if(input.features[i].properties.tags[key] == value) {
      output.features.push(input.features[i]);
  }
}};
function exactValue2(input, key, value, output){
  for(var i = 0; i < input.features.length; i++) {
    if(input.features[i].properties.tags[key] == value) {
      output.push(input.features[i]);
  }
}};
console.log(sport_field.features[0]);
//Example of how to write to file (as string):
//fs.writeFile('./data.geojson', JSON.stringify(output) , 'utf-8');

//***************************************
//process final playgrounds
//***************************************
var playground_final = turf.featurecollection([]); //store for playground centroids after cleaning
for(var i = 0; i < playground.features.length; i++) {

//create new geojson without properties
playground_final.features.push(turf.center(playground.features[i]));
// set distance variables
var nearDistance = 0.06;
var midDistance = 0.13;
//nearest toilet
var nearestToilet = turf.nearest(playground_final.features[i], toilets);
var distanceToilet = turf.distance(playground_final.features[i], nearestToilet);
//nearest picnic table
var nearestPicnicTable = turf.nearest(playground_final.features[i], picnictables);
var distancePicnicTable = turf.distance(playground_final.features[i], nearestPicnicTable);
//set property of nearest picnic table
playground_final.features[i].properties.picnic = distancePicnicTable;  //set OSM ID if a way
//nearest sport field
var nearestSportField = turf.nearest(playground_final.features[i], sport_field);
var distanceSportField = turf.distance(playground_final.features[i], nearestSportField);
if (nearestSportField.properties.tags["sport"] == "tennis"){
//console.log(nearestSportField.properties);
};
// set name

playground_final.features[i].properties.name = playground.features[i].properties.name;   
// set OSM IDs
if(playground.features[i].id.split('/')[0] == "way") {  
  playground_final.features[i].properties.id = "w" + playground.features[i].id.split('/')[1];  //set OSM ID if a way
} else if(playground.features[i].id.split('/')[0] == "node") {
  playground_final.features[i].properties.id = "n" + playground.features[i].id.split('/')[1];  //set OSM ID if a node
} else if(playground.features[i].id.split('/')[0] == "relation") {
  playground_final.features[i].properties.id = "r" + playground.features[i].id.split('/')[1];  //set OSM ID if a relation
};
// set toilets- simple distance logic right now

if(playground.features[i].properties["toilets"] == "yes" && distanceToilet >= midDistance) {  
  playground_final.features[i].properties.toilets = "unverified";
} else if(playground.features[i].properties["toilets"] == "no") {
  playground_final.features[i].properties.toilets = "no";
} else if(distanceToilet < nearDistance && playground.features[i].properties["toilets"] !== "no") {
  playground_final.features[i].properties.toilets = "yes: " + distanceToilet*1000 +"m";
} else if(distanceToilet < midDistance && distanceToilet >= nearDistance && playground.features[i].properties["toilets"] === "yes") {
  playground_final.features[i].properties.toilets = "yes";
} else if(distanceToilet < midDistance && distanceToilet >= nearDistance && playground.features[i].properties["toilets"] !== "yes") {
  playground_final.features[i].properties.toilets = "unverified";
};

// set wheelchair access
playground_final.features[i].properties.wheelchair = playground.features[i].properties.wheelchair;  
// set picnic tables nearby
};

console.log('final_playgrounds complete');
//console.log(nearestPicnicTable);

//***************************************
//process non-interactive amenities
//***************************************
//var playground_final = turf.featurecollection([]); //store for playground centroids after cleaning
//create new geojson without properties
//playground_final.features.push(turf.center(playground.features[i]));


//***************************************
//create final geojson
//***************************************
var center_output = turf.featurecollection([]); //store for all features
fs.writeFile('./'+'center_output'+'.geojson', JSON.stringify(playground_final) , 'utf-8'); //write final geojson


};

//firstStep(secondStep()); //callback test
firstStep();