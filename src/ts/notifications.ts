if (!localStorage.getItem('notifications')) {
    localStorage.setItem('notifications', JSON.stringify([]));
}
if (window.location.pathname === "/") {
    let items = document.getElementById("ul_o").getElementsByTagName("li").length;
    let size = items - JSON.parse(localStorage.getItem('notifications')).length;
    if (localStorage.getItem('notifications')) {
        document.getElementById("nc").innerHTML = size;
    } else {
        document.getElementById("nc").innerHTML = "N";
    }
    if (size == 0) {
        document.getElementById("nc").style.display = "none";
    } else {
        document.getElementById("nc").style.display = "block";
    }
    document.getElementById("nc").addEventListener("click", () => {
        document.getElementById("nc").style.display = "none";
        let tmp = [];
        Array.prototype.forEach.call(document.getElementById("ul_o").getElementsByTagName("li"), (e => {
            let notification = e.getElementsByTagName("a")[0].getAttribute("href");
            tmp.push(notification);
        }));
        localStorage.setItem('notifications', JSON.stringify(tmp));
    });
    document.getElementById("nc").addEventListener("mouseover", () => {
        document.getElementById("nc").style.cursor = "pointer";
    });
} else {
    if (localStorage.getItem('notifications')) {
        let notifications = JSON.parse(localStorage.getItem('notifications'));
        let inNotification: boolean = false;
        notifications.forEach(e => {
            if (window.location.pathname === e) {
                inNotification = true;
            }
        });
        // Add current notification to the list
        let notification = window.location.pathname;
        notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }
}