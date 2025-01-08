import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import i18n from '/src/translations/i18n';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import Footer from './components/ui/footer.tsx'

createRoot(document.getElementById('root')!).render(
  <I18nextProvider i18n={i18n}>
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-pink-50">
        <div className="flex-grow">
          <App />
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  </I18nextProvider>,
)
