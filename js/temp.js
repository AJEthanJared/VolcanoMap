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

// Volcano data: pyroclastic flow, ash cloud, sound is the respective order used for the distances and colors
var points = [
  { name: "Krakatoa 1883", coords: [-6.1021, 105.4230], distances: [40, 2500, 4800], colors: ["#FF0000", "#808080", "#EBE98A"], description: "Krakatoa sits at 2,617 feet above sea level and is a large stratovolcano. It's most infamous eruption in 1883 caused tsunamis in the region that resulted in mass destruction. The eruption of Krakatoa is also attributed to the loudest recorded sound in human history.", image: "sources/popup_krakatoa.jpg" },
  { name: "Mount Tambora 1815", coords: [-8.250, 118.000], distances: [20, 1300, 2600], colors: ["#FF0000", "#808080", "#EBE98A"], description: "Mount Tambora sits at 8,930 feet above sea level and is an active stratovolcano. The 1815 eruption is attributed to one of the most deadly eruptions in human history. It had a profund effect on North American and European climate causing major crop failure and livestock deaths. This was known as the year without a summer.", image: "sources/popup_tambora.jpg" },
  { name: "Mount St. Helens 1980", coords: [46.191, -122.194], distances: [8, 64, 322], colors: ["#FF0000", "#808080", "#EBE98A"], description: "Mount Saint Helens' elevation is 8,363 feet above sea level and is a stratovolcano.  The volcano is apart of a larger segment of the Pacific Ring of Fire. The eruption in 1980 removed the north side of the mountain and reduced it's height by about 1,300 feet.", image: "sources/popup_sainthelens.jpg" },
  { name: "Mount Vesuvius 79", coords: [40.8214, 14.4261], distances: [9, 36, 200], colors: ["#FF0000", "#808080", "#EBE98A"], description: "Mount Vesuvius sits at 4,203 feet above sea level and is a stratovolcano. Vesuvius has erupted many times however most famously is known for it's 79 AD eruption that wiped out the Roman city of Pompeii with an estimated 2,000 deaths.", image: "sources/vesuvius_popup.jpg" },
  { name: "Santorini 1600 BC", coords: [36.3956, 25.4592], distances: [70, 27, 200], colors: ["#FF0000", "#808080", "#EBE98A"], description: "The Thera volcano is an underwater volcano adjacent to the Greek island of Santorini. Most infamously, it resulted in the eradication of the Minoan civilization on the island around the time of 1600 BC. It also resulted in climactic change and volcanic winter similar to Mount Tambora's 1815 eruption.", image: "sources/santorini_popup.jpg" },
  { name: "Mount Bandai 1888", coords: [37.6127, 140.0761], distances: [6, 6, 100], colors: ["#FF0000", "#808080", "#EBE98A"], description: "Mount Bandai sits at 5,968 feet and is a stratovolcano. The 1888 eruption blocked rivers with volcanic mudslides and buried multiple villages.", image: "sources/popup_bandai.jpg" },
  { name: "Mount Pelée 1902", coords: [14.8166, -61.1666], distances: [8, 80, 322], colors: ["#FF0000", "#808080", "#EBE98A"], description: "Mount Pelée sits at 4,583 feet and is a stratovolcano. In 1902 it violently erupted and destroyed the port of Saint Pierre, resulting in 30,000 estimated deaths.", image: "sources/popup_pelee.jpg" },
  { name: "Nevado del Ruiz 1985", coords: [4.8925, -75.3233], distances: [50, 0.6, 16], colors: ["#FF0000", "#808080", "#EBE98A"], description: "Mount Ruiz sits at an astonishing 17,717 feet and is a stratovolcano. In 1985 it erupted and resulting mudslides and debris buried the town of Armero around 30 miles from the volcano.", image: "sources/popup_ruiz.jpg" },
  { name: "Mount Pinatubo 1991", coords: [15.1429, 120.3496], distances: [16, 30, 2700], colors: ["#FF0000", "#808080", "#EBE98A"], description: "Mount Pinatubo sits at 4,800 feet above sea level and is a stratovolcano. In 1991 it erupted leaving 100,000 people on Luzon homeless. This eruption and its ashfall resulted in the permanent closure of the Clark Air Force Base operated by the USA.", image: "sources/popup_pinatubo.jpg" },
];

var overlay = {}; // Store volcano groups
var selectedVolcano = null; // Currently selected volcano

// Add markers and buffers
points.forEach(pt => {
  var volcGroup = L.layerGroup();

  // Marker
  var marker = L.marker(pt.coords).bindPopup(`
    <div style="text-align:center;">
      <h3>${pt.name}</h3>
      <img src="${pt.image}" width="150" style="border-radius:6px; margin-bottom:8px;">
      <p>${pt.description}</p>
    </div>
  `);
  marker.on('click', e => mymap.flyTo(e.latlng, 4));
  marker.addTo(volcGroup);

  // Buffers stored individually
  const bufferLayers = {};

  pt.distances.forEach((dist, i) => {
    const type = ["pyro", "ash", "sound"][i];
    const turfPoint = turf.point([pt.coords[1], pt.coords[0]]);
    const buffer = turf.buffer(turfPoint, dist, { units: 'kilometers' });

    bufferLayers[type] = L.geoJSON(buffer, {
      style: {
        color: pt.colors[i],
        weight: 2,
        fillColor: pt.colors[i],
        fillOpacity: 0.25
      }
    }).addTo(volcGroup);
  });

  overlay[pt.name] = {
    group: volcGroup,
    buffers: bufferLayers
  };

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

// Buffer toggle logic
function applyToggleLogic() {
  if (!selectedVolcano) return;

  const toggles = {
    pyro: document.getElementById("togglePyro").checked,
    ash: document.getElementById("toggleAsh").checked,
    sound: document.getElementById("toggleSound").checked
  };

  for (const key in selectedVolcano.buffers) {
    const layer = selectedVolcano.buffers[key];
    if (toggles[key]) {
      mymap.addLayer(layer);
    } else {
      mymap.removeLayer(layer);
    }
  }
}

// Dropdown behavior
select.addEventListener("change", function () {
  const chosen = this.value;

  Object.values(overlay).forEach(v => mymap.removeLayer(v.group));

  if (chosen === "all") {
    Object.values(overlay).forEach(v => mymap.addLayer(v.group));
    selectedVolcano = null;
    mymap.setView([0, 0], 2);
    return;
  }

  selectedVolcano = overlay[chosen];

  mymap.addLayer(selectedVolcano.group);
  mymap.fitBounds(selectedVolcano.group.getBounds());

  applyToggleLogic();
});

// Move buffers on map click
mymap.on('click', function (e) {
  if (!selectedVolcano) return;

  selectedVolcano.group.eachLayer(layer => {
    if (layer instanceof L.GeoJSON) {
      layer.eachLayer(poly => {
        const center = poly.getBounds().getCenter();
        const latDiff = e.latlng.lat - center.lat;
        const lngDiff = e.latlng.lng - center.lng;

        const newLatLngs = poly.getLatLngs().map(ring =>
          ring.map(coord => L.latLng(coord.lat + latDiff, coord.lng + lngDiff))
        );
        poly.setLatLngs(newLatLngs);
      });
    }
  });
});

// Checkbox events
["togglePyro", "toggleAsh", "toggleSound"]
  .forEach(id => document.getElementById(id).addEventListener("change", applyToggleLogic));
