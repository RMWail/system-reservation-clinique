import express from 'express';
import adminRouting from './routes/adminRouting.js';
import superAdminRouting from './routes/superAdminRouting.js';
import loginRouting from './routes/loginRouting.js'
import patientRouting from './routes/patientRouting.js';
import forgetAndResetPassRouting from './routes/forgetAndResetPass.js';
import accountVerificationRouting from './routes/accountVerification.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { workerData,isMainThread,Worker } from 'worker_threads';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Server as socketio } from 'socket.io';
import dotenv from 'dotenv';


// Path to the .ttf or .otf font file
  // This will output the Base64 string


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;
const app = express();
const API_CLIENT = process.env.API_CLIENT;

const server = http.createServer(app);

app.use(cors({
  origin: `${API_CLIENT}`,
  methods: ["GET","POST"]
}
));
 // app.use(morgan('short'))
app.use(bodyParser.json()); // for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({extended:true,parameterLimit:100000,limit:"500mb"}));

const expressServer = app.listen(port,()=>{
  console.log(`server is running on port ${port}`);
})


const io = new socketio(expressServer,{
  cors: {

    origin: `${API_CLIENT}`,
    methods: ["GET","POST"],
    credentials: true
  }
})

app.use((req,res,next)=>{
  req.io = io;
  next();
})



app.use('/',adminRouting); // The routing of the admin 
app.use('/',superAdminRouting);
app.use('/',loginRouting);  // The routing of login and sign up operations
app.use('/',patientRouting);  // The routing of the customer operations
app.use('/',forgetAndResetPassRouting); // The routing of forget and reset password for customer
app.use('/',accountVerificationRouting); // The routing of customer account otp code verification
/*
if(isMainThread){

  console.log(`Main Thread with pid = ${process.pid}`);
  new Worker(__filename,{
  //  workerData: [7,9,1,6,8]
  });

  new Worker(__filename, {
   // workerData: [2,1,3,0.5]
  })

}
else {

  console.log(`worker thread = ${process.pid}`);

}

app.get('/proc', (req, res) => {
  console.log(`Request received by process with PID: ${process.pid}`);

  // Simulate CPU-intensive task (blocking the event loop for a while)
  const start = Date.now();
  while (Date.now() - start < 4000) {
    // Busy wait (simulating heavy computation)
  }

  res.send(`I'm a worker process with PID: ${process.pid}`);
});
*/


io.on('connect',(socket)=>{

 // console.log(socket.id + 'has joined our server');


 // Join room event
 socket.on('joinRoom', (data) => {
 // console.log('cutomerUsername in join Room = '+data.cutomerUsername);
  socket.join(data.cutomerUsername);
  console.log(`Customer ${data.cutomerUsername} joined room ${data.cutomerUsername}`);
 // console.log(io.sockets.adapter.rooms); // Log the rooms
});



})