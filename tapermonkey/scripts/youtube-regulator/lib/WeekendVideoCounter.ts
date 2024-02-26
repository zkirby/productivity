interface WeekendData {
  date: string;
  count: number;
}

/**
 * Adds a small floating details box that says what the count and date
 * is for the weekend video count. Only adds it if it's not already there.
 */
function init() {
  if (!document.getElementById("tm-weekend-video-counter")) {
    const weekendData = get();
    const detailsBox = document.createElement("div");
    detailsBox.id = "tm-weekend-video-counter";
    detailsBox.style.position = "fixed";
    detailsBox.style.bottom = "20px";
    detailsBox.style.right = "20px";
    detailsBox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    detailsBox.style.color = "white";
    detailsBox.style.padding = "10px";
    detailsBox.style.borderRadius = "5px";
    detailsBox.style.zIndex = "1000";
    detailsBox.textContent = `Weekend Video Count: ${
      weekendData.count
    } on ${new Date(weekendData.date).toLocaleDateString()}`;
    document.body.appendChild(detailsBox);
  }
}
function get(): WeekendData {
  let weekend = JSON.parse(localStorage.getItem("tm-yt-weekend") || "null");

  if (!weekend) {
    weekend = {
      date: new Date().toDateString(),
      count: 0,
    };
    localStorage.setItem("tm-yt-weekend", JSON.stringify(weekend));
  }

  if (weekend.date !== new Date().toDateString()) {
    weekend.date = new Date().toDateString();
    weekend.count = 0;
    localStorage.setItem("tm-yt-weekend", JSON.stringify(weekend));
  }
  return weekend;
}

function updateDetails() {
  const detailsBox = document.getElementById("tm-weekend-video-counter");
  if (detailsBox) {
    const weekendData = get();
    detailsBox.textContent = `Weekend Video Count: ${
      weekendData.count
    } on ${new Date(weekendData.date).toLocaleDateString()}`;
  }
}

export default {
  init,
  get,
  increment: () => {
    const weekend = get();
    weekend.count++;
    localStorage.setItem("tm-yt-weekend", JSON.stringify(weekend));
    updateDetails();
  },
};
