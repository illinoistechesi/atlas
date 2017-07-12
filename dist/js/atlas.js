(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

window.Atlas = function () {

    var hotKeys = {};
    var shiftDown = false;
    var keyChar = false;
    window.addEventListener('keydown', function (e) {
        keyChar = String.fromCharCode(e.which).toLowerCase();
        if (e.shiftKey) {
            shiftDown = true;
            if (hotKeys[keyChar]) {
                hotKeys[keyChar](e);
            }
        }
    });
    window.addEventListener('keyup', function (e) {
        shiftDown = false;
        keyChar = false;
    });

    var atlas = {

        init: function init() {
            return new Promise(function (resolve, reject) {
                google.maps.event.addDomListener(window, 'load', resolve);
            });
        },

        setMap: function setMap(map) {
            atlas.map = map;
        },

        isShiftClick: function isShiftClick() {
            return shiftDown;
        },

        // Map Markers

        map: false,
        markers: [],

        addMarker: function addMarker(data, options) {
            var opt = options || {};
            if (!data.name) {
                data.name = 'Location ' + atlas.markers.length;
            }
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(data.lat, data.lng),
                map: data.map,
                title: data.name
            });
            var entry = {
                ref: marker,
                data: data
            };
            atlas.markers.push(entry);
            var idx = atlas.markers.length - 1;

            var _loop = function _loop(event) {
                google.maps.event.addListener(marker, event, function (e) {
                    data.events[event](e, marker, idx);
                });
            };

            for (var event in data.events) {
                _loop(event);
            }
            if (!opt.readOnly) {
                atlas.saveMarkers(window.MAP_TAG, atlas.markers);
            }
            return entry;
        },

        removeMarker: function removeMarker(idx, options) {
            var opt = options || {};
            var entry = atlas.markers[idx];
            if (entry) {
                entry.ref.setMap(null);
                atlas.markers[idx] = null;
                //markers.splice(idx, 1);
            }
            if (!opt.readOnly) {
                atlas.saveMarkers(window.MAP_TAG, atlas.markers);
            }
        },

        /*clearMap: (makers) => {
        	markers.forEach(entry => {
        		entry.ref.setMap(null);
        	});
        },*/

        updateIcons: function updateIcons(markers, callback) {
            markers.forEach(function (entry, idx) {
                var icon = entry.ref.getIcon();
                var newIcon = callback(icon, entry, idx);
                entry.ref.setIcon(newIcon);
            });
        },

        updateName: function updateName(idx) {
            return new Promise(function (resolve, reject) {
                var entry = atlas.markers[idx];
                var vx = vex.dialog.prompt({
                    message: 'Update Marker Name',
                    value: entry.data.name,
                    placeholder: 'Location ' + idx,
                    callback: function callback(value) {
                        if (value) {
                            entry.data.name = value;
                            atlas.saveMarkers(window.MAP_TAG, atlas.markers);
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                });
            });
        },

        markersToString: function markersToString(markers) {
            var output = '';
            markers.forEach(function (entry, idx) {
                if (entry !== null) {
                    var coord = entry.ref.position;
                    var name = entry.data.name || 'Location ' + idx;
                    output += coord.lat() + ',' + coord.lng() + ',' + name + '$';
                }
            });
            return output;
        },

        markersFromString: function markersFromString(str) {
            return str.split('$').map(function (pair) {
                var coords = pair.split(',');
                return coords;
            }).filter(function (coords) {
                return coords.length !== 1;
            }).map(function (coords, idx) {
                return {
                    lat: parseFloat(coords[0]),
                    lng: parseFloat(coords[1]),
                    name: coords[2] || 'Location ' + idx
                };
            });
        },

        saveMarkers: function saveMarkers(tag, list) {
            if (tag) {
                localStorage.setItem(tag, atlas.markersToString(list));
            }
        },

        loadMarkers: function loadMarkers(tag) {
            var str = localStorage.getItem(tag);
            return str ? atlas.markersFromString(str) : false;
        },

        lastInfoWindow: false,

        addDefaultMarker: function addDefaultMarker(data) {
            var entry = atlas.addMarker({
                map: data.map,
                name: data.name,
                lat: data.coord.lat,
                lng: data.coord.lng,
                events: {
                    click: function click(e, m, i) {
                        console.log('click', i);
                        if (atlas.isShiftClick()) {
                            atlas.removeMarker(i);
                        } else {
                            var _entry = atlas.markers[i];
                            var info = new google.maps.InfoWindow({
                                content: _entry.data.name
                            });
                            if (atlas.map) {
                                info.open(atlas.map, _entry.ref);
                                if (atlas.lastInfoWindow) {
                                    atlas.lastInfoWindow.close();
                                    atlas.lastInfoWindow = false;
                                }
                                atlas.lastInfoWindow = info;
                            }
                        }
                    },
                    dblclick: function dblclick(e, m, i) {
                        console.log('dblclick', i);
                        atlas.updateName(i).then(function (updated) {
                            if (updated) {
                                if (atlas.lastInfoWindow) {
                                    atlas.lastInfoWindow.close();
                                    atlas.lastInfoWindow = false;
                                }
                            }
                        });
                    }
                }
            });
            entry.ref.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7.5,
                fillColor: '#F00',
                fillOpacity: 0.5,
                strokeWeight: 0
            });
            return entry;
        },

        addViewMarker: function addViewMarker(data) {
            var entry = atlas.addMarker({
                map: data.map,
                lat: data.coord.lat,
                lng: data.coord.lng,
                events: {
                    click: function click(e, m, i) {
                        console.log('click', i, data);
                        var entry = atlas.markers[i];
                        var entryData = entry.data;
                        var locName = entryData.name || 'Location ' + i;
                        var locData = '\n                            <h3>' + locName + '</h3>\n                            <ul>\n                                <li>Time: ' + entryData.time + '</li>\n                                <li>Infected: ' + entryData.infected + '</li>\n                            </ul>\n                        ';
                        var info = new google.maps.InfoWindow({
                            content: locData
                        });
                        if (atlas.map) {
                            info.open(atlas.map, entry.ref);
                            if (atlas.lastInfoWindow) {
                                atlas.lastInfoWindow.close();
                                atlas.lastInfoWindow = false;
                            }
                            atlas.lastInfoWindow = info;
                        }
                    }
                }
            }, {
                readOnly: true
            });
            var icon = data.icon || {
                scale: 0
            };
            entry.ref.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: 1.0 + 9.0 * icon.scale,
                fillColor: '#F00',
                fillOpacity: 0.5,
                strokeWeight: 0
            });
            return entry;
        },

        addCustomMarker: function addCustomMarker(data) {
            var entry = atlas.addMarker({
                map: data.map,
                lat: data.coord.lat,
                lng: data.coord.lng,
                events: {
                    click: function click(e, m, i) {
                        console.log('click', i, data);
                        var entry = atlas.markers[i];
                        var info = new google.maps.InfoWindow({
                            content: data.text
                        });
                        if (atlas.map) {
                            info.open(atlas.map, entry.ref);
                            if (atlas.lastInfoWindow) {
                                atlas.lastInfoWindow.close();
                                atlas.lastInfoWindow = false;
                            }
                            atlas.lastInfoWindow = info;
                        }
                    }
                }
            }, {
                readOnly: true
            });
            var icon = data.icon || {
                size: 0,
                color: 'rgb(0,0,0)',
                opacity: 1.0
            };
            entry.ref.setIcon({
                path: google.maps.SymbolPath.CIRCLE,
                scale: icon.size,
                fillColor: icon.color,
                fillOpacity: icon.opacity,
                strokeWeight: 0
            });
            return entry;
        },

        loadMapFromData: function loadMapFromData(map, value) {
            var input = value.split('$@@$').map(function (line) {
                return line.split('$@$');
            });
            input.forEach(function (data) {
                var lat = parseFloat(data[0]);
                var lng = parseFloat(data[1]);
                var color = data[2];
                var size = parseFloat(data[3]);
                var opacity = parseFloat(data[4]);
                var text = data[5];
                atlas.addCustomMarker({
                    map: map,
                    coord: {
                        lat: lat,
                        lng: lng
                    },
                    icon: {
                        size: size,
                        color: color,
                        opacity: opacity
                    },
                    text: text
                });
            });
            var first = atlas.markers[0];
            if (first) {
                map.setCenter({
                    lat: first.data.lat,
                    lng: first.data.lng
                });
            }
        },

        // Map Themes

        removeThemeLabels: function removeThemeLabels(theme) {
            var elementTypes = ['labels', 'labels.text.fill', 'labels.text.stroke'];
            elementTypes.forEach(function (elType) {
                theme.push({
                    elementType: 'labels',
                    stylers: [{
                        visibility: 'off'
                    }]
                });
            });
            return theme;
        },

        changeMapStyle: function changeMapStyle(map, name, styles) {
            var theme = atlas.removeThemeLabels(styles);
            var styledMapType = new google.maps.StyledMapType(theme, {
                map: map,
                name: name
            });
            map.mapTypes.set(name, styledMapType);
            map.setMapTypeId(name);
        },

        getMapStyleByURL: function getMapStyleByURL(url) {
            var SNAZZY_MAPS_URL = 'https://snazzymaps.com/explore.json?key=6fbb0a74-ec67-4329-83ee-15edd4740c4b';

            var getPage = function getPage(page) {
                return new Promise(function (resolve, reject) {
                    $.get(SNAZZY_MAPS_URL, {
                        page: page
                    }, function (res) {
                        res.styles.forEach(function (style) {
                            if (style.url === url) {
                                resolve(style);
                            }
                        });
                        var nextPage = res.pagination.currentPage + 1;
                        if (nextPage > res.pagination.totalPages) {
                            reject('Could not find style.');
                        } else {
                            getPage(nextPage).then(function (recRes) {
                                resolve(recRes);
                            }).catch(reject);
                        }
                    }).error(function (jqXHR, textStatus, errorThrown) {
                        reject(errorThrown);
                    });
                });
            };

            return getPage(1);
        },

        setHotKey: function setHotKey(shortcut, callback) {
            hotKeys[shortcut] = callback;
        }
    };

    return atlas;
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvYXRsYXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLE9BQU8sS0FBUCxHQUFlLFlBQU07O0FBRWpCLFFBQUksVUFBVSxFQUFkO0FBQ0EsUUFBSSxZQUFZLEtBQWhCO0FBQ0EsUUFBSSxVQUFVLEtBQWQ7QUFDQSxXQUFPLGdCQUFQLENBQXdCLFNBQXhCLEVBQW1DLGFBQUs7QUFDcEMsa0JBQVUsT0FBTyxZQUFQLENBQW9CLEVBQUUsS0FBdEIsRUFBNkIsV0FBN0IsRUFBVjtBQUNBLFlBQUcsRUFBRSxRQUFMLEVBQWM7QUFDVix3QkFBWSxJQUFaO0FBQ0EsZ0JBQUcsUUFBUSxPQUFSLENBQUgsRUFBb0I7QUFDaEIsd0JBQVEsT0FBUixFQUFpQixDQUFqQjtBQUNIO0FBQ0o7QUFDSixLQVJEO0FBU0EsV0FBTyxnQkFBUCxDQUF3QixPQUF4QixFQUFpQyxhQUFLO0FBQ2xDLG9CQUFZLEtBQVo7QUFDQSxrQkFBVSxLQUFWO0FBQ0gsS0FIRDs7QUFLSCxRQUFJLFFBQVE7O0FBRVgsY0FBTSxnQkFBTTtBQUNYLG1CQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7QUFDdkMsdUJBQU8sSUFBUCxDQUFZLEtBQVosQ0FBa0IsY0FBbEIsQ0FBaUMsTUFBakMsRUFBeUMsTUFBekMsRUFBaUQsT0FBakQ7QUFDQSxhQUZNLENBQVA7QUFHQSxTQU5VOztBQVFMLGdCQUFRLGdCQUFDLEdBQUQsRUFBUztBQUNiLGtCQUFNLEdBQU4sR0FBWSxHQUFaO0FBQ0gsU0FWSTs7QUFZTCxzQkFBYyx3QkFBTTtBQUNoQixtQkFBTyxTQUFQO0FBQ0gsU0FkSTs7QUFnQlg7O0FBRU0sYUFBSyxLQWxCQTtBQW1CTCxpQkFBUyxFQW5CSjs7QUFxQkwsbUJBQVcsbUJBQUMsSUFBRCxFQUFPLE9BQVAsRUFBbUI7QUFDN0IsZ0JBQUksTUFBTSxXQUFXLEVB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bGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ3aW5kb3cuQXRsYXMgPSAoKSA9PiB7XG5cbiAgICBsZXQgaG90S2V5cyA9IHt9O1xuICAgIGxldCBzaGlmdERvd24gPSBmYWxzZTtcbiAgICBsZXQga2V5Q2hhciA9IGZhbHNlO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZSA9PiB7XG4gICAgICAgIGtleUNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGUud2hpY2gpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIGlmKGUuc2hpZnRLZXkpe1xuICAgICAgICAgICAgc2hpZnREb3duID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmKGhvdEtleXNba2V5Q2hhcl0pe1xuICAgICAgICAgICAgICAgIGhvdEtleXNba2V5Q2hhcl0oZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBlID0+IHtcbiAgICAgICAgc2hpZnREb3duID0gZmFsc2U7XG4gICAgICAgIGtleUNoYXIgPSBmYWxzZTtcbiAgICB9KTtcblxuXHRsZXQgYXRsYXMgPSB7XG5cblx0XHRpbml0OiAoKSA9PiB7XG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih3aW5kb3csICdsb2FkJywgcmVzb2x2ZSk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG4gICAgICAgIHNldE1hcDogKG1hcCkgPT4ge1xuICAgICAgICAgICAgYXRsYXMubWFwID0gbWFwO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlzU2hpZnRDbGljazogKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNoaWZ0RG93bjtcbiAgICAgICAgfSxcblxuXHRcdC8vIE1hcCBNYXJrZXJzXG5cbiAgICAgICAgbWFwOiBmYWxzZSxcbiAgICAgICAgbWFya2VyczogW10sXG5cbiAgICAgICAgYWRkTWFya2VyOiAoZGF0YSwgb3B0aW9ucykgPT4ge1xuICAgICAgICBcdGxldCBvcHQgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICAgICAgaWYoIWRhdGEubmFtZSl7XG4gICAgICAgICAgICAgICAgZGF0YS5uYW1lID0gJ0xvY2F0aW9uICcgKyAoYXRsYXMubWFya2Vycy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICBcdGxldCBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICAgICAgXHRcdHBvc2l0aW9uOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGRhdGEubGF0LCBkYXRhLmxuZyksXG4gICAgICAgIFx0XHRtYXA6IGRhdGEubWFwLFxuICAgICAgICBcdFx0dGl0bGU6IGRhdGEubmFtZVxuICAgICAgICBcdH0pO1xuICAgICAgICBcdGxldCBlbnRyeSA9IHtcbiAgICAgICAgXHRcdHJlZjogbWFya2VyLFxuICAgICAgICBcdFx0ZGF0YTogZGF0YVxuICAgICAgICBcdH1cbiAgICAgICAgXHRhdGxhcy5tYXJrZXJzLnB1c2goZW50cnkpO1xuICAgICAgICBcdGxldCBpZHggPSBhdGxhcy5tYXJrZXJzLmxlbmd0aCAtIDE7XG4gICAgICAgIFx0Zm9yKGxldCBldmVudCBpbiBkYXRhLmV2ZW50cyl7XG4gICAgICAgIFx0XHRnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXJrZXIsIGV2ZW50LCBlID0+IHtcbiAgICAgICAgXHRcdFx0ZGF0YS5ldmVudHNbZXZlbnRdKGUsIG1hcmtlciwgaWR4KTtcbiAgICAgICAgXHRcdH0pO1xuICAgICAgICBcdH1cbiAgICAgICAgXHRpZighb3B0LnJlYWRPbmx5KXtcbiAgICAgICAgXHRcdGF0bGFzLnNhdmVNYXJrZXJzKHdpbmRvdy5NQVBfVEFHLCBhdGxhcy5tYXJrZXJzKTtcbiAgICAgICAgXHR9XG4gICAgICAgIFx0cmV0dXJuIGVudHJ5O1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlbW92ZU1hcmtlcjogKGlkeCwgb3B0aW9ucykgPT4ge1xuICAgICAgICBcdGxldCBvcHQgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBcdGxldCBlbnRyeSA9IGF0bGFzLm1hcmtlcnNbaWR4XTtcbiAgICAgICAgXHRpZihlbnRyeSl7XG4gICAgICAgIFx0XHRlbnRyeS5yZWYuc2V0TWFwKG51bGwpO1xuICAgICAgICBcdFx0YXRsYXMubWFya2Vyc1tpZHhdID0gbnVsbDtcbiAgICAgICAgXHRcdC8vbWFya2Vycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgXHR9XG5cdFx0XHRpZighb3B0LnJlYWRPbmx5KXtcbiAgICAgICAgXHRcdGF0bGFzLnNhdmVNYXJrZXJzKHdpbmRvdy5NQVBfVEFHLCBhdGxhcy5tYXJrZXJzKTtcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG5cbiAgICAgICAgLypjbGVhck1hcDogKG1ha2VycykgPT4ge1xuICAgICAgICBcdG1hcmtlcnMuZm9yRWFjaChlbnRyeSA9PiB7XG4gICAgICAgIFx0XHRlbnRyeS5yZWYuc2V0TWFwKG51bGwpO1xuICAgICAgICBcdH0pO1xuICAgICAgICB9LCovXG5cbiAgICAgICAgdXBkYXRlSWNvbnM6IChtYXJrZXJzLCBjYWxsYmFjaykgPT4ge1xuICAgICAgICBcdG1hcmtlcnMuZm9yRWFjaCgoZW50cnksIGlkeCkgPT4ge1xuICAgICAgICBcdFx0bGV0IGljb24gPSBlbnRyeS5yZWYuZ2V0SWNvbigpO1xuICAgICAgICBcdFx0bGV0IG5ld0ljb24gPSBjYWxsYmFjayhpY29uLCBlbnRyeSwgaWR4KTtcbiAgICAgICAgXHRcdGVudHJ5LnJlZi5zZXRJY29uKG5ld0ljb24pO1xuICAgICAgICBcdH0pO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgdXBkYXRlTmFtZTogKGlkeCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZW50cnkgPSBhdGxhcy5tYXJrZXJzW2lkeF07XG4gICAgICAgICAgICAgICAgbGV0IHZ4ID0gdmV4LmRpYWxvZy5wcm9tcHQoe1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVXBkYXRlIE1hcmtlciBOYW1lJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGVudHJ5LmRhdGEubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdMb2NhdGlvbiAnICsgaWR4LFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZih2YWx1ZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkuZGF0YS5uYW1lID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXRsYXMuc2F2ZU1hcmtlcnMod2luZG93Lk1BUF9UQUcsIGF0bGFzLm1hcmtlcnMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBtYXJrZXJzVG9TdHJpbmc6IChtYXJrZXJzKSA9PiB7XG4gICAgICAgICAgICBsZXQgb3V0cHV0ID0gJyc7XG4gICAgICAgICAgICBtYXJrZXJzLmZvckVhY2goKGVudHJ5LCBpZHgpID0+IHtcbiAgICAgICAgICAgICAgICBpZihlbnRyeSAhPT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb29yZCA9IGVudHJ5LnJlZi5wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5hbWUgPSBlbnRyeS5kYXRhLm5hbWUgfHwgJ0xvY2F0aW9uICcgKyBpZHg7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBjb29yZC5sYXQoKSArICcsJyArIGNvb3JkLmxuZygpICsgJywnICsgbmFtZSArICckJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWFya2Vyc0Zyb21TdHJpbmc6IChzdHIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdHIuc3BsaXQoJyQnKS5tYXAocGFpciA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNvb3JkcyA9IHBhaXIuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29vcmRzO1xuICAgICAgICAgICAgfSkuZmlsdGVyKGNvb3JkcyA9PiBjb29yZHMubGVuZ3RoICE9PSAxKS5tYXAoKGNvb3JkcywgaWR4KSA9PntcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBsYXQ6IHBhcnNlRmxvYXQoY29vcmRzWzBdKSxcbiAgICAgICAgICAgICAgICAgICAgbG5nOiBwYXJzZUZsb2F0KGNvb3Jkc1sxXSksXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGNvb3Jkc1syXSB8fCAnTG9jYXRpb24gJyArIGlkeFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNhdmVNYXJrZXJzOiAodGFnLCBsaXN0KSA9PiB7XG4gICAgICAgIFx0aWYodGFnKXtcbiAgICAgICAgXHRcdGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRhZywgYXRsYXMubWFya2Vyc1RvU3RyaW5nKGxpc3QpKTtcbiAgICAgICAgXHR9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbG9hZE1hcmtlcnM6ICh0YWcpID0+IHtcbiAgICAgICAgXHRsZXQgc3RyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGFnKTtcbiAgICAgICAgXHRyZXR1cm4gc3RyID8gYXRsYXMubWFya2Vyc0Zyb21TdHJpbmcoc3RyKSA6IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGxhc3RJbmZvV2luZG93OiBmYWxzZSxcblxuICAgICAgICBhZGREZWZhdWx0TWFya2VyOiAoZGF0YSkgPT4ge1xuXHRcdFx0bGV0IGVudHJ5ID0gYXRsYXMuYWRkTWFya2VyKHtcbiAgICAgICAgXHRcdG1hcDogZGF0YS5tYXAsXG4gICAgICAgICAgICAgICAgbmFtZTogZGF0YS5uYW1lLFxuICAgICAgICBcdFx0bGF0OiBkYXRhLmNvb3JkLmxhdCxcbiAgICAgICAgXHRcdGxuZzogZGF0YS5jb29yZC5sbmcsXG4gICAgICAgIFx0XHRldmVudHM6IHtcbiAgICAgICAgXHRcdFx0Y2xpY2s6IChlLCBtLCBpKSA9PiB7XG4gICAgICAgIFx0XHRcdFx0Y29uc29sZS5sb2coJ2NsaWNrJywgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhdGxhcy5pc1NoaWZ0Q2xpY2soKSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXRsYXMucmVtb3ZlTWFya2VyKGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW50cnkgPSBhdGxhcy5tYXJrZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbmZvID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBlbnRyeS5kYXRhLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhdGxhcy5tYXApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLm9wZW4oYXRsYXMubWFwLCBlbnRyeS5yZWYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihhdGxhcy5sYXN0SW5mb1dpbmRvdyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdGxhcy5sYXN0SW5mb1dpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXRsYXMubGFzdEluZm9XaW5kb3cgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdGxhcy5sYXN0SW5mb1dpbmRvdyA9IGluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICBcdFx0XHR9LFxuICAgICAgICBcdFx0XHRkYmxjbGljazogKGUsIG0sIGkpID0+IHtcbiAgICAgICAgXHRcdFx0XHRjb25zb2xlLmxvZygnZGJsY2xpY2snLCBpKTtcbiAgICAgICAgXHRcdFx0XHRhdGxhcy51cGRhdGVOYW1lKGkpLnRoZW4odXBkYXRlZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodXBkYXRlZCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGF0bGFzLmxhc3RJbmZvV2luZG93KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0bGFzLmxhc3RJbmZvV2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdGxhcy5sYXN0SW5mb1dpbmRvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIFx0XHRcdH1cbiAgICAgICAgXHRcdH1cbiAgICAgICAgXHR9KTtcbiAgICAgICAgICAgIGVudHJ5LnJlZi5zZXRJY29uKHtcbiAgICAgICAgICAgICAgICBwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRSxcbiAgICAgICAgICAgICAgICBzY2FsZTogNy41LFxuICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogJyNGMDAnLFxuICAgICAgICAgICAgICAgIGZpbGxPcGFjaXR5OiAwLjUsXG4gICAgICAgICAgICAgICAgc3Ryb2tlV2VpZ2h0OiAwXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBlbnRyeTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRWaWV3TWFya2VyOiAoZGF0YSkgPT4ge1xuXHRcdFx0bGV0IGVudHJ5ID0gYXRsYXMuYWRkTWFya2VyKHtcbiAgICAgICAgXHRcdG1hcDogZGF0YS5tYXAsXG4gICAgICAgIFx0XHRsYXQ6IGRhdGEuY29vcmQubGF0LFxuICAgICAgICBcdFx0bG5nOiBkYXRhLmNvb3JkLmxuZyxcbiAgICAgICAgXHRcdGV2ZW50czoge1xuICAgICAgICBcdFx0XHRjbGljazogKGUsIG0sIGkpID0+IHtcbiAgICAgICAgXHRcdFx0XHRjb25zb2xlLmxvZygnY2xpY2snLCBpLCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBlbnRyeSA9IGF0bGFzLm1hcmtlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW50cnlEYXRhID0gZW50cnkuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBsb2NOYW1lID0gZW50cnlEYXRhLm5hbWUgfHwgJ0xvY2F0aW9uICcgKyBpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxvY0RhdGEgPSBgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGgzPiR7bG9jTmFtZX08L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPlRpbWU6ICR7ZW50cnlEYXRhLnRpbWV9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpPkluZmVjdGVkOiAke2VudHJ5RGF0YS5pbmZlY3RlZH08L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGluZm8gPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogbG9jRGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhdGxhcy5tYXApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ub3BlbihhdGxhcy5tYXAsIGVudHJ5LnJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXRsYXMubGFzdEluZm9XaW5kb3cpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdGxhcy5sYXN0SW5mb1dpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdGxhcy5sYXN0SW5mb1dpbmRvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdGxhcy5sYXN0SW5mb1dpbmRvdyA9IGluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgIFx0XHRcdH1cbiAgICAgICAgXHRcdH1cbiAgICAgICAgXHR9LCB7XG4gICAgICAgIFx0XHRyZWFkT25seTogdHJ1ZVxuICAgICAgICBcdH0pO1xuICAgICAgICBcdGxldCBpY29uID0gZGF0YS5pY29uIHx8IHtcbiAgICAgICAgXHRcdHNjYWxlOiAwXG4gICAgICAgIFx0fTtcbiAgICAgICAgXHRlbnRyeS5yZWYuc2V0SWNvbih7XG4gICAgICAgIFx0XHRwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRSxcbiAgICAgICAgXHRcdHNjYWxlOiAoMS4wKSArICg5LjAgKiBpY29uLnNjYWxlKSxcbiAgICAgICAgXHRcdGZpbGxDb2xvcjogJyNGMDAnLFxuICAgICAgICBcdFx0ZmlsbE9wYWNpdHk6IDAuNSxcbiAgICAgICAgXHRcdHN0cm9rZVdlaWdodDogMFxuICAgICAgICBcdH0pO1xuICAgICAgICBcdHJldHVybiBlbnRyeTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRDdXN0b21NYXJrZXI6IChkYXRhKSA9PiB7XG4gICAgICAgICAgICBsZXQgZW50cnkgPSBhdGxhcy5hZGRNYXJrZXIoe1xuICAgICAgICAgICAgICAgIG1hcDogZGF0YS5tYXAsXG4gICAgICAgICAgICAgICAgbGF0OiBkYXRhLmNvb3JkLmxhdCxcbiAgICAgICAgICAgICAgICBsbmc6IGRhdGEuY29vcmQubG5nLFxuICAgICAgICAgICAgICAgIGV2ZW50czoge1xuICAgICAgICAgICAgICAgICAgICBjbGljazogKGUsIG0sIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjbGljaycsIGksIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVudHJ5ID0gYXRsYXMubWFya2Vyc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbmZvID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGRhdGEudGV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihhdGxhcy5tYXApe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8ub3BlbihhdGxhcy5tYXAsIGVudHJ5LnJlZik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoYXRsYXMubGFzdEluZm9XaW5kb3cpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdGxhcy5sYXN0SW5mb1dpbmRvdy5jbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdGxhcy5sYXN0SW5mb1dpbmRvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdGxhcy5sYXN0SW5mb1dpbmRvdyA9IGluZm87XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgcmVhZE9ubHk6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IGljb24gPSBkYXRhLmljb24gfHwge1xuICAgICAgICAgICAgICAgIHNpemU6IDAsXG4gICAgICAgICAgICAgICAgY29sb3I6ICdyZ2IoMCwwLDApJyxcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxLjBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBlbnRyeS5yZWYuc2V0SWNvbih7XG4gICAgICAgICAgICAgICAgcGF0aDogZ29vZ2xlLm1hcHMuU3ltYm9sUGF0aC5DSVJDTEUsXG4gICAgICAgICAgICAgICAgc2NhbGU6IGljb24uc2l6ZSxcbiAgICAgICAgICAgICAgICBmaWxsQ29sb3I6IGljb24uY29sb3IsXG4gICAgICAgICAgICAgICAgZmlsbE9wYWNpdHk6IGljb24ub3BhY2l0eSxcbiAgICAgICAgICAgICAgICBzdHJva2VXZWlnaHQ6IDBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGVudHJ5O1xuICAgICAgICB9LFxuXG4gICAgICAgIGxvYWRNYXBGcm9tRGF0YTogKG1hcCwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIGxldCBpbnB1dCA9IHZhbHVlLnNwbGl0KCckQEAkJykubWFwKGxpbmUgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBsaW5lLnNwbGl0KCckQCQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaW5wdXQuZm9yRWFjaChkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgbGF0ID0gcGFyc2VGbG9hdChkYXRhWzBdKTtcbiAgICAgICAgICAgICAgICBsZXQgbG5nID0gcGFyc2VGbG9hdChkYXRhWzFdKTtcbiAgICAgICAgICAgICAgICBsZXQgY29sb3IgPSBkYXRhWzJdO1xuICAgICAgICAgICAgICAgIGxldCBzaXplID0gcGFyc2VGbG9hdChkYXRhWzNdKTtcbiAgICAgICAgICAgICAgICBsZXQgb3BhY2l0eSA9IHBhcnNlRmxvYXQoZGF0YVs0XSk7XG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSBkYXRhWzVdO1xuICAgICAgICAgICAgICAgIGF0bGFzLmFkZEN1c3RvbU1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICBjb29yZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGF0OiBsYXQsXG4gICAgICAgICAgICAgICAgICAgICAgICBsbmc6IGxuZ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBpY29uOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplOiBzaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogb3BhY2l0eVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBmaXJzdCA9IGF0bGFzLm1hcmtlcnNbMF07XG4gICAgICAgICAgICBpZihmaXJzdCl7XG4gICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcih7XG4gICAgICAgICAgICAgICAgICAgIGxhdDogZmlyc3QuZGF0YS5sYXQsXG4gICAgICAgICAgICAgICAgICAgIGxuZzogZmlyc3QuZGF0YS5sbmdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXHRcdC8vIE1hcCBUaGVtZXNcblxuXHRcdHJlbW92ZVRoZW1lTGFiZWxzOiAodGhlbWUpID0+IHtcblx0XHQgICAgbGV0IGVsZW1lbnRUeXBlcyA9IFsnbGFiZWxzJywgJ2xhYmVscy50ZXh0LmZpbGwnLCAnbGFiZWxzLnRleHQuc3Ryb2tlJ107XG5cdFx0ICAgIGVsZW1lbnRUeXBlcy5mb3JFYWNoKGVsVHlwZSA9PiB7XG5cdFx0ICAgICAgICB0aGVtZS5wdXNoKHtcblx0XHQgICAgICAgIFx0ZWxlbWVudFR5cGU6ICdsYWJlbHMnLFxuXHRcdCAgICAgICAgXHRzdHlsZXJzOiBbe1xuXHRcdCAgICAgICAgXHRcdHZpc2liaWxpdHk6ICdvZmYnXG5cdFx0ICAgICAgICBcdH1dXG5cdFx0ICAgICAgICB9KTtcblx0XHQgICAgfSk7XG5cdFx0ICAgIHJldHVybiB0aGVtZTtcblx0XHR9LFxuXG5cdFx0Y2hhbmdlTWFwU3R5bGU6IChtYXAsIG5hbWUsIHN0eWxlcykgPT4ge1xuXHRcdFx0bGV0IHRoZW1lID0gYXRsYXMucmVtb3ZlVGhlbWVMYWJlbHMoc3R5bGVzKTtcblx0XHRcdGxldCBzdHlsZWRNYXBUeXBlID0gbmV3IGdvb2dsZS5tYXBzLlN0eWxlZE1hcFR5cGUodGhlbWUsIHtcblx0XHRcdFx0bWFwOiBtYXAsXG5cdFx0XHRcdG5hbWU6IG5hbWVcblx0XHRcdH0pO1xuXHRcdFx0bWFwLm1hcFR5cGVzLnNldChuYW1lLCBzdHlsZWRNYXBUeXBlKTtcblx0XHRcdG1hcC5zZXRNYXBUeXBlSWQobmFtZSk7XG5cdFx0fSxcblxuXHRcdGdldE1hcFN0eWxlQnlVUkw6ICh1cmwpID0+IHtcblx0XHRcdGNvbnN0IFNOQVpaWV9NQVBTX1VSTCA9ICdodHRwczovL3NuYXp6eW1hcHMuY29tL2V4cGxvcmUuanNvbj9rZXk9NmZiYjBhNzQtZWM2Ny00MzI5LTgzZWUtMTVlZGQ0NzQwYzRiJztcblxuXHRcdFx0bGV0IGdldFBhZ2UgPSAocGFnZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHRcdCQuZ2V0KFNOQVpaWV9NQVBTX1VSTCwge1xuXHRcdFx0XHRcdFx0cGFnZTogcGFnZVxuXHRcdFx0XHRcdH0sIChyZXMpID0+IHtcblx0XHRcdFx0XHRcdHJlcy5zdHlsZXMuZm9yRWFjaChzdHlsZSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmKHN0eWxlLnVybCA9PT0gdXJsKXtcblx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKHN0eWxlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRsZXQgbmV4dFBhZ2UgPSByZXMucGFnaW5hdGlvbi5jdXJyZW50UGFnZSArIDE7XG5cdFx0XHRcdFx0XHRpZihuZXh0UGFnZSA+IHJlcy5wYWdpbmF0aW9uLnRvdGFsUGFnZXMpe1xuXHRcdFx0XHRcdFx0XHRyZWplY3QoJ0NvdWxkIG5vdCBmaW5kIHN0eWxlLicpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZXtcblx0XHRcdFx0XHRcdFx0Z2V0UGFnZShuZXh0UGFnZSkudGhlbihyZWNSZXMgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUocmVjUmVzKTtcblx0XHRcdFx0XHRcdFx0fSkuY2F0Y2gocmVqZWN0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KS5lcnJvcigoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSA9PiB7XG5cdFx0XHRcdFx0XHRyZWplY3QoZXJyb3JUaHJvd24pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGdldFBhZ2UoMSk7XG5cdFx0fSxcblxuXHRcdHNldEhvdEtleTogKHNob3J0Y3V0LCBjYWxsYmFjaykgPT4ge1xuICAgICAgICAgICAgaG90S2V5c1tzaG9ydGN1dF0gPSBjYWxsYmFjaztcbiAgICAgICAgfVxuXHR9XG5cblx0cmV0dXJuIGF0bGFzO1xufSJdfQ==
