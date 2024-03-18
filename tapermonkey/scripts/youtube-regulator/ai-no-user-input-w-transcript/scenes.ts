import buildButton from "../../../lib/elements/buildButton";
import buildContainer from "../../../lib/elements/buildContainer";
import buildInput from "../../../lib/elements/buildInput";
import buildOverlay from "../../../lib/elements/buildOverlay";
import buildText from "../../../lib/elements/buildText";

/**
 * Ask for the users OPEN_API_KEY to be able to engage with the AI.
 */
export async function buildAskForAPIKeyScene(next: (key: string) => void) {
  const API_KEY = localStorage.getItem("OPENAI_API_KEY");
  if (API_KEY) {
    next(API_KEY);
    return;
  }

  const overlayElement = buildOverlay();
  const containerElement = buildContainer();

  const messageElement = buildText("Please Enter Your OpenAI API Key");
  const inputElement = buildInput();

  const buttonElement = buildButton("Submit", {
    onClick: () => {
      const apiKey = inputElement.value.trim();
      if (apiKey) {
        // Save the API key and reload the page.
        localStorage.setItem("OPENAI_API_KEY", apiKey);
        next(apiKey);
      }
    },
  });

  containerElement.appendChild(inputElement);
  containerElement.appendChild(buttonElement);

  overlayElement.appendChild(messageElement);
  overlayElement.appendChild(containerElement);

  document.body.innerHTML = "";
  document.body.appendChild(overlayElement);
}

/**
 * Blackouts the screen when for when not visiting a direct video link
 */
export function buildBlackoutScene() {
  const overlayElement = buildOverlay();

  const messageElement = buildText("This Page Is Not Allowed");
  overlayElement.appendChild(messageElement);

  document.body.innerHTML = "";
  document.body.appendChild(overlayElement);
}

/**
 * A small indicator if the video is allowed or not (mostly for debugging purposes)
 */
export function buildIndicator(content: string) {
  let detailsBox = document.getElementById("tm-weekend-video-counter");
  if (!detailsBox) {
    detailsBox = document.createElement("div");
    detailsBox.id = "tm-weekend-video-counter";
    detailsBox.style.position = "fixed";
    detailsBox.style.bottom = "20px";
    detailsBox.style.right = "20px";
    detailsBox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    detailsBox.style.color = "white";
    detailsBox.style.padding = "10px";
    detailsBox.style.borderRadius = "5px";
    detailsBox.style.zIndex = "1000";
    document.body.appendChild(detailsBox);
  }
  detailsBox.textContent = content;
}
