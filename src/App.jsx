import React, { useState, useEffect, useCallback } from 'react';

// --- Ícones SVG Internos (Consolidados para máxima compatibilidade) ---
const Icon = ({ children, size = 20, style = {} }) => (
<svg
width={size}
height={size}
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2.5"
strokeLinecap="round"
strokeLinejoin="round"
style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
>
{children}
</svg>
);

const MoonIcon = (props) => <Icon {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></Icon>;
const EyeIcon = (props) => <Icon {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></Icon>;
const EyeOffIcon = (props) => <Icon {...props}><path d="M9.88 9.88L2 12s3-7 10-7a11.6 11.6 0 0 1 5.19 1.24" /><path d="M10.73 15.08A3 3 0 0 1 9.25 13.5" /><path d="M12.92 7.92L22 12s-3 7-10 7a11.6 11.6 0 0 1-5.19-1.24" /><path d="M14.75 14.75a3 3 0 0 1-4.5-4.5" /><line x1="2" x2="22" y1="2" y2="22" /></Icon>;
const MapPinIcon = (props) => <Icon {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></Icon>;
const RefreshIcon = (props) => <Icon {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></Icon>;
const CalendarIcon = (props) => <Icon {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></Icon>;
const ClockIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon>;
const AlertIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></Icon>;
const TrophyIcon = (props) => <Icon {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></Icon>;
const ChevronRightIcon = (props) => <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>;
const CheckIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></Icon>;
const XIcon = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></Icon>;
const BellIcon = (props) => <Icon {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></Icon>;

// --- Lógica Astronômica ---
const getMoonPosition = (date, lat, lon) => {
const lw = -lon * (Math.PI / 180);
const phi = lat * (Math.PI / 180);
const d = (date.getTime() / 86400000) - (new Date('2000-01-01T12:00:00Z').getTime() / 86400000) + 2451545.0;
const L = (218.316 + 13.176396 * d) * (Math.PI / 180);
const M = (134.963 + 13.064993 * d) * (Math.PI / 180);
const l = L + 6.289 * Math.sin(M) * (Math.PI / 180);
const siderealTime = (280.46061837 + 360.98564736629 * d + lon) * (Math.PI / 180);
const ra = Math.atan2(Math.sin(l) * Math.cos(23.439 * Math.PI / 180), Math.cos(l));
const dec = Math.asin(Math.sin(l) * Math.sin(23.439 * Math.PI / 180));
const H = siderealTime - ra;
const h = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
return { altitude: h * (180 / Math.PI) };
};

const predictNextWindow = (lat, lon, isCurrentlyVisible) => {
let testDate = new Date();
if (isCurrentlyVisible) { testDate.setHours(testDate.getHours() + 1); }
let windowStart = null;
for (let i = 0; i < 240; i++) {
const pos = getMoonPosition(testDate, lat, lon);
const hour = testDate.getHours();
const isVisiblePotential = pos.altitude > 0 && hour >= 6 && hour <= 20;
if (!windowStart && isVisiblePotential) { windowStart = new Date(testDate); }
else if (windowStart && !isVisiblePotential) {
const formatDate = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const formatTime = (d) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
return `entre ${formatTime(windowStart)} e ${formatTime(testDate)} do dia ${formatDate(windowStart)}`;
}
testDate.setHours(testDate.getHours() + 1);
}
return "Não identificada nos próximos 10 dias";
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
const [location, setLocation] = useState(null);
const [loading, setLoading] = useState(true);
const [locationError, setLocationError] = useState(false);
const [lastCheck, setLastCheck] = useState({ visible: false, reason: "Aguardando GPS..." });
const [nextVisibility, setNextVisibility] = useState("Ative o GPS para prever");
const [visitCount, setVisitCount] = useState(1);
const [notifPermission, setNotifPermission] = useState('default');
const [isRefreshing, setIsRefreshing] = useState(false);

const [cardIndex, setCardIndex] = useState(0);
const [selectedOption, setSelectedOption] = useState(null);
const [answered, setAnswered] = useState(false);

// Injeção de Estilo
useEffect(() => {
const style = document.createElement('style');
style.innerHTML = `
body { background-color: #020617; margin: 0; padding: 0; font-family: -apple-system, system-ui, sans-serif; color: white; -webkit-tap-highlight-color: transparent; }
.app-wrapper { background-color: #020617; min-height: 100vh; width: 100%; display: flex; flex-direction: column; align-items: center; }
.app-container { width: 100%; max-width: 450px; padding: 20px; display: flex; flex-direction: column; gap: 16px; box-sizing: border-box; }
.card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 28px; padding: 24px; box-sizing: border-box; position: relative; overflow: hidden; }
.card-visible { background-color: rgba(37, 99, 235, 0.15); border-color: #3b82f6; box-shadow: 0 10px 40px -10px rgba(59, 130, 246, 0.4); }
.flex-center { display: flex; align-items: center; gap: 16px; }
.icon-box { padding: 16px; border-radius: 100px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.icon-blue { background-color: #3b82f6; color: white; }
.icon-slate { background-color: #1e293b; color: #64748b; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; width: 100%; }
.btn-round { padding: 14px; background-color: #1e293b; border-radius: 100px; border: none; color: #f1f5f9; cursor: pointer; display: flex; }
.quiz-option { width: 100%; padding: 18px; border-radius: 18px; border: 1px solid #1e293b; background-color: #1e293b; color: #e2e8f0; text-align: left; cursor: pointer; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 700; }
.quiz-correct { background-color: rgba(34, 197, 94, 0.25) !important; border-color: #22c55e !important; color: #bbf7d0 !important; }
.quiz-wrong { background-color: rgba(239, 68, 68, 0.25) !important; border-color: #ef4444 !important; color: #fecaca !important; }
.text-label { font-size: 11px; text-transform: uppercase; font-weight: 900; letter-spacing: 0.15em; color: #94a3b8; margin-bottom: 8px; }
.text-title { font-size: 21px; font-weight: 800; margin: 0; line-height: 1.2; letter-spacing: -0.02em; color: white !important; }
.text-value { font-size: 19px; font-weight: 800; color: white !important; margin: 0; }
.btn-next { background-color: #3b82f6; color: white; border: none; padding: 14px 28px; border-radius: 100px; font-weight: 900; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; text-transform: uppercase; }
.alert-box { background-color: #7f1d1d; border: 1px solid #ef4444; border-radius: 20px; padding: 18px; display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
.btn-alert { background-color: white; color: #7f1d1d; border: none; padding: 10px 18px; border-radius: 12px; font-weight: 900; cursor: pointer; font-size: 12px; }
.footer { text-align: center; color: #475569; padding: 30px 0; font-size: 10px; text-transform: uppercase; font-weight: 800; width: 100%; }
.spinning { animation: spin 1.2s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;
document.head.appendChild(style);

const today = new Date().toDateString();
const count = parseInt(localStorage.getItem('luarvis_visit_count') || '0');
if (localStorage.getItem('luarvis_last_visit_date') !== today) {
localStorage.setItem('luarvis_visit_count', '1');
localStorage.setItem('luarvis_last_visit_date', today);
setVisitCount(1);
} else {
localStorage.setItem('luarvis_visit_count', (count + 1).toString());
setVisitCount(count + 1);
}

if ("Notification" in window) {
setNotifPermission(Notification.permission);
}

requestLocation();
const t = setTimeout(() => setLoading(false), 2000);
return () => clearTimeout(t);
}, []);

const requestLocation = () => {
if (!navigator.geolocation) {
setLocationError(true);
return;
}
setIsRefreshing(true);
navigator.geolocation.getCurrentPosition(
(pos) => {
setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
setLocationError(false);
setIsRefreshing(false);
setLoading(false);
},
(err) => {
setLocationError(true);
setIsRefreshing(false);
setLoading(false);
},
{ timeout: 10000, enableHighAccuracy: true }
);
};

const requestNotificationPermission = async () => {
if (!("Notification" in window)) {
alert("No iPhone, salve o app na 'Tela de Início' primeiro para ativar notificações.");
return;
}
const permission = await Notification.requestPermission();
setNotifPermission(permission);
};

const checkVisibility = useCallback(async () => {
if (!location) return;
setIsRefreshing(true);
try {
const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=cloud_cover&timezone=auto`);
const data = await res.json();
const now = new Date();
const pos = getMoonPosition(now, location.lat, location.lon);
const hour = now.getHours();
const isVisible = pos.altitude > 0 && data.current.cloud_cover < 40 && hour >= 6 && hour <= 20;

setLastCheck({
visible: isVisible,
reason: hour < 6 || hour > 20 ? "Fora do horário (06h-20h)" : (pos.altitude <= 0 ? "Lua abaixo do horizonte" : (data.current.cloud_cover >= 40 ? "Céu muito nublado" : "Céu aberto"))
});

if (isVisible && notifPermission === 'granted') {
const todayStr = new Date().toDateString();
if (localStorage.getItem('luarvis_last_notif_date') !== todayStr) {
new Notification("LuarVis", { body: "Olhe pro céu! Talvez você veja a lua :)" });
localStorage.setItem('luarvis_last_notif_date', todayStr);
}
}
setNextVisibility(predictNextWindow(location.lat, location.lon, isVisible));
} catch (e) {
setNextVisibility("Erro na conexão");
} finally {
setIsRefreshing(false);
}
}, [location, notifPermission]);

useEffect(() => {
if (location) checkVisibility();
}, [location, checkVisibility]);

const showQuiz = !lastCheck?.visible || visitCount >= 2;

if (loading) return (
<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#020617' }}>
<MoonIcon className="spinning" style={{ color: '#3b82f6', marginBottom: '20px' }} size={64} />
<p style={{ fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em' }}>CONSULTANDO OS ASTROS...</p>
</div>
);

return (
<div className="app-wrapper">
<div className="app-container">

{locationError && (
<div className="alert-box">
<AlertIcon size={24} style={{ color: 'white' }} />
<div style={{ flex: 1 }}>
<p style={{ fontSize: '13px', fontWeight: '900', margin: 0, color: 'white' }}>LOCALIZAÇÃO BLOQUEADA</p>
<p style={{ fontSize: '11px', margin: 0, color: 'rgba(255,255,255,0.8)' }}>Toque no botão para tentar novamente.</p>
</div>
<button onClick={requestLocation} className="btn-alert">ATIVAR</button>
</div>
)}

<header className="header">
<div className="flex-center" style={{ gap: '12px' }}>
<MoonIcon style={{ color: '#3b82f6' }} size={34} />
<h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', letterSpacing: '-0.06em', color: 'white' }}>LuarVis</h1>
</div>
<div style={{ display: 'flex', gap: '12px' }}>
{notifPermission !== 'granted' && (
<button onClick={requestNotificationPermission} className="btn-round" title="Notificações">
<BellIcon size={22} style={{ color: '#94a3b8' }} />
</button>
)}
<button onClick={location ? checkVisibility : requestLocation} className="btn-round" title="Atualizar">
<RefreshIcon size={22} className={isRefreshing ? "spinning" : ""} style={{ color: '#f1f5f9' }} />
</button>
</div>
</header>

<section className={`card ${lastCheck?.visible ? 'card-visible' : ''}`} onClick={!location ? requestLocation : undefined}>
<div className="flex-center">
<div className={`icon-box ${lastCheck?.visible ? 'icon-blue' : 'icon-slate'}`}>
{lastCheck?.visible ? <EyeIcon size={38} /> : <EyeOffIcon size={38} />}
</div>
<div>
<p className="text-label">Consigo ver a lua agora?</p>
<h2 className="text-title">
{!location ? 'Toque para ativar GPS' : (lastCheck?.visible ? 'Sim! A lua deve estar visível.' : 'Não, lua escondida :(')}
</h2>
{location && <p style={{ fontSize: '14px', color: '#64748b', margin: '6px 0 0', fontWeight: '600' }}>{lastCheck?.reason}</p>}
</div>
</div>
</section>

<section className="card">
<div style={{ position: 'relative', zIndex: 2 }}>
<div className="flex-center" style={{ gap: '10px', marginBottom: '16px' }}>
<CalendarIcon style={{ color: '#3b82f6' }} size={20} />
<h3 className="text-label" style={{ margin: 0 }}>Próxima Visibilidade</h3>
</div>
<p className="text-value">
{!location ? 'Aguardando sinal do GPS...' : nextVisibility}
</p>
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
<p style={{ fontSize: '18px', fontWeight: '800', textAlign: 'center', marginBottom: '28px', lineHeight: '1.4', color: 'white' }}>
{QUIZ_CARDS[cardIndex].q}
</p>
<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
{QUIZ_CARDS[cardIndex].options.map((opt, i) => {
let statusClass = "";
if (answered) {
if (i === QUIZ_CARDS[cardIndex].correct) statusClass = "quiz-correct";
else if (i === selectedOption) statusClass = "quiz-wrong";
}
return (
<button
key={i}
onClick={() => !answered && (setSelectedOption(i), setAnswered(true))}
className={`quiz-option ${statusClass}`}
style={answered && i !== selectedOption && i !== QUIZ_CARDS[cardIndex].correct ? {opacity: 0.3} : {}}
>
<span>{opt}</span>
{answered && i === QUIZ_CARDS[cardIndex].correct && <CheckIcon size={18} />}
</button>
);
})}
</div>
{answered && (
<div className="feedback-box">
<p className="text-label" style={{ color: '#60a5fa' }}>Explicação:</p>
<p style={{ fontSize: '15px', margin: 0, color: '#cbd5e1', lineHeight: '1.6' }}>{QUIZ_CARDS[cardIndex].explanation}</p>
<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '22px' }}>
<button
onClick={() => { setAnswered(false); setSelectedOption(null); setCardIndex((prev) => (prev + 1) % QUIZ_CARDS.length); }}
className="btn-next"
>
Próxima <ChevronRightIcon size={18} />
</button>
</div>
</div>
)}
</div>
</section>
)}

<footer className="footer">
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
<MapPinIcon size={14} style={{ color: '#475569' }} />
<span>{location ? `COORD: ${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : 'SINAL GPS AUSENTE'}</span>
</div>
<div>LuarVis v2.6 • Otimizado para iPhone</div>
</footer>
</div>
</div>
);
};

export default App;