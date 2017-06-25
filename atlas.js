let Atlas = () => {

	let atlas = {

		init: () => {
			return new Promise((resolve, reject) => {
				google.maps.event.addDomListener(window, 'load', resolve);
			});
		},

		// Map Markers


        markers: [],

        addMarker: (data, options) => {
        	let opt = options || {};
        	let marker = new google.maps.Marker({
        		position: new google.maps.LatLng(data.lat, data.lng),
        		map: data.map,
        		title: data.title || ''
        	});
        	let entry = {
        		ref: marker,
        		data: data
        	}
        	atlas.markers.push(entry);
        	let idx = atlas.markers.length - 1;
        	for(let event in data.events){
        		google.maps.event.addListener(marker, event, e => {
        			data.events[event](e, marker, idx);
        		});
        	}
        	if(!opt.readOnly){
        		atlas.saveMarkers(window.MAP_TAG, atlas.markers);
        	}
        	return entry;
        },

        removeMarker: (idx, options) => {
        	let opt = options || {};
        	let entry = atlas.markers[idx];
        	if(entry){
        		entry.ref.setMap(null);
        		atlas.markers[idx] = null;
        		//markers.splice(idx, 1);
        	}
			if(!opt.readOnly){
        		atlas.saveMarkers(window.MAP_TAG, atlas.markers);
        	}
        },

        /*clearMap: (makers) => {
        	markers.forEach(entry => {
        		entry.ref.setMap(null);
        	});
        },*/

        updateIcons: (markers, callback) => {
        	markers.forEach((entry, idx) => {
        		let icon = entry.ref.getIcon();
        		let newIcon = callback(icon, entry, idx);
        		entry.ref.setIcon(newIcon);
        	});
        },

        markersToString: (markers) => {
			let output = '';
        	markers.forEach((entry, idx) => {
        		if(entry !== null){
					let coord = entry.ref.position;
        			output += coord.lat() + ',' + coord.lng() + '$';
        		}
        	});
        	return output;
        },

        markersFromString: (str) => {
        	return str.split('$').map(pair => {
        		let coords = pair.split(',').map(s => parseFloat(s));
        		return coords;
        	}).filter(coords => coords.length !== 1).map(coords =>{
        		return {
        			lat: coords[0],
        			lng: coords[1]
        		}
        	});
        },

        saveMarkers: (tag, list) => {
        	if(tag){
        		localStorage.setItem(tag, markersToString(list));
        	}
        },

        loadMarkers: (tag) => {
        	let str = localStorage.getItem(tag);
        	return str ? atlas.markersFromString(str) : false;
        },

        addDefaultMarker: (data) => {
			return atlas.addMarker({
        		map: data.map,
        		lat: data.coord.lat,
        		lng: data.coord.lng,
        		events: {
        			click: (e, m, i) => {
        				console.log('click', i);
        			},
        			dblclick: (e, m, i) => {
        				console.log('dblclick', i);
        				removeMarker(i);
        			}
        		}
        	});
        },

        addViewMarker: (data) => {
			let entry = atlas.addMarker({
        		map: data.map,
        		lat: data.coord.lat,
        		lng: data.coord.lng,
        		events: {
        			click: (e, m, i) => {
        				console.log('click', i, data);
        			}
        		}
        	}, {
        		readOnly: true
        	});
        	let icon = data.icon || {
        		scale: 0
        	};
        	entry.ref.setIcon({
        		path: google.maps.SymbolPath.CIRCLE,
        		scale: (1.0) + (9.0 * icon.scale),
        		fillColor: '#F00',
        		fillOpacity: 0.5,
        		strokeWeight: 0
        	});
        	return entry;
        },

		// Map Themes

		removeThemeLabels: (theme) => {
		    let elementTypes = ['labels', 'labels.text.fill', 'labels.text.stroke'];
		    elementTypes.forEach(elType => {
		        theme.push({
		        	elementType: 'labels',
		        	stylers: [{
		        		visibility: 'off'
		        	}]
		        });
		    });
		    return theme;
		},

		changeMapStyle: (map, name, styles) => {
			let theme = atlas.removeThemeLabels(styles);
			let styledMapType = new google.maps.StyledMapType(theme, {
				map: map,
				name: name
			});
			map.mapTypes.set(name, styledMapType);
			map.setMapTypeId(name);
		},

		getMapStyleByURL: (url) => {
			const SNAZZY_MAPS_URL = 'https://snazzymaps.com/explore.json?key=6fbb0a74-ec67-4329-83ee-15edd4740c4b';

			let getPage = (page) => {
				return new Promise((resolve, reject) => {
					$.get(SNAZZY_MAPS_URL, {
						page: page
					}, (res) => {
						res.styles.forEach(style => {
							if(style.url === url){
								resolve(style);
							}
						});
						let nextPage = res.pagination.currentPage + 1;
						if(nextPage > res.pagination.totalPages){
							reject('Could not find style.');
						}
						else{
							getPage(nextPage).then(recRes => {
								resolve(recRes);
							}).catch(reject);
						}
					}).error((jqXHR, textStatus, errorThrown) => {
						reject(errorThrown);
					});
				});
			}

			return getPage(1);
		},

		setHotKey: (id, callback) => {
        	document.getElementById(id).addEventListener('click', e => {
        		callback(e);
        	});
        }
	}

	return atlas;
}