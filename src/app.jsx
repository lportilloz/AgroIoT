import './style.css'
import { useState, useEffect } from 'react';

function App() {
    // const [datos, setDatos] = useState({ temperatura: 0, humedad: 0, luz: 0, tanque: 0 });
    const [datos, setDatos] = useState({
        temperatura: 24.5,
        humedad: 65.0,
        luz: 45,
        tanque: 30
    });
    /* useEffect(() => {
        // Reemplazá con la IP real que te tire el monitor serie de Arduino
        const IP_ESP8266 = "http://192.168.1.45/datos";

        const obtenerDatos = async () => {
            try {
                const respuesta = await fetch(IP_ESP8266);
                const json = await respuesta.json();
                setDatos(json);
            } catch (error) {
                console.error("Error al conectar con el ESP8266:", error);
            }
        };

        // Consultar al iniciar y luego cada 3 segundos
        obtenerDatos();
        const intervalo = setInterval(obtenerDatos, 3000);

        return () => clearInterval(intervalo);
    }, []);  */
// aca usamos datos inventados, la q va es ;la de arriba
    useEffect(() => {
        // 2. Simulamos que los datos cambian un poquito cada 3 segundos
        const intervalo = setInterval(() => {
            setDatos({
                temperatura: (22 + Math.random() * 5).toFixed(1), // Varía entre 22 y 27
                humedad: (50 + Math.random() * 20).toFixed(1),   // Varía entre 50 y 70
                luz: Math.floor(Math.random() * 100),             // Varía entre 0 y 100
                tanque: Math.floor(10 + Math.random() * 70)       // Varía entre 10 y 80
            });
        }, 3000);

        return () => clearInterval(intervalo);
    }, []);


    return (
        < >
            <div class="nav">
                <div>
                    <p class="sub">AgroIoT</p>
                    <p class="sub">Invernadero hidropónico</p>
                    <p class="sub">Nodo ESP8266</p>
                </div>
                <div class="chips">
                    <p class="chip">Wi-Fi conectado</p>
                    <p class="chip">IP 192.168.1.45</p>
                    <p class="chip">Última lectura: 14:32:05</p>
                    <button class="btn">Modo oscuro</button>
                </div>
            </div>


            <div>
                <h2>VARIABLES DEL ENTORNO</h2>
                <div class="variables">

                    <div class="variable-card">
                        <p>Temperatura</p>
                        <p class="num-variable">{datos.temperatura}C</p>
                        <p class="sensor">DHT22</p>
                        <p class="estado-variable">✖ Estrés térmico</p>
                    </div>
                    <div class="variable-card">
                        <p>Humedad</p>
                        <p class="num-variable">{datos.temperatura}C</p>
                        <p class="num-variable">20 %</p>
                        <p class="sensor">DHT22</p>
                        <p class="estado-variable">✖ Riesgo de hongos (Botrytis)</p>
                    </div>
                    <div class="variable-card">
                        <p>Intensidad luminica</p>
                        <p class="num-variable">40 %</p>
                        <p class="sensor">LDR</p>
                        <p class="estado-variable">OK</p>
                    </div>
                    <div class="variable-card">
                        <p>Nivel de tanque</p>
                        <p class="num-variable">30 %</p>
                        <p class="sensor">HC-SR04</p>
                        <p class="estado-variable">Tanque lleno</p>
                    </div>
                </div>
            </div>

            <h2>Actuadores</h2>
            <div class="grid g3" id="acts"></div>
            <h1 class="grid g3" id="acts">hola</h1 >


            {/* < h2 > Historial</h2 >
        <div class="card">
            <div class="tools">
                <div class="seg" id="range"><button>1 h</button><button class="on">24 h</button><button>7 días</button>
                </div>
                <button class="btn" id="csv">Exportar CSV</button>
            </div>
            <svg class="chart" id="chart" viewBox="0 0 900 330" role="img"
                aria-label="Gráficos de temperatura, humedad y luz con su rango óptimo"></svg>
            <div class="wrapt">
                <table>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Temp.</th>
                            <th>Hum.</th>
                            <th>Luz</th>
                            <th>Tanque</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody id="rows"></tbody>
                </table>
            </div>
        </div>

* <p>Temperatura: <strong>{datos.temperatura} °C</strong></p>
      <p>Humedad: <strong>{datos.humedad} %</strong></p>
      <p>Luz: <strong>{datos.luz} %</strong></p>
      <p>Tanque de Agua: <strong>{datos.tanque} cm</strong></p> */}
        </>
    );
}

export default App;