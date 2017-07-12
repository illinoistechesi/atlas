(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var fillText = function fillText(tag, text) {
	var spans = document.getElementsByClassName(tag);
	for (var s = 0; s < spans.length; s++) {
		var span = spans[s];
		span.innerText = text;
	}
};

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

	var shortcutsList = document.getElementById('shortcuts-list');
	document.getElementById('shortcuts').addEventListener('click', function (e) {
		var displayList = document.createElement('div');
		displayList.innerHTML = shortcutsList.innerHTML;
		vex.dialog.alert({
			unsafeMessage: displayList.outerHTML
		});
	});

	vex.dialog.prompt({
		message: 'Enter map data:',
		callback: function callback(value) {
			if (value) {
				atlas.loadMapFromData(map, value);
			}
		}
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

	atlas.setHotKey('l', function (e) {
		vex.dialog.prompt({
			message: 'Enter map data:',
			callback: function callback(value) {
				if (value) {
					atlas.loadMapFromData(map, value);
				}
			}
		});
	});

	/*atlas.setHotKey('u', e => {
 	vex.dialog.prompt({
 		message: 'Enter hosted data file URL:',
 		callback: (value) => {
 			$.get(value).then(res => {
 				console.log(res);
 			}).catch(err => {
 				console.error(err);
 			});
 			//atlas.loadMapFromDataFile()
 		}
 	});
 });*/
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBSSxXQUFXLFNBQVgsUUFBVyxDQUFDLEdBQUQsRUFBTSxJQUFOLEVBQWU7QUFDN0IsS0FBSSxRQUFRLFNBQVMsc0JBQVQsQ0FBZ0MsR0FBaEMsQ0FBWjtBQUNBLE1BQUksSUFBSSxJQUFJLENBQVosRUFBZSxJQUFJLE1BQU0sTUFBekIsRUFBaUMsR0FBakMsRUFBcUM7QUFDcEMsTUFBSSxPQUFPLE1BQU0sQ0FBTixDQUFYO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLElBQWpCO0FBQ0E7QUFDRCxDQU5EOztBQVFBLElBQUksUUFBUSxPQUFaOztBQUVBLE1BQU0sSUFBTixHQUFhLElBQWIsQ0FBa0IsZ0JBQVE7O0FBRXpCLEtBQUksYUFBYTtBQUNiLFFBQU0sRUFETztBQUViLFVBQVEsSUFBSSxPQUFPLElBQVAsQ0FBWSxNQUFoQixDQUF1QixTQUF2QixFQUFrQyxDQUFDLFNBQW5DLENBRks7QUFHYixVQUFRLE1BQU0saUJBQU4sQ0FBd0IsVUFBeEI7QUFISyxFQUFqQjs7QUFNQSxLQUFJLGFBQWEsU0FBUyxjQUFULENBQXdCLEtBQXhCLENBQWpCOztBQUVBLEtBQUksTUFBTSxJQUFJLE9BQU8sSUFBUCxDQUFZLEdBQWhCLENBQW9CLFVBQXBCLEVBQWdDLFVBQWhDLENBQVY7QUFDQSxRQUFPLE1BQVAsR0FBZ0IsR0FBaEI7QUFDQSxPQUFNLE1BQU4sQ0FBYSxHQUFiOztBQUVBLEtBQUksY0FBYyxhQUFhLE9BQWIsQ0FBcUIsZUFBckIsQ0FBbEI7QUFDQSxLQUFJLGdCQUFnQixhQUFhLE9BQWIsQ0FBcUIsaUJBQXJCLENBQXBCO0FBQ0EsS0FBRyxlQUFlLGFBQWxCLEVBQWdDO0FBQy9CLE1BQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxhQUFYLENBQVo7QUFDQSxRQUFNLGNBQU4sQ0FBcUIsR0FBckIsRUFBMEIsV0FBMUIsRUFBdUMsS0FBdkM7QUFDQTs7QUFFRSxLQUFJLGdCQUFnQixTQUFTLGNBQVQsQ0FBd0IsZ0JBQXhCLENBQXBCO0FBQ0EsVUFBUyxjQUFULENBQXdCLFdBQXhCLEVBQXFDLGdCQUFyQyxDQUFzRCxPQUF0RCxFQUErRCxhQUFLO0FBQ2hFLE1BQUksY0FBYyxTQUFTLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBbEI7QUFDSSxjQUFZLFNBQVosR0FBd0IsY0FBYyxTQUF0QztBQUNKLE1BQUksTUFBSixDQUFXLEtBQVgsQ0FBaUI7QUFDYixrQkFBZSxZQUFZO0FBRGQsR0FBakI7QUFHSCxFQU5EOztBQVFILEtBQUksTUFBSixDQUFXLE1BQVgsQ0FBa0I7QUFDakIsV0FBUyxpQkFEUTtBQUVqQixZQUFVLGtCQUFDLEtBQUQsRUFBVztBQUNwQixPQUFHLEtBQUgsRUFBUztBQUNSLFVBQU0sZUFBTixDQUFzQixHQUF0QixFQUEyQixLQUEzQjtBQUNBO0FBQ0Q7QUFOZ0IsRUFBbEI7O0FBU0EsT0FBTSxTQUFOLENBQWdCLEdBQWhCLEVBQXFCLGFBQUs7QUFDekIsTUFBSSxNQUFKLENBQVcsTUFBWCxDQUFrQjtBQUNqQixZQUFTLHNCQURRO0FBRWpCLGFBQVUsa0JBQUMsS0FBRCxFQUFXO0FBQ3BCLFVBQU0sZ0JBQU4sQ0FBdUIsS0FBdkIsRUFBOEIsSUFBOUIsQ0FBbUMsaUJBQVM7QUFDM0Msa0JBQWEsT0FBYixDQUFxQixlQUFyQixFQUFzQyxNQUFNLElBQTVDO0FBQ0Esa0JBQWEsT0FBYixDQUFxQixpQkFBckIsRUFBd0MsTUFBTSxJQUE5QztBQUNBLFNBQUksTUFBTSxNQUFNLElBQWhCO0FBQ0EsU0FBSSxRQUFRLEtBQUssS0FBTCxDQUFXLE1BQU0sSUFBakIsQ0FBWjtBQUNBLFdBQU0sY0FBTixDQUFxQixHQUFyQixFQUEwQixHQUExQixFQUErQixLQUEvQjs7QUFFQSxTQUFJLE1BQUosQ0FBVyxLQUFYLENBQWlCLDJCQUEyQixHQUE1QztBQUNBLEtBUkQsRUFRRyxLQVJILENBUVMsZUFBTztBQUNmLFNBQUksTUFBSixDQUFXLEtBQVgsQ0FBaUIsWUFBWSxHQUE3QjtBQUNBLEtBVkQ7QUFXQTtBQWRnQixHQUFsQjtBQWdCQSxFQWpCRDs7QUFtQkEsT0FBTSxTQUFOLENBQWdCLEdBQWhCLEVBQXFCLGFBQUs7QUFDekIsTUFBSSxNQUFKLENBQVcsTUFBWCxDQUFrQjtBQUNqQixZQUFTLGlCQURRO0FBRWpCLGFBQVUsa0JBQUMsS0FBRCxFQUFXO0FBQ3BCLFFBQUcsS0FBSCxFQUFTO0FBQ1IsV0FBTSxlQUFOLENBQXNCLEdBQXRCLEVBQTJCLEtBQTNCO0FBQ0E7QUFDRDtBQU5nQixHQUFsQjtBQVFBLEVBVEQ7O0FBV0E7Ozs7Ozs7Ozs7Ozs7QUFjQSxDQW5GRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgZmlsbFRleHQgPSAodGFnLCB0ZXh0KSA9PiB7XG5cdGxldCBzcGFucyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUodGFnKTtcblx0Zm9yKGxldCBzID0gMDsgcyA8IHNwYW5zLmxlbmd0aDsgcysrKXtcblx0XHRsZXQgc3BhbiA9IHNwYW5zW3NdO1xuXHRcdHNwYW4uaW5uZXJUZXh0ID0gdGV4dDtcblx0fVxufVxuXG5sZXQgYXRsYXMgPSBBdGxhcygpO1xuXG5hdGxhcy5pbml0KCkudGhlbihkb25lID0+IHtcblxuXHRsZXQgbWFwT3B0aW9ucyA9IHtcblx0ICAgIHpvb206IDE1LFxuXHQgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQxLjI1OTcxNiwgLTk1Ljk2MDU4OCksXG5cdCAgICBzdHlsZXM6IGF0bGFzLnJlbW92ZVRoZW1lTGFiZWxzKE1BUF9TVFlMRVMpXG5cdH07XG5cblx0bGV0IG1hcEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwJyk7XG5cblx0bGV0IG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwRWxlbWVudCwgbWFwT3B0aW9ucyk7XG5cdHdpbmRvdy5tYXBSZWYgPSBtYXA7XG5cdGF0bGFzLnNldE1hcChtYXApO1xuXG5cdGxldCBtYXBUaGVtZVRhZyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdtYXAtdGhlbWUtdGFnJyk7XG5cdGxldCBtYXBUaGVtZVN0eWxlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ21hcC10aGVtZS1zdHlsZScpO1xuXHRpZihtYXBUaGVtZVRhZyAmJiBtYXBUaGVtZVN0eWxlKXtcblx0XHRsZXQgdGhlbWUgPSBKU09OLnBhcnNlKG1hcFRoZW1lU3R5bGUpO1xuXHRcdGF0bGFzLmNoYW5nZU1hcFN0eWxlKG1hcCwgbWFwVGhlbWVUYWcsIHRoZW1lKTtcblx0fVxuXG4gICAgbGV0IHNob3J0Y3V0c0xpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvcnRjdXRzLWxpc3QnKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvcnRjdXRzJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgbGV0IGRpc3BsYXlMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICBkaXNwbGF5TGlzdC5pbm5lckhUTUwgPSBzaG9ydGN1dHNMaXN0LmlubmVySFRNTDtcbiAgICAgICAgdmV4LmRpYWxvZy5hbGVydCh7XG4gICAgICAgICAgICB1bnNhZmVNZXNzYWdlOiBkaXNwbGF5TGlzdC5vdXRlckhUTUxcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cblx0dmV4LmRpYWxvZy5wcm9tcHQoe1xuXHRcdG1lc3NhZ2U6ICdFbnRlciBtYXAgZGF0YTonLFxuXHRcdGNhbGxiYWNrOiAodmFsdWUpID0+IHtcblx0XHRcdGlmKHZhbHVlKXtcblx0XHRcdFx0YXRsYXMubG9hZE1hcEZyb21EYXRhKG1hcCwgdmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0YXRsYXMuc2V0SG90S2V5KCd0JywgZSA9PiB7XG5cdFx0dmV4LmRpYWxvZy5wcm9tcHQoe1xuXHRcdFx0bWVzc2FnZTogJ0VudGVyIG1hcCB0aGVtZSBVUkw6Jyxcblx0XHRcdGNhbGxiYWNrOiAodmFsdWUpID0+IHtcblx0XHRcdFx0YXRsYXMuZ2V0TWFwU3R5bGVCeVVSTCh2YWx1ZSkudGhlbihzdHlsZSA9PiB7XG5cdFx0XHRcdFx0bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ21hcC10aGVtZS10YWcnLCBzdHlsZS5uYW1lKTtcblx0XHRcdFx0XHRsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnbWFwLXRoZW1lLXN0eWxlJywgc3R5bGUuanNvbik7XG5cdFx0XHRcdFx0bGV0IHRhZyA9IHN0eWxlLm5hbWU7XG5cdFx0XHRcdFx0bGV0IHRoZW1lID0gSlNPTi5wYXJzZShzdHlsZS5qc29uKTtcblx0XHRcdFx0XHRhdGxhcy5jaGFuZ2VNYXBTdHlsZShtYXAsIHRhZywgdGhlbWUpO1xuXG5cdFx0XHRcdFx0dmV4LmRpYWxvZy5hbGVydCgnQ2hhbmdlZCBtYXAgdGhlbWUgdG86ICcgKyB0YWcpO1xuXHRcdFx0XHR9KS5jYXRjaChlcnIgPT4ge1xuXHRcdFx0XHRcdHZleC5kaWFsb2cuYWxlcnQoJ0Vycm9yOiAnICsgZXJyKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdGF0bGFzLnNldEhvdEtleSgnbCcsIGUgPT4ge1xuXHRcdHZleC5kaWFsb2cucHJvbXB0KHtcblx0XHRcdG1lc3NhZ2U6ICdFbnRlciBtYXAgZGF0YTonLFxuXHRcdFx0Y2FsbGJhY2s6ICh2YWx1ZSkgPT4ge1xuXHRcdFx0XHRpZih2YWx1ZSl7XG5cdFx0XHRcdFx0YXRsYXMubG9hZE1hcEZyb21EYXRhKG1hcCwgdmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0pO1xuXG5cdC8qYXRsYXMuc2V0SG90S2V5KCd1JywgZSA9PiB7XG5cdFx0dmV4LmRpYWxvZy5wcm9tcHQoe1xuXHRcdFx0bWVzc2FnZTogJ0VudGVyIGhvc3RlZCBkYXRhIGZpbGUgVVJMOicsXG5cdFx0XHRjYWxsYmFjazogKHZhbHVlKSA9PiB7XG5cdFx0XHRcdCQuZ2V0KHZhbHVlKS50aGVuKHJlcyA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2cocmVzKTtcblx0XHRcdFx0fSkuY2F0Y2goZXJyID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGVycik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQvL2F0bGFzLmxvYWRNYXBGcm9tRGF0YUZpbGUoKVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9KTsqL1xuXG59KTsiXX0=
