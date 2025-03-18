import express from 'express';
import "dotenv/config";

const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, () => {    
    console.log(`Server is running on http://localhost:${port}`);
});

export { app };