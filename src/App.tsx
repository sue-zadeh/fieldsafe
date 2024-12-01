// import { useState } from 'react'
import Sidebar from './components/sidebar';


  const App: React.FC = () => {
    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 p-3">
                <h1>Welcome to FieldBase</h1>
                {/* Other content */}
            </div>
        </div>
    );
};

export default App;
