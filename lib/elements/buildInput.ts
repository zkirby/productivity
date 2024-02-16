export default function buildInput() {
  const inputElement = document.createElement("input", { is: "tm-input" });
  inputElement.style.marginTop = "20px";
  inputElement.style.fontSize = "20px";
  inputElement.style.padding = "10px 20px";
  inputElement.style.borderRadius = "5px";
  inputElement.style.border = "none";
  inputElement.style.width = "60%";

  return inputElement;
}
