var exec = require('child_process').exec,
    child, child2;
var turf = require('./libs/turf.js');
var fs = require('fs');
var playgroundIn;  

var firstStep = function() {
var q = new Array();
q[0] = 'query-overpass queries/playground_center.ql >geojson/playground_center.geojson';
q[1] = 'query-overpass queries/playground_poly.ql >geojson/playground_poly.geojson';

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
//console.log(playground_poly.features[0].properties);

var playequipment = turf.featurecollection([]); //store for playground equipment
var playground = turf.featurecollection([]); //store for playground centroids
var playground_final = turf.featurecollection([]); //store for playground centroids after cleaning
var picnictables = turf.featurecollection([]); //store picnic tables
var picnicsites = turf.featurecollection([]); //store picnic sites
var toilets = turf.featurecollection([]); //store toilets



keyExists(playground_center, "playground", playequipment); //load all playground equipment
//exactValue(playground_center,"leisure","playground",playgroundIn); //load all playground centroids
//exactValue(playground_center,"leisure","picnic_table",picnictables); //load all playground centroids
//exactValue(playground_center,"tourism","picnic_site",picnicsites); //load all playground centroids
//exactValue(playground_center,"amenity","toilets",toilets); //load all playground centroids
exactValue(playground_center,playground); //load all playground centroids
exactValue(playground_center,picnictables); //load all playground centroids
exactValue(playground_center,picnicsites); //load all playground centroids
exactValue(playground_center,toilets); //load all playground centroids

function keyExists(input, key, output){
  for(var i = 0; i < input.features.length; i++) {
    if(input.features[i].properties[key]) {
      output.features.push(input.features[i]);
  }
}};
function exactValue(input, output){  
//function exactValue(input, key, value, output){
  for(var i = 0; i < input.features.length; i++) {
  //  if(input.features[i].properties[key] == value) {
      output.features.push(input.features[i]);
 // }
}};

//Example of how to write to file (as string):
//fs.writeFile('./data.geojson', JSON.stringify(output) , 'utf-8');


//process final playgrounds
for(var i = 0; i < playground.features.length; i++) {
//console.log("u");
//create new geojson without properties
playground_final.features.push(turf.center(playground.features[i]));
/*
//nearest toilet
var nearestToilet = turf.nearest(playground_final.features[i], toilets);
var distanceToilet = turf.distance(playground_final.features[i], nearestToilet);
// set name
*/
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
/*
if(playground.features[i].properties["toilets"] == "yes" && distanceToilet >= 0.13) {  
  playground_final.features[i].properties.toilets = "unverified";
} else if(playground.features[i].properties["toilets"] == "no") {
  playground_final.features[i].properties.toilets = "no";
} else if(distanceToilet < 0.06 && playground.features[i].properties["toilets"] !== "no") {
  playground_final.features[i].properties.toilets = "yes: " + distanceToilet*1000 +"m";
} else if(distanceToilet < 0.13 && distanceToilet >= 0.06 && playground.features[i].properties["toilets"] === "yes") {
  playground_final.features[i].properties.toilets = "yes";
} else if(distanceToilet < 0.13 && distanceToilet >= 0.06 && playground.features[i].properties["toilets"] !== "yes") {
  playground_final.features[i].properties.toilets = "unverified";
};
*/
// set wheelchair access
playground_final.features[i].properties.wheelchair = playground.features[i].properties.wheelchair;   
};
fs.writeFile('./'+'finalplaygrounds'+'.geojson', JSON.stringify(playground_final) , 'utf-8');
console.log('final_playgrounds complete');
};

//firstStep(secondStep()); //callback test
firstStep();