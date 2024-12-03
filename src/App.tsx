// import { useState } from 'react'
import React from 'react';
import Sidebar from './components/sidebar';


const App: React.FC = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="p-4 flex-grow-1">
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-4">
          <span className="navbar-brand">Welcome to FieldBase</span>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
        </nav>
        <div className="container">
          <h3>Main Content </h3>
        </div>
      </div>
    </div>
  );
};

export default App;
