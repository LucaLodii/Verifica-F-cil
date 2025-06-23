// Função para carregar os dados do carrossel, priorizando a API e usando fallback.
function loadCarousel() {
  fetch('http://localhost:3000/index.html') // URL da API para dados do carrossel.
    .then(function (response) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(function (data) {
      buildCarousel(data); // Constrói o carrossel com os dados da API.
    })
    .catch(function (error) {
      console.error("Erro ao carregar carrossel da API:", error);
      // Fallback: Constrói o carrossel com dados estáticos se a API falhar.
      buildCarousel([
        {
          imagem: "assets/images/imgTeste2.png",
          // Este item não terá legenda, pois faltam as propriedades de texto/booleano.
        },
        {
          imagem: "assets/images/imgCarrossel1.jpg",
          verdadeiro: false,
          descricao: "Não há qualquer proposta para confiscar poupanças superiores a R$ 5 mil",
          fonte: "Banco Central"
        },
        {
          imagem: "assets/images/imgCarrossel2.jpg",
          verdadeiro: false,
          descricao: "Documento atribuído a Boulos é inválido",
          fonte: "Aos Fatos"
        },
        {
          imagem: "assets/images/imgCarrossel3.jpg",
          verdadeiro: true,
          descricao: "Técnico italiano confirmado para 2024",
          fonte: "CBF"
        }
      ]);
    });
}

// Função para construir o carrossel dinamicamente com base nos itens fornecidos.
function buildCarousel(items) {
  const carousel = document.getElementById('mainCarousel');
  if (!carousel) return; // Garante que o elemento carrossel existe.

  const indicators = carousel.querySelector('.carousel-indicators');
  const inner = carousel.querySelector('.carousel-inner');

  indicators.innerHTML = ''; // Limpa indicadores existentes.
  inner.innerHTML = ''; // Limpa slides existentes.

  // Itera sobre cada item para criar seus respectivos indicadores e slides.
  items.forEach((item, index) => {
    // Cria o botão indicador para cada slide.
    indicators.innerHTML += `
      <button type="button" 
              data-bs-target="#mainCarousel" 
              data-bs-slide-to="${index}"
              ${index === 0 ? 'class="active"' : ''}
              aria-label="Slide ${index + 1}">
      </button>`;

    // Lógica para renderizar o 'carousel-caption' condicionalmente.
    // A legenda só será exibida se houver 'descricao', 'fonte' ou a propriedade 'verdadeiro' for booleana.
    const hasCaptionContent = item.descricao || item.fonte || (typeof item.verdadeiro === 'boolean');
    let captionHtml = '';

    if (hasCaptionContent) {
      // Renderiza o badge 'VERIFICADO'/'FALSO' apenas se 'verdadeiro' for um booleano.
      const badgeHtml = (typeof item.verdadeiro === 'boolean') ? `
            <h5 class="badge ${item.verdadeiro ? 'bg-success' : 'bg-danger'}">
                ${item.verdadeiro ? 'VERIFICADO' : 'FALSO'}
            </h5>
        ` : '';

      // Renderiza descrição e fonte somente se existirem.
      const descriptionHtml = item.descricao ? `${item.descricao}<br>` : '';
      const sourceHtml = item.fonte ? `<small>Fonte: ${item.fonte}</small>` : '';

      captionHtml = `
            <div class="carousel-caption d-none d-md-block">
                ${badgeHtml}
                <p class="bg-dark bg-opacity-75 p-2 rounded">
                    ${descriptionHtml}
                    ${sourceHtml}
                </p>
            </div>`;
    }

    // Adiciona o slide com a imagem e a legenda condicional.
    inner.innerHTML += `
      <div class="carousel-item ${index === 0 ? 'active' : ''}">
        <img src="${item.imagem}" class="d-block w-100" alt="${item.descricao || 'Imagem do Carrossel'}">
        ${captionHtml} 
      </div>`;
  });

  // Inicializa a instância do carrossel do Bootstrap.
  if (window.bootstrap) {
    new bootstrap.Carousel(carousel, {
      interval: 5000,
      wrap: true,
      pause: 'hover',
      keyboard: true,
      touch: true
    });

    // Opcional: Adiciona um listener para eventos de slide (para depuração ou outras ações).
    carousel.addEventListener('slid.bs.carousel', () => {
      console.log('Slide mudou');
    });
  }
}

// Inicia o carregamento do carrossel assim que o DOM estiver completamente carregado.
document.addEventListener('DOMContentLoaded', function () {
  loadCarousel();
});


// VERIFICADOR DE URL
let urlData = {
  riskyDomains: [],
  safeDomains: []
};

const checkBtn = document.getElementById('checkBtn');
const urlInput = document.getElementById('urlInput');
const resultDiv = document.getElementById('result');
const resultText = document.getElementById('resultText');

function displayResult(message, isSafe) {
  resultText.textContent = message;
  resultDiv.classList.remove("result-hidden", "safe", "risky");
  resultDiv.classList.add(isSafe ? "safe" : "risky");
  resultDiv.style.display = "block";
}

// Carrega os dados de domínios.
fetch('http://localhost:3000/urlChecker')
  .then(response => {
    if (!response.ok) {
      console.error(`Erro de rede: ${response.status} ${response.statusText}`);
      throw new Error("Falha no carregamento dos dados.");
    }
    return response.json();
  })
  .then(data => {
    // Tenta acessar 'urlChecker' ou usa 'data' diretamente, dependendo da API.
    const relevantData = data.urlChecker || data;

    if (relevantData && Array.isArray(relevantData.riskyDomains) && Array.isArray(relevantData.safeDomains)) {
      urlData.riskyDomains = relevantData.riskyDomains;
      urlData.safeDomains = relevantData.safeDomains;
      console.log("Dados carregados com sucesso.");

      if (checkBtn) {
        checkBtn.removeAttribute('disabled');
        checkBtn.textContent = 'Verificar';
        attachCheckButtonListener();
      }
    } else {
      console.warn("Estrutura de dados inválida no JSON.");
      displayResult("Erro: Estrutura de dados inválida. Verificador limitado.", false);
      if (checkBtn) checkBtn.textContent = 'Erro de dados';
    }
  })
  .catch(error => {
    console.error("Erro fatal ao carregar dados.", error);
    displayResult("Erro ao carregar dados. Verificador limitado.", false);
    if (checkBtn) checkBtn.textContent = 'Erro de carregamento';
  });

// Anexa o event listener ao botão 'Verificar'.
function attachCheckButtonListener() {
  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const urlInputVal = urlInput.value.trim();

      if (!urlInputVal) {
        alert("Por favor, insira uma URL!");
        return;
      }

      try {
        const urlObj = new URL(urlInputVal.includes("://") ? urlInputVal : `https://${urlInputVal}`);
        const result = analyzeUrl(urlObj);
        displayResult(result.message, result.isSafe);
      } catch (error) {
        displayResult("❌ URL inválida (exemplo válido: google.com)", false);
        console.error("Erro ao processar URL:", error);
      }
    });
  }
}

