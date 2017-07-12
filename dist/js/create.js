(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var atlas = Atlas();

atlas.init().then(function (done) {

    var mapOptions = {
        zoom: 15,
        center: new google.maps.LatLng(41.259716, -95.960588),
        styles: atlas.removeThemeLabels(MAP_STYLES)
    };

    var mapElement = document.getElementById('map');

    var map = new google.maps.Map(mapElement, mapOptions);
    window.mapRef = map;
    atlas.setMap(map);

    var mapThemeTag = localStorage.getItem('map-theme-tag');
    var mapThemeStyle = localStorage.getItem('map-theme-style');
    if (mapThemeTag && mapThemeStyle) {
        var theme = JSON.parse(mapThemeStyle);
        atlas.changeMapStyle(map, mapThemeTag, theme);
    }

    google.maps.event.addListener(map, 'click', function (e) {
        if (atlas.isShiftClick()) {
            var coord = e.latLng;
            var entry = atlas.addDefaultMarker({
                map: map,
                coord: {
                    lat: coord.lat(),
                    lng: coord.lng()
                }
            });
            /*atlas.updateName(atlas.markers.length - 1).then(added => {
                if(!added){
                    atlas.removeMarker(atlas.markers.length - 1);
                }
            });*/
        }
    });

    vex.dialog.prompt({
        message: 'Enter a key to create or load a map:',
        callback: function callback(value) {
            if (value) {
                var loaded = atlas.loadMarkers(value);
                if (loaded) {
                    loaded.forEach(function (coord) {
                        coord.map = map;
                        atlas.addDefaultMarker({
                            map: map,
                            coord: coord,
                            name: coord.name
                        });
                        var first = atlas.markers[0];
                        if (first) {
                            map.setCenter({
                                lat: first.data.lat,
                                lng: first.data.lng
                            });
                        }
                    });
                    vex.dialog.alert('Loaded existing map: ' + value);
                } else {
                    vex.dialog.alert('Created new map: ' + value);
                }
                window.MAP_TAG = value;
            }
        }
    });

    var importCoordinates = function importCoordinates(tag) {
        vex.dialog.prompt({
            message: 'Import your coordinates:',
            callback: function callback(value) {
                localStorage.setItem(tag, value);
            }
        });
    };

    var shortcutsList = document.getElementById('shortcuts-list');
    document.getElementById('shortcuts').addEventListener('click', function (e) {
        var displayList = document.createElement('div');
        displayList.innerHTML = shortcutsList.innerHTML;
        vex.dialog.alert({
            unsafeMessage: displayList.outerHTML
        });
    });

    atlas.setHotKey('i', function (e) {
        vex.dialog.prompt({
            message: 'Enter a key for this map:',
            callback: function callback(tag) {
                var existing = localStorage.getItem(tag);
                if (existing) {
                    vex.dialog.confirm({
                        message: 'This will overwrite an existing map, are you sure?',
                        callback: function callback(yes) {
                            if (yes) {
                                importCoordinates(tag);
                            }
                        }
                    });
                } else {
                    importCoordinates(tag);
                }
            }
        });
    });

    atlas.setHotKey('e', function (e) {
        vex.dialog.prompt({
            message: 'Exported coordinates:',
            value: atlas.markersToString(atlas.markers),
            callback: function callback(value) {}
        });
    });

    atlas.setHotKey('t', function (e) {
        vex.dialog.prompt({
            message: 'Enter map theme URL:',
            callback: function callback(value) {
                atlas.getMapStyleByURL(value).then(function (style) {
                    localStorage.setItem('map-theme-tag', style.name);
                    localStorage.setItem('map-theme-style', style.json);
                    var tag = style.name;
                    var theme = JSON.parse(style.json);
                    atlas.changeMapStyle(map, tag, theme);

                    vex.dialog.alert('Changed map theme to: ' + tag);
                }).catch(function (err) {
                    vex.dialog.alert('Error: ' + err);
                });
            }
        });
    });
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvY3JlYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFJLFFBQVEsT0FBWjs7QUFFQSxNQUFNLElBQU4sR0FBYSxJQUFiLENBQWtCLGdCQUFROztBQUV0QixRQUFJLGFBQWE7QUFDYixjQUFNLEVBRE87QUFFYixnQkFBUSxJQUFJLE9BQU8sSUFBUCxDQUFZLE1BQWhCLENBQXVCLFNBQXZCLEVBQWtDLENBQUMsU0FBbkMsQ0FGSztBQUdiLGdCQUFRLE1BQU0saUJBQU4sQ0FBd0IsVUFBeEI7QUFISyxLQUFqQjs7QUFNQSxRQUFJLGFBQWEsU0FBUyxjQUFULENBQXdCLEtBQXhCLENBQWpCOztBQUVBLFFBQUksTUFBTSxJQUFJLE9BQU8sSUFBUCxDQUFZLEdBQWhCLENBQW9CLFVBQXBCLEVBQWdDLFVBQWhDLENBQVY7QUFDQSxXQUFPLE1BQVAsR0FBZ0IsR0FBaEI7QUFDQSxVQUFNLE1BQU4sQ0FBYSxHQUFiOztBQUVBLFFBQUksY0FBYyxhQUFhLE9BQWIsQ0FBcUIsZUFBckIsQ0FBbEI7QUFDQSxRQUFJLGdCQUFnQixhQUFhLE9BQWIsQ0FBcUIsaUJBQXJCLENBQXBCO0FBQ0EsUUFBRyxlQUFlLGFBQWxCLEVBQWdDO0FBQzVCLFlBQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxhQUFYLENBQVo7QUFDQSxjQUFNLGNBQU4sQ0FBcUIsR0FBckIsRUFBMEIsV0FBMUIsRUFBdUMsS0FBdkM7QUFDSDs7QUFFRCxXQUFPLElBQVAsQ0FBWSxLQUFaLENBQWtCLFdBQWxCLENBQThCLEdBQTlCLEVBQW1DLE9BQW5DLEVBQTRDLGFBQUs7QUFDN0MsWUFBRyxNQUFNLFlBQU4sRUFBSCxFQUF3QjtBQUNwQixnQkFBSSxRQUFRLEVBQUUsTUFBZDtBQUNBLGdCQUFJLFFBQVEsTUFBTSxnQkFBTixDQUF1QjtBQUMvQixxQkFBSyxHQUQwQjtBQUUvQix1QkFBTztBQUNI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WCxDQUFrQjtBQUNkLHFCQUFTLHNCQURLO0FBRWQsc0JBQVUsa0JBQUMsS0FBRCxFQUFXO0FBQ2pCLHNCQUFNLGdCQUFOLENBQXVCLEtBQXZCLEVBQThCLElBQTlCLENBQW1DLGlCQUFTO0FBQ3hDLGlDQUFhLE9BQWIsQ0FBcUIsZUFBckIsRUFBc0MsTUFBTSxJQUE1QztBQUNBLGlDQUFhLE9BQWIsQ0FBcUIsaUJBQXJCLEVBQXdDLE1BQU0sSUFBOUM7QUFDQSx3QkFBSSxNQUFNLE1BQU0sSUFBaEI7QUFDQSx3QkFBSSxRQUFRLEtBQUssS0FBTCxDQUFXLE1BQU0sSUFBakIsQ0FBWjtBQUNBLDBCQUFNLGNBQU4sQ0FBcUIsR0FBckIsRUFBMEIsR0FBMUIsRUFBK0IsS0FBL0I7O0FBRUEsd0JBQUksTUFBSixDQUFXLEtBQVgsQ0FBaUIsMkJBQTJCLEdBQTVDO0FBQ0gsaUJBUkQsRUFRRyxLQVJILENBUVMsZUFBTztBQUNaLHdCQUFJLE1BQUosQ0FBVyxLQUFYLENBQWlCLFlBQVksR0FBN0I7QUFDSCxpQkFWRDtBQVdIO0FBZGEsU0FBbEI7QUFnQkgsS0FqQkQ7QUFtQkgsQ0F6SUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IGF0bGFzID0gQXRsYXMoKTtcblxuYXRsYXMuaW5pdCgpLnRoZW4oZG9uZSA9PiB7XG5cbiAgICBsZXQgbWFwT3B0aW9ucyA9IHtcbiAgICAgICAgem9vbTogMTUsXG4gICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyg0MS4yNTk3MTYsIC05NS45NjA1ODgpLFxuICAgICAgICBzdHlsZXM6IGF0bGFzLnJlbW92ZVRoZW1lTGFiZWxzKE1BUF9TVFlMRVMpXG4gICAgfTtcblxuICAgIGxldCBtYXBFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcCcpO1xuXG4gICAgbGV0IG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwRWxlbWVudCwgbWFwT3B0aW9ucyk7XG4gICAgd2luZG93Lm1hcFJlZiA9IG1hcDtcbiAgICBhdGxhcy5zZXRNYXAobWFwKTtcblxuICAgIGxldCBtYXBUaGVtZVRhZyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdtYXAtdGhlbWUtdGFnJyk7XG4gICAgbGV0IG1hcFRoZW1lU3R5bGUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbWFwLXRoZW1lLXN0eWxlJyk7XG4gICAgaWYobWFwVGhlbWVUYWcgJiYgbWFwVGhlbWVTdHlsZSl7XG4gICAgICAgIGxldCB0aGVtZSA9IEpTT04ucGFyc2UobWFwVGhlbWVTdHlsZSk7XG4gICAgICAgIGF0bGFzLmNoYW5nZU1hcFN0eWxlKG1hcCwgbWFwVGhlbWVUYWcsIHRoZW1lKTtcbiAgICB9XG5cbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXAsICdjbGljaycsIGUgPT4ge1xuICAgICAgICBpZihhdGxhcy5pc1NoaWZ0Q2xpY2soKSl7XG4gICAgICAgICAgICBsZXQgY29vcmQgPSBlLmxhdExuZztcbiAgICAgICAgICAgIGxldCBlbnRyeSA9IGF0bGFzLmFkZERlZmF1bHRNYXJrZXIoe1xuICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgIGNvb3JkOiB7XG4gICAgICAgICAgICAgICAgICAgIGxhdDogY29vcmQubGF0KCksXG4gICAgICAgICAgICAgICAgICAgIGxuZzogY29vcmQubG5nKClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8qYXRsYXMudXBkYXRlTmFtZShhdGxhcy5tYXJrZXJzLmxlbmd0aCAtIDEpLnRoZW4oYWRkZWQgPT4ge1xuICAgICAgICAgICAgICAgIGlmKCFhZGRlZCl7XG4gICAgICAgICAgICAgICAgICAgIGF0bGFzLnJlbW92ZU1hcmtlcihhdGxhcy5tYXJrZXJzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pOyovXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZleC5kaWFsb2cucHJvbXB0KHtcbiAgICAgICAgbWVzc2FnZTogJ0VudGVyIGEga2V5IHRvIGNyZWF0ZSBvciBsb2FkIGEgbWFwOicsXG4gICAgICAgIGNhbGxiYWNrOiAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmKHZhbHVlKXtcbiAgICAgICAgICAgICAgICBsZXQgbG9hZGVkID0gYXRsYXMubG9hZE1hcmtlcnModmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmKGxvYWRlZCl7XG4gICAgICAgICAgICAgICAgICAgIGxvYWRlZC5mb3JFYWNoKGNvb3JkID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkLm1hcCA9IG1hcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0bGFzLmFkZERlZmF1bHRNYXJrZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkOiBjb29yZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb29yZC5uYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaXJzdCA9IGF0bGFzLm1hcmtlcnNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihmaXJzdCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdDogZmlyc3QuZGF0YS5sYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxuZzogZmlyc3QuZGF0YS5sbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHZleC5kaWFsb2cuYWxlcnQoJ0xvYWRlZCBleGlzdGluZyBtYXA6ICcgKyB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHZleC5kaWFsb2cuYWxlcnQoJ0NyZWF0ZWQgbmV3IG1hcDogJyArIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2luZG93Lk1BUF9UQUcgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbGV0IGltcG9ydENvb3JkaW5hdGVzID0gKHRhZykgPT4ge1xuICAgICAgICB2ZXguZGlhbG9nLnByb21wdCh7XG4gICAgICAgICAgICBtZXNzYWdlOiAnSW1wb3J0IHlvdXIgY29vcmRpbmF0ZXM6JyxcbiAgICAgICAgICAgIGNhbGxiYWNrOiAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0YWcsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbGV0IHNob3J0Y3V0c0xpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvcnRjdXRzLWxpc3QnKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvcnRjdXRzJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgbGV0IGRpc3BsYXlMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBkaXNwbGF5TGlzdC5pbm5lckhUTUwgPSBzaG9ydGN1dHNMaXN0LmlubmVySFRNTDtcbiAgICAgICAgdmV4LmRpYWxvZy5hbGVydCh7XG4gICAgICAgICAgICB1bnNhZmVNZXNzYWdlOiBkaXNwbGF5TGlzdC5vdXRlckhUTUxcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhdGxhcy5zZXRIb3RLZXkoJ2knLCBlID0+IHtcbiAgICAgICAgdmV4LmRpYWxvZy5wcm9tcHQoe1xuICAgICAgICAgICAgbWVzc2FnZTogJ0VudGVyIGEga2V5IGZvciB0aGlzIG1hcDonLFxuICAgICAgICAgICAgY2FsbGJhY2s6ICh0YWcpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZXhpc3RpbmcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0YWcpO1xuICAgICAgICAgICAgICAgIGlmKGV4aXN0aW5nKXtcbiAgICAgICAgICAgICAgICAgICAgdmV4LmRpYWxvZy5jb25maXJtKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdUaGlzIHdpbGwgb3ZlcndyaXRlIGFuIGV4aXN0aW5nIG1hcCwgYXJlIHlvdSBzdXJlPycsXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogKHllcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHllcyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcG9ydENvb3JkaW5hdGVzKHRhZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICBpbXBvcnRDb29yZGluYXRlcyh0YWcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhdGxhcy5zZXRIb3RLZXkoJ2UnLCBlID0+IHtcbiAgICAgICAgdmV4LmRpYWxvZy5wcm9tcHQoe1xuICAgICAgICAgICAgbWVzc2FnZTogJ0V4cG9ydGVkIGNvb3JkaW5hdGVzOicsXG4gICAgICAgICAgICB2YWx1ZTogYXRsYXMubWFya2Vyc1RvU3RyaW5nKGF0bGFzLm1hcmtlcnMpLFxuICAgICAgICAgICAgY2FsbGJhY2s6ICh2YWx1ZSkgPT4ge31cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhdGxhcy5zZXRIb3RLZXkoJ3QnLCBlID0+IHtcbiAgICAgICAgdmV4LmRpYWxvZy5wcm9tcHQoe1xuICAgICAgICAgICAgbWVzc2FnZTogJ0VudGVyIG1hcCB0aGVtZSBVUkw6JyxcbiAgICAgICAgICAgIGNhbGxiYWNrOiAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICBhdGxhcy5nZXRNYXBTdHlsZUJ5VVJMKHZhbHVlKS50aGVuKHN0eWxlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ21hcC10aGVtZS10YWcnLCBzdHlsZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ21hcC10aGVtZS1zdHlsZScsIHN0eWxlLmpzb24pO1xuICAgICAgICAgICAgICAgICAgICBsZXQgdGFnID0gc3R5bGUubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRoZW1lID0gSlNPTi5wYXJzZShzdHlsZS5qc29uKTtcbiAgICAgICAgICAgICAgICAgICAgYXRsYXMuY2hhbmdlTWFwU3R5bGUobWFwLCB0YWcsIHRoZW1lKTtcblxuICAgICAgICAgICAgICAgICAgICB2ZXguZGlhbG9nLmFsZXJ0KCdDaGFuZ2VkIG1hcCB0aGVtZSB0bzogJyArIHRhZyk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdmV4LmRpYWxvZy5hbGVydCgnRXJyb3I6ICcgKyBlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxufSk7Il19
