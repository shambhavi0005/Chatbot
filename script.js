const chatInput = document.querySelector(".chat-input textarea"); //Selects the first text area element inside the html element with the class "Chat-input" and assigns it to the variable `chatInput`. Used to capture user input in a chat interface.
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const sendChatBtn = document.querySelector(".chat-input span"); //selects the first <span> element inside an HTML element with the class "chat-input" and assigns it to the variable sendChatBtn. This likely represents a button that users can click to send their chat message.
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const chatbox = document.querySelector(".chatbox"); // selects an HTML element with the class "chatbox" and assigns it to the variable chatbox. This is where the chat messages will be displayed.
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const voiceRecognitionButton = document.getElementById("voiceRecognitionButton");
let userMessage; //Declares a variable called userMessage which will be used to store the user's input message.
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Reminders
const reminders = [];
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Main Api Key
const API_KEY = "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";
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// This is a function declaration that defines a function called createChatLi. It takes two parameters, message  and className. This function is used to create a new chat message element.
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p>${message}</p>` : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
}


// This code is related to the emotional intelligence of the chatbot
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// This code written here for the speech recognition functionality of the bot.
if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    let listening = false;

    voiceRecognitionButton.addEventListener("click", () => {
        if (listening) {
            recognition.stop();
            voiceRecognitionButton.textContent = "Start Voice Input";
        } else {
            recognition.start();
            voiceRecognitionButton.textContent = "Stop Voice Input";
        }
        listening = !listening;
    });
    recognition.onresult = (event) => {
        const voiceInput = event.results[event.results.length - 1][0].transcript;
        chatInput.value = voiceInput;
    };
} else {
    voiceRecognitionButton.disabled = true;
    voiceRecognitionButton.textContent = "Voice Input Not Supported";
    sendChatButton.disabled = true;
}
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//It takes an incoming chat message element (incomingChatLi) as a parameter. This function is responsible for generating a response to the user's message.
const generateResponse = (incomingChatLi) => {
    const API_URL = "https://api.openai.com/v1/chat/completions"; //This is where the code will send requests to generate responses using GPT-3.

    const messageElement = incomingChatLi.querySelector("p"); //selects the <p> element inside the incomingChatLi, which represents the message content that will be updated with the response.

    const isAskingName = userMessage.toLowerCase().includes("name"); 
    const isAskingAi = userMessage.toLowerCase().includes("who are you?"); 
    const isAskingDayTime = /day|time/gi.test(userMessage); 
    const isGreeting = /hi|hello|hey/gi.test(userMessage);
    const isAskingWeather = /weather in (.+)/i.test(userMessage);
    const isHappy = userMessage.toLowerCase().includes("happy");
    const isSad = userMessage.toLowerCase().includes("sad");


    // Emotional Intelligence
    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    // For name, weather, Who are you, Greeting, Date and time, Reminder
    if (isAskingName) {
        messageElement.textContent = "My name is Oliver!";
    } 
    else if (isAskingWeather){
        const location = userMessage.match(/weather in (.+)/i)[1];
        getWeatherInfo(location, messageElement);
    } 
    else if (isAskingAi) {
            messageElement.textContent = "I am Oliver.!";
    
    } 
    else if (isGreeting) {
        messageElement.textContent = "Hello there! I'm your virtual assistant, here to make your day a little brighter and your tasks a lot easier. Feel free to ask me anything, whether it's a question, a task, or just a friendly chat. I'm here to help and have a great conversation with you. What can I assist you with today?";
    }
    else if (isAskingDayTime) {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString();
        const formattedTime = currentDate.toLocaleTimeString();
        messageElement.textContent = `The current date is ${formattedDate} and the time is ${formattedTime}`;
    } 
    else if (userMessage.toLowerCase().includes("remind me to")) {
        const reminderMessage = userMessage.substring("remind me to".length).trim();
        const currentTime = new Date();
        const minutesToAdd = 1; 

        currentTime.setMinutes(currentTime.getMinutes() + minutesToAdd);

        createReminder(reminderMessage, currentTime);

        messageElement.textContent = `I've set a reminder for "${reminderMessage}" in ${minutesToAdd} minutes.`;
    } 
    else if (/^\s*[+\-*/0-9.() ]+\s*$/.test(userMessage)) {
        try {
            const result = eval(userMessage);
            messageElement.textContent = `The result of the calculation is: ${result}`;
        } catch (error) {
            messageElement.textContent = "Sorry, there was an error in the calculation. Please check your input.";
        }
    } 


    else {
        // object called requestOptions with the configuration for a HTTP POST request to the OpenAI API. It specifies the model to use, the message content, and the API key for authentication.
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: userMessage }]
            })
        }


        // uses the fetch API to make a POST request to the OpenAI API with the provided requestOptions. It then processes the response by converting it to JSON format and updating the messageElement with the generated response.
        fetch(API_URL, requestOptions)
            .then(res => res.json())
            .then(data => {
                messageElement.textContent = data.choices[0].message.content;
            })

            // If there's an error during the API request, this code handles the error by updating the messageElement with an error message.
            .catch(error => {
                messageElement.textContent = "Oops! Something went wrong. Please try again.";
            });
    }
}

