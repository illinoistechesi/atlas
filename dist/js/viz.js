!function e(t,a,n){function o(i,l){if(!a[i]){if(!t[i]){var c="function"==typeof require&&require;if(!l&&c)return c(i,!0);if(r)return r(i,!0);var s=new Error("Cannot find module '"+i+"'");throw s.code="MODULE_NOT_FOUND",s}var m=a[i]={exports:{}};t[i][0].call(m.exports,function(e){var a=t[i][1][e];return o(a||e)},m,m.exports,e,t,a,n)}return a[i].exports}for(var r="function"==typeof require&&require,i=0;i<n.length;i++)o(n[i]);return o}({1:[function(e,t,a){"use strict";var n=function(e,t){for(var a=document.getElementsByClassName(e),n=0;n<a.length;n++)a[n].innerText=t},o=Atlas();o.init().then(function(e){var t={zoom:15,center:new google.maps.LatLng(41.259716,-95.960588),styles:o.removeThemeLabels(MAP_STYLES)},a=document.getElementById("map"),r=new google.maps.Map(a,t);window.mapRef=r,o.setMap(r);var i=localStorage.getItem("map-theme-tag"),l=localStorage.getItem("map-theme-style");if(i&&l){var c=JSON.parse(l);o.changeMapStyle(r,i,c)}var s=function(e){var t=[],a=0;e.split("%").forEach(function(e){var n=e.trim().split(":"),o=parseInt(n[0]),r=[];n[1]&&n[1].split("$").forEach(function(e){var t=e.split(","),n=parseInt(t[0]),o=parseInt(t[1]);r[n]={id:n,infected:o},o>a&&(a=o)}),t.push({time:o,locations:r})});var r=function(e){n("fill-sim-time",e);var r=t[e];r&&o.updateIcons(o.markers,function(t,n,o){var i=(r.locations[o]||{}).infected||0,l=i/a;return t.scale=1+9*l,n.data.time=e,n.data.infected=i,t})},i=0,l=t.length-1;document.getElementById("back").addEventListener("click",function(e){--i<0&&(i=0),r(i)}),document.getElementById("forward").addEventListener("click",function(e){++i>l&&(i=l),r(i)});var c=document.getElementById("time");c.step=1,c.min=0,c.max=t.length-1,c.value=0,r(0),c.addEventListener("input",function(e){var t=parseInt(e.target.value);r(t),i=t});var s=void 0;o.setHotKey("p",function(e){s?vex.dialog.confirm({message:"Stop simulation?",callback:function(e){e&&(clearInterval(s),s=!1)}}):vex.dialog.prompt({message:"Select simulation speed (ms/step):",value:250,callback:function(e){if(e){var t=0;s=setInterval(function(){r(t),++t>l&&(clearInterval(s),s=!1)},e)}}})})},m=document.getElementById("shortcuts-list");document.getElementById("shortcuts").addEventListener("click",function(e){var t=document.createElement("div");t.innerHTML=m.innerHTML,vex.dialog.alert({unsafeMessage:t.outerHTML})}),vex.dialog.prompt({message:"Enter a key to load a map:",callback:function(e){if(e){var t=o.loadMarkers(e);if(t){t.forEach(function(e){e.map=r,o.addViewMarker({map:r,coord:e});var t=o.markers[0];t&&r.setCenter({lat:t.data.lat,lng:t.data.lng})});var a=localStorage.getItem("data-"+e);a?(s(a),vex.dialog.alert("Loaded existing simulation on map: "+e)):vex.dialog.alert("Loaded existing map: "+e)}else vex.dialog.alert("Map not found: "+e);window.MAP_TAG=e}}}),o.setHotKey("t",function(e){vex.dialog.prompt({message:"Enter map theme URL:",callback:function(e){o.getMapStyleByURL(e).then(function(e){localStorage.setItem("map-theme-tag",e.name),localStorage.setItem("map-theme-style",e.json);var t=e.name,a=JSON.parse(e.json);o.changeMapStyle(r,t,a),vex.dialog.alert("Changed map theme to: "+t)}).catch(function(e){vex.dialog.alert("Error: "+e)})}})}),o.setHotKey("v",function(e){vex.dialog.prompt({message:"Enter simulation data for map: "+window.MAP_TAG,callback:function(e){localStorage.setItem("data-"+window.MAP_TAG,e),s(e)}})})})},{}]},{},[1]);
//# sourceMappingURL=maps/viz.js.map
