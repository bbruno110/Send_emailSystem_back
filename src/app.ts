import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';

import dotenv from 'dotenv';
import routes from './router';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use( routes );
app.get('/', async (req:Request, res:Response) =>{
    res.send('pong')    
})

app.listen(3031);
export default app;