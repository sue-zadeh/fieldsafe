import React from 'react';

const Sidebar: React.FC = () => {
    return (
        <div className="d-flex flex-column vh-100 bg-light" style={{ width: '250px' }}>
            <div className="p-3 border-bottom">
                <h4>FieldBase</h4>
            </div>
            <ul className="nav flex-column">
                <li className="nav-item">
                    <a href="#projects" className="nav-link text-dark">
                        Projects
                    </a>
                </li>
                <li className="nav-item">
                    <a href="#fieldnotes" className="nav-link text-dark">
                        Field Notes
                    </a>
                </li>
                <li className="nav-item">
                    <a href="#reports" className="nav-link text-dark">
                        Reports
                    </a>
                </li>
                <li className="nav-item">
                    <a href="#profile" className="nav-link text-dark">
                        Profile
                    </a>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
