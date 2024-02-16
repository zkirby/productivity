import buildButton from "../../lib/elements/buildButton";
import buildOverlay from "../../lib/elements/buildOverlay";
import buildText from "../../lib/elements/buildText";
import isWeekend from "../../lib/isWeekend";

function run() {
  if (isWeekend()) return;

  const overlayElement = buildOverlay();
  const messageElement = buildText("Sorry friend... Get back to work.");

  const buttonElement = buildButton("Okay", {
    onClick: () => window.close(),
  });

  setTimeout(() => {
    overlayElement.appendChild(messageElement);
    overlayElement.appendChild(buttonElement);
    document.body.innerHTML = "";
    document.body.appendChild(overlayElement);
  }, 1000);
}

run();
