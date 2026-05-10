let chartCurva, chartEnvoltoria;
let pontosEnvoltoria = [];

const ctxCurva = document.getElementById('chartCurva').getContext('2d');
const ctxEnvoltoria = document.getElementById('chartEnvoltoria').getContext('2d');

function calcularCurva() {
    const sigmaN = parseFloat(document.getElementById('sigmaN').value);
    const c = parseFloat(document.getElementById('coesao').value);
    const phi = parseFloat(document.getElementById('phi').value) * (Math.PI / 180);
    
    document.getElementById('valSigma').innerText = sigmaN;
    document.getElementById('valC').innerText = c;
    document.getElementById('valPhi').innerText = document.getElementById('phi').value;

    const tauPico = c + sigmaN * Math.tan(phi);
    const labels = [];
    const data = [];

    for (let x = 0; x <= 10; x += 0.5) {
        labels.push(x.toFixed(1));
        const tau = x / (1 / 25 + x / tauPico);
        data.push(tau.toFixed(2));
    }

    renderizarCurva(labels, data);
}

function renderizarCurva(labels, data) {
    if (chartCurva) chartCurva.destroy();
    chartCurva = new Chart(ctxCurva, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ensaio Atual (τ vs ΔL)',
                data: data,
                borderColor: '#3498db',
                fill: false
            }]
        },
        options: { responsive: true, scales: { y: { title: { display: true, text: 'Tensão (kPa)' } } } }
    });
}

function registrarEnsaio() {
    const sigmaN = parseFloat(document.getElementById('sigmaN').value);
    const c = parseFloat(document.getElementById('coesao').value);
    const phi = parseFloat(document.getElementById('phi').value) * (Math.PI / 180);
    const tauPico = c + sigmaN * Math.tan(phi);

    pontosEnvoltoria.push({ x: sigmaN, y: tauPico });
    atualizarTabela();
    renderizarEnvoltoria();
}

function atualizarTabela() {
    const tbody = document.querySelector('#tabelaEnsaios tbody');
    tbody.innerHTML = "";
    pontosEnvoltoria.forEach((p, i) => {
        tbody.innerHTML += `<tr><td>${i+1}</td><td>${p.x}</td><td>${p.y.toFixed(2)}</td></tr>`;
    });
}

function renderizarEnvoltoria() {
    if (chartEnvoltoria) chartEnvoltoria.destroy();
    
    // Ordenar pontos por SigmaN para a linha ficar correta
    const sortedPoints = [...pontosEnvoltoria].sort((a, b) => a.x - b.x);

    chartEnvoltoria = new Chart(ctxEnvoltoria, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Envoltória de Resistência',
                data: sortedPoints,
                showLine: true,
                borderColor: '#e67e22',
                backgroundColor: '#e67e22',
                pointRadius: 6
            }]
        },
        options: {
            scales: {
                x: { type: 'linear', position: 'bottom', title: { display: true, text: 'Tensão Normal σ (kPa)' }, min: 0 },
                y: { title: { display: true, text: 'Resistência τ (kPa)' }, min: 0 }
            }
        }
    });
}

function limparEnsaios() {
    pontosEnvoltoria = [];
    atualizarTabela();
    renderizarEnvoltoria();
}

document.querySelectorAll('input').forEach(input => input.addEventListener('input', calcularCurva));
calcularCurva();
renderizarEnvoltoria();
