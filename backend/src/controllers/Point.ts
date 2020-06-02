import { Request, Response } from 'express';
import knex from '../database/index';

class Point {
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const point = {
      image: 'some_image',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    try {
      const trx = await knex.transaction();

      const [point_id] = await trx('points').insert(point);

      const pointsItems = items.map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

      await trx('points_items').insert(pointsItems);

      await trx.commit();

      return response.json({ id: point_id, ...point });
    } catch (e) {
      console.log(e);
    }
  }

  async list(request: Request, response: Response) {
    const { city, uf, items } = request.query;

    const arrItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('points_items', 'points.id', '=', 'points_items.point_id')
      .whereIn('points_items.item_id', arrItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return response.json(points);
  }

  async index(request: Request, response: Response) {
    const points = await knex('points').select('*');

    return response.json(points);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    const items = await knex('items')
      .join('points_items', 'items.id', '=', 'points_items.item_id')
      .where('points_items.point_id', id)
      .select('items.id', 'items.title');

    point.items = items;

    if (!point) return response.status(404).json({ error: 'Not found' });

    return response.json(point);
  }
}

export default new Point();
