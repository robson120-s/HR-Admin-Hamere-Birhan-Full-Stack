const express = require('express')
const app = require('./app')
const PORT = process.env.PORT || 5555;










app.listen(PORT, ()=>{
    console.log(`Server is Listening on port ${PORT}`)
})