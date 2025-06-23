document.addEventListener('DOMContentLoaded', function () {
  // Busca dados de assuntos de fake news da API local.
  fetch('http://localhost:3000/fakeNewsAssuntos') 
    .then(response => response.json()) // Converte a resposta para JSON.
    .then(data => {
      // Extrai categorias e quantidades dos dados recebidos.
      const categorias = data.map(item => item.categoria);
      const quantidades = data.map(item => item.quantidade);

      // Obtém o contexto 2D do canvas para renderização do gráfico.
      const ctx = document.getElementById('fakeNewsChart').getContext('2d');
      
      // Cria uma nova instância do gráfico Doughnut (rosca).
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: categorias, // Rótulos do gráfico (categorias).
          datasets: [{
            data: quantidades, // Dados a serem exibidos no gráfico.
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
              '#FF9F40', '#8AC24A', '#607D8B', '#E91E63', '#2196F3'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true, // Torna o gráfico responsivo ao tamanho do container.
          maintainAspectRatio: false, // Permite que a altura do gráfico seja independente da largura.
          plugins: {
            legend: {
              position: 'right', // Posição da legenda.
              labels: {
                boxWidth: 12 // Largura das caixas de cor na legenda.
              }
            },
            tooltip: {
              callbacks: {
                // Formata o texto da tooltip ao passar o mouse sobre as fatias.
                label: function (context) {
                  return `${context.label}: ${context.raw} ocorrências`;
                }
              }
            }
          }
        }
      });
    })
    .catch(error => {
      // Em caso de erro no carregamento ou processamento dos dados, exibe uma mensagem.
      console.error('Erro ao carregar dados:', error);
      document.getElementById('fakeNewsChart').closest('.card').innerHTML =
        '<p class="p-3 text-danger">Erro ao carregar dados do gráfico</p>';
    });
});