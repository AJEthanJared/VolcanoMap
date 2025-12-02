// Initialize the map
var mymap = L.map('mapid').setView([0, 0], 2);

// Zoom level display
var ZoomViewer = L.Control.extend({
  onAdd: function () {
    var gauge = L.DomUtil.create('div');
    gauge.style.width = '100px';
    gauge.style.background = 'rgba(255,255,255,0.5)';
    gauge.style.textAlign = 'right';
    mymap.on('zoomstart zoom zoomend', function () {
      gauge.innerHTML = 'Zoom Level: ' + mymap.getZoom();
    });
    return gauge;
  }
});
(new ZoomViewer()).addTo(mymap);

// Base tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(mymap);
mymap.setView([0, 0], 2);

// Reset button
var resetButton = L.control({ position: 'topleft' });
resetButton.onAdd = function () {
  var div = L.DomUtil.create('div', 'reset-btn');
  div.innerHTML = '<button style="padding:4px; cursor:pointer;">Reset View</button>';
  L.DomEvent.disableClickPropagation(div);
  div.onclick = function () { mymap.setView([0, 0], 2); };
  return div;
};
resetButton.addTo(mymap);

// Volcano data
var points = [
  { name: "Krakatoa 1883", coords: [-6.1021, 105.4230], distances: [40, 2500, 4800], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Tambora 1815", coords: [-8.250, 118.000], distances: [20, 1300, 2600], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount St. Helens 1980", coords: [46.191, -122.194], distances: [8, 64, 322], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Vesuvius 79", coords: [40.8214, 14.4261], distances: [9, 24, 200], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Santorini 1600 BC", coords: [36.3956, 25.4592], distances: [70, 27, 4800], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Bandai 1888", coords: [37.6127, 140.0761], distances: [6, 0, 100], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Pelée 1902", coords: [14.8166, -61.1666], distances: [8, 80, 322], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Nevado del Ruiz 1985", coords: [4.8925, -75.3233], distances: [50, 0, 100], colors: ["#FF0000", "#808080", "#FAF9F6"] },
  { name: "Mount Pinatubo 1991", coords: [15.1429, 120.3496], distances: [16, 30, 2700], colors: ["#FF0000", "#808080", "#FAF9F6"] },
];

var overlay = {}; // Store volcano groups
var selectedVolcano = null; // Currently selected volcano

// Add markers and buffers
points.forEach(pt => {
  var volcGroup = L.layerGroup();

  // Marker
  var marker = L.marker(pt.coords).bindPopup(pt.name);
  marker.addTo(volcGroup);

  // Buffers
  pt.distances.forEach((dist, i) => {
    const turfPoint = turf.point([pt.coords[1], pt.coords[0]]);
    const buffer = turf.buffer(turfPoint, dist, { units: 'kilometers' });

    const bufferLayer = L.geoJSON(buffer, {
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

// Populate dropdown
var select = document.getElementById("volcanoSelect");
points.forEach(pt => {
  var opt = document.createElement("option");
  opt.text = pt.name;
  opt.value = pt.name;
  select.appendChild(opt);
});

// Dropdown change behavior
select.addEventListener("change", function () {
  const chosen = this.value;
  selectedVolcano = overlay[chosen] || null;

  Object.values(overlay).forEach(group => mymap.removeLayer(group));

  if (chosen === "all") {
    Object.values(overlay).forEach(group => mymap.addLayer(group));
    selectedVolcano = null;
    mymap.setView([0, 0], 2);
    return;
  }

  if (selectedVolcano) {
    mymap.addLayer(selectedVolcano);
    mymap.fitBounds(selectedVolcano.getBounds());
  }
});

// Click map to move selected volcano's buffers
mymap.on('click', function (e) {
  if (!selectedVolcano) return;

  selectedVolcano.eachLayer(layer => {
    // Only move buffer polygons, not markers
    if (layer instanceof L.GeoJSON) {
      layer.eachLayer(poly => {
        if (poly instanceof L.Polygon) {
          const center = poly.getBounds().getCenter();
          const latDiff = e.latlng.lat - center.lat;
          const lngDiff = e.latlng.lng - center.lng;

          const newLatLngs = poly.getLatLngs().map(ring =>
            ring.map(coord => L.latLng(coord.lat + latDiff, coord.lng + lngDiff))
          );
          poly.setLatLngs(newLatLngs);
        }
      });
    }
  });


});

