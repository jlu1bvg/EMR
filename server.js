import express from 'express';
import aggregationRoutes from './routes/aggregation.js';
import basicRoutes from './routes/basics.js';


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/aggregation', aggregationRoutes);
app.use('/api', basicRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});