// Creates Leaflet map
var mymap = L.map('mapid').setView([0, 0], 2);

// adds search bar to map and zoomes to area when searched
L.Control.geocoder({
    defaultMarkGeocode: false, // don't add a default marker
    placeholder: "Search for a location...",
})
.on('markgeocode', function(e) {
    const bbox = e.geocode.bbox;
    const bounds = [[bbox.getSouthWest().lat, bbox.getSouthWest().lng],
                    [bbox.getNorthEast().lat, bbox.getNorthEast().lng]];
    mymap.fitBounds(bounds);
})
.addTo(mymap);

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

// Base map used to help contrast with the colors used in the buffers
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',

    maxZoom: 19
}).addTo(mymap);
mymap.setView([0, 0], 2);

// Reset button that centers the map to its default
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
// shown below is points with their name, coordinates, distances (pyroclastic flows, ash cloud, sound),
// colors for each of the distances buffers, zoom level to flyTo when marker is clicked,
// description, image, and casualties for each popup
var points = [
  { name: "Yellowstone", coords: [44.5979, -110.5612], distances: [1000, 1609, 0], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 4, description: "Yellowstone is a supervolcano spanning parts of Wyoming, Idaho, and Montana. Rather than a traditional Stratovolcano with a mountain peak, the caldera is contained in a crater. Tough devastating in size the supervolcano has not supererupted in about 630,000 years.<br><i><b>*Sound distance not shown due to the buffer encompassing the whole map</b></i>", image: "sources/popup_yellowstone.jpg", casualties: "~90,000"},
  { name: "Krakatoa 1883", coords: [-6.1021, 105.4230], distances: [40, 2500, 4800], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 3,  description: "Krakatoa sits at 2,617 feet above sea level and is a large stratovolcano. It's most infamous eruption in 1883 caused tsunamis in the region that resulted in mass destruction. The eruption of Krakatoa is also attributed to the loudest recorded sound in human history.", image: "sources/popup_krakatoa.jpg", casualties: "~36,000" },
  { name: "Mount Tambora 1815", coords: [-8.250, 118.000], distances: [20, 1300, 2600], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 4, description: "Mount Tambora sits at 8,930 feet above sea level and is an active stratovolcano. The 1815 eruption is attributed to one of the most deadly eruptions in human history. It had a profund effect on North American and European climate causing major crop failure and livestock deaths. This was known as the year without a summer.", image: "sources/popup_tambora.jpg", casualties: "~92,000" },
  { name: "Mount St. Helens 1980", coords: [46.191, -122.194], distances: [8, 64, 322], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 6, description: "Mount Saint Helens' elevation is 8,363 feet above sea level and is a stratovolcano.  The volcano is apart of a larger segment of the Pacific Ring of Fire. The eruption in 1980 removed the north side of the mountain and reduced it's height by about 1,300 feet.", image: "sources/popup_sainthelens.jpg", casualties: "57" },
  { name: "Mount Vesuvius 79", coords: [40.8214, 14.4261], distances: [9, 36, 200], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 7, description: "Mount Vesuvius sits at 4,203 feet above sea level and is a stratovolcano. Vesuvius has erupted many times however most famously is known for it's 79 AD eruption that wiped out the Roman city of Pompeii with an estimated 2,000 deaths.", image: "sources/vesuvius_popup.jpg", casualties: "~2,000" },
  { name: "Santorini 1600 BC", coords: [36.3956, 25.4592], distances: [70, 27, 200], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 7, description: "The Thera volcano is an underwater volcano adjacent to the Greek island of Santorini. Most infamously, it resulted in the eradication of the Minoan civilization on the island around the time of 1600 BC. It also resulted in climactic change and volcanic winter similar to Mount Tambora's 1815 eruption.", image: "sources/santorini_popup.jpg", casualties: "~20,000" },
  { name: "Mount Bandai 1888", coords: [37.6127, 140.0761], distances: [6, 6, 100], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 8, description: "Mount Bandai sits at 5,968 feet and is a stratovolcano. The 1888 eruption blocked rivers with volcanic mudslides and buried multiple villages.", image: "sources/popup_bandai.jpg", casualties: "477" },
  { name: "Mount Pelée 1902", coords: [14.8166, -61.1666], distances: [8, 80, 322], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 7, description: "Mount Pelée sits at 4,583 feet and is a stratovolcano. In 1902 it violently erupted and destroyed the port of Saint Pierre, resulting in 30,000 estimated deaths.", image: "sources/popup_pelee.jpg", casualties: "~30,000" },
  { name: "Nevado del Ruiz 1985", coords: [4.8925, -75.3233], distances: [50, 0.6, 16], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 8, description: "Mount Ruiz sits at an astonishing 17,717 feet and is a stratovolcano. In 1985 it erupted and resulting mudslides and debris buried the town of Armero around 30 miles from the volcano.", image: "sources/popup_ruiz.jpg", casualties: "~23,000" },
  { name: "Mount Pinatubo 1991", coords: [15.1429, 120.3496], distances: [16, 30, 2700], colors: ["#FF0000", "#808080", "#EBE98A"], zoom: 4, description: "Mount Pinatubo sits at 4,800 feet above sea level and is a stratovolcano. In 1991 it erupted leaving 100,000 people on Luzon homeless. This eruption and its ashfall resulted in the permanent closure of the Clark Air Force Base operated by the USA.", image: "sources/popup_pinatubo.jpg", casualties: "847" },
];

  var overlay = {}; // Stores volcanoes
  var selectedVolcano = null; // Currently selected volcano

  // Positioning for the marker for each point, put on the upper right of each point for clarity
  var volcanoIcon = L.icon({
    iconUrl: 'sources/volcano.png',
    iconSize: [30, 30],
    iconAnchor: [0, 40],
  });

