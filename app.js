const express = require('express');
const {port } = require('./src/config/config.js');
const {connectDB} = require('./src/config/db.js');
const routes = require('./src/routes/index.js')
const {errorHandler} =require('./src/middleware/errorHandler.js')


const app = express();
connectDB()
app.use(express.json());


app.use('healthcheck', (req, res) => {
    res.status(200).send('Server is running');
});

app.use('/api',routes)
app.use(errorHandler)

app.listen(port,()=>{
    console.log(`Server is listening on http://localhost:${port}`);
})


