!function e(n,a,o){function t(l,i){if(!a[l]){if(!n[l]){var s="function"==typeof require&&require;if(!i&&s)return s(l,!0);if(r)return r(l,!0);var c=new Error("Cannot find module '"+l+"'");throw c.code="MODULE_NOT_FOUND",c}var f=a[l]={exports:{}};n[l][0].call(f.exports,function(e){var a=n[l][1][e];return t(a||e)},f,f.exports,e,n,a,o)}return a[l].exports}for(var r="function"==typeof require&&require,l=0;l<o.length;l++)t(o[l]);return t}({1:[function(e,n,a){"use strict";window.Atlas=function(){var e={},n=!1,a=!1;window.addEventListener("keydown",function(o){a=String.fromCharCode(o.which).toLowerCase(),o.ctrlKey&&(n=!0,e[a]&&e[a](o))}),window.addEventListener("keyup",function(e){n=!1,a=!1});var o={init:function(){return new Promise(function(e,n){google.maps.event.addDomListener(window,"load",e)})},setMap:function(e){o.map=e},isShiftClick:function(){return n},map:!1,markers:[],addMarker:function(e,n){var a=n||{};e.name||(e.name="Location "+o.markers.length);var t=new google.maps.Marker({position:new google.maps.LatLng(e.lat,e.lng),map:e.map,title:e.name}),r={ref:t,data:e};o.markers.push(r);var l=o.markers.length-1;for(var i in e.events)!function(n){google.maps.event.addListener(t,n,function(a){e.events[n](a,t,l)})}(i);return a.readOnly||o.saveMarkers(window.MAP_TAG,o.markers),r},removeMarker:function(e,n){var a=n||{},t=o.markers[e];t&&(t.ref.setMap(null),o.markers[e]=null),a.readOnly||o.saveMarkers(window.MAP_TAG,o.markers)},updateIcons:function(e,n){e.forEach(function(e,a){var o=e.ref.getIcon(),t=n(o,e,a);e.ref.setIcon(t)})},updateName:function(e){return new Promise(function(n,a){var t=o.markers[e];vex.dialog.prompt({message:"Update Marker Name",value:t.data.name,placeholder:"Location "+e,callback:function(e){e?(t.data.name=e,o.saveMarkers(window.MAP_TAG,o.markers),n(!0)):n(!1)}})})},markersToString:function(e){var n="";return e.forEach(function(e,a){if(null!==e){var o=e.ref.position,t=e.data.name||"Location "+a;n+=o.lat()+","+o.lng()+","+t+"$"}}),n},markersFromString:function(e){return e.split("$").map(function(e){return e.split(",")}).filter(function(e){return 1!==e.length}).map(function(e,n){return{lat:parseFloat(e[0]),lng:parseFloat(e[1]),name:e[2]||"Location "+n}})},saveMarkers:function(e,n){e&&localStorage.setItem(e,o.markersToString(n))},loadMarkers:function(e){var n=localStorage.getItem(e);return!!n&&o.markersFromString(n)},lastInfoWindow:!1,addDefaultMarker:function(e){var n=o.addMarker({map:e.map,name:e.name,lat:e.coord.lat,lng:e.coord.lng,events:{click:function(e,n,a){if(console.log("click",a),o.isShiftClick())o.removeMarker(a);else{var t=o.markers[a],r=new google.maps.InfoWindow({content:t.data.name});o.map&&(r.open(o.map,t.ref),o.lastInfoWindow&&(o.lastInfoWindow.close(),o.lastInfoWindow=!1),o.lastInfoWindow=r)}},dblclick:function(e,n,a){console.log("dblclick",a),o.updateName(a).then(function(e){e&&o.lastInfoWindow&&(o.lastInfoWindow.close(),o.lastInfoWindow=!1)})}}});return n.ref.setIcon({path:google.maps.SymbolPath.CIRCLE,scale:7.5,fillColor:"#F00",fillOpacity:.5,strokeWeight:0}),n},addViewMarker:function(e){var n=o.addMarker({map:e.map,lat:e.coord.lat,lng:e.coord.lng,events:{click:function(n,a,t){console.log("click",t,e);var r=o.markers[t],l=r.data,i="\n                            <h3>"+(l.name||"Location "+t)+"</h3>\n                            <ul>\n                                <li>Time: "+l.time+"</li>\n                                <li>Infected: "+l.infected+"</li>\n                            </ul>\n                        ",s=new google.maps.InfoWindow({content:i});o.map&&(s.open(o.map,r.ref),o.lastInfoWindow&&(o.lastInfoWindow.close(),o.lastInfoWindow=!1),o.lastInfoWindow=s)}}},{readOnly:!0}),a=e.icon||{scale:0};return n.ref.setIcon({path:google.maps.SymbolPath.CIRCLE,scale:1+9*a.scale,fillColor:"#F00",fillOpacity:.5,strokeWeight:0}),n},addCustomMarker:function(e){var n=o.addMarker({map:e.map,lat:e.coord.lat,lng:e.coord.lng,events:{click:function(n,a,t){console.log("click",t,e);var r=o.markers[t],l=new google.maps.InfoWindow({content:e.text});o.map&&(l.open(o.map,r.ref),o.lastInfoWindow&&(o.lastInfoWindow.close(),o.lastInfoWindow=!1),o.lastInfoWindow=l)}}},{readOnly:!0}),a=e.icon||{size:0,color:"rgb(0,0,0)",opacity:1};return n.ref.setIcon({path:google.maps.SymbolPath.CIRCLE,scale:a.size,fillColor:a.color,fillOpacity:a.opacity,strokeWeight:0}),n},loadMapFromData:function(e,n){n.split("$@@$").map(function(e){return e.split("$@$")}).forEach(function(n){var a=parseFloat(n[0]),t=parseFloat(n[1]),r=n[2],l=parseFloat(n[3]),i=parseFloat(n[4]),s=n[5];o.addCustomMarker({map:e,coord:{lat:a,lng:t},icon:{size:l,color:r,opacity:i},text:s})});var a=o.markers[0];a&&e.setCenter({lat:a.data.lat,lng:a.data.lng})},removeThemeLabels:function(e){return["labels","labels.text.fill","labels.text.stroke"].forEach(function(n){e.push({elementType:"labels",stylers:[{visibility:"off"}]})}),e},changeMapStyle:function(e,n,a){var t=o.removeThemeLabels(a),r=new google.maps.StyledMapType(t,{map:e,name:n});e.mapTypes.set(n,r),e.setMapTypeId(n)},getMapStyleByURL:function(e){return function n(a){return new Promise(function(o,t){$.get("https://snazzymaps.com/explore.json?key=6fbb0a74-ec67-4329-83ee-15edd4740c4b",{page:a},function(a){a.styles.forEach(function(n){n.url===e&&o(n)});var r=a.pagination.currentPage+1;r>a.pagination.totalPages?t("Could not find style."):n(r).then(function(e){o(e)}).catch(t)}).error(function(e,n,a){t(a)})})}(1)},setHotKey:function(n,a){e[n]=a}};return o}},{}]},{},[1]);
//# sourceMappingURL=maps/atlas.js.map
