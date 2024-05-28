#!/bin/sh
rm -rf main.zip
rm -rf dist
rm -rf gemini
rm -rf gemini-main
rm -rf gemtext2md
git clone https://github.com/mk270/gemtext2md
cd gemtext2md
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- --default-toolchain stable -y
. "$HOME/.cargo/env"
cargo build --release
cp target/release/gemtext2md ../buildfiles
wget -O main.zip https://github.com/koyuawsmbrtn/gemini/archive/refs/heads/main.zip
unzip main.zip
mv gemini-main gemini
for f in $(find gemini/ -name '*.gmi'); do
    y=${f%.*}
    ./buildfiles/gemtext2md < $f > $f.md
    sed -i -e 's/gmi/html/g' $f.md
    rm $f
    mv $f.md $y.md
    pandoc -f markdown $y.md -o $y.html
    rm $y.md
    mv $y.html $y.html.tmp
    cat buildfiles/head.html $y.html.tmp buildfiles/foot.html > $y.html
    rm $y.html.tmp
done
mv gemini dist
pandoc -f markdown buildfiles/404.md -o dist/404.html
mv dist/404.html dist/404.html.tmp
cat buildfiles/head.html dist/404.html.tmp buildfiles/foot.html > dist/404.html
rm dist/404.html.tmp
rm -rf dist/files
rm -rf dist/contact
rm -rf dist/README.md
cp -r buildfiles/css dist
cp -r buildfiles/js dist
cp buildfiles/navigation.json dist
cp buildfiles/favicon.ico dist