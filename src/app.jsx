import { useState, useEffect } from 'react';
import './style.css';

// Nombre mDNS del ESP8266. Si no resuelve en tu red, poné la IP que muestra el LCD (ej: '192.168.0.50')
const ESP_HOST = 'agroiot.local';
const INTERVALO_MS = 3000;
const MAX_HISTORIAL = 5;

// ---- Lógica de control (rangos de la consigna) ----
const evaluar = {
  temperatura: (t) =>
    t < 18 ? { nivel: 'warn', msg: 'Riesgo de bache térmico', accion: 'Poca tasa metabólica' }
    : t > 26 ? { nivel: 'crit', msg: 'Estrés térmico', accion: 'Activar ventilación / sombra' }
    : { nivel: 'ok', msg: 'Temperatura óptima', accion: '' },
  humedad: (h) =>
    h < 50 ? { nivel: 'warn', msg: 'Deshidratación', accion: 'Transpiración excesiva' }
    : h > 75 ? { nivel: 'crit', msg: 'Alto riesgo de hongos (Botrytis)', accion: 'Activar aireación' }
    : { nivel: 'ok', msg: 'Humedad óptima', accion: '' },
  luz: (l) =>
    l < 30 ? { nivel: 'warn', msg: 'Luz insuficiente', accion: 'Considerar iluminación complementaria' }
    : l > 80 ? { nivel: 'crit', msg: 'Sol directo', accion: 'Desplegar malla de sombra' }
    : { nivel: 'ok', msg: 'Luz óptima', accion: '' },
  // El HC-SR04 mide la distancia tapa → agua: más cm = menos agua
  tanque: (cm) =>
    cm > 80 ? { nivel: 'crit', msg: 'Alerta de vaciado', accion: 'Apagado preventivo de bomba' }
    : cm < 20 ? { nivel: 'warn', msg: 'Tanque lleno', accion: '' }
    : { nivel: 'ok', msg: 'Nivel óptimo', accion: '' },
};

const SENSORES = [
  { key: 'temperatura', titulo: 'Temperatura', unidad: '°C', sensor: 'DHT22', icono: 'thermometer.png' },
  { key: 'humedad', titulo: 'Humedad', unidad: '%', sensor: 'DHT22', icono: 'water-waves.png' },
  { key: 'luz', titulo: 'Intensidad lumínica', unidad: '%', sensor: 'LDR', icono: 'brightness.png' },
  { key: 'tanque', titulo: 'Nivel del tanque', unidad: 'cm', sensor: 'HC-SR04', icono: 'water-tank.png' },
];

const ACTUADORES = [
  { key: 'extractor', nombre: 'Extractor' },
  { key: 'bomba', nombre: 'Bomba de agua' },
  { key: 'malla', nombre: 'Malla de sombra' },
];

// ---- Utilidades ----
const leerLS = (clave, defecto) => {
  try {
    const v = localStorage.getItem(clave);
    return v ? JSON.parse(v) : defecto;
  } catch {
    return defecto;
  }
};
const guardarLS = (clave, valor) => {
  try { localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin storage */ }
};

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

