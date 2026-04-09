let allExoplanets = [];
let currentResults = [];
let currentPage = 1;
const itemsPerPage = 50; 
const CSV_URL = 'http://localhost:8080/exoplanets';

let methodsChart = null; // Instância do gráfico

const els = {
    year: document.getElementById('disc_year'),
    method: document.getElementById('discoverymethod'),
    host: document.getElementById('hostname'),
    facility: document.getElementById('disc_facility'),
    btnSearch: document.getElementById('btn-search'),
    btnClear: document.getElementById('btn-clear'),
    tbody: document.getElementById('table-body'),
    sortIcons: document.querySelectorAll('.sort'),
    kpiCount: document.getElementById('kpi-count'),
    kpiHosts: document.getElementById('kpi-hosts'), 
    pagination: document.getElementById('pagination-controls'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    pageInfo: document.getElementById('page-info'),
    // Novos elementos do Modal e Gráfico
    btnStats: document.getElementById('btn-stats'),
    modal: document.getElementById('stats-modal'),
    closeModal: document.getElementById('close-modal'),
    chartCanvas: document.getElementById('methodsChart')
};

async function loadData() {
    try {
        els.kpiCount.textContent = "...";
        if(els.kpiHosts) els.kpiHosts.textContent = "...";

        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error("Erro no Proxy");
        
        const csvText = await response.text();
        allExoplanets = parseCSV(csvText);
        currentResults = [...allExoplanets]; 

        initFilters();
        unlockUI();

        updateKPI(allExoplanets);
        renderTable(); 
    } catch (error) {
        console.error("Erro:", error);
        els.kpiCount.textContent = "ERR";
    }
}

function parseCSV(csv) {
    const lines = csv.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));
    const headers = lines[0].split(',').map(h => h.trim());

    return lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] ? values[index].replace(/"/g, '').trim() : '';
            return obj;
        }, {});
    });
}

function initFilters() {
    const filters = { years: new Set(), methods: new Set(), hosts: new Set(), facilities: new Set() };
    allExoplanets.forEach(p => {
        if (p.disc_year) filters.years.add(p.disc_year);
        if (p.discoverymethod) filters.methods.add(p.discoverymethod);
        if (p.hostname) filters.hosts.add(p.hostname);
        if (p.disc_facility) filters.facilities.add(p.disc_facility);
    });

    populateDropdown(els.year, Array.from(filters.years).sort((a, b) => b - a), "Todos os Anos");
    populateDropdown(els.method, Array.from(filters.methods).sort(), "Todos os Métodos");
    populateDropdown(els.host, Array.from(filters.hosts).sort(), "Todos os Hosts");
    populateDropdown(els.facility, Array.from(filters.facilities).sort(), "Todas as Instalações");
}

function populateDropdown(selectElement, optionsArray, defaultText) {
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    optionsArray.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        selectElement.appendChild(opt);
    });
}

function unlockUI() {
    els.year.disabled = false;
    els.method.disabled = false;
    els.host.disabled = false;
    els.facility.disabled = false;
    els.btnSearch.disabled = false;
    els.btnClear.disabled = false;
}

function updateKPI(results) {
    // Total de Planetas
    els.kpiCount.textContent = results.length.toLocaleString();

    // 2. Calcula Sistemas Estelares 
    if (els.kpiHosts) {
        const uniqueHosts = new Set(results.map(p => p.hostname)).size;
        els.kpiHosts.textContent = uniqueHosts.toLocaleString();
    }
}

function handleSearch() {
    const activeFilters = {
        disc_year: els.year.value,
        discoverymethod: els.method.value,
        hostname: els.host.value,
        disc_facility: els.facility.value
    };
    
    currentResults = allExoplanets.filter(p => {
        return (!activeFilters.disc_year || p.disc_year === activeFilters.disc_year) &&
               (!activeFilters.discoverymethod || p.discoverymethod === activeFilters.discoverymethod) &&
               (!activeFilters.hostname || p.hostname === activeFilters.hostname) &&
               (!activeFilters.disc_facility || p.disc_facility === activeFilters.disc_facility);
    });

    currentPage = 1; 
    renderTable();
    
    // Atualiza os KPIs
    updateKPI(currentResults);
}

