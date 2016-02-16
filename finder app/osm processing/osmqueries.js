var exec = require('child_process').exec,
    child, child2;
     var turf = require('./libs/turf.js');
var fs = require('fs');

 var playgroundIn;   

 child = exec('query-overpass queries/playground_center.ql >test.geojson', {maxBuffer: 1024 * 2500},
 function (error, stdout, stderr) {
 playgroundIn = stdout;
     console.log(playgroundIn);
     console.log('stderr: ' + stderr);
     if (error !== null) {
          console.log('exec error: ' + error);
     }
 });

  child2 = exec('query-overpass queries/playground_poly.ql', {maxBuffer: 1024 * 2500},
 function (error, stdout, stderr) {
 	
    console.log(stdout);
     console.log('stderr: ' + stderr);
     if (error !== null) {
          console.log('exec error: ' + error);
     }
 });
 
 
 

function secondStep(){
var centers = JSON.parse(fs.readFileSync('test.geojson', 'utf8'));
var polys = JSON.parse(fs.readFileSync('./geojson/poly_test.geojson', 'utf8'));


var playequipment = turf.featurecollection([]); //store for playground equipment
var playground = turf.featurecollection([]); //store for playground centroids
var playground_final = turf.featurecollection([]); //store for playground centroids after cleaning
var picnictables = turf.featurecollection([]); //store picnic tables
var picnicsites = turf.featurecollection([]); //store picnic sites
var toilets = turf.featurecollection([]); //store toilets



keyExists(centers, "playground", playequipment); //load all playground equipment
exactValue(centers,"leisure","playground",playgroundIn); //load all playground centroids
exactValue(centers,"leisure","picnic_table",picnictables); //load all playground centroids
exactValue(centers,"tourism","picnic_site",picnicsites); //load all playground centroids
exactValue(centers,"amenity","toilets",toilets); //load all playground centroids


function keyExists(input, key, output){
  for(var i = 0; i < input.features.length; i++) {
    if(input.features[i].properties[key]) {
      output.features.push(input.features[i]);
  }
}};
  
function exactValue(input, key, value, output){
  for(var i = 0; i < input.features.length; i++) {
    if(input.features[i].properties[key] == value) {
      output.features.push(input.features[i]);
     // fs.writeFile('./'+key+'.geojson', JSON.stringify(output) , 'utf-8');
  }
}};

//Example of how to write to file (as string):
//fs.writeFile('./data.geojson', JSON.stringify(output) , 'utf-8');


//process final playgrounds
for(var i = 0; i < playground.features.length; i++) {
//create new geojson without properties
playground_final.features.push(turf.center(playground.features[i]));
//nearest toilet
var nearestToilet = turf.nearest(playground_final.features[i], toilets);
var distanceToilet = turf.distance(playground_final.features[i], nearestToilet);
// set name
playground_final.features[i].properties.name = playground.features[i].properties.name;   
// set OSM IDs
if(playground.features[i].properties["@id"].split('/')[0] == "way") {  
  playground_final.features[i].properties.id = "w" + playground.features[i].properties["@id"].split('/')[1];  //set OSM ID if a way
} else if(playground.features[i].properties["@id"].split('/')[0] == "node") {
  playground_final.features[i].properties.id = "n" + playground.features[i].properties["@id"].split('/')[1];  //set OSM ID if a node
} else if(playground.features[i].properties["@id"].split('/')[0] == "relation") {
  playground_final.features[i].properties.id = "r" + playground.features[i].properties["@id"].split('/')[1];  //set OSM ID if a relation
};
// set toilets- simple distance logic right now
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
// set wheelchair access
playground_final.features[i].properties.wheelchair = playground.features[i].properties.wheelchair;   
};
//fs.writeFile('./'+'finalplaygrounds'+'.geojson', JSON.stringify(playground_final) , 'utf-8');
};
