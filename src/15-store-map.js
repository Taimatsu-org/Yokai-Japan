document.addEventListener('DOMContentLoaded', () => {
  var LAND_COLOR = '#F5EFE1';
  var SECONDARY_COLOR = '#EBE4D4';
  var BORDER_COLOR = '#DDD5BE';
  var LABEL_COLOR = '#7a7466';
  var LABEL_HALO = '#F5EFE1';
  var FLY_ZOOM = 15;
  var FLY_DURATION = 1200;
  var REGION_FLY_DURATION = 2000;
  var FIT_PADDING = 80;
  var REGION_FIT_PADDING = 100;
  var REGION_MAX_ZOOM = 12;
  var PIN_IMAGE_URL = 'https://cdn.prod.website-files.com/694de20134d7a4afc6818bdd/69da2da3a1b0da348dcab091_yokai-pin.png';
  var PIN_IMAGE_ID = 'yokai-pin';
  var PIN_SIZE = 0.3;
  var PIN_BORDER_WIDTH = 2;
  var PIN_BORDER_PADDING = PIN_BORDER_WIDTH + 1;
  var PIN_BORDER_COLOR = '#000';
  var PIN_BORDER_OPACITY = 0.15;
  var POPUP_OFFSET = 50;
  var SOURCE_ID = 'stores';
  var LAYER_ID = 'store-pins';

  var MAP_STYLE = {
    version: 8,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: {
      openfreemap: {
        type: 'vector',
        url: 'https://tiles.openfreemap.org/planet',
      },
    },
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': LAND_COLOR } },
      { id: 'water', type: 'fill', source: 'openfreemap', 'source-layer': 'water', paint: { 'fill-color': SECONDARY_COLOR } },
      { id: 'road-minor', type: 'line', source: 'openfreemap', 'source-layer': 'transportation', minzoom: 13, filter: ['in', 'class', 'minor', 'service', 'track'], paint: { 'line-color': SECONDARY_COLOR, 'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.5, 18, 2] } },
      { id: 'road-secondary', type: 'line', source: 'openfreemap', 'source-layer': 'transportation', minzoom: 11, filter: ['in', 'class', 'secondary', 'tertiary'], paint: { 'line-color': SECONDARY_COLOR, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.5, 18, 4] } },
      { id: 'road-primary', type: 'line', source: 'openfreemap', 'source-layer': 'transportation', minzoom: 8, filter: ['in', 'class', 'primary', 'trunk'], paint: { 'line-color': SECONDARY_COLOR, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 18, 6] } },
      { id: 'road-motorway', type: 'line', source: 'openfreemap', 'source-layer': 'transportation', minzoom: 6, filter: ['==', 'class', 'motorway'], paint: { 'line-color': SECONDARY_COLOR, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 0.5, 18, 8] } },
      { id: 'building', type: 'fill', source: 'openfreemap', 'source-layer': 'building', minzoom: 14, paint: { 'fill-color': SECONDARY_COLOR, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 16, 1] } },
      { id: 'country-border', type: 'line', source: 'openfreemap', 'source-layer': 'boundary', filter: ['==', 'admin_level', 2], paint: { 'line-color': BORDER_COLOR, 'line-width': 0.5 } },
      { id: 'road-label-major', type: 'symbol', source: 'openfreemap', 'source-layer': 'transportation_name', minzoom: 12, filter: ['in', 'class', 'motorway', 'trunk', 'primary'], layout: { 'symbol-placement': 'line', 'text-field': ['coalesce', ['get', 'name:latin'], ['get', 'name:en'], ['get', 'name']], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-letter-spacing': 0.05, 'symbol-spacing': 350 }, paint: { 'text-color': LABEL_COLOR, 'text-halo-color': LABEL_HALO, 'text-halo-width': 1.5 } },
    ],
  };

  var container = document.getElementById('store-map');
  if (!container || typeof maplibregl === 'undefined') return;

  var DIRECTIONS_LABEL = container.getAttribute('data-directions-label') || 'Directions';

  var storeEls = Array.from(document.querySelectorAll('.store--list-info'));
  if (!storeEls.length) return;

  var features = storeEls.map((el, i) => {
    var lat = parseFloat(el.getAttribute('data-lat'));
    var lng = parseFloat(el.getAttribute('data-lng'));
    if (isNaN(lat) || isNaN(lng)) return null;
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        id: i,
        name: el.querySelector('.medium-text')?.textContent.trim() || el.querySelector('.small-text')?.textContent.trim() || '',
        address: el.querySelector('[data-address]')?.textContent.trim() || el.getAttribute('data-address') || '',
        mapsUrl: el.getAttribute('data-google-maps') || '',
      },
      _el: el,
      _region: el.getAttribute('data-region') || '',
    };
  }).filter(Boolean);

  if (!features.length) return;

  storeEls.forEach((el) => {
    el.style.cursor = 'pointer';
    el.querySelectorAll('a').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
    var arrow = el.querySelector('.address-arrow');
    if (arrow && arrow.previousElementSibling) {
      var textEl = arrow.previousElementSibling;
      var text = textEl.textContent.trim();
      if (text) {
        var words = text.split(/\s+/);
        var lastWord = words.pop();
        textEl.textContent = words.length ? words.join(' ') + ' ' : '';
        var span = document.createElement('span');
        span.style.whiteSpace = 'nowrap';
        span.textContent = lastWord;
        arrow.style.display = 'inline-block';
        arrow.style.verticalAlign = 'middle';
        arrow.style.marginTop = '0';
        arrow.style.marginLeft = '0.25rem';
        span.appendChild(arrow);
        textEl.appendChild(span);
      }
    }
  });

  var popupStyle = document.createElement('style');
  popupStyle.textContent = '.maplibregl-popup-content{background:#F5EFE1!important;box-shadow:none!important;border-radius:0!important;border:1px solid rgba(31,29,33,0.15)!important;padding:0.875rem 1rem!important;font-family:"ibm-plex-sans-jp","IBM Plex Sans JP",sans-serif!important;font-weight:400!important;font-size:0.75rem!important;line-height:2!important;letter-spacing:0.05em!important;text-align:center!important;max-width:200px!important;}.maplibregl-popup-content a{outline:none!important;}.maplibregl-popup-content a:focus,.maplibregl-popup-content a:focus-visible{outline:none!important;box-shadow:none!important;}.maplibregl-popup-tip{display:none!important;}.maplibregl-popup{max-width:200px!important;}';
  document.head.appendChild(popupStyle);

  var pendingFlyIdx = null;
  var mapReady = false;

  document.addEventListener('click', (ev) => {
    var storeEl = ev.target.closest('.store--list-info');
    if (!storeEl) return;
    if (ev.target.closest('a')) return;
    var idx = features.findIndex((f) => f._el === storeEl);
    if (idx < 0) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (mapReady) flyToStore(idx);
    else pendingFlyIdx = idx;
  }, true);

  var allBounds = new maplibregl.LngLatBounds();
  features.forEach((f) => allBounds.extend(f.geometry.coordinates));

  var map = new maplibregl.Map({
    container: container,
    style: MAP_STYLE,
    bounds: allBounds,
    fitBoundsOptions: { padding: FIT_PADDING, maxZoom: 10 },
    projection: 'mercator',
    attributionControl: false,
  });

  map.scrollZoom.disable();
  if (map.touchZoomRotate) map.touchZoomRotate.enable();
  if (map.touchPitch) map.touchPitch.disable();

  map.getCanvas().addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    map.zoomTo(map.getZoom() + (-e.deltaY * 0.01), { duration: 0 });
  }, { passive: false });

  var currentPopup = null;

  function flyToStore(idx) {
    var f = features[idx];
    if (!f) return;
    map.flyTo({ center: f.geometry.coordinates, zoom: FLY_ZOOM, duration: FLY_DURATION, essential: true });
    openPopupFor(f);
  }

  function flyToRegion(region) {
    var regionFeatures = features.filter((f) => f._region === region);
    if (!regionFeatures.length) return;
    if (currentPopup) { currentPopup.remove(); currentPopup = null; }
    if (regionFeatures.length === 1) {
      map.flyTo({ center: regionFeatures[0].geometry.coordinates, zoom: REGION_MAX_ZOOM, duration: REGION_FLY_DURATION, essential: true });
      return;
    }
    var b = new maplibregl.LngLatBounds();
    regionFeatures.forEach((f) => b.extend(f.geometry.coordinates));
    map.fitBounds(b, { padding: REGION_FIT_PADDING, maxZoom: REGION_MAX_ZOOM, duration: REGION_FLY_DURATION, essential: true });
  }

  function openPopupFor(f) {
    if (currentPopup) { currentPopup.remove(); currentPopup = null; }
    var html = '<div style="color:#1F1D21;">' + f.properties.name + '</div>';
    if (f.properties.address) html += '<div style="color:#7a7466;">' + f.properties.address + '</div>';
    if (f.properties.mapsUrl) html += '<a href="' + f.properties.mapsUrl + '" target="_blank" rel="noopener" style="font-family:ibm-plex-sans-jp,sans-serif;font-size:0.625rem;text-decoration:underline;color:#1F1D21;letter-spacing:0.05rem;text-transform:uppercase;line-height:1.4;display:inline-block;margin-top:0.25rem;">' + DIRECTIONS_LABEL + '</a>';
    currentPopup = new maplibregl.Popup({ anchor: 'bottom', offset: POPUP_OFFSET, closeButton: false, maxWidth: '200px', focusAfterOpen: false })
      .setLngLat(f.geometry.coordinates)
      .setHTML(html)
      .addTo(map);
  }

  function buildBorderedPinImage(img) {
    var p = PIN_BORDER_PADDING;
    var w = img.width + p * 2;
    var h = img.height + p * 2;

    var silCanvas = document.createElement('canvas');
    silCanvas.width = w;
    silCanvas.height = h;
    var silCtx = silCanvas.getContext('2d');
    silCtx.drawImage(img, p, p);
    silCtx.globalCompositeOperation = 'source-in';
    silCtx.fillStyle = PIN_BORDER_COLOR;
    silCtx.fillRect(0, 0, w, h);

    var borderCanvas = document.createElement('canvas');
    borderCanvas.width = w;
    borderCanvas.height = h;
    var borderCtx = borderCanvas.getContext('2d');
    for (var dx = -PIN_BORDER_WIDTH; dx <= PIN_BORDER_WIDTH; dx++) {
      for (var dy = -PIN_BORDER_WIDTH; dy <= PIN_BORDER_WIDTH; dy++) {
        if (dx === 0 && dy === 0) continue;
        borderCtx.drawImage(silCanvas, dx, dy);
      }
    }
    borderCtx.globalCompositeOperation = 'destination-out';
    borderCtx.drawImage(silCanvas, 0, 0);

    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.globalAlpha = PIN_BORDER_OPACITY;
    ctx.drawImage(borderCanvas, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(img, p, p);

    return ctx.getImageData(0, 0, w, h);
  }

  function loadPinImage() {
    if (map.hasImage(PIN_IMAGE_ID)) return;
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (map.hasImage(PIN_IMAGE_ID)) return;
      map.addImage(PIN_IMAGE_ID, buildBorderedPinImage(img));
    };
    img.src = PIN_IMAGE_URL;
  }

  map.on('styleimagemissing', (e) => {
    if (e.id === PIN_IMAGE_ID) loadPinImage();
  });

  map.on('load', () => {
    loadPinImage();

    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: features.map((f, i) => ({ type: 'Feature', id: i, geometry: f.geometry, properties: f.properties })) },
    });

    map.addLayer({
      id: LAYER_ID,
      type: 'symbol',
      source: SOURCE_ID,
      layout: {
        'icon-image': PIN_IMAGE_ID,
        'icon-size': PIN_SIZE,
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom',
      },
      paint: {
        'icon-opacity': 1,
      },
    });

    map.on('mousemove', LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', LAYER_ID, () => {
      map.getCanvas().style.cursor = '';
    });

    map.on('click', LAYER_ID, (e) => {
      if (e.features.length) flyToStore(e.features[0].id);
    });

    mapReady = true;
    if (pendingFlyIdx !== null) { flyToStore(pendingFlyIdx); pendingFlyIdx = null; }

    var regionTabs = document.querySelectorAll('.store--title-grid .title-block[data-region]');
    var regionCounts = {};
    features.forEach((f) => { if (f._region) regionCounts[f._region] = (regionCounts[f._region] || 0) + 1; });
    regionTabs.forEach((tab) => {
      var region = tab.dataset.region;
      var count = regionCounts[region];
      if (count) {
        tab.style.position = 'relative';
        var badge = document.createElement('span');
        badge.textContent = count;
        badge.style.cssText = 'position:absolute;top:-0.1em;left:100%;font-family:optima,serif;font-style:italic;font-size:0.65em;margin-left:0.1em;pointer-events:none;';
        tab.appendChild(badge);
      }
      tab.addEventListener('click', () => flyToRegion(region));
    });

    var firstRegion = regionTabs[0]?.dataset.region;
    if (firstRegion) flyToRegion(firstRegion);
  });

  window.addEventListener('resize', () => map.resize());
  window.addEventListener('layout-change', () => map.resize());
});