// function for weather 
function getWeatherInfo(location, messageElement) {
    const API_KEY_WEATHER = "3c3a7aa4b042ae8fd1af16ed4babe5a8"; 
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${API_KEY_WEATHER}`;

    fetch(WEATHER_API_URL)
        .then((response) => response.json())
        .then((data) => {
            if (data.cod === 200) {
                const description = data.weather[0].description;
                const temperature = (data.main.temp - 273.15).toFixed(2);
                messageElement.textContent = `The weather in ${location} is ${description} with a temperature of ${temperature}°C.`;
            } else {
                messageElement.textContent = "Sorry, I couldn't find weather information for that location.";
            }
        })
        .catch((error) => {
            messageElement.textContent = "Oops! Something went wrong while fetching weather data.";
        });
}
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Function to set a reminder
const createReminder = (message, time) => {
    const reminder = {
        message,
        time,
    };
    reminders.push(reminder);
};

// Function to check and trigger reminders
const checkReminders = () => {
    const currentTime = new Date();

    for (let i = reminders.length - 1; i >= 0; i--) {
        const reminder = reminders[i];
        const reminderTime = new Date(reminder.time);

        if (reminderTime <= currentTime) {
            const reminderMessage = `⏰ Reminder: ${reminder.message}`;
            const reminderChatLi = createChatLi(reminderMessage, "incoming");
            chatbox.appendChild(reminderChatLi);
            reminders.splice(i, 1);
        }
    }
};
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// Function to get latest news
function getLatestNews(messageElement) {
    const NEWS_API_KEY = "YOUR_NEWS_API_KEY"; // Replace with your News API key
    const NEWS_API_URL = "https://newsapi.org/v2/top-headlines";
    const NEWS_API_COUNTRY = "us"; // You can change the country code as needed

    const requestOptions = {
        method: "GET"
    };
    const apiUrl = `${NEWS_API_URL}?country=${NEWS_API_COUNTRY}&apiKey=${NEWS_API_KEY}`;

    fetch(apiUrl, requestOptions)
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "ok" && data.articles.length > 0) {
                const articles = data.articles;
                let newsResponse = "Here are the latest news headlines:\n\n";

                for (let i = 0; i < Math.min(5, articles.length); i++) {
                    const article = articles[i];
                    newsResponse += `${i + 1}. ${article.title}\n${article.url}\n\n`;
                }

                messageElement.textContent = newsResponse;
            } else {
                messageElement.textContent = "Sorry, I couldn't retrieve the latest news at the moment.";
            }
        })
        .catch((error) => {
            messageElement.textContent = "Oops! Something went wrong while fetching the latest news.";
        });
}
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



// used to scroll the chatbox to the bottom so that the most recent messages are visible.
    function scrollToBottom() {
        chatbox.scrollTop = chatbox.scrollHeight;
    }
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


//function captures the user's message, appends it to the chatbox as an outgoing message, clears the input field, displays a "Thinking..." message, generates a response, and scrolls to the bottom to show the latest messages in the chat interface. This function manages the user's input and the display of chat messages.
const handleChat = () => {

    // captures the user's input from the chatInput element (which is a textarea), trims any leading or trailing whitespace, and assigns the cleaned message to the userMessage variable. Trimming removes unnecessary spaces or newlines that the user might have entered.
    userMessage = chatInput.value.trim();

    // checks if the userMessage is empty or contains only whitespace after trimming. If the message is empty, the function immediately returns, and no further action is taken. This is a validation step to prevent sending empty messages.
    if (!userMessage) return;

    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    
    // After adding the user's message to the chatbox, this line clears the text input field by setting its value to an empty string. This allows the user to start typing a new message easily.
    chatInput.value = ''; 


    //  sets up a delay using setTimeout. The code inside the function passed to setTimeout will run after a 600-millisecond
    setTimeout(() => {
        const incomingChatLi = createChatLi("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        generateResponse(incomingChatLi);
       
        scrollToBottom();
    }, 100);
}

// Feedback code
const positiveFeedbackBtn = document.getElementById("positive-feedback");
const negativeFeedbackBtn = document.getElementById("negative-feedback");

positiveFeedbackBtn.addEventListener("click", () => {
    handleFeedback(true);
});

negativeFeedbackBtn.addEventListener("click", () => {
    handleFeedback(false); 
});

const handleFeedback = (isPositive) => {
    const feedbackType = isPositive ? "positive" : "negative";
    console.log(`User provided ${feedbackType} feedback`);

    const feedbackMessage = isPositive ? "Thanks for your positive feedback!" : "We're sorry to hear that. How can we improve?";
    const feedbackChatLi = createChatLi(feedbackMessage, "incoming");
    chatbox.appendChild(feedbackChatLi);
    scrollToBottom();
};


// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

window.addEventListener("load", scrollToBottom);
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

sendChatBtn.addEventListener("click", handleChat);
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        handleChat();
    }
});
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++