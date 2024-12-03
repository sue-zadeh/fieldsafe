import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <div className="d-flex flex-column bg-success text-white vh-100 p-3" style={{ width: '250px', backgroundColor: ''}}>
      {/* Branding */}
      <h2 className="text-center mb-4">FieldBase</h2>
      
      {/* Navigation Links */}
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-white active">
            <i className="bi bi-briefcase me-2"></i> Projects
          </a>
        </li>
        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-white">
            <i className="bi bi-journal-text me-2"></i> Field Notes
          </a>
        </li>
        <li className="nav-item mb-2">
          <a href="#" className="nav-link text-white">
            <i className="bi bi-bar-chart me-2"></i> Reports
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link text-white">
            <i className="bi bi-person me-2"></i> Profile
          </a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
