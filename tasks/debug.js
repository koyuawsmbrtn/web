var exec = require('child_process').exec;
const fs = require('fs');
const request = require('request');

const removeSub = (s) => {
	let d = undefined;
	let p = s.split(".");
	if (p.length == 3) {
	  d = `${p[1]}.${p[2]}`;
	}
	if (d == undefined) {
	  d = s;
	}
	return d;
}

const download = (url, dest, cb) => {
	const file = fs.createWriteStream(dest);
	request(url).pipe(file).on('close', cb);
};

fs.readFile("src/json/instances.json", 'utf8', (err, data) => {
	if (err) {
		console.log(err);
		return;
	}
	const instances = JSON.parse(data);
	instances.forEach(instance => {
		var logo = instance.logo;
		if (logo.startsWith("http://") || logo.startsWith("https://")) {
			var extension = logo.split("/")[logo.split("/").length - 1].split(".")[1] == undefined || logo.split("/")[logo.split("/").length - 1].split(".")[1].startsWith("com") ? "png" : logo.split("/")[logo.split("/").length - 1].split(".")[1];
			download(logo, `public/fedilist/${removeSub(instance.instance).replace(".", "")}.${extension}`, () => {
				console.log(`Successfully downloaded logo for ${instance.instance}`);
			});
		}
	});
});

exec("yarn dev");
console.log("Listening...")