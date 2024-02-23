export default function buildText(msg: string) {
  const messageElement = document.createElement("div");
  messageElement.style.color = "#ffffff";
  messageElement.style.fontSize = "24px";
  messageElement.textContent = msg;
  return messageElement;
}
