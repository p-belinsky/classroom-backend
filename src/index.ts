import AgentApi from "apminsight";
AgentApi.config()

import express from 'express';
import classesRouter from "./routes/classes.js";
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";
import departmentsRouter from "./routes/departments.js";
import cors from 'cors';
import securityMiddleware from "./middleware/security.js";
import {auth} from "./lib/auth.js";
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
app.use('/api/users', usersRouter)
app.use('/api/classes', classesRouter)
app.use('/api/departments', departmentsRouter)

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Classroom API!' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
