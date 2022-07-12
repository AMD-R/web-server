// Getting AMD-R id
const id = window.location.pathname.split('/')[2];

// Setting up variables
let name = document.getElementById('name');
let battery = document.getElementById('battery');
let battery_bar = document.getElementById('battery-bar');
let speed = document.getElementById('speed');
let speed_bar = document.getElementById('speed-bar');
let task = document.getElementById('task');

// Setting up openstreet map
var coords = [2.947, 101.8752];
// Map
var map = L.map('map').setView(coords, 19);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
// Marker
var marker = L.marker(coords).addTo(map);
marker.on('move', (e) => {
  map.panTo(e.latlng);
});

async function getData(id) {
  const res = await fetch('/api/amd-r/getData', {
    method: 'POST',
    body: JSON.stringify({ id }),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json()

  // Changing elements
  name.innerHTML = data.name;
  battery.innerHTML = data.battery + "%";
  battery_bar.style.width = data.battery + "%";
  speed.innerHTML = data.speed + " m/s";
  speed_bar.style.width = data.speed / 2 * 100 + "%";
  task.innerHTML = data.mission;

  // Updating map
  // Setting up coords
  if (data.gps.lat != undefined && data.gps.lon != undefined) {
    coords = data.gps;
  }
  marker.setLatLng(coords);

  setTimeout(() => {
    getData(id)
  }, 1000);
};
getData(id, map);