async function pedirDatos() {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 2500);
  try {
    const r = await fetch(`http://${ESP_HOST}/datos`, { signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const j = await r.json();
    return {
      temperatura: num(j.temperatura),
      humedad: num(j.humedad),
      luz: num(j.luz),
      tanque: num(j.tanque),
      actuadores: {
        extractor: !!j.actuadores?.extractor,
        bomba: !!j.actuadores?.bomba,
        malla: !!j.actuadores?.malla,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

function App() {
  const [datos, setDatos] = useState(null);
  const [historial, setHistorial] = useState(() => leerLS('agroiot:historial', []).slice(0, MAX_HISTORIAL));
  const [conexion, setConexion] = useState('esperando'); // esperando | ok | error
  const [tema, setTema] = useState(() =>
    leerLS('agroiot:tema', window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro')
  );

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    guardarLS('agroiot:tema', tema);
  }, [tema]);

  useEffect(() => guardarLS('agroiot:historial', historial), [historial]);

  // ---- Adquisición periódica desde el ESP8266 ----
  useEffect(() => {
    let activo = true;
    const tick = async () => {
      try {
        const lectura = { ...(await pedirDatos()), hora: new Date().toLocaleTimeString('es-AR') };
        if (!activo) return;
        setDatos(lectura);
        setHistorial((prev) => [lectura, ...prev].slice(0, MAX_HISTORIAL));
        setConexion('ok');
      } catch {
        if (activo) setConexion('error'); // se conserva la última lectura real y el historial
      }
    };
    tick();
    const id = setInterval(tick, INTERVALO_MS);
    return () => { activo = false; clearInterval(id); };
  }, []);

  const tanqueCritico = datos?.tanque != null && evaluar.tanque(datos.tanque).nivel === 'crit';
  const textoConexion = {
    esperando: 'Conectando…',
    ok: 'Conectado al ESP8266',
    error: `Sin conexión con ${ESP_HOST}`,
  }[conexion];

  return (
    <>
      <header className="nav">
        <img className="icono" src="/images/icono.png" alt="" />
        <h1 className="sub">AgroIoT</h1>
        <button className="tema" onClick={() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro')}>
          {tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </header>

      <main className={conexion === 'error' ? 'desactualizado' : ''}>
        <div className="titulo-fila">
          <h2 className="titulo">Estado del invernadero</h2>
          <p className={`conexion ${conexion}`} role="status">{textoConexion}</p>
        </div>

        <section className="variables">
          {SENSORES.map((s) => {
            const v = datos?.[s.key];
            const e = v == null ? null : evaluar[s.key](v);
            return (
              <article key={s.key} className={`variable-card ${e ? e.nivel : ''}`}>
                <div className="card-header">
                  <h3>{s.titulo}</h3>
                  <img className="card-image" src={`/images/${s.icono}`} alt="" />
                </div>
                <p className="num-variable">{v ?? '--'}<small>{s.unidad}</small></p>
                <p className="estado-variable">{e ? e.msg : 'Sin lectura'}</p>
                {e?.accion && <p className="accion">{e.accion}</p>}
                <p className="sensor">{s.sensor}</p>
              </article>
            );
          })}
        </section>

        <h2 className="titulo">Actuadores</h2>
        <section className="actuadores">
          {ACTUADORES.map((a) => {
            const encendido = datos?.actuadores?.[a.key];
            const bloqueada = a.key === 'bomba' && tanqueCritico;
            const estado = !datos ? '' : bloqueada ? 'bloq' : encendido ? 'on' : '';
            const texto = !datos ? '--' : bloqueada ? 'Bloqueada' : encendido ? 'Encendido' : 'Apagado';
            return (
              <div key={a.key} className="actuador">
                <div>
                  <p className="actuador-nombre">{a.nombre}</p>
                  {bloqueada && <p className="accion">Nivel crítico del tanque</p>}
                </div>
                <span className={`pill ${estado}`}>{texto}</span>
              </div>
            );
          })}
        </section>

        <div className="titulo-fila">
          <h2 className="titulo">Historial</h2>
          {historial.length > 0 && (
            <button className="link" onClick={() => setHistorial([])}>Borrar historial</button>
          )}
        </div>
        <div className="tabla-wrap">
          <table>
            <thead>
              <tr>
                <th>Hora</th><th>Temp.</th><th>Hum.</th><th>Luz</th><th>Tanque</th>
              </tr>
            </thead>
            <tbody>
              {historial.length === 0 ? (
                <tr><td colSpan="5" className="vacio">Esperando mediciones…</td></tr>
              ) : (
                historial.map((h, i) => (
                  <tr key={`${h.hora}-${i}`}>
                    <td>{h.hora}</td>
                    {SENSORES.map((s) => {
                      const v = h[s.key];
                      return (
                        <td key={s.key} className={`dato ${v == null ? '' : evaluar[s.key](v).nivel}`}>
                          {v == null ? '--' : `${v} ${s.unidad}`}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

export default App;