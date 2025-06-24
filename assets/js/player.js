const playIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" /></svg>';
const pauseIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>';

function togglePlayPause() {
  const playPauseButton = document.getElementById("playpause");
  if (playPauseButton) {
    const audio = document.getElementById("audio");
    const mainDiv = document.querySelector("main > div");
    
    if (audio.paused) {
      audio.play();
      playPauseButton.innerHTML = pauseIcon;
      mainDiv.style.animationPlayState = "running";
    } else {
      audio.pause();
      playPauseButton.innerHTML = playIcon;
      mainDiv.style.animationPlayState = "paused";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const audio = document.getElementById("audio");
  if (!audio) return;

  const playPauseButton = document.getElementById("playpause");
  const mainDiv = document.querySelector("main > div");
  if (!playPauseButton || !mainDiv) return;

  if (audio.paused) {
    playPauseButton.innerHTML = playIcon;
    mainDiv.style.animationPlayState = "paused";
  } else {
    playPauseButton.innerHTML = pauseIcon;
    mainDiv.style.animationPlayState = "running";
  }
});