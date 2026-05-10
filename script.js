// Variáveis Globais
let chartCurva, chartEnvoltoria;
let ensaios = [];

const canvas = document.getElementById('canvasMEF');
const ctx = canvas.getContext('2d');

// Inicialização
window.onload = () => {
    atualizarSimulacao();
    document.querySelectorAll('input').forEach(i => i.addEventListener('input', atualizarSimulacao));
};

function atualizarSimulacao() {
    const params = getParams();
    atualizarUI(params);
    
    // 1. Calcular Dados
    const tauPico = params.c + params.sigmaN * Math.tan(params.phiRad);
    const curvaData = gerarPontosCurva(tauPico, params.dx);

    // 2. Renderizar Gráficos
    renderizarCurva(curvaData.labels, curvaData.values);
    renderizarEnvoltoria();

    // 3. Desenhar MEF
    desenharMEF(params, tauPico);
}

function getParams() {
    const sigmaN = parseFloat(document.getElementById('sigmaN').value);
    const c = parseFloat(document.getElementById('coesao').value);
    const phi = parseFloat(document.getElementById('phi').value);
    const dx = parseFloat(document.getElementById('dx').value);
    return { sigmaN, c, phi, phiRad: (phi * Math.PI) / 180, dx };
}

function atualizarUI(p) {
    document.getElementById('valSigma').innerText = p.sigmaN;
    document.getElementById('valC').innerText = p.c;
    document.getElementById('valPhi').innerText = p.phi;
    document.getElementById('valDx').innerText = p.dx;
}

// --- LÓGICA DE ELEMENTOS FINITOS (VISUAL) ---
function desenharMEF(p, tauPico) {
    const w = canvas.width;
    const h = canvas.height;
    const meio = h / 2;
    const tamGrid = 25;

    ctx.clearRect(0, 0, w, h);

    // Fator de tensão para o Mapa de Calor (0 a 1)
    const tensaoAtual = (p.dx / (1 / 5 + p.dx / tauPico)) / tauPico;
    
    // Desenhar Malha Superior (Móvel)
    for (let x = -tamGrid; x < w + tamGrid; x += tamGrid) {
        for (let y = 0; y < meio; y += tamGrid) {
            const distX = x + (p.dx * 15); // Deslocamento visual exagerado
            const hue = 200 - (tensaoAtual * 200); // De azul (frio) para vermelho (quente)
            ctx.fillStyle = `hsla(${hue}, 70%, 40%, 0.6)`;
            ctx.strokeStyle = "#333";
            ctx.fillRect(distX, y, tamGrid, tamGrid);
            ctx.strokeRect(distX, y, tamGrid, tamGrid);
        }
    }

    // Desenhar Malha Inferior (Fixa)
    for (let x = 0; x < w; x += tamGrid) {
        for (let y = meio; y < h; y += tamGrid) {
            ctx.fillStyle = "#34495e";
            ctx.strokeStyle = "#2c3e50";
            ctx.fillRect(x, y, tamGrid, tamGrid);
            ctx.strokeRect(x, y, tamGrid, tamGrid);
        }
    }

    // Linha de Interface (Emulsão)
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = tensaoAtual > 0.9 ? "#ff0000" : "#00efff";
    ctx.moveTo(0, meio);
    ctx.lineTo(w, meio);
    ctx.stroke();
}

// --- LÓGICA DE GRÁFICOS ---
function gerarPontosCurva(tauPico, dxFinal) {
    const labels = [];
    const values = [];
    for (let i = 0; i <= 15; i += 0.5) {
        labels.push(i.toFixed(1));
        const tau = i / (1 / 10 + i / tauPico);
        values.push(tau.toFixed(2));
    }
    return { labels, values };
}

function renderizarCurva(labels, values) {
    if (chartCurva) chartCurva.destroy();
    chartCurva = new Chart(document.getElementById('chartCurva'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tensão de Cisalhamento (kPa)',
                data: values,
                borderColor: '#3498db',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(52, 152, 219, 0.1)'
            }]
        },
        options: { animation: false, scales: { y: { min: 0 } } }
    });
}

function registrarPonto() {
    const p = getParams();
    const tauPico = p.c + p.sigmaN * Math.tan(p.phiRad);
    ensaios.push({ x: p.sigmaN, y: tauPico });
    atualizarSimulacao();
}

function renderizarEnvoltoria() {
    if (chartEnvoltoria) chartEnvoltoria.destroy();
    const pontos = [...ensaios].sort((a,b) => a.x - b.x);
    
    chartEnvoltoria = new Chart(document.getElementById('chartEnvoltoria'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Envoltória (Mohr-Coulomb)',
                data: pontos,
                showLine: true,
                borderColor: '#e67e22',
                backgroundColor: '#e67e22',
                pointRadius: 6
            }]
        },
        options: { scales: { x: { min: 0, title: {display:true, text:'σn (kPa)'} }, y: { min: 0, title: {display:true, text:'τ (kPa)'} } } }
    });
}

function limparTudo() {
    ensaios = [];
    atualizarSimulacao();
}
