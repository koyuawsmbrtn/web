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

    // Transing the internet!
    const container = document.getElementById("buttons");
    const script1 = document.createElement("script");
    script1.src = "https://transring.neocities.org/ring.js";
    script1.type = "text/javascript";
    container.appendChild(script1);
  })
  .catch((error) => console.error("Error loading footer:", error));
