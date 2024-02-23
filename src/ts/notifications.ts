if (!localStorage.getItem('notifications')) {
    Array.prototype.forEach.call(document.getElementById("ul_o").getElementsByTagName("li"), (e => {
        let text = e.innerText;
        let title = e.getElementsByTagName("a")[0].innerText;
        let date = e.getElementsByTagName("span")[0].innerText;
        let link = e.getElementsByTagName("a")[0].getAttribute("href");
        let notification = {
            title: title,
            text: text,
            date: date,
            link: link
        };
        let notifications = localStorage.getItem('notifications') ? JSON.parse(localStorage.getItem('notifications')) : [];
        notifications.push(notification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }));
}
if (window.location.pathname === "/") {
    if (localStorage.getItem('notifications')) {
        document.getElementById("nc").innerHTML = JSON.parse(localStorage.getItem('notifications')).length ? JSON.parse(localStorage.getItem('notifications')).length : "N";
    } else {
        document.getElementById("nc").innerHTML = "N";
    }
    if (JSON.parse(localStorage.getItem('notifications')).length == 0) {
        document.getElementById("nc").style.display = "none";
    } else {
        document.getElementById("nc").style.display = "block";
    }
    document.getElementById("nc").addEventListener("click", () => {
        document.getElementById("nc").style.display = "none";
        localStorage.setItem('notifications', JSON.stringify([]));
    });
    document.getElementById("nc").addEventListener("mouseover", () => {
        document.getElementById("nc").style.cursor = "pointer";
    });
} else {
    if (localStorage.getItem('notifications')) {
        let notifications = JSON.parse(localStorage.getItem('notifications'));
        notifications.forEach(e => {
            if (window.location.pathname === e.link) {
                notifications.splice(notifications.indexOf(e), 1);
                localStorage.setItem('notifications', JSON.stringify(notifications));
            }
        });
    }
}