import React, { useState, useEffect, useCallback } from 'react';

// --- Ícones SVG Internos ---
const Icon = ({ children, size = 20, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}>
    {children}
  </svg>
);

const MoonIcon = (props) => <Icon {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></Icon>;
const EyeIcon = (props) => <Icon {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></Icon>;
const EyeOffIcon = (props) => <Icon {...props}><path d="M9.88 9.88L2 12s3-7 10-7a11.6 11.6 0 0 1 5.19 1.24" /><path d="M10.73 15.08A3 3 0 0 1 9.25 13.5" /><path d="M12.92 7.92L22 12s-3 7-10 7a11.6 11.6 0 0 1-5.19-1.24" /><path d="M14.75 14.75a3 3 0 0 1-4.5-4.5" /><line x1="2" x2="22" y1="2" y2="22" /></Icon>;
const MapPinIcon = (props) => <Icon {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Icon>;
const RefreshIcon = (props) => <Icon {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></Icon>;
const CalendarIcon = (props) => <Icon {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></Icon>;
const TrophyIcon = (props) => <Icon {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></Icon>;
const ChevronRightIcon = (props) => <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>;
const CheckIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></Icon>;
const XIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></Icon>;
const BellIcon = (props) => <Icon {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></Icon>;
const SearchIcon = (props) => <Icon {...props}><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /></Icon>;
const CompassIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></Icon>;

// --- MOTOR ASTRONÔMICO (Portado do SunCalc) ---
const PI = Math.PI, sin = Math.sin, cos = Math.cos, tan = Math.tan, asin = Math.asin, atan = Math.atan2, acos = Math.acos, rad = PI / 180;
const e = rad * 23.4397; 

function toAzimuth(H, phi, dec) { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
function toAltitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }
function siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }
function toDays(date) { return (date.valueOf() / 86400000.0) - 10957.5; }

function getMoonCoords(d) { 
    const L = rad * (218.316 + 13.176396 * d), M = rad * (134.963 + 13.064993 * d), F = rad * (93.272 + 13.229350 * d);
    const l  = L + rad * 6.289 * sin(M), b  = rad * 5.128 * sin(F), dt = 385001 - 20905 * cos(M);
    return { ra: atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)), dec: asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)), dist: dt };
}

const getMoonPosition = (date, lat, lng) => {
    const lw = rad * -lng, phi = rad * lat, d = toDays(date);
    const c = getMoonCoords(d), H = siderealTime(d, lw) - c.ra;
    let h = toAltitude(H, phi, c.dec);
    const pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));
    h = h - rad * 0.017 / tan(h); 
    const alt = h * 180 / PI;
    const az = (toAzimuth(H, phi, c.dec) * 180 / PI + 180) % 360;
    return { altitude: alt, azimuth: az };
};

const getMoonIllumination = (date) => {
    const d = toDays(date);
    const s = { w: rad * (280.460 + 0.9856474 * d), M: rad * (357.528 + 0.9856003 * d) }; 
    const m = getMoonCoords(d);
    const phi = acos(sin(m.dec) * sin(0) + cos(m.dec) * cos(0) * cos(m.ra - (s.w + 1.915 * rad * sin(s.M))));
    const inc = atan(385001 * sin(phi), 385001 * cos(phi) - 149598000);
    const angle = atan(cos(s.w + 1.915 * rad * sin(s.M)) * sin(m.dec) - sin(s.w + 1.915 * rad * sin(s.M)) * cos(m.dec) * cos(m.ra - s.w), sin(m.ra - s.w) * cos(m.dec));
    
    // Cálculo do ciclo de fase (0 a 1)
    // 0 = Nova, 0.25 = Quarto Crescente, 0.5 = Cheia, 0.75 = Quarto Minguante
    let phase = 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI;
    if (phase < 0) phase += 1; // Normalizar para 0-1
    
    return { fraction: (1 + cos(inc)) / 2, phase: phase };
};

const getPhaseName = (phase) => {
    // Fases baseadas no ciclo 0.0 - 1.0
    if (phase <= 0.03 || phase >= 0.97) return "Nova";
    if (phase < 0.22) return "Crescente";
    if (phase < 0.28) return "Quarto Crescente";
    if (phase < 0.47) return "Gibosa Crescente";
    if (phase < 0.53) return "Cheia";
    if (phase < 0.72) return "Gibosa Minguante";
    if (phase < 0.78) return "Quarto Minguante";
    return "Minguante"; // Waning Crescent (0.78 - 0.97)
};

