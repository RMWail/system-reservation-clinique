import { useLanguage } from '../../../../context/LanguageContext';
import { translations } from '../../../../translations/translations';
import './LoadingData.scss';

const LoadingData = () => {
    const { currentLanguage } = useLanguage();
    const t = translations[currentLanguage];

    return (
        <div className="LoadingDataContainer">
            <div className="loading-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
            </div>
            <p>{t.admin.errors.loadingData}</p>
        </div>
    );
};

export default LoadingData;
