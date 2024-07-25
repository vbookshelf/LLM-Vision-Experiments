
// Config
//-------
// Chat parameters are explained here: https://platform.openai.com/docs/api-reference/chat
// GPT-3-5 specs: https://platform.openai.com/docs/models/gpt-3-5

// Your OpenAi API Key
const apiKey = 'YOUR-API-KEY'; 


const bot_name = 'Khuluma'; // Give the bot a name
const user_name = 'Friend';	// Set your chat name 


const model_type = "gpt-4-vision-preview"; // 4096 tokens // gpt-3.5-turbo
const openai_url = 'https://api.openai.com/v1/chat/completions';

// If this number plus the number of tokens in the message_history exceed
// the max value for the model (e.g. 4096) then the response from the api will
// an error dict instead of the normal message response. Thos error dict will
// contain an error message saying that the number of tokens for 
// this model has been exceeded.
const max_tokens = 300; //300

// 0 to 2. Higher values like 0.8 will make the output more random, 
// while lower values like 0.2 will make it more focused and deterministic.
// Alter this or top_p but not both.
const temperature = 0;

// -2 to 2. Higher values increase the model's likelihood to talk about new topics.
// Reasonable values for the penalty coefficients are around 0.1 to 1.
const presence_penalty = 0; 

// -2 to 2. Higher values decrease the model's likelihood to repeat the same line verbatim.
// Reasonable values for the penalty coefficients are around 0.1 to 1.
const frequency_penalty = 0;




// Remove these suffixes. I think removing them makes the chat sound more natural.
// They will sliced off the bot's responses.
// This is done below in the 'Remove suffixes' part of the code.
var suffixes_list = ['How can I help you?', 'How can I assist you today?', 'How can I help you today?', 'Is there anything else you would like to chat about?', 'Is there anything else I can assist you with today?', 'Is there anything I can help you with today?', 'Is there anything else you would like to chat about today?', 'Is there anything else I can assist you with?'];


// The message history is stored in this variable.
// Storing the message history allows the bot to have context memory.

var message_list;





// Option 1: The user does not load a saved chat
//-----------------------------------------------


var system_setup_message = `
Your name is ${bot_name}. You are a kind and friendly research assistant.
The user's words are being converted from speech to text using Javascript SpeechRecognition.
The speech recognition text may contain errors.
You optimize for poor quality speech detection.
Your responses are being converted from text to speech using Javascript SpeechSynthesis.
You optimize your responses for SpeechSynthesis.
You add a full stop at the end of each bullet point.
You use a friendly and casual female tone.
`;



// Replace newline characters with a space.
// This is important for ensuring that the csv file is created correctly.
// Every line in the csv file ends with a new line character. 
// If there are newline characters in the system message then this causes errors
// when creating and then later loading the csv file.
system_setup_message = system_setup_message.replace(/\n/g, " ");


// Append to message_list. This is the history of chat messages.
message_list = [{"role": "system", "content": system_setup_message}];			



// Option 2: The user loads a saved chat (csv file)
//--------------------------------------------------

// The previous chat history will be loaded from the csv file.
// The system_setup_mesaage that defines the bot's behaviour is included in the
// saved chat history.
// The message_list variable is assigned inside the loadChatHistoryFromCsv() function.
// The chat continues from where the chat in the csv file stopped.

const fileInput = document.getElementById("csv-file");

fileInput.addEventListener("change", function(event) {
	
  const file = event.target.files[0];
  
  loadChatHistoryFromCsv(file);
});




// OpenAI API - Javascript
//-------------------------
	
// Define a function to:

// 1. Make the api request,
// 2. Get the response
// 3. Process the response
// 4. Update the web page
// 5. Save the user's message and the response in
//    the message_list to enable context memory.

async function makeApiRequest(my_message, dataURL) {
	
		// Show the spinner while waiting for the response from openai
		create_spinner_div();

	
		// This scrolls the page up by cicking on a div at the bottom of the page.
		// This shows the user's message.
		// Note that if the click is simlated "on page load" then the cursor 
		// will not autofocus in the form input.
		simulateClick('scroll-page-up');
		
		//base64_image = dataURL;
		
		console.log('test')
		console.log(dataURL)
		

	  try {
		  
		// Append to message_list. This is the history of chat messages.
		//message_list.push({"role": "user", "content": my_message});
		
		
		message_list.push({"role": "user", "content": [
                {"type": "text", "text": my_message},
                {
                    "type": "image_url",
                    "image_url": dataURL,
                },
				]});
		
				
		/*	
		message_list.push({"role": "user", "content": [
                {"type": "text", "text": my_message},
                
				]});
		
		*/
		
	    const response = await fetch(openai_url, {
			
	      method: 'POST',
	      headers: {
			Authorization: `Bearer ${apiKey}`,
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify({
			 model: model_type,
	        messages: message_list,
	        max_tokens: max_tokens,
			temperature: temperature,
			presence_penalty: presence_penalty,
			frequency_penalty: frequency_penalty
	      })
	    })
		
		
		// The API can return:
		// 1- A dict containing the reponse message or
		// 2- A different dict containing the error message.
	    const data = await response.json();
		
		
		// Check if the response dict has a key called 'error'
		if ('error' in data) {
		  
		  // Get the error message and error code
		  var response_text = "Error: " + data['error']['code'] + "<br>" + data['error']['message'];
		  
		  console.log(response_text)
	
		  
		} else { // The response is a dict containing the message
			
			// Get the response text
			var response_text = data['choices'][0]['message']['content'];
			
			console.log(response_text)	
			
		}
			
		
		// Replace the suffixes with "":
		// This removes sentences like: How can I help you today?
		// For each suffix in the list...
		 suffixes_list.forEach(suffix => {
	      
			// Replace the suffix with nothing.
	        response_text = response_text.replace(suffix, "");
			
	  	});
		
		
		
		// *** Remove any html and then speak *** //
		////////////////////////////////////////////
		const cleaned_text = removeHtmlTags(response_text);
		speak(cleaned_text);
		
		
		
		
		// Format the response so it can be displayed on the web page.
		var paragraph_response = formatResponse(response_text);
			
		
		//console.log(response_text)
		
		
		// If the API returned an error message beacuse the token count was exceeded.
		// If the "error" key is in the dict that the api returned.
		if ('error' in data) {
			 // Do nothing, i.e. don't append the error message to 
			 // the message_list (chat history).
		
		} else {
			
			// Append to message_list. This is the history of chat messages.
			message_list.push({"role": "assistant", "content": paragraph_response});
			
		}
		
		
			
		
		var input_message = {
		  sender: bot_name,
	  		text: paragraph_response
		};
		
		// Delete the div containing the spinner
		delete_spinner_div();
		
		// Add the message from Maiya to the chat
		addMessageToChat(input_message);
		
		
		// Scroll the page up by cicking on a div at the bottom of the page.
		simulateClick('scroll-page-up');
		
		// Put the cursor in the form input field
		const inputField = document.getElementById("user-input");
		inputField.focus();
		
		
		
	  } catch (error) {
		  
		// Delete the div containing the spinner
		delete_spinner_div();
		  
	    console.log(error);
		
		// When this happens print an error message on the screen.
		// The user needs to send the same message again
		if (error.message == 'Failed to fetch') {
			
			var input_message = {
				  	sender: bot_name,
			  		text: 'Failed to fetch. Please send the message again.'
					};
	
		
			// Add the message from Maiya to the chat
			addMessageToChat(input_message);
		
			
		}
		
	  }
	   		
  
  }
  
  