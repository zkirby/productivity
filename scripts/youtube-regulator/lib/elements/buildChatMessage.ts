function createChatBubble(message, isSender) {
  const bubble = document.createElement("div");
  bubble.textContent = message;
  bubble.style.maxWidth = "60%";
  bubble.style.padding = "10px";
  bubble.style.borderRadius = "20px";
  bubble.style.marginBottom = "5px";
  if (isSender) {
    bubble.style.backgroundColor = "#DCF8C6";
    bubble.style.marginLeft = "auto";
  } else {
    bubble.style.backgroundColor = "#ECECEC";
  }
  return bubble;
}

export default function buildChatMessage(onSubmit) {
  // Create main chat container
  const chatContainer = document.createElement("div");
  chatContainer.style.display = "flex";
  chatContainer.style.flexDirection = "column";
  chatContainer.style.height = "400px"; // Adjust as needed
  chatContainer.style.width = "800px"; // Adjust as needed
  chatContainer.style.border = "1.5px solid #ccc";
  chatContainer.style.padding = "10px";

  // Create container for chat bubbles
  const bubblesContainer = document.createElement("div");
  bubblesContainer.style.overflowY = "scroll";
  bubblesContainer.style.flexGrow = "1";
  bubblesContainer.style.display = "flex";
  bubblesContainer.style.flexDirection = "column";
  bubblesContainer.style.gap = "10px";
  bubblesContainer.style.padding = "5px";

  // Create input container
  const inputContainer = document.createElement("div");
  inputContainer.style.display = "flex";
  inputContainer.style.gap = "10px";

  // Create text input
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.style.flexGrow = "1";

  // Create submit button
  const submitButton = document.createElement("button");
  submitButton.textContent = "Send";
  submitButton.onclick = () => {
    const message = textInput.value.trim();
    if (message) {
      // Assume sender
      const bubble = createChatBubble(message, true);
      bubblesContainer.appendChild(bubble);
      textInput.value = ""; // Clear input after sending
      bubblesContainer.scrollTop = bubblesContainer.scrollHeight; // Scroll to bottom
      onSubmit(message);
    }
  };

  // Append input and button to input container
  inputContainer.appendChild(textInput);
  inputContainer.appendChild(submitButton);

  // Append bubbles container and input container to main chat container
  chatContainer.appendChild(bubblesContainer);
  chatContainer.appendChild(inputContainer);

  return [
    chatContainer,
    (msg) => {
      const bubble = createChatBubble(msg, false);
      bubblesContainer.appendChild(bubble);
      bubblesContainer.scrollTop = bubblesContainer.scrollHeight; // Scroll to bottom
    },
  ] as const;
}
