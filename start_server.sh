#!/bin/sh

old_web_server=$(sudo lsof -t -i:8080)
kill -9 $old_web_server

python3 -m http.server 8080 --directory ./public_html
