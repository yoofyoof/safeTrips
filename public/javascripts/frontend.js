let map;

// eslint-disable-next-line no-unused-vars
function initMap() {
  //set san fran as initial center
  const options = {
    zoom: 8,
    mapTypeControl: false,
    center: { lat: 37.7749, lng: -122.4194 },
  };
  // set inital location on the new map and set autocomplete
  // eslint-disable-next-line no-undef
  map = new google.maps.Map(document.getElementById("map"), options);
  new AutocompleteDirectionsHandler(map);

  //<------------------start search box ----------------->
  //<-------allow single point search and autocomplete for report address------>
  // eslint-disable-next-line no-undef
  var input2 = document.getElementById("report-address");
  // eslint-disable-next-line no-undef

  // eslint-disable-next-line no-undef
  var searchBox2 = new google.maps.places.SearchBox(input2);

  map.addListener("bounds_changed", function () {
    searchBox2.setBounds(map.getBounds());
  });

  var markers = [];

  searchBox2.addListener("places_changed", function () {
    var places = searchBox2.getPlaces();
    if (places.length === 0) return;

    markers.forEach(function (currentMarker) {
      currentMarker.setMap(null);
    });

    markers = [];
    // eslint-disable-next-line no-undef
    var bounds = new google.maps.LatLngBounds();

    places.forEach(function (p) {
      if (!p.geometry) return;

      markers.push(
        // eslint-disable-next-line no-undef
        new google.maps.Marker({
          map: map,
          title: p.name,
          position: p.geometry.location,
        })
      );

      if (p.geometry.viewport) bounds.union(p.geometry.viewport);
      else bounds.extend(p.geometry.location);
    });
    map.fitBounds(bounds);
  });

  loadReports();
}

//<------------------ geocode conversion and load marker start----------------->
function codeAddress(location, event) {
  // eslint-disable-next-line no-undef
  const geocoder = new google.maps.Geocoder();

  geocoder.geocode({ address: location }, (results, status) => {
    if (status === "OK") {
      var myLatLong = results[0].geometry.location;
      addMarker({ latLng: myLatLong, content: event });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

//<------------------ geocode conversion and load marker ends----------------->

//<------------------ add  marker function start ----------------->
//added marker show info(crime type), need to load crime type from db
function addMarker(property) {
  // eslint-disable-next-line no-undef
  var marker = new google.maps.Marker({
    position: property.latLng,
    map: map,
    icon:
      "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
  });

  // add disply info to marker property after check it's not null
  if (property.content) {
    // eslint-disable-next-line no-undef
    var infoWindow = new google.maps.InfoWindow({
      content: property.content,
    });

    marker.addListener("click", function () {
      infoWindow.open(map, marker);
      console.log("clicked");
    });
  }
}
//<------------------ add marker function ends----------------->

//<------------------start load data and display marker  ----------------->
async function loadReports() {
  try {
    const resRaw1 = await fetch("/getLogin");
    const res1 = await resRaw1.json();
    if (res1.username) {
      showLogoutButton(res1.username);
    }

    const resRaw = await fetch("/getReports");
    const res = resRaw.json();

    res.then(function (result) {
      let resultArray = result["resultArray"];
      for (let i = 0; i < resultArray.length; i++) {
        const address = resultArray[i].address;
        console.log(address);
        const event = resultArray[i].event;
        codeAddress(address, event);
      }
    });
  } catch (e) {
    console.log("error", e);
  }
}

//<------------------end load data and display marker  ----------------->

//<----------start autocomplete and direction ------------------>
class AutocompleteDirectionsHandler {
  constructor(map) {
    this.map = map;
    this.originPlaceId = "";
    this.destinationPlaceId = "";
    // eslint-disable-next-line no-undef
    this.travelMode = google.maps.TravelMode.DRIVING;
    // eslint-disable-next-line no-undef
    this.directionsService = new google.maps.DirectionsService();
    // eslint-disable-next-line no-undef
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(map);
    const originInput = document.getElementById("search-from");
    const destinationInput = document.getElementById("search-to");
    // eslint-disable-next-line no-undef
    const originAutocomplete = new google.maps.places.Autocomplete(originInput);
    // Specify just the place data fields that you need.
    originAutocomplete.setFields(["place_id"]);
    // eslint-disable-next-line no-undef
    const destinationAutocomplete = new google.maps.places.Autocomplete(
      destinationInput
    );
    this.setupPlaceChangedListener(originAutocomplete, "ORIG");
    this.setupPlaceChangedListener(destinationAutocomplete, "DEST");
  }
  // Sets a listener on a radio button to change the filter type on Places
  // Autocomplete.
  setupClickListener(id, mode) {
    const radioButton = document.getElementById(id);
    radioButton.addEventListener("click", () => {
      this.travelMode = mode;
      this.route();
    });
  }
  setupPlaceChangedListener(autocomplete, mode) {
    autocomplete.bindTo("bounds", this.map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.place_id) {
        window.alert("Please select an option from the dropdown list.");
        return;
      }

      if (mode === "ORIG") {
        this.originPlaceId = place.place_id;
      } else {
        this.destinationPlaceId = place.place_id;
      }
      this.route();
    });
  }
  route() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
      return;
    }
    const me = this;
    this.directionsService.route(
      {
        origin: { placeId: this.originPlaceId },
        destination: { placeId: this.destinationPlaceId },
        travelMode: this.travelMode,
      },
      (response, status) => {
        if (status === "OK") {
          me.directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }
}
//<----------end autocomplete and direction ------------------>

// go to login page from homepage
let homeLogin = document.querySelector("#login");
homeLogin.addEventListener("click", homepageLogin);

function homepageLogin() {
  window.location.href = "login.html";
}

// show logout button after login
// eslint-disable-next-line no-unused-vars
function showLogoutButton(username) {
  const loginButton = document.querySelector("#login");
  const logoutButton = document.querySelector("#logout");
  const loginUser = document.querySelector("#user");
  loginButton.style.display = "none";
  logoutButton.style.display = "block";
  loginUser.textContent = username;
}

// show login button after logout
let homeLogout = document.querySelector("#logout");
homeLogout.addEventListener("click", hideLogoutButton);

async function hideLogoutButton() {
  await fetch("/logout");

  const loginButton = document.querySelector("#login");
  const logoutButton = document.querySelector("#logout");
  const loginUser = document.querySelector("#user");
  loginButton.style.display = "block";
  logoutButton.style.display = "none";
  loginUser.textContent = "";
}
