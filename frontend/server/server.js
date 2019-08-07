const express = require('express')
const app = express()
const port = 7070

app.use(express.static('dist'))

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log('server is listening ' + port)
})