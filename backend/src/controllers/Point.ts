import { Request, Response } from 'express';
import knex from '../database/index';

class Point {
  async create(request: Request, response: Response) {
    const defaultImage =
      'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60';
    const {
      name,
      image = defaultImage,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const point = {
      image,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    if (!name || !email || !whatsapp || !latitude || !longitude || !city || !uf)
      return response.status(400).json({ error: 'Missing data' });

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
      return response.status(500).json(e);
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
