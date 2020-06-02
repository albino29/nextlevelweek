import express from 'express';

import ItemsController from './controllers/Items';
import PointsController from './controllers/Point';

const routes = express.Router();

routes.get('/items', ItemsController.list);

routes.post('/points', PointsController.create);
routes.get('/points/all', PointsController.index);
routes.get('/points', PointsController.list);
routes.get('/points/:id', PointsController.show);

export default routes;
