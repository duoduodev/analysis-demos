'use strict';

/* global mapboxgl */
/* eslint-disable new-cap */
mapboxgl.accessToken = process.env.MapboxAccessToken;

// Set bounds to Philadelphia
var bounds = [
  [-75.63195500381617, 39.76055866429846], // Southwest coordinates
  [-74.6075343956525, 40.122534817620846] // Northeast coordinates
];

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v8',
  center: [-75.1759, 39.9361],
  maxBounds: bounds,
  minZoom: 13,
  maxZoom: 19,
  zoom: 13
});

var popup = new mapboxgl.Popup({
  closeButton: false
});

var filterGroup = document.getElementById('filter-group');

var layers = [
  [0, '#27b691', 'Residential'],
  [1, '#1279b9', 'Commecial'],
  [2, '#484896', 'Hotels & Apartments'],
  [3, '#ed4f3e', 'Store with dwelling'],
  [4, '#f6d845', 'Vacant land'],
  [5, '#ed5299', 'Industrial']
];

function initialize() {
  document.body.classList.remove('loading');

  map.addSource('philly', {
    type: 'vector',
    url: 'mapbox://tristen.2so304hr'
  });

  layers.forEach(function(layer, i) {
    var layerID = 'poi-' + i;
    map.addLayer({
      id: layerID,
      interactive: true,
      type: 'circle',
      source: 'philly',
      'source-layer': 'original',
      paint: {
        'circle-color': layer[1],
        'circle-radius': {
          base: 1,
          stops: [[13, 1], [15, 2], [17, 5]]
        }
      },
      filter: ['==', 'category', layer[0]]

    }, 'place_label_city_small_s');

    var input = document.createElement('input');
    input.type = 'checkbox';
    input.id = layerID;
    input.checked = true;
    filterGroup.appendChild(input);

    var label = document.createElement('label');
    label.className = 'button col12';
    label.setAttribute('for', layerID);
    label.textContent = layer[2];

    var labelKey = document.createElement('span');
    labelKey.style.backgroundColor = layer[1];

    label.appendChild(labelKey);
    filterGroup.appendChild(label);

    // When the checkbox changes, update the visibility of the layer.
    input.addEventListener('change', function(e) {
        map.setLayoutProperty(layerID, 'visibility',
            e.target.checked ? 'visible' : 'none');
    });
  });
}

map.on('click', function(e) {
  console.log('coordinates: ', e.lngLat);
});

map.on('mousemove', function(e) {
  map.featuresAt(e.point, {
    radius: 2.5, // Half the marker size (5px).
    includeGeometry: true,
    layer: layers.map(function(layer, i) {
      return 'poi-' + i;
    })
  }, function(err, features) {
    map.getCanvas().style.cursor = (!err && features.length) ? 'pointer' : '';

    if (err || !features.length) {
      popup.remove();
      return;
    }

    var feature = features[0];
    var p = feature.properties;
    var popupContainer = document.createElement('div');

    var items = [
      ['Address', p.address],
      ['Category', layers[p.category][2]],
      ['Price', p.price]
    ];

    if (p.stories) items.push(['Stories', p.stories]);
    if (p.rooms) items.push(['Rooms', p.rooms]);
    if (p.bedrooms) items.push(['Bedrooms', p.bedrooms]);
    if (p.bathrooms) items.push(['Bathrooms', p.bathrooms]);

    items.forEach(function(d) {
      var item = document.createElement('div');
      var label = document.createElement('strong');
      label.className = 'space-right0';
      label.textContent = d[0];

      var value = document.createElement('div');
      value.className = 'inline capitalize';
      value.textContent = d[1];

      item.appendChild(label);
      item.appendChild(value);
      popupContainer.appendChild(item);
    });

    // Initialize a popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(feature.geometry.coordinates)
      .setHTML(popupContainer.innerHTML)
      .addTo(map);
  });
});

map.on('load', initialize);
