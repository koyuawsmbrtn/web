---
title: How to compile butt on Solus
author: koyu
type: post
date: 2020-07-23T02:51:43+00:00
url: /2020/07/23/how-to-compile-butt-on-solus/
featured_image: /wp-content/uploads/2020/11/saso-tusar-QtgGYlug6Cw-unsplash.jpg
categories:
  - Uncategorized

---
This is a small tutorial on how I got&nbsp;`butt`&nbsp;(broadcast using this tool) working on Solus.

First download the source code from here:&nbsp;<a href="https://danielnoethen.de/butt/" target="_blank" rel="noreferrer noopener">https://danielnoethen.de/butt/</a>  
and extract it. Now navigate to that folder with your terminal and issue the following commands in that folder.

Install compiler and dependencies:

<pre class="wp-block-code"><code>sudo eopkg install -c system.devel

sudo eopkg install libogg-devel libvorbis-devel lame-devel libflac-devel portaudio-devel libsamplerate-devel  fdk-aac-devel fltk-devel  opus-devel  libx11-devel bdwgc-dbginfo libpng-devel fontconfig-devel libxfixes-devel libxext-devel libxft-devel</code></pre>

Compile butt:

<pre class="wp-block-code"><code>./configure --prefix=/usr
make -j4
sudo make install</code></pre>

Now run the command butt from your terminal&nbsp;🎉<figure class="wp-block-image size-full is-resized">

<img loading="lazy" src="https://web.koyu.space/wp-content/uploads/2020/09/1595465454-290531-877d9f0c099bd7ad.png" alt="" class="wp-image-94" width="1653" height="991" srcset="https://web.koyu.space/wp-content/uploads/2020/09/1595465454-290531-877d9f0c099bd7ad.png 1653w, https://web.koyu.space/wp-content/uploads/2020/09/1595465454-290531-877d9f0c099bd7ad-300x180.png 300w, https://web.koyu.space/wp-content/uploads/2020/09/1595465454-290531-877d9f0c099bd7ad-1024x614.png 1024w, https://web.koyu.space/wp-content/uploads/2020/09/1595465454-290531-877d9f0c099bd7ad-768x460.png 768w, https://web.koyu.space/wp-content/uploads/2020/09/1595465454-290531-877d9f0c099bd7ad-1536x921.png 1536w, https://web.koyu.space/wp-content/uploads/2020/09/1595465454-290531-877d9f0c099bd7ad-1200x719.png 1200w" sizes="(max-width: 1653px) 100vw, 1653px" /> </figure>