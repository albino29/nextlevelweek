import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home';
import CreatePoint from './pages/Point';

const src: React.FC = () => {
  return (
    <BrowserRouter>
      <Route path="/" exact component={Home} />
      <Route path="/point" component={CreatePoint} />
    </BrowserRouter>
  );
};

export default src;
