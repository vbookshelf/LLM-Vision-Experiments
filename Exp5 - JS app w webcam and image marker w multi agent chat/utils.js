
// This function creates the three dot spinner.
// Calling this function starts the spinner.
function spinner() {
	
	// Select the element where the spinner will be displayed
	const spinnerElement = document.getElementById("spinner");
	
	// Define an array of dots
	const dots = ["", ".", "..", "..."];
	
	// Initialize the dot counter
	let dotIndex = 0;
	
	// Start the spinner animation
	setInterval(() => {
	  // Update the text content of the spinner element with the current dot
	  spinnerElement.textContent = `>${dots[dotIndex]}`;
	
	  // Increment the dot counter
	  dotIndex = (dotIndex + 1) % dots.length;
	}, 500);

}



// We create the div containing the spinner.
// We append the div to the chat.
// This displays the spinner.
function create_spinner_div() {
	
	// Create a new div element
	const spinnerElement = document.createElement("div");
	
	// Set the id attribute of the div element to "spinner"
	spinnerElement.setAttribute("id", "spinner");
	
	var chat = document.getElementById("chat");
  
	// Append the div to the chat
  	chat.appendChild(spinnerElement);
	
	// Start the spinner
	spinner();
}



// This function deletes the div containing the spinner.
// This causes the spinner to disappear.
function delete_spinner_div() {
	
	// Get the div element you want to delete
	const elementToDelete = document.getElementById("spinner");
	
	// Get the parent node of the div element
	const parentElement = elementToDelete.parentNode;
	
	// Remove the div element from its parent node
	parentElement.removeChild(elementToDelete);

}



// This functions takes a list of text (paragraphs).
// If the paragraph does not have p tags then it adds them.
function wrapInPTags(paragraphs) {
	
  let result = '';

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];

    if (paragraph.includes('<p>')) {
      result += paragraph;
    } else {
      result += '<p>' + paragraph + '</p>';
    }
  }

  return result;
}



// This function formats the text into paragraphs.
function formatResponse(response) {
	
    // Split the response into lines
    const lines = response.split("\n");

    // Combine the lines into paragraphs
    const paragraphs = [];
    let currentParagraph = "";

    for (const line of lines) {
        if (line.trim()) {  // Check if the line is non-empty
            currentParagraph += line.trim() + " ";
        } else if (currentParagraph) {  // Check if the current paragraph is non-empty
            paragraphs.push(currentParagraph.trim());
            currentParagraph = "";
        }
    }

    // Append the last paragraph
    if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
    }

	// Some text thats returned has \n character but no <p> tags.
	// Other text has <p> tags that we can use when displaying the text on the page.
	// Here we check each list item (paragraph). If it doesn't have <p> tags then add them.
	// This is also important when we save and then reload the chat history.
	//	If you change this make sure that the saving and reloading also works well.
	formattedResponse = wrapInPTags(paragraphs);
	
	
    // Add HTML tags to separate paragraphs
    //const formattedResponse = paragraphs.map(p => `<p>${p}</p>`).join("");
	
	return formattedResponse;
	
	
}



// Function to create a new message container
function createMessageContainer(message) {
	
  var messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");
  
  messageContainer.classList.add("w3-animate-opacity");
  

  var messageText = document.createElement("span"); //p
  
  
  // This if statement sets the coour of the name that gets displayed
  if (message.sender == bot_name) {
  
	  messageText.innerHTML = "<span class='set-color1'><b>&#x2022 " + message.sender + "</b></span>" + message.text;
  } else {
  	messageText.innerHTML = "<span class='set-color2'><b>&#x2022 " + message.sender + "</b></span>" + message.text;
	}

 
  messageContainer.appendChild(messageText);
  

  return messageContainer;
}


// Function to add a new message to the chat
function addMessageToChat(message) {
	
  var chat = document.getElementById("chat");
  var messageContainer = createMessageContainer(message);
  
  chat.appendChild(messageContainer);
  
}




