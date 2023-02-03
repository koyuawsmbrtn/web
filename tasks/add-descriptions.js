var fs = require('fs');

let files = [];
fs.readdirSync('src/pages/').forEach(file => {
    if (file.endsWith('.md')) {
        files.push(file);
    }
});
fs.readdirSync('src/pages/notes/').forEach(file => {
    if (file.endsWith('.md')) {
        files.push("notes/"+file);
    }
});

files.forEach(file => {
    fs.readFile("src/pages/"+file, 'utf8', function (err, data) {
        let md = data.split("---")[2];
        description = md.split("\n")[2].replace("* ", "").replaceAll("#", "");
        if (description.startsWith("<")) {
            description = md.split("\n")[3].replace("* ", "").replaceAll("#", "");
        }
        if (description.length > 252 || !description.endsWith(".")) {
            description = description.substring(0,252)+"...";
        }
        if (!data.split("---")[1].includes("description: ")) {
            if (description !== "...") {
                let finalPage = "---"+data.split("---")[1]+"description: "+description+"\n---"+md;
                fs.writeFile("src/pages/"+file, finalPage, { encoding: 'utf8' }, ()=>{});
            }
        }
    });
});