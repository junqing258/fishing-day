#!/usr/bin/env bash

echo "开始打包..."
cd ./release
tar -czvf ./fishing.tar.gz ./bin/*

echo "\n开始上传..."
# a578219!
scp ./fishing.tar.gz www@47.57.124.61:~/gofishing/client/fishing.tar.gz
rm -rf ./fishing.tar.gz

ssh www@47.57.124.61 > /dev/null 2>&1 << eeooff
cd ~/gofishing/client/
rm -f bin/
tar -xzvf fishing.tar.gz
rm -f fishing.tar.gz
exit
eeooff
# npm install
# pm2 stop server.js
# pm2 start server.js
echo "Done!"
