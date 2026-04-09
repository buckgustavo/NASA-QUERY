# 🌌 NASA Exoplanet Explorer

![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![NASA](https://img.shields.io/badge/NASA-Data-blue?style=for-the-badge&logo=nasa&logoColor=white)

> **Status:** 🚀 Full Stack / Production Ready
<img width="1919" height="999" alt="IMG1" src="https://github.com/user-attachments/assets/d256c949-973b-4dad-a0ec-46b83ee9aba1" />

Este não é apenas um dashboard comum; é um sistema de exploração científica de alto desempenho. O foco principal aqui foi resolver o gargalo de **CORS** das APIs da NASA e gerenciar um volume massivo de dados mantendo a fluidez da interface.

---

## 🏗️ Engenharia e Desafios Técnicos

### 1. O Proxy de Alta Concorrência (Go)
Para evitar o bloqueio de CORS e garantir segurança, desenvolvi um backend em **Go** que atua como um túnel. 
* **Data Streaming:** O servidor não apenas repassa os dados, ele gerencia a requisição para a tabela `ps` (Planetary Systems) do NASA Archive.
* **Segurança:** Implementação de headers de segurança e isolamento da `NASA_API_URL` via variáveis de ambiente.

### 2. Performance de UI (60 FPS)
Manipular **~40.000 registros** no DOM costuma travar o navegador. Este projeto resolve isso através de:
* **Parser Otimizado:** Processamento do CSV bruto via Fetch API sem overhead de bibliotecas pesadas.
* **Paginação Inteligente:** Renderização por demanda (50 itens por página) para manter o consumo de memória baixo.
* **Lógica Reativa:** Filtros multi-parâmetros que recalculam estatísticas em milissegundos.

### 3. Visual Identity (IPAC/Caltech)
A interface foi projetada para simular consoles de centros de pesquisa astronômica:
* **Design:** Grids científicos, painéis translúcidos e tipografia de alta legibilidade.
* **Visualização:** Gráficos dinâmicos via **Chart.js** para análise estatística imediata dos métodos de descoberta.

---

## ✨ Funcionalidades Core

* **Sincronização Direta:** Conexão `TAP (Table Access Protocol)` com os servidores da NASA.
* **KPIs de Sistemas Únicos:** Algoritmo que identifica sistemas hospedeiros distintos em tempo real.
* **Filtros de Missão:** Busca por ano, método de detecção e tipo de instalação (Terrestre ou Orbital).
* **UX Imersiva:** Background espacial em HD com interface "Glassmorphism" profissional.

---

## 🚀 Como Executar

### 1. Ambiente
* Ter o **Go 1.18+** instalado.
* VS Code com a extensão **Live Server**.

### 2. Configuração (`.env`)
PORT=

NASA_API_URL=

ALLOWED_ORIGIN=

3. Start
Bash
# Terminal 1: Iniciar o Proxy
go run main.go

# Terminal 2: Abrir o index.html via Live Server
📂 Estrutura do Ecossistema
main.go → Backend Proxy & Security Layer.

app.js → Engine de Parsing, Filtros e Gráficos.

style.css → Layout Científico (CSS Grid & Glassmorphism).

.env → Configurações sensíveis (Ignorado pelo Git).

📝 Licença
Desenvolvido por [G.Buck] 