const getCardinalDirection = (azimuth) => {
    if (azimuth >= 337.5 || azimuth < 22.5) return "Norte";
    if (azimuth >= 22.5 && azimuth < 67.5) return "Nordeste";
    if (azimuth >= 67.5 && azimuth < 112.5) return "Leste";
    if (azimuth >= 112.5 && azimuth < 157.5) return "Sudeste";
    if (azimuth >= 157.5 && azimuth < 202.5) return "Sul";
    if (azimuth >= 202.5 && azimuth < 247.5) return "Sudoeste";
    if (azimuth >= 247.5 && azimuth < 292.5) return "Oeste";
    if (azimuth >= 292.5 && azimuth < 337.5) return "Noroeste";
    return "";
};

const predictNextWindow = (lat, lon) => {
    try {
        let testDate = new Date();
        let windowStart = null;
        for (let i = 0; i < 960; i++) {
            testDate.setMinutes(testDate.getMinutes() + 15);
            const pos = getMoonPosition(testDate, lat, lon);
            const illum = getMoonIllumination(testDate);
            const hour = testDate.getHours();
            
            // Regra mais tolerante para fase minguante (visível de manhã)
            const isVisiblePotential = pos.altitude > 2 && illum.fraction > 0.01 && hour >= 6 && hour <= 20;

            if (!windowStart && isVisiblePotential) {
                windowStart = new Date(testDate);
            } else if (windowStart && !isVisiblePotential) {
                const formatDate = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const formatTime = (d) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return `entre ${formatTime(windowStart)} e ${formatTime(testDate)} de ${formatDate(windowStart)}`;
            }
        }
    } catch (e) { return "Erro no cálculo"; }
    return "Sem visibilidade nos próx. 10 dias";
};

