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

    google.maps.event.addListener(map, 'click', e => {
        if(atlas.isShiftClick()){
            let coord = e.latLng;
            let entry = atlas.addDefaultMarker({
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
        callback: (value) => {
            if(value){
                let loaded = atlas.loadMarkers(value);
                if(loaded){
                    loaded.forEach(coord => {
                        coord.map = map;
                        atlas.addDefaultMarker({
                            map: map,
                            coord: coord,
                            name: coord.name
                        });
                        let first = atlas.markers[0];
                        if(first){
                            map.setCenter({
                                lat: first.data.lat,
                                lng: first.data.lng
                            });
                        }
                    });
                    vex.dialog.alert('Loaded existing map: ' + value);
                }
                else{
                    vex.dialog.alert('Created new map: ' + value);
                }
                window.MAP_TAG = value;
            }
        }
    });

    let importCoordinates = (tag) => {
        vex.dialog.prompt({
            message: 'Import your coordinates:',
            callback: (value) => {
                localStorage.setItem(tag, value);
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

    atlas.setHotKey('i', e => {
        vex.dialog.prompt({
            message: 'Enter a key for this map:',
            callback: (tag) => {
                let existing = localStorage.getItem(tag);
                if(existing){
                    vex.dialog.confirm({
                        message: 'This will overwrite an existing map, are you sure?',
                        callback: (yes) => {
                            if(yes){
                                importCoordinates(tag);
                            }
                        }
                    })
                }
                else{
                    importCoordinates(tag);
                }
            }
        });
    });

    atlas.setHotKey('e', e => {
        vex.dialog.prompt({
            message: 'Exported coordinates:',
            value: atlas.markersToString(atlas.markers),
            callback: (value) => {}
        });
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

});