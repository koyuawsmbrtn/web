---
title: Having a good nginx config
layout: ../../layouts/page.astro
---

Put this into something like `/etc/nginx/sites-enabled/yoursite` and test the config with `sudo nginx -t`. If everything passed reload nginx with `sudo systemctl reload nginx`. You might have to request an SSL certificate through <a href="https://certbot.eff.org/instructions" target="_blank">Let's Encrypt</a> if you haven't already.

```
server {

    listen 443;

    index index.php index.html index.htm index.nginx-debian.html;

    server_name example.com;

    add_header Access-Control-Allow-Origin "*";

    # For static sites, use rewrite rules if you use
    # something like Astro for cleaner URLs.
    # root /var/www/html/;
    # rewrite ^([^\.]*[^\/])$ $1/ break;

    location / {
        # For static sites, comment block 
        # below to disable proxy.
        # try_files $uri $uri/ =404;
        client_max_body_size 200M;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://localhost:3000;
    }

    # PHP configuration
    # location ~ \.php$ {
    #     include snippets/fastcgi-php.conf;
    #     fastcgi_pass unix:/var/run/php/php-fpm.sock;
    # }

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;


    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # managed by Certbot
}

server {
    if ($host = $host) {
        return 301 https://$host$request_uri;
    }
    server_name $host;
    return 404;
}
```