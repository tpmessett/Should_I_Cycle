function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  var london = new google.maps.LatLng(51.5074, 0.1278);
  mapOptions = {
    zoom: 21,
    center: london
  }
  var map = new google.maps.Map(document.getElementById('map'), mapOptions);
  directionsRenderer.setMap(map);
}

function calcRoute(count) {
  var start = document.getElementById('from').value;
  var end = document.getElementById('to').value;
  var london = new google.maps.LatLng(51.5074, 0.1278);
  let c = count
  let t = 'TRANSIT'
  if (c >= 0){
    t = 'BICYCLING'
  }
  var request = {
    origin: start,
    destination: end,
    travelMode: `${t}`,
  };
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsRenderer.setDirections(result);
    }
  });
}

