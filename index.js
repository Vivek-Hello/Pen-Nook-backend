import express from 'express';

import dotevn from 'dotenv';
import { connectDB } from './DB/db.js';
import cookieParser from 'cookie-parser';
import authRout from './routes/Auth.router.js';
import cors from 'cors'
import blogRouter from './routes/Blog.router.js';

dotevn.config();
const app =  express();


const port = process.env.PORT || 8080;



app.use(express.json())
app.use(express.urlencoded({ extended: true }));




// Handle preflight requests
// In your Express server configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser());

app.use('/api/auth',authRout)
app.use('/api/blog',blogRouter)




app.listen(port,()=>{

  console.log(`Server is running at http://localhost:${port}`);
    connectDB();

})