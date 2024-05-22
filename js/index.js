const API_KEY = 'c594227b65125fa40028a106ab3c643f'; // Thay thế bằng API Key của bạn

document.getElementById('search-input').addEventListener('change', async () => {
    const city = document.getElementById('search-input').value;
    if (city) {
        const coordinates = await getCoordinates(city);
        if (coordinates) {
            // console.log(coordinates);
            await getWeatherData(coordinates.lat, coordinates.lon);
        }
    }
});

async function getCoordinates(city) {
    const BASE_URL_CURRENT = 'http://api.openweathermap.org/data/2.5/weather';
    const url = `${BASE_URL_CURRENT}?q=${city}&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const lat = data.coord.lat;
        const lon = data.coord.lon;
        return { lat, lon };
    } catch (error) {
        console.error(`Error fetching coordinates: ${error}`);
    }
}

async function getWeatherData(lat, lon) {
    const BASE_URL_ONECALL = 'http://api.openweathermap.org/data/2.5/weather';
    const EXCLUDE = 'minutely,hourly';
    const url = `${BASE_URL_ONECALL}?lat=${lat}&lon=${lon}&exclude=${EXCLUDE}&units=metric&appid=${API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        document.querySelector('.city-name').textContent = data.name;
        document.querySelector('.weather-state').textContent = data.weather[0].description;
        document.querySelector('.temperature').textContent = `${data.main.temp}`;
        document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById('sunrise').textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        document.getElementById('sunset').textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.getElementById('wind-speed').textContent = `${data.wind.speed} km/h`;
    } catch (error) {
        console.error(`Error fetching weather data: ${error}`);
    }
}

//tro ly ao
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

const recognition = new SpeechRecognition();
const synth = window.speechSynthesis;
recognition.lang = 'vi-VI';
recognition.continuous =false;

const microphone = document.querySelector('.microphone');

const speak = (text)=>{
    if (synth.speaking) {
        console.error('Busy. speaking...');
        return;
    }

    const utter = new SpeechSynthesisUtterance(text);

    utter.onend = ()=>{
        console.log('SpeechSynthesisUtterance.onend');
    }
    utter.error = (err)=>{
        console.log('SpeechSynthesisUtterance.error',err);
    }
    synth.speak(utter);
}

const handleVoice = (text) =>{
    const handleText = text.toLowerCase();
    if (handleText.includes('thời tiết tại')) {
        const location = handleText.split('tại')[1].trim();
        console.log(location);
        document.getElementById('search-input').value = location;
        const changeEvent = new Event('change');
        document.getElementById('search-input').dispatchEvent(changeEvent);
        return
    }
    
    const container = document.querySelector('.container');
    if (handleText.includes('thay đổi màu nền ')) {
        const color = handleText.split('màu nền')[1].trim();
        console.log(color);
        container.style.background = color;
        return;
    }

    if (handleText.includes('màu nền mặc định')) {
        container.style.background = '';
        return;
    }

    if (handleText.includes('mấy giờ')) {
        const textToSpeech = `${moment().hours()} hours ${moment().minutes()} minutes`;
        speak(textToSpeech);
        return;
    }
    speak('Try again');
}

microphone.addEventListener('click',(e)=>{
    e.preventDefault();
    recognition.start();
    microphone.classList.add('recording');
});

recognition.onspeechend = () =>{
    recognition.stop();
    microphone.classList.remove('recording');
}

recognition.onerror = (err) =>{
    recognition.error(err);
    microphone.classList.remove('recording');
}
recognition.onresult = (e) =>{
    console.log('onresult', e);
    const text = e.results[0][0].transcript;
    handleVoice(text);
}