// --- Dados do Quiz ---
const QUIZ_CARDS = [
  { q: "Qual foi a data do primeiro pouso humano na Lua?", options: ["20 de Julho de 1969", "12 de Abril de 1961", "14 de Dezembro de 1972"], correct: 0, explanation: "A missão Apollo 11 pousou em 1969." },
  { q: "Quem foi a primeira pessoa a caminhar na Lua?", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin"], correct: 1, explanation: "Armstrong deu o primeiro passo; Aldrin foi o segundo." },
  { q: "Qual o primeiro país a enviar humanos para orbitar a Lua?", options: ["União Soviética", "China", "Estados Unidos"], correct: 2, explanation: "A Apollo 8 (EUA) foi a primeira missão tripulada a orbitar a Lua." },
  { q: "Quando ocorreu o último pouso humano na Lua?", options: ["1969", "1972", "1984"], correct: 1, explanation: "A Apollo 17 encerrou o programa em dezembro de 1972." },
  { q: "Quais foram os primeiros seres vivos a orbitar a Lua?", options: ["Cadelas russas", "Tartarugas", "Macacos americanos"], correct: 1, explanation: "Tartarugas russas na nave Zond 5 orbitaram a Lua em 1968." }
];

const App = () => {
  const [cityData, setCityData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState({ visible: false, reason: "Iniciando...", phase: "", direction: "" });
  const [nextVisibility, setNextVisibility] = useState("Calculando...");
  const [visitCount, setVisitCount] = useState(1);
  const [notifPermission, setNotifPermission] = useState('default');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  const [cardIndex, setCardIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      html, body { background-color: #020617 !important; margin: 0; padding: 0; font-family: -apple-system, system-ui, sans-serif; color: white; -webkit-tap-highlight-color: transparent; height: 100%; width: 100%; overflow-x: hidden; }
      .app-wrapper { background-color: #020617; min-height: 100vh; width: 100%; display: flex; flex-direction: column; align-items: center; }
      .app-container { width: 100%; max-width: 450px; padding: 20px; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; }
      .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 28px; padding: 24px; box-sizing: border-box; position: relative; overflow: hidden; }
      .card-visible { background-color: rgba(37, 99, 235, 0.15); border-color: #3b82f6; box-shadow: 0 10px 40px -10px rgba(59, 130, 246, 0.4); }
      .flex-center { display: flex; align-items: center; gap: 16px; }
      .icon-box { padding: 16px; border-radius: 100px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
      .icon-blue { background-color: #3b82f6; color: white; }
      .icon-slate { background-color: #1e293b; color: #64748b; }
      .header { display: flex; justify-content: center; align-items: center; padding: 10px 0; width: 100%; margin-bottom: 8px; position: relative; }
      .btn-round { padding: 14px; background-color: #1e293b; border-radius: 100px; border: none; color: #f1f5f9; cursor: pointer; display: flex; touch-action: manipulation; }
      .btn-round:active { background-color: #334155; transform: scale(0.95); }
      .input-city { width: 100%; background: #1e293b; border: 2px solid #334155; border-radius: 16px; padding: 16px; color: white; font-size: 16px; font-weight: 600; outline: none; box-sizing: border-box; }
      .search-item { background: #1e293b; padding: 16px; border-radius: 16px; margin-top: 8px; cursor: pointer; border: 1px solid #334155; }
      .quiz-option { width: 100%; padding: 18px; border-radius: 18px; border: 1px solid #1e293b; background-color: #1e293b; color: #e2e8f0; text-align: left; cursor: pointer; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 700; }
      .quiz-correct { background-color: rgba(34, 197, 94, 0.25) !important; border-color: #22c55e !important; color: #bbf7d0 !important; }
      .quiz-wrong { background-color: rgba(239, 68, 68, 0.25) !important; border-color: #ef4444 !important; color: #fecaca !important; }
      .text-label { font-size: 11px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 6px; }
      .text-title { font-size: 20px; font-weight: 800; margin: 0; line-height: 1.2; color: white; }
      .footer { text-align: center; color: #475569; padding: 30px 0; font-size: 10px; text-transform: uppercase; font-weight: 800; width: 100%; }
      .spinning { animation: spin 1.2s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);

    setIsStandalone(window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches);
    const savedCity = localStorage.getItem('luarvis_city');
    if (savedCity) setCityData(JSON.parse(savedCity));
    if ("Notification" in window) setNotifPermission(Notification.permission);
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchInput.length >= 3) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchInput)}&count=5&language=pt&format=json`);
          const data = await res.json();
          setSearchResults(data.results || []);
        } catch (e) { console.error(e); } finally { setIsSearching(false); }
      } else { setSearchResults([]); }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const selectCity = (city) => {
    const data = { name: city.name, admin: city.admin1 || city.country, lat: city.latitude, lon: city.longitude };
    localStorage.setItem('luarvis_city', JSON.stringify(data));
    setCityData(data);
    setSearchResults([]);
    setSearchInput("");
  };

  const checkVisibility = useCallback(async () => {
    if (!cityData) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${cityData.lat}&longitude=${cityData.lon}&current=cloud_cover&timezone=auto`);
      const data = await res.json();
      const now = new Date();
      
      const pos = getMoonPosition(now, cityData.lat, cityData.lon);
      const illum = getMoonIllumination(now);
      const hour = now.getHours();
      
      const isInSky = pos.altitude > 0.8;
      const isVisibleTime = hour >= 6 && hour <= 20;
      const isClearEnough = data.current.cloud_cover < 65;
      const isVisiblePhase = illum.fraction > 0.01; // Mais de 1% de iluminação
      
      const isVisible = isInSky && isVisibleTime && isClearEnough && isVisiblePhase;
      
      let reason = "Céu limpo e visível";
      if (!isInSky) reason = "Lua abaixo do horizonte";
      else if (!isVisibleTime) reason = "Fora do horário (06h-20h)";
      else if (!isVisiblePhase) reason = "No céu, mas invisível (Lua Nova)";
      else if (!isClearEnough) reason = `Céu muito nublado (${data.current.cloud_cover}%)`;

      // Uso do PHASE (Ciclo 0-1) para determinar o nome
      const phaseName = getPhaseName(illum.phase);

      setLastCheck({ 
        visible: isVisible, 
        reason, 
        phase: phaseName, 
        direction: getCardinalDirection(pos.azimuth) 
      });
      setNextVisibility(predictNextWindow(cityData.lat, cityData.lon));
    } catch (e) { setNextVisibility("Erro na conexão"); } finally { setIsRefreshing(false); }
  }, [cityData]);

  useEffect(() => { if (cityData) checkVisibility(); }, [cityData, checkVisibility]);

  const requestNotificationPermission = async () => {
    if (!isStandalone) {
      alert("⚠️ No iPhone, salve o app na 'Tela de Início' para ativar as notificações.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission);
    if (permission === 'granted') alert("Notificações ativadas! 🌙");
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#020617' }}>
      <MoonIcon className="spinning" style={{ color: '#3b82f6', marginBottom: '20px' }} size={64} />
    </div>
  );

  const AppHeader = () => (
    <header className="header">
      <div className="flex-center" style={{ gap: '12px' }}>
        <MoonIcon style={{ color: '#3b82f6' }} size={34} />
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-0.06em', color: 'white' }}>LuarVis</h1>
      </div>
      {cityData && notifPermission !== 'granted' && (
        <div style={{ position: 'absolute', right: 0 }}>
            <button onClick={requestNotificationPermission} className="btn-round" title="Notificações">
            <BellIcon size={22} />
            </button>
        </div>
      )}
    </header>
  );

  if (!cityData) return (
    <div className="app-wrapper">
      <div className="app-container">
        <AppHeader />
        <div style={{ marginTop: '40px', marginBottom: '24px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '600', margin: 0 }}>Em qual cidade você está?</p>
        </div>
        <div style={{ position: 'relative' }}>
          <input type="text" className="input-city" placeholder="Comece a digitar..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} autoFocus />
          {isSearching && (
            <div style={{ position: 'absolute', right: '16px', top: '16px' }}>
              <RefreshIcon size={20} className="spinning" style={{ color: '#3b82f6' }} />
            </div>
          )}
        </div>
        <div style={{ marginTop: '16px' }}>
          {searchResults.map((city, idx) => (
            <div key={idx} className="search-item" onClick={() => selectCity(city)}>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '16px', color: 'white' }}>{city.name}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{city.admin1}, {city.country}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const showQuiz = !lastCheck.visible || visitCount >= 2;

  return (
    <div className="app-wrapper">
      <div className="app-container">
        <AppHeader />

        <section className={`card ${lastCheck.visible ? 'card-visible' : ''}`}>
          <div className="flex-center">
            <div className={`icon-box ${lastCheck.visible ? 'icon-blue' : 'icon-slate'}`}>
              {lastCheck.visible ? <EyeIcon size={38} /> : <EyeOffIcon size={38} />}
            </div>
            <div style={{ flex: 1 }}>
              <p className="text-label">Consigo ver a lua agora?</p>
              <h2 className="text-title">
                {lastCheck.visible ? 'Sim! A lua deve estar visível.' : 'Não, lua escondida :('}
              </h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>{lastCheck.reason}</span>
                <span style={{ fontSize: '11px', background: '#1e293b', color: '#3b82f6', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>
                  Fase: {lastCheck.phase}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="flex-center" style={{ gap: '10px', marginBottom: '16px' }}>
              <CalendarIcon style={{ color: '#3b82f6' }} size={20} />
              <h3 className="text-label" style={{ margin: 0 }}>Próxima Visibilidade</h3>
            </div>
            <p style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: 'white', lineHeight: '1.4' }}>{nextVisibility}</p>
          </div>
          <MoonIcon style={{ position: 'absolute', right: '-35px', bottom: '-35px', opacity: 0.05, color: 'white' }} size={160} />
        </section>

        {showQuiz && (
          <section className="card" style={{ padding: 0 }}>
            <div style={{ backgroundColor: 'rgba(30,41,59,0.5)', padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrophyIcon style={{ color: '#eab308' }} size={20} />
              <span className="text-label" style={{ margin: 0, color: '#cbd5e1' }}>Teste seus conhecimentos</span>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '18px', fontWeight: '800', textAlign: 'center', marginBottom: '28px', lineHeight: '1.4', color: 'white' }}>{QUIZ_CARDS[cardIndex].q}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {QUIZ_CARDS[cardIndex].options.map((opt, i) => {
                  let statusClass = answered ? (i === QUIZ_CARDS[cardIndex].correct ? "quiz-correct" : (i === selectedOption ? "quiz-wrong" : "")) : "";
                  return (
                    <button key={i} onClick={() => !answered && (setSelectedOption(i), setAnswered(true))} className={`quiz-option ${statusClass}`} style={answered && i !== selectedOption && i !== QUIZ_CARDS[cardIndex].correct ? {opacity: 0.3} : {}}>
                      <span style={{ color: 'white' }}>{opt}</span>
                      {answered && i === QUIZ_CARDS[cardIndex].correct && <CheckIcon size={18} />}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div className="feedback-box">
                  <p className="text-label" style={{ color: '#3b82f6' }}>Explicação:</p>
                  <p style={{ fontSize: '15px', margin: 0, color: '#cbd5e1', lineHeight: '1.6' }}>{QUIZ_CARDS[cardIndex].explanation}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '22px' }}>
                    <button onClick={() => { setAnswered(false); setSelectedOption(null); setCardIndex((prev) => (prev + 1) % QUIZ_CARDS.length); }} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '100px', fontWeight: '900', fontSize: '12px', cursor: 'pointer' }}>Próxima</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <footer 
          className="footer" 
          onClick={() => { setCityData(null); localStorage.removeItem('luarvis_city'); }}
          style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <MapPinIcon size={14} style={{ color: '#475569' }} />
            <span style={{ color: '#475569' }}>{cityData.name} • Toque para mudar</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