// Adds markers and buffers
points.forEach(pt => {
  var volcGroup = L.layerGroup();

  // Markers with their popups
  var marker = L.marker(pt.coords, { icon: volcanoIcon }).bindPopup(`
    <div class="popup-container">
        <div class="popup-title">${pt.name}</div>
        <img class="popup-image" src="${pt.image}" />
        <div class="popup-desc">${pt.description}</div>
        <div class="popup-casualties"><b>Casualties:</b> ${pt.casualties}</div>
        <div class="popup-buffers">
          <b>Buffer Sizes (km):</b> Pyroclastic Flows: ${pt.distances[0]}, Ash Cloud: ${pt.distances[1]}, Sound Distance: ${pt.distances[2]}
        </div>
    </div>
  `);

  // Flys to volcano upon clicking a marker
  marker.on('click', e => mymap.flyTo(pt.coords, pt.zoom));
  marker.addTo(volcGroup);

  // Stores buffers
  const bufferLayers = {};

  pt.distances.forEach((dist, i) => {
    const type = ["pyro", "ash", "sound"][i];

    // turf uses lng,lat order
    const turfPoint = turf.point([pt.coords[1], pt.coords[0]]);
    const buffer = turf.buffer(turfPoint, dist, { units: 'kilometers' });

    // Styles buffers
    bufferLayers[type] = L.geoJSON(buffer, {
      style: {
        color: pt.colors[i],
        weight: 2,
        fillColor: pt.colors[i],
        fillOpacity: 0.25
      },
      interactive: false
    }).addTo(volcGroup);

    // Attempt at storing original coordinates so we could try to make the buffers reset if moved
    bufferLayers[type].originalLatLngs = bufferLayers[type].getLayers().map(layer =>
      layer.getLatLngs().map(ring => ring.map(coord => L.latLng(coord.lat, coord.lng)))
    );
  });

  overlay[pt.name] = {
    group: volcGroup,
    buffers: bufferLayers
  };

  // Adds volcanoes to the map
  volcGroup.addTo(mymap);
});

// Populates dropdown for volcano presets
var select = document.getElementById("volcanoSelect");
points.forEach(pt => {
  var opt = document.createElement("option");
  opt.text = pt.name;
  opt.value = pt.name;
  select.appendChild(opt);
});

// Buffer toggle to show or take away buffers
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

// Dropdown behavior, removes all volcanoes except for the selected one and brings them all back when show all is selected
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

// Moves buffers upon map click
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


// Custom buffer

var customBufferLayer = null;
var customBufferDistance = 10; // default
var waitingForClick = false;

// Allows for clicking on custom buffer box and user input for a number to show
// a buffer of that size on the map when it is clicked
document.getElementById("addCustomBufferBtn").addEventListener("click", () => {
  const val = parseFloat(document.getElementById("customBufferDistance").value);
  if (isNaN(val) || val <= 0) {
    alert("Enter a valid distance in km.");
    return;
  }
  customBufferDistance = val;
  waitingForClick = true;
  alert("Click anywhere on the map to place your custom buffer!");
});

mymap.on('click', function(e) {
  if (!waitingForClick) return;

  // Tries to remove the buffer first clicked, but issues were apparent so I ended
  // up making a reset button for it instead
  if (customBufferLayer) mymap.removeLayer(customBufferLayer);

  const turfPoint = turf.point([e.latlng.lng, e.latlng.lat]);
  const buffer = turf.buffer(turfPoint, customBufferDistance, { units: "kilometers" });

  // Style of the custom buffer
  customBufferLayer = L.geoJSON(buffer, {
    style: {
      color: "#00FFAA",
      weight: 2,
      fillColor: "#00FFAA",
      fillOpacity: 0.25
    }
  }).addTo(mymap);

  waitingForClick = false;
});

// Checkbox events and connect to buffer toggle
["togglePyro", "toggleAsh", "toggleSound"]
  .forEach(id => document.getElementById(id).addEventListener("change", applyToggleLogic));

  // Reset Buffers Button
  const resetBtn = document.getElementById("resetBuffersBtn");

  resetBtn.addEventListener("click", () => {
      console.log("Reset button clicked!"); // Debug because button was not working originally

      // Resets map view
      mymap.setView([0, 0], 2);

      // Shows volcano groups
      Object.values(overlay).forEach(v => {
          if (!mymap.hasLayer(v.group)) mymap.addLayer(v.group);
      });

      // Resets selected volcano
      selectedVolcano = null;

      // Resets dropdown
      const select = document.getElementById("volcanoSelect");
      select.value = "all";

      // Resets buffer checkboxes to checked
      document.getElementById("togglePyro").checked = true;
      document.getElementById("toggleAsh").checked = true;
      document.getElementById("toggleSound").checked = true;

      // Apply toggle to ensure buffers are shown
      Object.values(overlay).forEach(v => {
          for (const key in v.buffers) {
              const layer = v.buffers[key];
              if (!mymap.hasLayer(layer)) mymap.addLayer(layer);
          }
      });

      // Removes custom buffer if it exists
      if (customBufferLayer) {
          mymap.removeLayer(customBufferLayer);
          customBufferLayer = null;
      }

      //originally also debug stuff, commented out cause not needed.
      //console.log("Map and buffers reset to default.");
  });
