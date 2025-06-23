fetch("/parts/header.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("render-header").innerHTML = data;
  })
  .catch((error) => console.error("Error loading header:", error));

fetch("/parts/footer.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("render-footer").innerHTML = data;
  })
  .catch((error) => console.error("Error loading footer:", error));