// 
/*-------------------------------------------
            config map
*-------------------------------------------*/
let mapConfig = {
    maxZoom: 18,
    minZoom: 7
}
let mapZoom = 12;
let mapCenter = [25.047929607735554, 121.51699271828755];
let map = L.map('map', mapConfig).setView(mapCenter, mapZoom);

map.on('click', removeClicked);

/*-------------------------------------------
            control layers
-------------------------------------------*/
let allStationLayer = new L.featureGroup();

let basicLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    id: 'basicLayer',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>         contributors'
}).addTo(map);


let OpenStreetMap_DELayer = L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


let baseMaps = {
    "basic": basicLayer,
    "layey1": OpenStreetMap_DELayer
};
let overlayMaps = {
    "stations": allStationLayer
};

L.control.layers(baseMaps, overlayMaps).addTo(map);
map.addLayer(allStationLayer);


/*-------------------------------------------
            create marker
*-------------------------------------------*/

let stationMarkerGroup = [];
let data = [{
    id: 'point1',
    lat: 25.03327634008765,
    lng: 121.50023730362538,
    textTop: '',
    name: '萬華車站',
    status: "success"
}, {
    id: 'point2',
    lat: 25.047929607735554,
    lng: 121.51699271828755,
    textTop: 'root',
    name: '台北車站',
    status: "success"
}, {
    id: 'point3',
    lat: 25.04970260812922,
    lng: 121.57841311212317,
    textTop: '',
    name: '松山車站',
    status: "warning"
}, {
    id: 'point4',
    lat: 25.053394886139333,
    lng: 121.60711639333876,
    textTop: '',
    name: '南港車站',
    status: "success"
}];



data.forEach(point => {
    stationMarkerGroup.push(createStationMarker(point))
})

function createStationMarker(point) {

    let marker = L.marker([point.lat, point.lng], {
        group: 'station',
        id: point.id,
        draggable: true,
        icon: createStationIcon()
    }).addTo(map);
    allStationLayer.addLayer(marker);

    marker.on('click', clickMarkerHandeler)
        .on('drag', dragHandler);

    marker.latlng = [point.lat, point.lng];
    return marker;

    function createStationIcon() {

        let iconTemplate = `<div class="marker" id=${point.id}>  
                                <svg version="1.1" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                    <g>
                                        <circle cx="50" cy="50" r="48" class="${point.status}">
                                        </circle>
                                        <text x="50" y="20" style="font-size:14px;text-anchor:middle;">${point.textTop}</text>
                                        <image href="./images//marker-icon-2x-gold.png"
                                        width="30px" height="30px" x="50%" y="50%" transform="translate(-15,-15)"
                                            width="30px" height="30px" x="50%" y="50%" transform="translate(-15,-15)" />
                                        <text x="50" y="80" style="font-size:14px;text-anchor:middle;">${point.name}</text>
                                    </g>
                                </svg> 
                        </div>`;
        let stationIcon = L.DivIcon.extend({
            options: {
                className: 'css-icon',
                html: iconTemplate
            }
        })
        return new stationIcon()
    };

    function clickMarkerHandeler(e) {
        removeClicked();
        let backgroundCircle = this.getElement().children[0].children[0].children[0].children[0];
        if (!L.DomUtil.hasClass(backgroundCircle, 'warning')) {
            backgroundCircle.setAttribute("style", "stroke:#2C9090; stroke-width:2; fill:rgba(159, 207, 207, 0.609);");
        }
        L.DomUtil.addClass(backgroundCircle, 'clicked')

        map.setView(e.target.getLatLng(), mapZoom);
    }
}


/*-------------------------------------------
            mapinfo
*-------------------------------------------*/

