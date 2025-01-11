import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

import Home from './screens/Home';
import Frame from './screens/Setup/Frame';
import Background from './screens/Setup/Background';
import Layout from './screens/Setup/Layout';
import PaymentNumber from './screens/Payment/PaymentNumber';
import Payment from './screens/Payment/Payment';
import QR from './screens/Payment/QR';
import Promo from './screens/Payment/Promo';
import Cash from './screens/Payment/Cash';
import Result from './screens/Payment/Result';
import Photoshoot from './screens/Photoshoot/Photo';
import Choose from './screens/Photoshoot/Choose';
import Sticker from './screens/Makeup/Sticker';
import Print from './screens/Print';
/* import Landing from './screens/Landing'; */

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/frame" element={<Frame />} />
      <Route path="/background" element={<Background />} />
      <Route path="/layout" element={<Layout />} />
      <Route path="/payment-number" element={<PaymentNumber />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/payment-qpay" element={<QR method="qpay" />} />
      <Route path="/payment-vnpay" element={<QR method="vnpay" />} />
      <Route path="/payment-momo" element={<QR method="momo" />} />
      <Route path="/payment-zalopay" element={<QR method="zalopay" />} />
      <Route path="/payment-promo" element={<Promo />} />
      <Route path="/payment-cash" element={<Cash />} />
      <Route path="/payment-result" element={<Result />} />
      <Route path="/photo" element={<Photoshoot />} />
      <Route path="/photo-choose" element={<Choose />} />
      <Route path="/sticker" element={<Sticker />} />
      <Route path="/print" element={<Print />} />
      {/* <Route path="/landing" element={<Landing />} /> */}

      {/* default redirect to home page */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;