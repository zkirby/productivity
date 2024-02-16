export default function buildOverlay() {
  const overlayElement = document.createElement("div", {
    is: "tm-overlay",
  });
  overlayElement.style.position = "fixed";
  overlayElement.style.top = "0";
  overlayElement.style.left = "0";
  overlayElement.style.width = "100%";
  overlayElement.style.height = "100%";
  overlayElement.style.backgroundColor = "#0a0a0a";
  overlayElement.style.display = "flex";
  overlayElement.style.flexDirection = "column";
  overlayElement.style.justifyContent = "center";
  overlayElement.style.alignItems = "center";
  overlayElement.style.zIndex = "1000";

  return overlayElement;
}
