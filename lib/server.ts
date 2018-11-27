import app from './app';
import * as http from 'http';
// import * as fs from 'fs';
require('dotenv').config();

const PORT = process.env.PORT;

/**
 * HTTPS SERVER
 */
// const httpsOptions = {
//     key: fs.readFileSync('./config/key.pem'),
//     cert: fs.readFileSync('./config/cert.pem')
// }
// https.createServer(httpsOptions, app).listen(PORT, () => {
//     console.log('Express server listening on port ' + PORT);
// })

/**
 * HTTP SERVER
 */
http.createServer(app).listen(PORT, () => {
    console.log('Express server listening on port ' + PORT);
})