let Atlas = () => {

    let hotKeys = {};
    let shiftDown = false;
    let keyChar = false;
    window.addEventListener('keydown', e => {
        keyChar = String.fromCharCode(e.which).toLowerCase();
        if(e.shiftKey){
            shiftDown = true;
            if(hotKeys[keyChar]){
                hotKeys[keyChar](e);
            }
        }
    });
    window.addEventListener('keyup', e => {
        shiftDown = false;
        keyChar = false;
    });

	let atlas = {

		init: () => {
			return new Promise((resolve, reject) => {
				google.maps.event.addDomListener(window, 'load', resolve);
			});
		},

        setMap: (map) => {
            atlas.map = map;
        },

        isShiftClick: () => {
            return shiftDown;
        },

		// Map Markers

        map: false,
        markers: [],

        addMarker: (data, options) => {
        	let opt = options || {};
            if(!data.name){
                data.name = 'Location ' + (atlas.markers.length);
            }
        	let marker = new google.maps.Marker({
        		position: new google.maps.LatLng(data.lat, data.lng),
        		map: data.map,
        		title: data.name
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


        updateName: (idx) => {
            return new Promise((resolve, reject) => {
                let entry = atlas.markers[idx];
                let vx = vex.dialog.prompt({
                    message: 'Update Marker Name',
                    value: entry.data.name,
                    placeholder: 'Location ' + idx,
                    callback: (value) => {
                        if(value){
                            entry.data.name = value;
                            atlas.saveMarkers(window.MAP_TAG, atlas.markers);
                            resolve(true);
                        }
                        else{
                            resolve(false);
                        }
                    }
                });
            });
        },

        markersToString: (markers) => {
            let output = '';
            markers.forEach((entry, idx) => {
                if(entry !== null){
                    let coord = entry.ref.position;
                    let name = entry.data.name || 'Location ' + idx;
                    output += coord.lat() + ',' + coord.lng() + ',' + name + '$';
                }
            });
            return output;
        },

        markersFromString: (str) => {
            return str.split('$').map(pair => {
                let coords = pair.split(',');
                return coords;
            }).filter(coords => coords.length !== 1).map((coords, idx) =>{
                return {
                    lat: parseFloat(coords[0]),
                    lng: parseFloat(coords[1]),
                    name: coords[2] || 'Location ' + idx
                }
            });
        },

        saveMarkers: (tag, list) => {
        	if(tag){
        		localStorage.setItem(tag, atlas.markersToString(list));
        	}
        },

        loadMarkers: (tag) => {
        	let str = localStorage.getItem(tag);
        	return str ? atlas.markersFromString(str) : false;
        },

        lastInfoWindow: false,

        addDefaultMarker: (data) => {
			let entry = atlas.addMarker({
        		map: data.map,
                name: data.name,
        		lat: data.coord.lat,
        		lng: data.coord.lng,
        		events: {
        			click: (e, m, i) => {
        				console.log('click', i);
                        if(atlas.isShiftClick()){
                            atlas.removeMarker(i);
                        }
                        else{
                            let entry = atlas.markers[i];
                            let info = new google.maps.InfoWindow({
                                content: entry.data.name
                            });
                            if(atlas.map){
                                info.open(atlas.map, entry.ref);
                                if(atlas.lastInfoWindow){
                                    atlas.lastInfoWindow.close();
                                    atlas.lastInfoWindow = false;
                                }
                                atlas.lastInfoWindow = info;
                            }
                        }
        			},
        			dblclick: (e, m, i) => {
        				console.log('dblclick', i);
        				atlas.updateName(i).then(updated => {
                            if(updated){
                                if(atlas.lastInfoWindow){
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

        addViewMarker: (data) => {
			let entry = atlas.addMarker({
        		map: data.map,
        		lat: data.coord.lat,
        		lng: data.coord.lng,
        		events: {
        			click: (e, m, i) => {
        				console.log('click', i, data);
                        let entry = atlas.markers[i];
                        let entryData = entry.data;
                        let locName = entryData.name || 'Location ' + i;
                        let locData = `
                            <h3>${locName}</h3>
                            <ul>
                                <li>Time: ${entryData.time}</li>
                                <li>Infected: ${entryData.infected}</li>
                            </ul>
                        `;
                        let info = new google.maps.InfoWindow({
                            content: locData
                        });
                        if(atlas.map){
                            info.open(atlas.map, entry.ref);
                            if(atlas.lastInfoWindow){
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

        addCustomMarker: (data) => {
            let entry = atlas.addMarker({
                map: data.map,
                lat: data.coord.lat,
                lng: data.coord.lng,
                events: {
                    click: (e, m, i) => {
                        console.log('click', i, data);
                        let entry = atlas.markers[i];
                        let info = new google.maps.InfoWindow({
                            content: data.text
                        });
                        if(atlas.map){
                            info.open(atlas.map, entry.ref);
                            if(atlas.lastInfoWindow){
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
            let icon = data.icon || {
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

        loadMapFromData: (map, value) => {
            let input = value.split('$@@$').map(line => {
                return line.split('$@$');
            });
            input.forEach(data => {
                let lat = parseFloat(data[0]);
                let lng = parseFloat(data[1]);
                let color = data[2];
                let size = parseFloat(data[3]);
                let opacity = parseFloat(data[4]);
                let text = data[5];
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
            let first = atlas.markers[0];
            if(first){
                map.setCenter({
                    lat: first.data.lat,
                    lng: first.data.lng
                });
            }
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

		setHotKey: (shortcut, callback) => {
            hotKeys[shortcut] = callback;
        }
	}

	return atlas;
}