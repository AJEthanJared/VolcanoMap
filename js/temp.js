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

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18
}).addTo(mymap);

var resetButton = L.control({ position: 'topleft' });

resetButton.onAdd = function () {
    var div = L.DomUtil.create('div', 'reset-btn');
    div.innerHTML = '<button style="padding:4px; cursor:pointer;">Reset View</button>';

    // Prevent clicks inside the button from affecting the map
    L.DomEvent.disableClickPropagation(div);

    div.onclick = function () {
        mymap.setView([0, 0], 2);
    };

    return div;
};

resetButton.addTo(mymap);

//initial coordinate points that will be used for each volcanic area listed in our google spreadsheet
var points = [
  //these distances are in order of: pyroclastic flows, ash cloud, and sound
  //same order as distances, but colors used are red, grey, and off-white
  { name: "Krakatoa 1883", coords: [-6.1021, 105.4230], distances: [40, 2500, 4800], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Tambora 1815", coords: [-8.250, 118.000], distances: [20, 1300, 2600], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount St. Helens 1980", coords: [46.191, -122.194], distances: [8, 64, 322], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Vesuvius 79", coords: [40.8214, 14.4261], distances: [9, 24, 200], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Santorini 1600 BC", coords: [36.3956, 25.4592], distances: [70, 27, 4800], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Bandai 1888", coords: [37.6127, 140.0761], distances: [6, 0, 100], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Pelée 1902", coords: [14.8166, -61.1666], distances: [8, 80, 322], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Nevado del Ruiz", coords: [4.8925, -75.3233], distances: [50, 0, 100], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Pinatubo 1991", coords: [15.1429, 120.3496], distances: [16, 30, 2700], colors: ["#FF0000", "#808080", "#FAF9F6"] },

];

var overlay = {};

//Adding markers
points.forEach(pt => {
  var volcGroup = L.layerGroup();
  var marker = L.marker(pt.coords).addTo(mymap).bindPopup(pt.name);
  marker.on('click', function (e) {
    mymap.setView(e.latlng, 7);
  });
  marker.addTo(volcGroup);

  const turfPoint = turf.point([pt.coords[1], pt.coords[0]]);

  pt.distances.forEach((dist, i) => {
    const buffer = turf.buffer(turfPoint, dist, { units: 'kilometers' });

    L.geoJSON(buffer, {
      style: {
        color: pt.colors[i],
        weight: 2,
        fillColor: pt.colors[i],
        fillOpacity: 0.25
      }
    }).addTo(volcGroup);
  });

  overlay[pt.name] = volcGroup;
  volcGroup.addTo(mymap);
});
L.control.layers(null, overlay, { collapsed: false }).addTo(mymap);

// --- Create dropdown UI ---
var selectDiv = L.DomUtil.create('div', 'volcano-select');
selectDiv.style.background = 'white';
selectDiv.style.padding = '6px';
selectDiv.style.borderRadius = '4px';

L.DomEvent.disableClickPropagation(selectDiv);
L.DomEvent.disableScrollPropagation(selectDiv);

var select = L.DomUtil.create('select', '', selectDiv);
select.style.width = "180px";

// Add default option
var defaultOption = document.createElement("option");
defaultOption.text = "Show All";
defaultOption.value = "all";
select.appendChild(defaultOption);

// Add each volcano to dropdown
points.forEach(pt => {
  var opt = document.createElement("option");
  opt.text = pt.name;
  opt.value = pt.name;
  select.appendChild(opt);
});

// Add the dropdown as a Leaflet control
var VolcanoSelectControl = L.Control.extend({
  onAdd: function () { return selectDiv; },
  onRemove: function () {}
});
(new VolcanoSelectControl({ position: "topright" })).addTo(mymap);


// --- Dropdown behavior ---
select.addEventListener("change", function () {
  var chosen = this.value;

  if (chosen === "all") {
    // Show all volcano groups
    Object.values(overlay).forEach(group => {
      if (!mymap.hasLayer(group)) mymap.addLayer(group);
    });
    mymap.setView([0, 0], 2);
    return;
  }

  // Hide ALL volcano groups
  Object.values(overlay).forEach(group => {
    if (mymap.hasLayer(group)) mymap.removeLayer(group);
  });

  // Show the selected volcano
  var group = overlay[chosen];
  group.addTo(mymap);

  // Pan to marker location
  var pt = points.find(p => p.name === chosen);
  mymap.setView(pt.coords, 7);
});