let template = "";
data.forEach(point => {
    let status = "正常",
        warning = "";
    if (point.status === "warning") {
        status = "異常";
        warning = "warning";
    }
    template += ` <li id='marker_${point.id}' class="info-item ${warning}">
                    <p class="name"><span>${point.name}</span></p>
                    <p class="lng">經度：<span>${point.lng}</span></p>
                    <p class="lat">緯度：<span>${point.lat}</span></p>
                    <p class="status">狀態：<span>${status}</span></p>
                </li>`;
})

let infoElement = document.getElementById('info');
infoElement.innerHTML = template;


let infoItems = document.getElementsByClassName('info-item');
for (let i = 0; i < infoItems.length; i++) {
    infoItems[i].addEventListener('click', function() {
        map.setView({
            lat: data[i].lat,
            lng: data[i].lng
        }, mapZoom);
    })
}



/*-------------------------------------------
            create polyline 
-------------------------------------------*/

let stationLatlngs = [
    [stationMarkerGroup[0].latlng, stationMarkerGroup[1].latlng],
    [stationMarkerGroup[1].latlng, stationMarkerGroup[2].latlng],
    [stationMarkerGroup[2].latlng, stationMarkerGroup[3].latlng]
];

let stationPolylines = [];
stationLatlngs.forEach(line => {
    stationPolylines.push(createPolyline(line));
});

let allPolylines = {};
allPolylines.station = {
    polyline: stationPolylines,
    latlng: stationLatlngs,
};

function createPolyline(latlng) {

    let polyline = L.polyline(latlng, {
        color: "#333333",
        className: 'polyline-custom'
    }).addTo(map);

    allStationLayer.addLayer(polyline);
    polyline.on('click', clickPolylineHandeler);
    return polyline;

    function clickPolylineHandeler(e) {
        L.DomEvent.stopPropagation(e);
        removeClicked();
        let polyline = this.getElement();
        polyline.setAttribute("style", "stroke:#2C9090; weight:6;")
        L.DomUtil.addClass(polyline, 'clicked')
    }
}

/*-------------------------------------------
            global function
-------------------------------------------*/

function removeClicked() {
    let clickedElements = document.getElementsByClassName('clicked');
    if (clickedElements.length !== 0) {
        let clickedElement = clickedElements[0];
        switch (clickedElement.tagName) {
            case 'circle':
                clickedElement.setAttribute("style", "stroke:transparent; stroke-width:none; fill:transparent;");
                break;
            case 'path':
                clickedElement.setAttribute("style", "color:#2C9090; weight:3;");
                break;
        }

        L.DomUtil.removeClass(clickedElements[0], 'clicked')
    }
}



function dragHandler(e) {
    let polylines = allPolylines[e.target.options.group].polyline,
        latlngs = allPolylines[e.target.options.group].latlng,
        oldLat = e.target.latlng[0],
        oldLng = e.target.latlng[1],
        newLatlng = [e.latlng.lat, e.latlng.lng];

    latlngs.forEach((polyline, polylineIndex) => {
        polyline.forEach((marker, markerIndex) => {
            if (marker[0] === oldLat && marker[1] === oldLng) {
                let newPolylineLatlng = [];
                let anotherPoint = polylines[polylineIndex].getLatLngs();
                if (markerIndex === 0) {
                    newPolylineLatlng = [
                        newLatlng, [anotherPoint[1].lat, anotherPoint[1].lng]
                    ];
                } else {
                    newPolylineLatlng = [
                        [anotherPoint[0].lat, anotherPoint[0].lng],
                        newLatlng
                    ];
                }
                polylines[polylineIndex].setLatLngs(newPolylineLatlng);
                latlngs[polylineIndex][markerIndex] = newLatlng;
            }
        })
    })

    e.target.latlng = newLatlng;

    let changePoint = data.find(el => el.id === e.target.options.id)
    changePoint.lat = newLatlng[0];
    changePoint.lng = newLatlng[1];

    let changeElement = L.DomUtil.get(`marker_${e.target.options.id}`)
    changeElement.children[1].children[0].innerText = newLatlng[1];
    changeElement.children[2].children[0].innerText = newLatlng[0];
}