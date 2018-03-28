"use strict";

const $ = require('jquery');
require('./sass/materialize.scss');
require('./js/bin/materialize.min.js');
require('./style.sass');

const apiKey = '639dfa01002f3408a38a3b3682d9331c';
const imgPath = './img/';

let weatherData = {
    place: '',
    temperature: 0,
    humidity: -1,
    pressure: -1,
    type: '',
    icon: 0,
    cloudiness: 0,
    windspeed: 0
};
let temp_unit = 'c';
const weatherTypes = new Map();
weatherTypes.set('Thunderstorm', 'thunderstorm.jpg');
weatherTypes.set('Drizzle', 'drizzle.jpg');
weatherTypes.set('Rain', 'rain.jpg');
weatherTypes.set('Snow', 'snow.jpg');
weatherTypes.set('Atmosphere', 'mist.jpg');
weatherTypes.set('Mist', 'mist.jpg');
weatherTypes.set('Clear', 'clear.jpg');
weatherTypes.set('Clouds', 'clouds.jpg');
weatherTypes.set('Extreme', 'extreme.jpg');
weatherTypes.set('Additional', 'additional.jpg');

$('body').css('background-image', `url("${imgPath}background-beach.jpg")`);
$('.wrapper').css('background-image', `url("${imgPath}texture.png")`);
$('document').ready(() => {
    getLocationAuto();
});

$('#get-auto').on('mousedown touchstart', () => {
    getLocationAuto();
});

$('#unit-switch').on('mousedown touchstart', () => {
    let temp;
    if (temp_unit == 'c') {
        temp_unit = 'f';
        temp = Math.round((weatherData.temperature*9/5 + 32)*100)/100;
    }
    else if (temp_unit == 'f') {
        temp_unit = 'c';
        temp = Math.round(weatherData.temperature*100)/100;
    }
    else return;
    $('#temp').text(temp + ' \u00BA' + temp_unit.toUpperCase()); 
});

$('#get-man').on('mousedown touchstart', () => {
    getCity();
});

$('#input-city').on("keydown", event => {
    if (event.which == 13)
        getCity();
});

function getLocationAuto() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    resolve([position.coords.latitude, position.coords.longitude]);
                }, 
                error => {
                    reject('Geolocation is disabled'); 
                }
            );
        }
        else reject('Geolocation not supported');
    }).then(
        function fulfilled(data) {
            let location = {
                lat: data[0],
                long: data[1]
            };
            displayLocation(location);
        },
        function rejected(error) {
            M.toast({html: `${error}`, classes: 'rounded blue toast-resize'});
            $('#warning').text(error);
        }
    );
}

function getCity() {
    let val = $('#input-city').val();
    if (val) {
        if (!val[0].match(/[a-z]/i)) 
            M.toast({html: `Incorrect city name`, classes: 'rounded blue toast-resize'});
        else displayLocation(val);
    }
    else M.toast({html: `No city name given`, classes: 'rounded blue toast-resize'});
}

function displayLocation(location) {
    if (location.hasOwnProperty('lat') && 
        location.hasOwnProperty('long')) {
            let lat = Math.round(location.lat*1000)/1000, 
                long = Math.round(location.long*1000)/1000;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}`)
            .then(
                response => {
                    if (response.ok)
                        response.json().then(data => updateDisplay(data, temp_unit));
                    else {
                        M.toast({html: `City not found`, classes: 'rounded blue toast-resize'});
                    }
                }
            ).catch(error => {
                M.toast({html: error, classes: 'rounded blue toast-resize'});
            });
    }
    else if (typeof location == 'string') {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`)
        .then( 
            response => {
                if (response.ok) 
                    response.json().then(data => updateDisplay(data, temp_unit));
                else {
                    let error = response.status;
                    M.toast({html: `City not found`, classes: 'rounded blue toast-resize'});
                }
            }
        ).catch(error => {
            M.toast({html: error, classes: 'rounded blue toast-resize'});
        });
    }
}

function updateDisplay(data, temp_unit) {
    let temp, img;
    if (temp_unit == 'c')
        temp = Math.round((data.main.temp - 273.15)*100)/100;
    else if (temp_unit == 'f')
        temp = Math.round(((data.main.temp - 273.15)*9/5 + 32)*100)/100;
    else
        return;
    $('#place').text(data.name);
    $('#temp').text(temp + ' \u00BA' + temp_unit.toUpperCase());
    $('#humidity').text(data.main.humidity + '%');
    $('#pressure').text(data.main.pressure + ' hPa');
    $('#clouds').text(data.clouds.all + '%');
    $('#wind').text(data.wind.speed + ' km/h');
    img = weatherTypes.get(data.weather[0].main);
    if (!img) img = 'default.jpg';
    $('body').css('background-image', `url("${imgPath}${img}")`);
    $('#icon').empty();
    $('#icon').prepend(`<img id="img-icon" src="http://openweathermap.org/img/w/${data.weather[0].icon}.png"/>`);
}

