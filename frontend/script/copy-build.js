const cpx = require('cpx')
const src = 'src'
const dest = 'dist'

cpx.copy(src + '/css/*.css', dest + '/css', {update:true})
cpx.copy(src + '/lib/*.js', dest + '/lib', {update:true})
cpx.copy(src + '/image/*.{jpg,png,bmp,jpeg}', dest + '/image', {update:true})
cpx.copy(src + '/manifest.json', dest, {update:true})
cpx.copy(src + '/serviceWorker.js', dest, {update:true})
cpx.copy(src + '/index.html', dest, {update:true})