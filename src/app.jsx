import { useState, useEffect } from 'react';
import './style.css';

function App() {
    const [datos, setDatos] = useState({
        horaActual:1,
        temperatura: 24.5,
        infoTemperatura: "Óptimo",
        humedad: 65.0,
        infoHumedad: "Óptimo",
        luz: 45,
        infoLuz: "Luz óptima",
        tanque: 30,
        infoTanque: "Nivel de agua óptimo"
    });

    const [historial, setHistorial] = useState([]);

    // Funciones para calcular los mensajes basados en los valores
    const calcularTemperatura = (t) => {
        if (t < 18) return "Riesgo de bache térmico.";
        if (t > 26) return "Estrés térmico.";
        return "La temperatura es óptima.";
    };

    const calcularHumedad = (h) => {
        if (h < 50) return "Deshidratación.";
        if (h > 75) return "Alto riesgo de hongos.";
        return "La humedad es óptima.";
    };

    const calcularIluminacion = (l) => {
        if (l < 30) return "Luz insuficiente.";
        if (l > 80) return "Sol directo.";
        return "Luz óptima.";
    };

    const calcularTanque = (tanque) => {
        if (tanque > 80) return "Alerta de vaciado.";
        if (tanque < 20) return "Tanque lleno.";
        return "Nivel óptimo.";
    };

    useEffect(() => {
        const intervalo = setInterval(() => {
            const nuevaTemp = Number((20 + Math.random() * 8).toFixed(1));
            const nuevaHum = Number((45 + Math.random() * 35).toFixed(1));
            const nuevaLuz = Math.floor(Math.random() * 100);
            const nuevoTanque = Math.floor(10 + Math.random() * 85);
            
            // Generamos la hora actual para el historial
            //const horaActual = new Date().toLocaleTimeString();

            const lecturaActual = {
                hora: horaActual, // <-- Agregado para que la tabla muestre la hora
                temperatura: nuevaTemp,
                infoTemperatura: calcularTemperatura(nuevaTemp),
                humedad: nuevaHum,
                infoHumedad: calcularHumedad(nuevaHum),
                luz: nuevaLuz,
                infoLuz: calcularIluminacion(nuevaLuz),
                tanque: nuevoTanque,
                infoTanque: calcularTanque(nuevoTanque)
            };

            setDatos(lecturaActual);

            // Actualizamos el historial guardando solo los últimos 5
            setHistorial((prev) => [lecturaActual, ...prev].slice(0, 5));

        }, 3000);

        return () => clearInterval(intervalo);
    }, []);

    return (
        <>
            <div className="nav">
                <img className="icono" src="/images/icono.png" alt="icono-pagina" />
                <h1 className="sub">AgroIoT</h1>
            </div>

            <div>
                <h2 className='titulo'>Estado del invernadero</h2>
                <div className="variables">

                    <div className="variable-card">
                        <div className="card-header">
                            <p>Temperatura</p>
                            <img className='card-image' src="/images/thermometer.png" alt="icono-temperatura" />
                        </div>
                        <p className="num-variable">{datos.temperatura}°C</p>
                        <p className="sensor">DHT22</p>
                        <p className="estado-variable">{datos.infoTemperatura}</p>
                    </div>

                    <div className="variable-card">
                        <div className='card-header'>
                            <p>Humedad</p>
                            <img className='card-image' src="/images/water-waves.png" alt="icono-humedad" />
                        </div>
                        <p className="num-variable">{datos.humedad}%</p>
                        <p className="sensor">DHT22</p>
                        <p className="estado-variable">{datos.infoHumedad}</p>
                    </div>

                    <div className="variable-card">
                        <div className='card-header'>
                            <p>Intensidad lumínica</p>
                            <img className='card-image' src="/images/brightness.png" alt="icono-intensidad-luminica" />
                        </div>
                        <p className="num-variable">{datos.luz}%</p>
                        <p className="sensor">LDR</p>
                        <p className="estado-variable">{datos.infoLuz}</p>
                    </div>

                    <div className="variable-card">
                        <div className='card-header'>
                            <p>Nivel de tanque</p>
                            <img className='card-image' src="/images/water-tank.png" alt="icono-tanque" />
                        </div>
                        <p className="num-variable">{datos.tanque} cm</p>
                        <p className="sensor">HC-SR04</p>
                        <p className="estado-variable">{datos.infoTanque}</p>
                    </div>

                </div>
            </div>

            <h2 className='titulo'>Historial</h2>
            <div style={{ padding: '0 20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eaeaea', color: '#666', fontSize: '0.9rem' }}>
                            <th style={{ padding: '12px' }}>Hora</th>
                            <th style={{ padding: '12px' }}>Temp.</th>
                            <th style={{ padding: '12px' }}>Hum.</th>
                            <th style={{ padding: '12px' }}>Luz</th>
                            <th style={{ padding: '12px' }}>Tanque</th>
                            <th style={{ padding: '12px' }}>Estado Temp.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historial.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '15px', textAlign: 'center', color: '#888' }}>Esperando mediciones...</td>
                            </tr>
                        ) : (
                            historial.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0', fontSize: '0.9rem' }}>
                                    <td style={{ padding: '12px' }}>{item.hora}</td>
                                    <td style={{ padding: '12px' }}>{item.temperatura} °C</td>
                                    <td style={{ padding: '12px' }}>{item.humedad} %</td>
                                    <td style={{ padding: '12px' }}>{item.luz} %</td>
                                    <td style={{ padding: '12px' }}>{item.tanque} cm</td>
                                    <td style={{ padding: '12px' }}>{item.infoTemperatura}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div>
                <h2 className='titulo'>Actuadores</h2>
            </div>
        </>
    );
}

export default App;