function renderTable() {
    els.tbody.innerHTML = '';
    
    if (currentResults.length === 0) {
        els.pagination.classList.add('hidden');
        els.tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 30px;">Nenhum planeta encontrado.</td></tr>';
        return;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = currentResults.slice(startIndex, endIndex);

    paginatedItems.forEach(p => {
        const tr = document.createElement('tr');
        const encodedHost = encodeURIComponent(p.hostname);
        const hostLink = `<a href="https://exoplanetarchive.ipac.caltech.edu/overview/${encodedHost}" target="_blank" style="color:#007bff; text-decoration:none;">${p.hostname}</a>`;

        tr.innerHTML = `
            <td>${hostLink}</td>
            <td>${p.disc_year || '-'}</td>
            <td>${p.discoverymethod || '-'}</td>
            <td>${p.disc_facility || '-'}</td>
        `;
        els.tbody.appendChild(tr);
    });

    updatePaginationUI();
}

function updatePaginationUI() {
    const totalPages = Math.ceil(currentResults.length / itemsPerPage);
    if (totalPages <= 1) {
        els.pagination.classList.add('hidden');
    } else {
        els.pagination.classList.remove('hidden');
        els.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        els.btnPrev.disabled = currentPage === 1;
        els.btnNext.disabled = currentPage === totalPages;
    }
}

function handleClear() {
    els.year.value = '';
    els.method.value = '';
    els.host.value = '';
    els.facility.value = '';
    currentResults = [...allExoplanets];
    currentPage = 1;
    renderTable();
    
    // Volta a calcular usando o banco de dados inteiro
    updateKPI(allExoplanets);
}

function handleSort(e) {
    if (currentResults.length === 0) return;
    const th = e.target.closest('th');
    const col = th.dataset.col;
    const dir = e.target.dataset.dir;

    currentResults.sort((a, b) => {
        let valA = a[col] || ''; let valB = b[col] || '';
        if (!isNaN(valA) && !isNaN(valB)) { valA = Number(valA); valB = Number(valB); }
        if (valA < valB) return dir === 'asc' ? -1 : 1;
        if (valA > valB) return dir === 'asc' ? 1 : -1;
        return 0;
    });

    currentPage = 1; 
    renderTable();
}

// Gráfico de Estatísticas
function renderChart() {
    if (methodsChart) methodsChart.destroy();
    
    // Metodos na lista atual
    const methodCounts = {};
    currentResults.forEach(p => {
        const method = p.discoverymethod || 'Desconhecido';
        methodCounts[method] = (methodCounts[method] || 0) + 1;
    });

    const labels = Object.keys(methodCounts);
    const data = Object.values(methodCounts);

    methodsChart = new Chart(els.chartCanvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#e83e8c', '#fd7e14'],
                borderWidth: 1, borderColor: '#151515'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right', labels: { color: '#ccc' } }
            }
        }
    });
}

// Eventos
els.btnPrev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
els.btnNext.addEventListener('click', () => { if (currentPage < Math.ceil(currentResults.length / itemsPerPage)) { currentPage++; renderTable(); } });
els.btnSearch.addEventListener('click', handleSearch);
els.btnClear.addEventListener('click', handleClear);
els.sortIcons.forEach(icon => icon.addEventListener('click', handleSort));

if(els.btnStats) {
    els.btnStats.addEventListener('click', () => {
        if (currentResults.length > 0) {
            els.modal.classList.remove('hidden');
            renderChart();
        }
    });
}
if(els.closeModal) {
    els.closeModal.addEventListener('click', () => els.modal.classList.add('hidden'));
}

document.addEventListener('DOMContentLoaded', loadData);