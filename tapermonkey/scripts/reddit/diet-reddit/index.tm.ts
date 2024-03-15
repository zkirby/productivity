function run() {
  // Remove everything but the subscription feed.
  // Remove search
  document.querySelector(".reddit-search-bar")?.remove();

  // Remove left sidebar
  document.querySelector("#left-sidebar")?.remove();

  // Remove right sidebar
  document.querySelector("#right-sidebar-container")?.remove();
}

run();
document.addEventListener("DOMContentLoaded", run);
document.addEventListener("load", run);
