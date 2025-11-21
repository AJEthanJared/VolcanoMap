var mymap = L.map('mapid').setView([51.505, -0.09], 3);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18
}).addTo(mymap);


//initial coordinate points that will be used for each volcanic area listed in our google spreadsheet
var points = [
  { name: "Krakatoa 1883", coords: [-6.1021, 105.4230] },

];

//Adding markers, buffers, colors to the buffers

points.forEach(pt => {
  L.marker(pt.coords).addTo(mymap).bindPopup(pt.name);

  const turfPoint = turf.point([pt.coords[1], pt.coords[0]]);

  //these distances are in order of: pyroclastic flows, ash cloud, and sound
  const distances = [40, 480, 4800];

  //same order as distances, but colors used are red, grey, and off-white
  const colors = ["#FF0000", "#808080", "#FAF9F6"];

  distances.forEach((dist, i) => {

    const buffer = turf.buffer(turfPoint, dist, { units: 'kilometers' });

    L.geoJSON(buffer, {
      style: {
        color: colors[i],
        weight: 2,
        fillColor: colors[i],
        fillOpacity: 0.25
      }
    }).addTo(mymap);
  });
});
