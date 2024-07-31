

// Config
//-------
// Chat parameters are explained here: https://platform.openai.com/docs/api-reference/chat

// GPT-3-5 specs: https://platform.openai.com/docs/models/gpt-3-5

// Your Groq API Key
const apiKey = "YOUR-API-KEY";


var bot_name = 'Agent'; // Give the bot a name
const user_name = 'Human';	// Set your chat name 


const model_type = "llama-3.1-70b-versatile";//"llama3-70b-8192"; //mixtral-8x7b-32768

//const model_type = "llama-3.1-405b-reasoning";

const openai_url = "https://api.groq.com/openai/v1/chat/completions"; 




// If this number plus the number of tokens in the message_history exceed
// the max value for the model (e.g. 4096) then the response from the api will
// an error dict instead of the normal message response. Thos error dict will
// contain an error message saying that the number of tokens for 
// this model has been exceeded.
const max_tokens = 300; //300

// 0 to 2. Higher values like 0.8 will make the output more random, 
// while lower values like 0.2 will make it more focused and deterministic.
// Alter this or top_p but not both.
const temperature = 0.25;

// -2 to 2. Higher values increase the model's likelihood to talk about new topics.
// Reasonable values for the penalty coefficients are around 0.1 to 1.
const presence_penalty = 0.5; 

// -2 to 2. Higher values decrease the model's likelihood to repeat the same line verbatim.
// Reasonable values for the penalty coefficients are around 0.1 to 1.
const frequency_penalty = 2;




// Remove these suffixes. I think removing them makes the chat sound more natural.
// They will sliced off the bot's responses.
// This is done below in the 'Remove suffixes' part of the code.
var suffixes_list = ['How can I help you?', 'How can I assist you today?', 'How can I help you today?', 'Is there anything else you would like to chat about?', 'Is there anything else I can assist you with today?', 'Is there anything I can help you with today?', 'Is there anything else you would like to chat about today?', 'Is there anything else I can assist you with?', '*winks*', '*wink*', '*bats eyelashes*', '*raises an eyebrow*', '*smirks*', '*winking*'];


// The message history is stored in this variable.
// Storing the message history allows the bot to have context memory.

var message_list;





// ---------------------------------
// Set up the agent system messages
// ---------------------------------

// System message
system_setup_message = "Your name is " + bot_name + ". You are a helpful assistant.";






const agent1_system_message = `
Your name is Emma.
You are taking part in a panel discusssion. The other members of the panel are:
User: The discussion moderator
Liam: A historian
The topic is: Are we living in a simulation?

You are a compassionate psychologist with a focus on mental health and well-being.
You are empathetic, supportive, patient, and warm in your communication.
Your responses should be comforting, insightful, and focused on providing mental health support. Keep your responses concise.
{
"name": "Emma",
"background": "A compassionate psychologist with a focus on mental health and well-being.",
"expertise": ["Psychology", "Mental Health", "Counseling"],
"personality_traits": ["Empathetic", "Supportive", "Patient", "Warm"],
"sample_dialogue": [
    "It's important to acknowledge your feelings and work through them.",
    "From a psychological standpoint, it's helpful to practice mindfulness."
]
}
`;



const agent2_system_message = `
Your name is Liam.
You are taking part in a panel discusssion. The other members of the panel are:
User: The discussion moderator
Emma: A psychologist
The topic is: Are we living in a simulation?

You are a witty historian with a passion for storytelling and historical context.
You are engaging, knowledgeable, and humorous in your communication.
Your responses should be insightful, entertaining, and focused on historical events and cultural studies. Keep your responses concise.
{
"name": "Liam",
"background": "A witty historian with a passion for storytelling and historical context.",
"expertise": ["History", "Cultural Studies", "Storytelling"],
"personality_traits": ["Witty", "Engaging", "Knowledgeable", "Humorous"],
"sample_dialogue": [
    "Did you know that in ancient Rome...",
    "History has a funny way of repeating itself, much like..."
]
}
`;



const router_system_message = `
# Context: A conversation between three people is in progress.
Their names are: User, Emma and Liam.

# Task: You will be given some text from their conversation that's
directed form one person to another, or from one person to all the others.
You need to output the name of the person to whom the text is directed.
Output your response as a JSON string. Output the name only.

# Example

Text: "Hi Emma. How are you?"
Your response:
{
"directed_to": "Emma"
}

Text: "Hi everybody!"
Your response:
{
"directed_to": "All"
}
`;




// ---------------------
// Initialize the state
// ---------------------

var state_dict = initialize_the_state(agent1_system_message, agent2_system_message);



// Append to message_list. This is the history of chat messages.
//message_list = [{"role": "system", "content": system_setup_message}];	





async function makeApiRequest(my_message) {
	
		// Show the spinner while waiting for the response from openai
		//create_spinner_div();

	
		// This scrolls the page up by cicking on a div at the bottom of the page.
		// This shows the user's message.
		// Note that if the click is simlated "on page load" then the cursor 
		// will not autofocus in the form input.
		simulateClick('scroll-page-up');
		
		
		
		
		var sender = 'user'
		//var agent = 'agent2'
		
		
		

	  try {
		  
		// Check which agent the user's message is directed to
		// Run the router agent.
		const agent = await run_router_agent(my_message);
		
		 // Update the master chat history
		 update_master_chat_history(sender, my_message);
		  
		  
		  
		// Run the agent that the user's message was directed to.
		// Run all agents if the user's message was directed to "all".
		if (agent != 'all') {
			
			bot_name = state_dict[agent].name;
		  
			// Run the selected agent
			run_agent(agent, sender, my_message).then((response_text) => {
				handle_response(response_text, suffixes_list, bot_name);
			});// End run_agent()
		
		} else {
			
			/*
			// In this code the functions will run concurrently
			
			// Run agent1
			run_agent("agent1", sender, my_message).then((response_text) => {
				handle_response(response_text, suffixes_list, bot_name);
			});
			
			// Run agent2
			run_agent("agent2", sender, my_message).then((response_text) => {
				handle_response(response_text, suffixes_list, bot_name);
			});
			*/
			
			
			// Function to create a delay
			function delay(ms) {
			    return new Promise(resolve => setTimeout(resolve, ms));
			}
			
			
			// Run agent1 and wait until it's done before running agent2
			run_agent("agent1", sender, my_message)
			    .then((response_text) => {
					bot_name = state_dict["agent1"].name;
			        handle_response(response_text, suffixes_list, bot_name);
			        // Add a delay before running agent2
			        return delay(1000); // Delay in milliseconds (e.g., 1000 ms = 1 second)
			    })
			    .then(() => {
			        // Run agent2 after the delay
			        return run_agent("agent2", sender, my_message);
			    })
			    .then((response_text) => {
					bot_name = state_dict["agent2"].name;
			        handle_response(response_text, suffixes_list, bot_name);
			    })
			    .catch((error) => {
			        console.error("Error occurred:", error);
			    });
	
		}
		
		
		
		
	  } catch (error) {
		  
		// Delete the div containing the spinner
		//delete_spinner_div();
		  
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
  
  