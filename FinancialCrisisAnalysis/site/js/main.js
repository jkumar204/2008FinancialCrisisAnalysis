let map = d3.geomap()
    .geofile('data/countries.json');
let initYear;
let stopYear;
let x;
let yearDiv = document.querySelector('#year');

let config = {
    unemployment: {
        file: 'data/unemployment.csv',
        colorscheme: colorbrewer.YlOrRd[9],
        startYear: 1991,
        stopYear: 2014,
        selected: false
    },
    trade: {
        file: 'data/trade.csv',
        colorscheme: colorbrewer.YlGn[9],
        startYear: 1960,
        stopYear: 2015,
        selected: false
    },
    inflation: {
        file: 'data/inflation.csv',
        colorscheme: colorbrewer.YlOrRd[9],
        startYear: 1960,
        stopYear: 2015,
        selected: false
    }
}



d3.select('#map')
    .call(map.draw, map);

let format = function(d) {
    return d3.format(',.02f')(d) + '%';
}

function initMap(year, colorscheme) {
    initYear = year;
    x = initYear;
    map = d3.geomap.choropleth()
        .geofile('data/countries.json')
        .colors(colorscheme)
        .column(year)
        .format(format)
        .legend(true)
        .unitId('Country Code');
}

function dataBind(filename) {
    d3.csv(filename, function(error, data) {
        d3.select('#map')
            .datum(data)
            .call(map.draw, map);
    });
}

function iterMap(stopYear, direction) {
    if (direction == 'next') {
        if (x >= stopYear) {
            x = initYear;
            updateYear(x);
            return;
        }
        x++;
        updateYear(x);
    }
    if (direction == 'prev') {
        if (x <= initYear) {
            x = stopYear;
            updateYear(x);
            return;
        }
        x--;
        updateYear(x);
    }
}

function updateYear(year) {
    yearDiv.innerHTML = year;
    map.properties.column = year;
    map.update();
}

let mapInterval = null;

function buttonHandler(e) {

    // console.log(e.target.classList.contains('next'));
    // console.log(e.target.dataset.action);

    if (e.target.dataset.action == 'play-pause') {
        if (typeof(map) == 'undefined') {
            yearDiv.innerHTML = "First select a feature to initialize the map!";
            return;
        }
        if (mapInterval === null) {
            console.log(e.target.dataset.action);
            let callFunc = 'iterMap(' + stopYear + ', "next")';
            console.log(callFunc);
            e.target.classList.remove('selected');
            mapInterval = setInterval(callFunc, 400);
            // mapInterval = setInterval('iterMap(2014, "next")', 400);
        } else {
            e.target.classList.add('selected');
            window.clearInterval(mapInterval);
            mapInterval = null;
        }
        return;
    }

    if (e.target.dataset.action == 'next' || e.target.dataset.action == 'prev') {
        if (typeof(map) == 'undefined') {
            yearDiv.innerHTML = "First select a feature to initialize the map!";
            return;
        }
        iterMap(stopYear, e.target.dataset.action)
        return;
    }

    d3.select('svg').remove();

    buttons.forEach(b => {
        b.classList.remove('selected');
    });

    e.target.classList.add('selected');

    dataBind(config[`${e.target.dataset.action}`].file);
    initMap(config[`${e.target.dataset.action}`].startYear, config[`${e.target.dataset.action}`].colorscheme);
    stopYear = config[`${e.target.dataset.action}`].stopYear;
    window.clearInterval(mapInterval);
    let callFunc = 'iterMap(' + stopYear + ', "next")';
    mapInterval = setInterval(callFunc, 400);
}

const buttons = document.querySelectorAll('button');

buttons.forEach(b => {
    b.addEventListener('click', buttonHandler)
});
