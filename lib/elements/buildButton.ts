export default function buildButton(msg: string, { onClick }) {
  const buttonElement = document.createElement("button", {
    is: "tm-button",
  });
  buttonElement.textContent = msg;
  buttonElement.style.marginTop = "20px";
  buttonElement.style.fontSize = "20px";
  buttonElement.style.padding = "10px 20px";
  buttonElement.style.border = "none";
  buttonElement.style.borderRadius = "5px";
  buttonElement.style.cursor = "pointer";
  buttonElement.style.backgroundColor = "#202020";
  buttonElement.style.color = "#ffffff";
  buttonElement.onclick = onClick;

  return buttonElement;
}
