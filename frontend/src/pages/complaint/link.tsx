import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ReactDOM from 'react-dom/client';

import ComplaintCreate from './complaintCreate';



ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/complaint/create" element={<ComplaintCreate />} />
    </Routes>
      
    
  </BrowserRouter>
);

import { Link } from 'react-router-dom';

function Nav() {
  return (
    <ul>
      <li><Link to="/complaint/create">ข้อร้องเรียน</Link></li>
    </ul>
  );
}
export default Nav;