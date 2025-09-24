document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const contadorDisplay = document.getElementById("contador");
    const listaPessoasDisplay = document.getElementById("listaPessoas");
    const estadoVazioDisplay = document.getElementById("estadoVazio");
    const overlay = document.getElementById("overlay");

    // Botões Principais
    const botaoIncrementar = document.getElementById("botaoIncrementar");
    const botaoDecrementar = document.getElementById("botaoDecrementar");
    const botaoLimparTudo = document.getElementById("botaoLimparTudo");
    const botaoStats = document.getElementById("botaoStats");

    // Modal Limpar Tudo
    const modalLimparTudo = document.getElementById("modalLimparTudo");
    const botaoConfirmarLimpeza = document.getElementById("botaoConfirmarLimpeza");
    const botaoCancelarLimpeza = document.getElementById("botaoCancelarLimpeza");

    // Modal Adicionar
    const modalAdicionar = document.getElementById("modalAdicionar");
    const botaoConfirmarAdicao = document.getElementById("botaoConfirmarAdicao");
    const botaoCancelarAdicao = document.getElementById("botaoCancelarAdicao");
    const inputNome = document.getElementById("inputNome");
    const containerEmojis = document.getElementById("containerEmojis");

    // Modal Stats
    const modalStats = document.getElementById("modalStats");
    const botaoFecharStats = document.getElementById("botaoFecharStats");
    const statsTotal = document.getElementById("statsTotal");
    const statsRuim = document.getElementById("statsRuim");
    const statsBom = document.getElementById("statsBom");
    const statsDenovo = document.getElementById("statsDenovo");

    // --- ESTADO DA APLICAÇÃO ---
    let pessoas = JSON.parse(localStorage.getItem('pessoas')) || [];
    let ratingSelecionado = null;

    // --- FUNÇÕES ---

    const salvarEstado = () => {
        localStorage.setItem('pessoas', JSON.stringify(pessoas));
    };

    const renderizar = () => {
        listaPessoasDisplay.innerHTML = '';
        contadorDisplay.innerText = pessoas.length;

        if (pessoas.length === 0) {
            estadoVazioDisplay.style.display = 'block';
            listaPessoasDisplay.style.display = 'none';
        } else {
            estadoVazioDisplay.style.display = 'none';
            listaPessoasDisplay.style.display = 'block';

            pessoas.forEach(pessoa => {
                const item = document.createElement('li');
                item.className = 'lista-item';
                item.dataset.id = pessoa.id;

                const ratingEmojiMap = {
                    ruim: '🤮',
                    bom: '😊',
                    denovo: '😍'
                };

                // Novo layout: Emoji - Nome - Data - Lixeira
                item.innerHTML = `
                    <span class="lista-item-emoji">${ratingEmojiMap[pessoa.rating] || ''}</span>
                    <p class="lista-item-nome">${pessoa.name}</p>
                    <p class="lista-item-data">${pessoa.date}</p>
                    <button class="botao-deletar-item" title="Deletar ${pessoa.name}">🗑️</button>
                `;
                listaPessoasDisplay.appendChild(item);
            });
        }
    };

    const toggleModal = (modal, mostrar) => {
        if (mostrar) {
            overlay.classList.add('visible');
            modal.classList.add('visible');
        } else {
            overlay.classList.remove('visible');
            modal.classList.remove('visible');
        }
    };

    const dispararAnimacao = (rating) => {
        const opcoes = {
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        };

        if (rating === 'ruim') {
            opcoes.colors = ['#5C4033', '#6A5141', '#856D4D', '#3D2B1F']; // Tons de marrom/verde escuro
        } else if (rating === 'denovo') {
            opcoes.colors = ['#ff69b4', '#ff1493', '#c71585', '#db7093']; // Tons de rosa/vermelho
        }
        // Se for 'bom', usa as cores padrão do confete

        confetti(opcoes);
    };

    // --- LÓGICA DE ADICIONAR PESSOA ---
    botaoIncrementar.addEventListener('click', () => {
        inputNome.value = '';
        ratingSelecionado = null;
        document.querySelectorAll('.emoji').forEach(e => e.classList.remove('selected'));
        toggleModal(modalAdicionar, true);
        inputNome.focus();
    });
    
    containerEmojis.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji')) {
            document.querySelectorAll('.emoji').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
            ratingSelecionado = e.target.dataset.rating;
        }
    });

    botaoConfirmarAdicao.addEventListener('click', () => {
        const nome = inputNome.value.trim();
        if (nome && ratingSelecionado) {
            const novaPessoa = {
                id: Date.now(),
                name: nome,
                rating: ratingSelecionado,
                date: new Date().toLocaleDateString('pt-BR') // Adiciona a data atual
            };
            pessoas.push(novaPessoa);
            salvarEstado();
            renderizar();
            toggleModal(modalAdicionar, false);
            dispararAnimacao(ratingSelecionado);
        } else if (!nome) {
            alert('Por favor, digite um nome.');
        } else if (!ratingSelecionado) {
            alert('Por favor, escolha uma avaliação.');
        }
    });

    botaoCancelarAdicao.addEventListener('click', () => toggleModal(modalAdicionar, false));

    // --- LÓGICA DE REMOVER PESSOA ---
    botaoDecrementar.addEventListener('click', () => {
        if (pessoas.length > 0) {
            if (confirm(`Tem certeza que deseja remover "${pessoas[pessoas.length - 1].name}"?`)) {
                pessoas.pop();
                salvarEstado();
                renderizar();
            }
        }
    });

    listaPessoasDisplay.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('botao-deletar-item')) {
            const item = target.closest('.lista-item');
            const pessoaId = Number(item.dataset.id);
            const pessoa = pessoas.find(p => p.id === pessoaId);
            if(confirm(`Tem certeza que deseja remover "${pessoa.name}"?`)){
                pessoas = pessoas.filter(p => p.id !== pessoaId);
                salvarEstado();
                renderizar();
            }
        }
    });

    // --- LÓGICA DE LIMPAR TUDO ---
    botaoLimparTudo.addEventListener('click', () => {
        if (pessoas.length > 0) {
            toggleModal(modalLimparTudo, true);
        } else {
            alert("A lista já está vazia!");
        }
    });
    
    botaoConfirmarLimpeza.addEventListener('click', () => {
        pessoas = [];
        salvarEstado();
        renderizar();
        toggleModal(modalLimparTudo, false);
    });

    botaoCancelarLimpeza.addEventListener('click', () => toggleModal(modalLimparTudo, false));

    // --- LÓGICA DE ESTATÍSTICAS ---
    const calcularStats = () => {
        statsTotal.innerText = pessoas.length;
        statsRuim.innerText = pessoas.filter(p => p.rating === 'ruim').length;
        statsBom.innerText = pessoas.filter(p => p.rating === 'bom').length;
        statsDenovo.innerText = pessoas.filter(p => p.rating === 'denovo').length;
    };

    botaoStats.addEventListener('click', () => {
        calcularStats();
        toggleModal(modalStats, true);
    });

    botaoFecharStats.addEventListener('click', () => toggleModal(modalStats, false));

    // Fechar modais com a tecla ESC ou clique no overlay
    const fecharModais = () => {
        toggleModal(modalLimparTudo, false);
        toggleModal(modalAdicionar, false);
        toggleModal(modalStats, false);
    };

    overlay.addEventListener('click', fecharModais);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModais();
        }
    });

    // --- INICIALIZAÇÃO ---
    renderizar();
});