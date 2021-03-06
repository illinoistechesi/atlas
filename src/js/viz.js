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

	let renderSimulationFromString = (value) => {
		let simulationData = [];
		let peakInfection = 0;
		value.split('%').forEach(inLine => {
			let line = inLine.trim();
			let parts = line.split(':');
			let time = parseInt(parts[0]);
			let locations = [];
			if(parts[1]){
				parts[1].split('$').forEach(val => {
					let data = val.split(',');
					let lidx = parseInt(data[0]);
					let infected = parseInt(data[1]);
					locations[lidx] = {
						id: lidx,
						infected: infected
					}
					if(infected > peakInfection){
						peakInfection = infected;
					}
				});
			}
			simulationData.push({
				time: time,
				locations: locations
			});
		});

		let renderAtTime = (val) => {
			fillText('fill-sim-time', val);
			let data = simulationData[val];
			if(data){
				atlas.updateIcons(atlas.markers, (icon, entry, idx) => {
					let location = data.locations[idx] || {};
					let inf = location.infected || 0;
					let ratio = inf / peakInfection;
					icon.scale = (1.0) + (9.0 * ratio);
					entry.data.time = val;
					entry.data.infected = inf;
					return icon;
				});
			}
		}

		let simTime = 0;
		let maxSimTime = simulationData.length - 1;
		document.getElementById('back').addEventListener('click', e => {
			simTime--;
			if(simTime < 0){
				simTime = 0;
			}
			renderAtTime(simTime);
		});
		document.getElementById('forward').addEventListener('click', e => {
			simTime++;
			if(simTime > maxSimTime){
				simTime = maxSimTime;
			}
			renderAtTime(simTime);
		});

		let slider = document.getElementById('time');
		slider.step = 1;
		slider.min = 0;
		slider.max = simulationData.length - 1;
		slider.value = 0;
		renderAtTime(0);
		slider.addEventListener('input', e => {
			let val = parseInt(e.target.value);
			renderAtTime(val);
			simTime = val;
		});

		let itv;
		atlas.setHotKey('p', e => {
			if(itv){
				vex.dialog.confirm({
					message: 'Stop simulation?',
					callback: (yes) => {
						if(yes){
							clearInterval(itv);
							itv = false;
						}
					}
				});
			}
			else{
				vex.dialog.prompt({
					message: 'Select simulation speed (ms/step):',
					value: 250,
					callback: (step) => {
						if(step){
							let t = 0;
							itv = setInterval(function(){
								renderAtTime(t);
								t++;
								if(t > maxSimTime){
									clearInterval(itv);
									itv = false;
								}
							}, step);
						}
					}
				});
			}
		});
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
		message: 'Enter a key to load a map:',
		callback: (value) => {
			if(value){
				let loaded = atlas.loadMarkers(value);
				if(loaded){
					loaded.forEach(coord => {
						coord.map = map;
						atlas.addViewMarker({
							map: map,
							coord: coord
						});
						let first = atlas.markers[0];
						if(first){
							map.setCenter({
								lat: first.data.lat,
								lng: first.data.lng
							});
						}
					});
					let simString = localStorage.getItem('data-' + value);
					if(simString){
						renderSimulationFromString(simString);
						vex.dialog.alert('Loaded existing simulation on map: ' + value);
					}
					else{
						vex.dialog.alert('Loaded existing map: ' + value);
					}
				}
				else{
					vex.dialog.alert('Map not found: ' + value);
				}
				window.MAP_TAG = value;
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

	atlas.setHotKey('v', e => {
		vex.dialog.prompt({
			message: 'Enter simulation data for map: ' + window.MAP_TAG,
			callback: (value) => {
				localStorage.setItem('data-' + window.MAP_TAG, value);
				renderSimulationFromString(value);
			}
		});
	});

});