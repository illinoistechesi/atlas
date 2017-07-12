let fillText = (tag, text) => {
	let spans = document.getElementsByClassName(tag);
	for(let s = 0; s < spans.length; s++){
		let span = spans[s];
		span.innerText = text;
	}
}

let atlas = Atlas();

atlas.init().then(done => {

	let mapOptions = {
	    zoom: 15,
	    center: new google.maps.LatLng(41.259716, -95.960588),
	    styles: atlas.removeThemeLabels(MAP_STYLES)
	};

	let mapElement = document.getElementById('map');

	let map = new google.maps.Map(mapElement, mapOptions);
	window.mapRef = map;
	atlas.setMap(map);

	let mapThemeTag = localStorage.getItem('map-theme-tag');
	let mapThemeStyle = localStorage.getItem('map-theme-style');
	if(mapThemeTag && mapThemeStyle){
		let theme = JSON.parse(mapThemeStyle);
		atlas.changeMapStyle(map, mapThemeTag, theme);
	}

    let shortcutsList = document.getElementById('shortcuts-list');
    document.getElementById('shortcuts').addEventListener('click', e => {
        let displayList = document.createElement('div');
            displayList.innerHTML = shortcutsList.innerHTML;
        vex.dialog.alert({
            unsafeMessage: displayList.outerHTML
        });
    });

	vex.dialog.prompt({
		message: 'Enter map data:',
		callback: (value) => {
			if(value){
				atlas.loadMapFromData(map, value);
			}
		}
	});

	atlas.setHotKey('t', e => {
		vex.dialog.prompt({
			message: 'Enter map theme URL:',
			callback: (value) => {
				atlas.getMapStyleByURL(value).then(style => {
					localStorage.setItem('map-theme-tag', style.name);
					localStorage.setItem('map-theme-style', style.json);
					let tag = style.name;
					let theme = JSON.parse(style.json);
					atlas.changeMapStyle(map, tag, theme);
					vex.dialog.alert('Changed map theme to: ' + tag);
				}).catch(err => {
					vex.dialog.alert('Error: ' + err);
				});
			}
		});
	});

	atlas.setHotKey('l', e => {
		vex.dialog.prompt({
			message: 'Enter map data:',
			callback: (value) => {
				if(value){
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