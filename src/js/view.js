let config = {
	apiKey: 'AIzaSyA9EYUXVL5WAh6Aam1qXlWyvi3b7HLcZ1U',
	authDomain: 'esigamma.firebaseapp.com',
	databaseURL: 'https://esigamma.firebaseio.com',
	projectId: 'esigamma',
	storageBucket: 'esigamma.appspot.com',
	messagingSenderId: '73416363603'
};
let ESIFirebase = firebase.initializeApp(config, 'Atlas');
let db = ESIFirebase.database();

function getQueryParams(qs) {
	qs = qs.split('+').join(' ');
	var params = {},
		tokens,
		re = /[?&]?([^=]+)=([^&]*)/g;
	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}
	return params;
}

let fillText = (tag, text) => {
	let spans = document.getElementsByClassName(tag);
	for(let s = 0; s < spans.length; s++){
		let span = spans[s];
		span.innerText = text;
	}
}

let params = getQueryParams(document.location.search);

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

	try{
		let mapThemeTag = localStorage.getItem('map-theme-tag');
		let mapThemeStyle = localStorage.getItem('map-theme-style');
		if(mapThemeTag && mapThemeStyle){
			let theme = JSON.parse(mapThemeStyle);
			atlas.changeMapStyle(map, mapThemeTag, theme);
		}
	}
	catch(e){
		console.log(e);
	}

    let shortcutsList = document.getElementById('shortcuts-list');
    document.getElementById('shortcuts').addEventListener('click', e => {
        let displayList = document.createElement('div');
            displayList.innerHTML = shortcutsList.innerHTML;
        vex.dialog.alert({
            unsafeMessage: displayList.outerHTML
        });
    });

    if(params.code){
    	let ref = db.ref('atlas/saved/' + params.code);
    	ref.once('value', snap => {
    		let val = snap.val();
    		if(val){
    			atlas.loadMapFromData(map, val);
    			vex.dialog.alert({
	    			message: `Loaded map data saved at code: ${params.code}.`
	    		});
    		}
    		else{
    			vex.dialog.alert({
	    			message: `No map data saved with code: ${params.code}.`
	    		});
    		}
    	}).catch(err => {
    		vex.dialog.alert({
    			message: `Something went wrong with the code: ${params.code}, : ${err}.`
    		});
    	});
    }
    else{
		vex.dialog.prompt({
			message: 'Enter map data:',
			callback: (value) => {
				if(value){
					window.storedMapData = value;
					atlas.loadMapFromData(map, value);
				}
			}
		});
    }

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

	atlas.setHotKey('m', e => {
		vex.dialog.prompt({
			message: 'Enter map theme data:',
			callback: (value) => {
				let style = {
					name: 'Custom Style',
					json: value
				}
				localStorage.setItem('map-theme-tag', style.name);
				localStorage.setItem('map-theme-style', style.json);
				let tag = style.name;
				let theme = JSON.parse(style.json);
				atlas.changeMapStyle(map, tag, theme);
				vex.dialog.alert('Changed map theme to: ' + tag);
			}
		});
	});

	atlas.setHotKey('l', e => {
		vex.dialog.prompt({
			message: 'Enter map data:',
			callback: (value) => {
				if(value){
					window.storedMapData = value;
					atlas.loadMapFromData(map, value);
				}
			}
		});
	});

	atlas.setHotKey('s', e => {
		let dataToStore = window.storedMapData;
		if(dataToStore){
			vex.dialog.prompt({
				message: 'Choose a code to save your map with.',
				callback: (code) => {
					if(code){
						let ref = db.ref('atlas/saved/' + code);
						ref.once('value', snap => {
							let val = snap.val();
							if(val){
								vex.dialog.confirm({
									message: `There is already a map saved with code: ${code}. Do you want to replace it?`,
									callback: (replace) => {
										if(replace){
											let p = ref.set(dataToStore);
											handleSavedMapOverwrite(p, code);
										}
									}
								});
							}
							else{
								let p = ref.set(dataToStore);
								handleSavedMapOverwrite(p, code);
							}
						});
					}
				}
			});
		}
		else{
			vex.dialog.alert('There is no map data to save.');
		}
	});

	let handleSavedMapOverwrite = (promise, code) => {
		promise.then(done => {
			let link = `illinoistechesi.github.io/atlas/view?code=${code}`;
			vex.dialog.prompt({
				message: `Share your map with this link:`,
				value: link,
				callback: () => {}
			});
		}).catch(err => {
			vex.dialog.alert(`Something went wrong: ${err}.`);
		});
	}

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