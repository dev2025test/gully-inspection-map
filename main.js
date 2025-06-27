// All JavaScript from index.html will be placed here, organized by section. 

/**
 * Filters visible assets on the map based on search text and selected layer.
 * Matches asset id, status, or marker description/title.
 */
function filterAssets() {
  const searchText = document.getElementById('assetSearchInput').value.trim().toLowerCase();
  const selectedLayer = document.getElementById('assetSearchLayer').value;
  gullyData.forEach(gully => {
    let matchesLayer = (selectedLayer === 'all' || gully.layer === selectedLayer);
    let matchesText = false;
    // Try to match id, status, or description (if available)
    if (searchText === '') {
      matchesText = true;
    } else {
      const idMatch = gully.id && gully.id.toLowerCase().includes(searchText);
      const statusMatch = gully.status && gully.status.toLowerCase().includes(searchText);
      let descMatch = false;
      if (gully.marker && gully.marker.options && gully.marker.options.title) {
        descMatch = gully.marker.options.title.toLowerCase().includes(searchText);
      }
      matchesText = idMatch || statusMatch || descMatch;
    }
    if (matchesLayer && matchesText) {
      if (gully.marker.setOpacity) gully.marker.setOpacity(1);
      if (gully.marker._icon) gully.marker._icon.style.display = '';
    } else {
      if (gully.marker.setOpacity) gully.marker.setOpacity(0.2);
      if (gully.marker._icon) gully.marker._icon.style.display = matchesLayer ? '' : 'none';
    }
  });
}

document.getElementById('assetSearchInput').addEventListener('input', filterAssets);
document.getElementById('assetSearchLayer').addEventListener('change', filterAssets);

/**
 * Shows a global loading spinner with a message.
 * @param {string} message - The message to display.
 */
function showLoading(message = 'Loading...') {
  let loadingDiv = document.getElementById('global-loading-spinner');
  if (!loadingDiv) {
    loadingDiv = document.createElement('div');
    loadingDiv.id = 'global-loading-spinner';
    loadingDiv.className = 'loading-spinner';
    loadingDiv.innerHTML = `
      <div class="spinner"></div>
      <div id="global-loading-message">${message}</div>
    `;
    document.body.appendChild(loadingDiv);
  } else {
    document.getElementById('global-loading-message').textContent = message;
    loadingDiv.style.display = 'block';
  }
}

/**
 * Hides the global loading spinner.
 */
function hideLoading() {
  const loadingDiv = document.getElementById('global-loading-spinner');
  if (loadingDiv) loadingDiv.style.display = 'none';
}

// Example usage in async actions (wrap existing logic):
// showLoading('Importing data...');
// ... do async work ...
// hideLoading();

// Patch into import, export, backup, load backup, reset map, etc.
const originalHandleImportFile = window.handleImportFile;
window.handleImportFile = async function(event) {
  try {
    showLoading('Importing data...');
    await originalHandleImportFile(event);
  } catch (err) {
    alert('Error importing file: ' + (err.message || err));
    console.error(err);
  } finally {
    hideLoading();
  }
};

const originalExportData = window.exportData;
window.exportData = async function() {
  try {
    showLoading('Exporting data...');
    await originalExportData();
  } catch (err) {
    alert('Error exporting data: ' + (err.message || err));
    console.error(err);
  } finally {
    hideLoading();
  }
};

const originalSaveGullyData = window.saveGullyData;
window.saveGullyData = async function() {
  try {
    showLoading('Backing up data...');
    await originalSaveGullyData();
  } catch (err) {
    alert('Error backing up data: ' + (err.message || err));
    console.error(err);
  } finally {
    hideLoading();
  }
};

const originalLoadFromBackup = window.loadFromBackup;
window.loadFromBackup = async function() {
  try {
    showLoading('Loading backup...');
    await originalLoadFromBackup();
  } catch (err) {
    alert('Error loading backup: ' + (err.message || err));
    console.error(err);
  } finally {
    hideLoading();
  }
};

const originalResetMap = window.resetMap;
window.resetMap = async function() {
  try {
    showLoading('Resetting map...');
    await originalResetMap();
  } catch (err) {
    alert('Error resetting map: ' + (err.message || err));
    console.error(err);
  } finally {
    hideLoading();
  }
};

// --- Marker Clustering Setup ---
// Use clustering for non-gully layers
window.dataLayers = {
  gullies: L.layerGroup(),
  playgrounds: L.markerClusterGroup(),
  walkways: L.markerClusterGroup(),
  signage: L.markerClusterGroup(),
  lining: L.markerClusterGroup()
};

/**
 * Add a marker to the map and the correct layer/cluster group.
 * For gullies, use circleMarker; for others, use marker and clustering.
 */
function addGullyToMap(latlng, gullyId, layerType = 'gullies', status = 'Unmarked') {
    let marker;
    if (layerType === 'gullies') {
        marker = L.circleMarker([latlng.lat, latlng.lng], getMarkerOptions(status));
    } else if (layerIcons[layerType]) {
        marker = L.marker([latlng.lat, latlng.lng], { icon: layerIcons[layerType] });
    } else {
        marker = L.marker([latlng.lat, latlng.lng]); // fallback
    }
    // Add to the correct layer group or cluster group
    if (window.dataLayers && window.dataLayers[layerType]) {
        window.dataLayers[layerType].addLayer(marker);
    } else {
        console.warn('Layer not found:', layerType);
        marker.addTo(window.map);
    }
    marker.on('click', function(e) {
        if (deleteMode) {
            handleGullyDelete(gullyId, marker, layerType);
        } else {
            currentMarker = marker;
            showInspectionPopup(marker, gullyId, latlng, layerType);
        }
    });
    marker.on('mouseover', function() {
        if (deleteMode && layerType === 'gullies') {
            marker.setStyle({ radius: 10 });
        }
    });
    marker.on('mouseout', function() {
        if (deleteMode && layerType === 'gullies') {
            marker.setStyle({ radius: 8 });
        } else if (layerType === 'gullies') {
            marker.setStyle({ radius: 6 });
        }
    });
    gullyData.push({ 
        marker, 
        id: gullyId, 
        layer: layerType,
        status: status
    });
    return marker;
}

// When initializing the map, add all cluster groups to the map if they have data
// (This is handled in your existing map/layer logic) 
