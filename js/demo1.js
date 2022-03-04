// 
/*-------------------------------------------
            config map
*-------------------------------------------*/

let map = L.map('map').setView([25.047929607735554, 121.5499271828755], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    id: 'basicLayer',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>contributors'
}).addTo(map);


map.on('click', removeClicked);



/*-------------------------------------------
            create marker
*-------------------------------------------*/

let stationMarkerGroup = [];
let data = [{
    id: 'point2',
    lat: 25.047929607735554,
    lng: 121.51699271828755,
    textTop: 'root',
    name: '台北車站'
}, {
    id: 'point3',
    lat: 25.04970260812922,
    lng: 121.57841311212317,
    textTop: '',
    name: '松山車站'
}];


data.forEach(point => {
    stationMarkerGroup.push(createStationMarker(point))
})

function createStationMarker(point) {

    let marker = L.marker([point.lat, point.lng], {
        group: 'station',
        draggable: true,
        icon: createStationIcon()
    }).addTo(map);

    marker.on('click', clickMarkerHandeler)
        .on('drag', dragHandler);

    marker.latlng = [point.lat, point.lng];
    return marker;

    function createStationIcon() {

        let iconTemplate = `<div class="marker" id=${point.id}>  
                                <svg version="1.1" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                    <g>
                                        <circle cx="50" cy="50" r="48" style="stroke:transparent; stroke-width:none; fill:transparent;">
                                        </circle>
                                        <text x="50" y="20" style="font-size:14px;text-anchor:middle;">${point.textTop}</text>
                                        <image href="./images//marker-icon-2x-gold.png"
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
        L.DomUtil.addClass(backgroundCircle, 'clicked')
        backgroundCircle.setAttribute("style", "stroke:#2C9090; stroke-width:2; fill:rgba(159, 207, 207, 0.609);");
    }
}


/*-------------------------------------------
            create polyline 
-------------------------------------------*/

let stationLatlngs = [
    [stationMarkerGroup[0].latlng, stationMarkerGroup[1].latlng]
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


}