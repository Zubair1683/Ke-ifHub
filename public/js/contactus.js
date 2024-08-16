
$(document).ready(function () {
    updatePage()
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=39.9334&longitude=32.8597&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code';

    $.getJSON(url, function (data) {
        $.getJSON(url, function (data) {
            $.each(data, function () {

                const currentTemp = data.current.temperature_2m;
                const currentWeatherCode = data.hourly.weather_code[data.hourly.weather_code.length - 1];
                const weatherDescription = getWeatherDescription(currentWeatherCode);

                $("#weather").empty().append("<h4>The current weather in Ankara is " + weatherDescription + " , with a temperature of " +
                    currentTemp + "C</h4>");

            });
            updatePage()
        });
    });

});




function getWeatherDescription(weatherCode) {
    switch (weatherCode) {
        case 0:
            $("#weather").css("color", "yellow");
            $("#weather").css("background-color", "grey");
            return 'Clear sky';
        case 1:
            $("#weather").css("color", "yellow");
            $("#weather").css("background-color", "grey");
            return 'Mainly clear';
        case 2:
            $("#weather").css("color", "yellow");
            $("#weather").css("background-color", "grey");
            return 'Partly cloudy';
        case 3:
            $("#weather").css("color", "yellow");
            $("#weather").css("background-color", "grey");
            return 'Overcast';
        case 45:
        case 48:
            $("#weather").css("color", "grey");
            return 'Foggy';
        case 51:
            $("#weather").css("color", "grey");
            return 'Light Drizzle';
        case 53:
        case 55:
            $("#weather").css("color", "grey");
            return 'Moderate Drizzle';
        case 56:
             $("#weather").css("color", "grey");
            return 'Light Freezing Drizzle';
        case 57:
            $("#weather").css("color", "grey");
            return 'Dense intensity Freezing Drizzle';
        case 61:
            $("#weather").css("color", "blue");
            return 'Slight Rain';
        case 63:
            $("#weather").css("color", "blue");
            return 'Moderate Rain: Slighy';
        case 65:
            $("#weather").css("color", "blue");
            return 'Heavy intensity Rain';
        case 66:
            $("#weather").css("color", "blue");
            return 'Freezing Light Rain';
        case 67:
            $("#weather").css("color", "blue");
            return 'Freezing heavy intensity Rain';
        case 71:
            $("#weather").css("color", "white");
            $("#weather").css("background-color", "grey");
            return 'Slight Snowfall';
        case 73:
            $("#weather").css("color", "white");
            $("#weather").css("background-color", "grey");
            return 'moderate Snowfall';
        case 75:
            $("#weather").css("color", "white");
            $("#weather").css("background-color", "grey");
            return 'heavy intensity Snowfall';
        case 77:
            $("#weather").css("color", "white");
            $("#weather").css("background-color", "grey");
            return 'Snow grains';
        case 80:
            $("#weather").css("color", "blue");
            return 'Slight Rain showers';
        case 81:
            $("#weather").css("color", "blue");
            return 'moderate Rain showers';
        case 82:
            $("#weather").css("color", "blue");
            return 'violent Rain showers';
        case 85:
            $("#weather").css("color", "white");
            $("#weather").css("background-color", "grey");
            return 'slight Snow showers'
        case 86:
            $("#weather").css("color", "white");
            $("#weather").css("background-color", "grey");
            return 'heavy Snow showers';
        default:
            $("#weather").css("color", "white");
            $("#weather").css("background-color", "grey");
            return 'Thunderstorm';
    }
}





// Countries for autocomplete section
const countries = [
    "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bangladesh", "Belarus", "Belgium", "Benin", "Bolivia", "Brazil", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Chad", "Chile", "China", "Colombia",
    "Comoros", "Congo (Kinshasa)", "Congo (Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
    "Georgia", "Germany", "Ghana", "Greece", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territories", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
    "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
    "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];
let submitted = false; 
function updatePage() {
    // Jquery widget (autocomplete)
    $(document).ready(function () {
        $(function () {
            $("#country").autocomplete({
                source: countries
            });
        });


        // Get the input element
        var phoneInput = document.getElementById("phone");

        // Add event listener for input
        phoneInput.addEventListener("input", function () {
            // Get input value and remove non-numeric characters
            var inputValue = phoneInput.value.replace(/\D/g, "");

            // Check if the value matches the expected pattern and add "-" after certain digits
            if (inputValue.length >= 1 && inputValue.length < 4) {
                phoneInput.value = inputValue;
            } else if (inputValue.length >= 4 && inputValue.length < 7) {
                phoneInput.value = inputValue.slice(0, 1) + "-" + inputValue.slice(1);
            } else if (inputValue.length >= 7 && inputValue.length < 10) {
                phoneInput.value = inputValue.slice(0, 1) + "-" + inputValue.slice(1, 4) + "-" + inputValue.slice(4, 7) + "-" + inputValue.slice(7);
            } else if (inputValue.length >= 10 && inputValue.length <= 13) {
                phoneInput.value = inputValue.slice(0, 1) + "-" + inputValue.slice(1, 4) + "-" + inputValue.slice(4, 7) + "-" + inputValue.slice(7, 11);
            }
        });



        $('#Male').click(function () {
            $('#maleLabel').css("color", "darkblue");
            $('#femaleLabel').css("color", "black");
            $('#otherLabel').css("color", "black");
        });

        $('#Female').click(function () {
            $('#maleLabel').css("color", "black");
            $('#femaleLabel').css("color", "red");
            $('#otherLabel').css("color", "black");
        });

        $('#Other').click(function () {
            $('#maleLabel').css("color", "black");
            $('#femaleLabel').css("color", "black");
            $('#otherLabel').css("color", "purple");
        });

        if(!submitted){
            document.getElementById('contactForm').addEventListener('submit', function (event) {
                //event.preventDefault(); // Prevent default form submission
    
                // Display custom success message
                alert('Thanks, you have contacted the developer. You will receive a response as soon as possible.');
                
            });
            submitted = true; 
        }
        
    });
}




