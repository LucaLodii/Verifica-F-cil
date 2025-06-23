document.addEventListener('DOMContentLoaded', function () {
    const sintetizador = window.speechSynthesis;
    let utterance = null;
    let leituraAtual = null;

    document.querySelectorAll('.leitura-btn.btn-ler').forEach(botaoLer => {
        botaoLer.addEventListener('click', function () {
            // Tenta encontrar a div com texto (pode ser .conteudo ou .custom-section)
            const bloco = this.closest('.conteudo') || this.closest('.custom-section');
            const pararBtn = bloco.querySelector('.leitura-btn.btn-parar');

            // Pega o texto do card-body, se existir, senão pega do bloco todo
            const textoContainer = bloco.querySelector('.card-body') || bloco;
            const texto = textoContainer.innerText || textoContainer.textContent;

            sintetizador.cancel();

            if (!texto.trim()) {
                alert('Esse bloco está vazio!');
                return;
            }

            utterance = new SpeechSynthesisUtterance(texto);
            utterance.lang = 'pt-BR';
            utterance.rate = 1;
            utterance.pitch = 1;

            utterance.onstart = () => {
                botaoLer.disabled = true;
                pararBtn.disabled = false;
                bloco.classList.add('lendo');
                leituraAtual = bloco;
            };

            utterance.onend = utterance.onerror = () => {
                botaoLer.disabled = false;
                pararBtn.disabled = true;
                bloco.classList.remove('lendo');
                leituraAtual = null;
            };

            sintetizador.speak(utterance);
        });
    });

    document.querySelectorAll('.btn-parar').forEach(botaoParar => {
        botaoParar.addEventListener('click', function () {
            sintetizador.cancel();
            const bloco = this.closest('.conteudo') || this.closest('.custom-section');
            const lerBtn = bloco.querySelector('.btn-ler');

            lerBtn.disabled = false;
            this.disabled = true;
            bloco.classList.remove('lendo');
        });
    });
});
