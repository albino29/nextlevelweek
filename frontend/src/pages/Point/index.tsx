import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';

import './style.css';
import logo from '../../assets/logo.svg';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUF {
  sigla: string;
}

interface IBGECity {
  nome: string;
}

const Point: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });
  const [selectedPositionMap, setSelectedPositionMap] = useState<
    [number, number]
  >([0, 0]);
  const [initalPositionMap, setInitialPositionMap] = useState<[number, number]>(
    [0, 0],
  );

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      setInitialPositionMap([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      const { data } = await api.get('items');
      setItems(data);
    };
    loadItems();
  }, []);

  useEffect(() => {
    const loadUf = async () => {
      const { data } = await axios.get<IBGEUF[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
      );

      const ufInitials = data.map(uf => uf.sigla);
      setUfs(ufInitials);
    };
    loadUf();
  }, []);

  useEffect(() => {
    if (!selectedUf) return;
    const loadCity = async () => {
      const { data } = await axios.get<IBGECity[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`,
      );
      const cityNames = data.map(city => city.nome);
      setCities(cityNames);
    };
    loadCity();
  }, [selectedUf]);

  function handleSelectUf(e: ChangeEvent<HTMLSelectElement>) {
    const uf = e.target.value;
    setSelectedUf(uf);
  }

  function handleSelectCity(e: ChangeEvent<HTMLSelectElement>) {
    const city = e.target.value;
    setSelectedCity(city);
  }

  function handleMapClick(e: LeafletMouseEvent) {
    const { lat, lng } = e.latlng;
    setSelectedPositionMap([lat, lng]);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPositionMap;
    const items = selectedItems;
    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    };
    try {
      const { data: create } = await api.post('points', data);

      history.push('/');
    } catch (error) {
      alert(error.message);
    }
  }

  function handleSelecItem(id: number) {
    const selected = selectedItems.findIndex(item => item === id);

    if (selected >= 0) {
      const removedItem = selectedItems.filter(item => item !== id);
      setSelectedItems(removedItem);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="logo" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para a home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initalPositionMap} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPositionMap} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
              >
                <option value="0">Selecione uma uf</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
              <li
                key={item.id}
                onClick={() => handleSelecItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default Point;
