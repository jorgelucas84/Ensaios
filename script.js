const ctx = document.getElementById('shearChart').getContext('2d');
let chart;

function calcularCurva() {
    const sigmaN = parseFloat(document.getElementById('sigmaN').value);
    const c = parseFloat(document.getElementById('coesao').value);
    const phi = parseFloat(document.getElementById('phi').value) * (Math.PI / 180);
    const k = parseFloat(document.getElementById('rigidez').value);

    // Atualiza labels na tela
    document.getElementById('valSigma').innerText = sigmaN;
    document.getElementById('valC').innerText = c;
    document.getElementById('valPhi').innerText = document.getElementById('phi').value;
    document.getElementById('valK').innerText = k;

    // Tensão de pico (Mohr-Coulomb)
    const tauPico = c + sigmaN * Math.tan(phi);

    const labels = [];
    const data = [];

    // Gerar pontos da curva Tensão x Deslocamento (modelo hiperbólico simplificado)
    for (let x = 0; x <= 10; x += 0.5) {
        labels.push(x.toFixed(1) + "mm");
        // Fórmula: tau = x / (1/(k*10) + x/tauPico)
        const tau = x / (1 / (k * 5) + x / tauPico);
        data.push(tau.toFixed(2));
    }

    updateChart(labels, data);
}

function updateChart(labels, data) {
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tensão de Cisalhamento (τ) em kPa',
                data: data,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Tensão (kPa)' } },
                x: { title: { display: true, text: 'Deslocamento Horizontal (mm)' } }
            }
        }
    });
}

// Escutar mudanças nos inputs
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', calcularCurva);
});

// Iniciar primeiro gráfico
calcularCurva();
