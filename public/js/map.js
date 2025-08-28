maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
  container: "map", // container's id or the HTML element in which the SDK will render the map
  style: maptilersdk.MapStyle.STREETS,
  center: [80.3319, 26.4499], // starting position [lng, lat]
  zoom: 14, // starting zoom
});