// This functions saves the chat to a csv file.
// The system setup message, that defines the bot's behaviour, is part of the chat.
function saveChatHistoryToCsv() {
	
  const rows = [
    ['Role', 'Message']
  ];

  message_list.forEach((message) => {
    rows.push([message.role, message.content]);
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  
  // Save the config in the file name
  link.setAttribute("download", `temp${temperature}_prespen${presence_penalty}_freqpen${frequency_penalty}_${timestamp}.csv`);
  
  link.style.display = "none";

  // Attach the link to the DOM
  document.body.appendChild(link);

  // Trigger the download in the background
  link.click();

  // Remove the link from the DOM
  document.body.removeChild(link);
}


// This function reads the chat history from a csv file and
// displays the chat content on the page.
function writeCsvFileContentToPage(input_list) {
		
		let my_list = input_list;
		
	    for (let i = 0; i < my_list.length; i++) {
			
			
			// row 0 in the csv file is system message.
			// We don't want to display the system message on the page.
			if (i >= 1) {
				
				let chat_role;
				
				if (my_list[i].role === "assistant") {
					chat_role = bot_name;
				} else {
					chat_role = user_name;
					
				}
		  		
				let input_message = {
				  sender: chat_role,
			  		text: my_list[i].content
				}
				
				
				// Add the message from Maiya to the chat
				addMessageToChat(input_message);
				
				
				// Scroll the page up by cicking on a div at the bottom of the page.
				simulateClick('scroll-page-up');
				
				// Put the cursor in the form input field
				const inputField = document.getElementById("user-input");
				inputField.focus();
			
			}	
		}
	}



  
  
  // This function reads the chat history from the csv file 
  // where it has been saved.
  function loadChatHistoryFromCsv(file) {
	  
	  const reader = new FileReader();
	
	  reader.readAsText(file);
	
	  reader.onload = function(event) {
	    const csv = event.target.result;
		
	    const rows = csv.split("\n");
		
	    const messages = [];
	
	    rows.forEach(row => {
	      const cols = row.split(',');
	      const role = cols[0];
	      const content = cols.slice(1).join(',').replace(/^"(.*)"$/, '$1');
	      messages.push({ role, content });
	    });
	
	    // Set the message_list to the loaded messages
	    // The first item is the header row. Here we are slicing it out.
	    let chat_messages = messages.slice(1);
	
	    // Display the csv file chat history on the page
	    writeCsvFileContentToPage(chat_messages);
	
	    // Note: message_list is a global variable
	    // This line will change the value of the global variable.
	    message_list = chat_messages;
	  }
}

  

// Function to remove html tags from a string
function removeHtmlTags(str) {
	
  return str.replace(/(<([^>]+)>)/gi, "");
  
}


function wrapSentencesWithParagraphs(text) {
    // Use a regex to find all instances of text surrounded by asterisks or just regular text
    const sentences = text.match(/\*[^*]+\*|[^*]+/g);

    if (!sentences) return ""; // If no sentences found, return empty string

    // Wrap each sentence in paragraph tags, apply italic tags to sentences with asterisks
    const paragraphs = sentences.map(sentence => {
        // Check if the sentence is wrapped in asterisks
        if (sentence.startsWith('*') && sentence.endsWith('*')) {
            // Remove asterisks and wrap the sentence in italic tags within paragraph tags
            sentence = `<i>${sentence}</i>`;
        }
        return `<p>${sentence}</p>`;
    });

    // Join all paragraph-wrapped sentences into a single string
    return paragraphs.join("");
}





async function make_api_call(message_history_list) {
		

	  try {
		  
		
		    const response = await fetch(openai_url, {
				
		      method: 'POST',
		      headers: {
				Authorization: `Bearer ${apiKey}`,
		        'Content-Type': 'application/json'
		      },
		      body: JSON.stringify({
				 model: model_type,
		        messages: message_history_list,
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
			  
			  return "Error";
		
			  
			} else { // The response is a dict containing the message
				
				// Get the response text
				var response_text = data['choices'][0]['message']['content'];
				
				return response_text;
				
			}
				
		
		
	  } catch (error) {
			
			return "Error";
			
	  }
	   		
 }
  
 
 
 function scrollToBottom() {
  var chat = document.getElementById("chat");
  chat.scrollTop = chat.scrollHeight;
}


// Call this function right after adding a new message to the chat
// For demonstration purposes, you might call scrollToBottom() manually or within another function that appends messages

function scrollToLastMessage() {
  var chat = document.getElementById("chat");
  var messages = chat.children; // Assuming all children are message elements
  if (messages.length > 0) {
    var lastMessage = messages[messages.length - 1];
    // Calculate the position of the last message
    var lastMessageTop = lastMessage.offsetTop;
    chat.scrollTop = lastMessageTop - chat.offsetTop;
  }
}


/////////////////////



function initialize_master_chat_history() {
	
    let messageHistory = [];
    return messageHistory;
}


function initialize_agent_chat_history(agentSystemMessage) {
	
    let messageHistory = [
        {
            role: "system",
            content: agentSystemMessage
        }
    ];
    return messageHistory;
}


function initialize_the_state(agent1_system_message, agent2_system_message) {
	
    let master_chat_history = [];

    let agent1_chat_history = initialize_agent_chat_history(agent1_system_message);
    let agent2_chat_history = initialize_agent_chat_history(agent2_system_message);

    let state_dict = {
        master_chat_history: master_chat_history,
        agent1: { name: "Emma", agent_chat_history: agent1_chat_history },
        agent2: { name: "Liam", agent_chat_history: agent2_chat_history }
    };

    return state_dict;
}


function update_master_chat_history(sender, message) {
    
    var entry = {
        role: sender,
        content: message,
        timestamp: new Date().toISOString() // Using ISO string format for timestamp
    };

    entry = JSON.stringify(entry);
    state_dict.master_chat_history.push(entry);
}




async function run_agent(agent, sender, message) {
    // Format the content
    var content = {
        chat_history: state_dict.master_chat_history,
        message: message
    };
    content = JSON.stringify(content);

    // Add the message to the agent's chat history - OpenAI format
    var input_message = {
        role: "user",
        content: content
    };
    state_dict[agent].agent_chat_history.push(input_message);

    // Prompt the chat agent
    var response = await make_api_call(state_dict[agent].agent_chat_history);

    // Update the agent's chat history
    input_message = {
        role: "assistant",
        content: response
    };
    state_dict[agent].agent_chat_history.push(input_message);

    // Update the master chat history
    update_master_chat_history(agent, response);

    // Return the response
    return response;
}

/*

run_agent(agent, sender, message).then((response) => {
    console.log("Agent response:", response);
    
});

*/


function handle_response(response, suffixes_list, bot_name) {
	
    // Replace the suffixes with ""
    suffixes_list.forEach(suffix => {
        response = response.replace(suffix, "");
    });

    // Remove any HTML and then speak
    const cleaned_text = removeHtmlTags(response);
    // speak(cleaned_text);

    // Apply the function
    var paragraph_response = wrapSentencesWithParagraphs(response);

    // Append to message_list. This is the history of chat messages.
    // message_list.push({"role": "assistant", "content": cleaned_text});

    var input_message = {
        sender: bot_name,
        text: paragraph_response
    };

    // Delete the div containing the spinner
    //delete_spinner_div();

    // Add the message from Maiya to the chat
    addMessageToChat(input_message);

    // Scroll the page up by clicking on a div at the bottom of the page.
    // simulateClick('scroll-page-up');

    scrollToLastMessage();

    // Put the cursor in the form input field
    const inputField = document.getElementById("user-input");
    inputField.focus();
}



async function run_router_agent(text) {
	
    console.log("---ROUTER AGENT---");
	
	
	// Create the message history
	let message_history = [{"role": "system", "content": router_system_message}];
	message_history.push({"role": "user", "content": text});


    // Prompt the LLM and wait for the response
    const response = await make_api_call(message_history);

    // Parse the JSON response
    const json_response = JSON.parse(response);
    let name = json_response.directed_to;
    name = name.trim();

    console.log("Route to...");
    console.log("Name:", name);

    function extract_key_by_name(state_dict, name) {
        for (const [key, value] of Object.entries(state_dict)) {
            if (typeof value === 'object' && value.name === name) {
                return key;
            }
        }
        return null;
    }

    let agent_id;
    if (name !== "All") {
        agent_id = extract_key_by_name(state_dict, name);
        agent_id = agent_id ? agent_id.trim() : null;
    } else {
        agent_id = "all";
    }

    console.log("agent_id:", agent_id);

    return agent_id;
}




  


  
  