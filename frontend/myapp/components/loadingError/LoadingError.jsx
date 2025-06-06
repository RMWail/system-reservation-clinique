import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations/translations';

import './LoadingError.scss';



const LoadingError = ()=>{
   
    const {currentLanguage} = useLanguage();

    const t = translations[currentLanguage];

    return (
        <div className="LoadingErrorContainer">
          <p>{t.errors.error}</p>
        </div>
      );
}


export default LoadingError;