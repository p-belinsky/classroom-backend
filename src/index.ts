import AgentApi from "apminsight";
AgentApi.config()

import express from 'express';
import subjectsRouter from "./routes/subjects";
import cors from 'cors';
import securityMiddleware from "./middleware/security";
import {auth} from "./lib/auth";
import {toNodeHandler} from "better-auth/node";

const app = express();
const port = 8000;

const frontendUrl = process.env.FRONTEND_URL;
if(!frontendUrl) throw new Error(
  'FRONTEND_URL is not set in .env file'
)

app.use(cors({
  origin: frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

app.all("/api/auth/*splat", toNodeHandler(auth));


app.use(express.json());

app.use(securityMiddleware);

app.use('/api/subjects', subjectsRouter)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Classroom API!' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
