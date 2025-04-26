// links/LegalRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import PrivacyPolicy from './PrivacyPolicy';
import ShippingPolicy from './ShippingPolicy';
import ReturnPolicy from './ReturnPolicy';
import SalesAgreement from './SalesAgreement';

const LegalRoutes = () => (
    <Routes>
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="shipping-policy" element={<ShippingPolicy />} />
        <Route path="return-policy" element={<ReturnPolicy />} />
        <Route path="sales-agreement" element={<SalesAgreement />} />
    </Routes>
);

export default LegalRoutes;