var mymap = L.map('mapid').setView([51.505, -0.09], 3);

//Adds a zoom reset and control to the map
var ZoomViewer = L.Control.extend({
  onAdd: function () {
    var gauge = L.DomUtil.create('div');
    gauge.style.width = '100px';
    gauge.style.background = 'rgba(255,255,255,0.5)';
    gauge.style.textAlign = 'right';
    mymap.on('zoomstart zoom zoomend', function (ev) {
      gauge.innerHTML = 'Zoom Level: ' + mymap.getZoom();
    })
    return gauge;
  }
});
(new ZoomViewer).addTo(mymap);
L.control.resetView({
  position: "topleft",
  title: "Reset view",
  latlng: L.latLng([0, 0]),
  zoom: 2,
}).addTo(mymap);
mymap.setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(mymap);

//initial coordinate points that will be used for each volcanic area listed in our google spreadsheet
var points = [
  { name: "Krakatoa 1883", coords: [-6.1021, 105.4230] },

];

//Adding markers, buffers, colors to the buffers
points.forEach(pt => {
  var marker = L.marker(pt.coords).addTo(mymap).bindPopup(pt.name);
  let popupData = pt.name;
  marker.bindPopup(popupData).openPopup();
  marker.on('click', function (e) { mymap.setView(e.latlng, 14); })

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

