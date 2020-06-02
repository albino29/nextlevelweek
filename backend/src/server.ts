import path from 'path';
import cors from 'cors';
import express from 'express';
import routes from './routes';

const app = express();

app.use(cors());

app.use(express.json());
app.use(routes);

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'tmp')));

app.listen(3333, (req, res) => {
  console.log('🚀 App running in port 3333 🚀');
});
