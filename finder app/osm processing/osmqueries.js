var exec = require('child_process').exec,
    child, child2;
var turf = require('./libs/turf.js');
var fs = require('fs');

 

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
// commented while debugging
function queries() {
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
queries();
//
//secondStep(); //delete after uncommenting the above
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
var playground_poly = turf.featurecollection([]); //store for playground centroids
var picnictables = turf.featurecollection([]); //store picnic tables
var picnicsites = turf.featurecollection([]); //store picnic sites
var toilets = turf.featurecollection([]); //store toilets
var bbq = turf.featurecollection([]); //store bbq
var drinking_water = turf.featurecollection([]); //store drinking water
var sport_field = turf.featurecollection([]); //store drinking water

//keyExists(all_center, "playground", playequipment); //load all playground equipment
exactValue(all_center,"leisure","playground",playground); //load all playground centroids
exactValue(all_center,"leisure","pitch",sport_field); //load all playground centroids
exactValue(all_center,"leisure","picnic_table",picnictables); //load all playground centroids
exactValue(playground_center,"tourism","picnic_site",picnicsites); //load all playground centroids
exactValue(all_center,"amenity","toilets",toilets); //load all playground centroids
exactValue(all_center,"amenity","bbq",bbq); //load all playground centroids
exactValue(all_center,"amenity","drinking_water",drinking_water); //load all playground centroids
//exactValue(all_center,playground); //load all playground centroids
//exactValue(picnic_tables,picnictables); //load all playground centroids
//exactValue(playground_center,picnicsites); //load all playground centroids
//exactValue(toilets_center,toilets); //load all playground centroids
polyExtract(all_poly,"leisure","playground",playground_poly);

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

function polyExtract(input, key, value, output){
  for(var i = 0; i < input.features.length; i++) {
    if(input.features[i].geometry["type"] == "Polygon" && input.features[i].properties.tags[key] == value) {
      output.features.push(input.features[i]);
  }
}};

//console.log(sport_field.features[0]);
//Example of how to write to file (as string):
//fs.writeFile('./data.geojson', JSON.stringify(output) , 'utf-8');

//***************************************
//process final playgrounds
//***************************************
var playground_final = turf.featurecollection([]); //store for playground centroids after cleaning
for(var i = 0; i < playground.features.length; i++) {
//create new geojson without properties
playground_final.features.push(turf.center(playground.features[i]));
// set category
playground_final.features[i].properties.category = "playground"; 
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

//set variables for distances analysis
var bufferDistance = 100;
var pointDistance = 150;

//build buffer
var buffer;
var pointBuffer;
var matchingPoly;

//if a polygon:

try {
  matchingPoly = turf.filter(playground_poly, 'id', Number(playground.features[i].id.split('/')[1]));
  buffer = turf.buffer(matchingPoly, bufferDistance, 'meters');
} 
//if a point:
catch(err) {
  buffer = turf.buffer(playground.features[i], pointDistance, 'meters');
};
// count points within buffer
var toilet_count = turf.count(buffer, toilets, 'toilet_count');
var bbq_count = turf.count(buffer, bbq, 'bbq_count');
var picnictables_count = turf.count(buffer, picnictables, 'picnictables_count');
var drinking_water_count = turf.count(buffer, drinking_water, 'drinking_water_count');
var picnicsites_count = turf.count(buffer, picnicsites, 'picnicsites_count');

// set playground distance-based properties
if (toilet_count > 0) {
  playground_final.features[i].properties.toilets = "yes";
} else {
  playground_final.features[i].properties.toilets = "no";
};
if (bbq_count > 0) {
  playground_final.features[i].properties.bbq = "yes";
} else {
  playground_final.features[i].properties.bbq = "no";
};
if (picnictables_count > 0) {
  playground_final.features[i].properties.picnic_tables = "yes";
} else {
  playground_final.features[i].properties.picnic_tables = "no";
};
if (drinking_water_count > 0) {
  playground_final.features[i].properties.drinking_water = "yes";
} else {
  playground_final.features[i].properties.drinking_water = "no";
};
// set wheelchair access
playground_final.features[i].properties.wheelchair = playground.features[i].properties.wheelchair;  
};

//***************************************
//process non-interactive amenities
//***************************************
var bbq_final = turf.featurecollection([]); 
drinking_water_final = turf.featurecollection([]); 
toilets_final = turf.featurecollection([]); 
picnicsites_final = turf.featurecollection([]); 
picnictables_final = turf.featurecollection([]); 
//create new geojsons without properties
for(var i = 0; i < bbq.features.length; i++) {
    bbq_final.features.push(turf.center(bbq.features[i]));
	bbq_final.features[i].properties.category = "bbq"; 
};
for(var i = 0; i < drinking_water.features.length; i++) {
    drinking_water_final.features.push(turf.center(drinking_water.features[i]));
	drinking_water_final.features[i].properties.category = "drinking_water"; 
};
for(var i = 0; i < toilets.features.length; i++) {
    toilets_final.features.push(turf.center(toilets.features[i]));
	toilets_final.features[i].properties.category = "toilets"; 
};
for(var i = 0; i < picnicsites.features.length; i++) {
    picnicsites_final.features.push(turf.center(picnicsites.features[i]));
	picnicsites_final.features[i].properties.category = "picnic_sites"; 
};
for(var i = 0; i < picnictables.features.length; i++) {
    picnictables_final.features.push(turf.center(picnictables.features[i]));
	picnictables_final.features[i].properties.category = "picnic_tables"; 
};
//bbq_final.features.push(turf.center(bbq.features[i]));
//fs.writeFile('./'+'bbq'+'.geojson', JSON.stringify(bbq_final) , 'utf-8');

//***************************************
//create final geojson
//***************************************
var center_output = turf.featurecollection([]); //store for all features
fs.writeFile('./'+'finalplaygrounds'+'.geojson', JSON.stringify(playground_final) , 'utf-8'); //write final geojson

var final_inputs = [playground_final,bbq_final,drinking_water_final,toilets_final,picnicsites_final,picnictables_final];
  for(var i = 0; i < final_inputs.length; i++) {
      combineFinal(final_inputs[i],center_output); 
};


function combineFinal(input, output){
  for(var i = 0; i < input.features.length; i++) {
      output.features.push(input.features[i]); 
}};

fs.writeFile('./'+'final'+'.geojson', JSON.stringify(center_output) , 'utf-8'); //write final geojson
fs.writeFile('./'+'playground_poly'+'.geojson', JSON.stringify(playground_poly) , 'utf-8');
console.log('final_playgrounds complete');
};

//firstStep(secondStep()); //callback test
firstStep();