// Analisa a URL com base nas listas de domínios.
function analyzeUrl(urlObj) {
  const { hostname, protocol } = urlObj;
  const isHttps = protocol === "https:";
  const lowerCaseHostname = hostname.toLowerCase();

  const isRiskyDomain = urlData.riskyDomains.some(domain => lowerCaseHostname.includes(domain.toLowerCase()));
  const isShortener = ["bit.ly", "tinyurl.com"].some(domain => lowerCaseHostname.includes(domain.toLowerCase()));

  if (isRiskyDomain || isShortener) {
    return {
      isSafe: false,
      message: `⚠️ Cuidado! Domínio suspeito (${hostname})`
    };
  }

  const isSafeDomain = urlData.safeDomains.some(domain => lowerCaseHostname.includes(domain.toLowerCase()));

  if (isSafeDomain) {
    if (isHttps) {
      return {
        isSafe: true,
        message: `✅ Seguro! Domínio confiável (${hostname})`
      };
    } else {
      return {
        isSafe: false,
        message: `⚠️ Atenção: Domínio confiável (${hostname}) mas não usa HTTPS`
      };
    }
  }

  return {
    isSafe: isHttps,
    message: isHttps ?
      "🔍 Parece seguro (HTTPS ativado)" :
      "⚠️ Atenção: Site não usa HTTPS"
  };
}
// VERIFICADOR DE URL - Fim

function sair() {
  window.location.href = "index.html"; // ou "login.html" quando tiver
}

document.addEventListener('DOMContentLoaded', loadCarousel);