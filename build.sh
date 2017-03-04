rm dist/*
cat src/player.module.js src/directives/*.js src/services/*.js > dist/streama-video-player.js
yuicompressor dist/streama-video-player.js -o dist/streama-video-player.min.js