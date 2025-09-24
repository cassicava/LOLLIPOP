document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const header = document.getElementById("header");
    const contadorDisplay = document.getElementById("contador");
    const listaPessoasDisplay = document.getElementById("listaPessoas");
    const estadoVazioDisplay = document.getElementById("estadoVazio");
    const overlay = document.getElementById("overlay");

    // Botões Principais
    const botaoIncrementar = document.getElementById("botaoIncrementar");
    const botaoDecrementar = document.getElementById("botaoDecrementar");
    const botaoLimparTudo = document.getElementById("botaoLimparTudo");

    // Modal Limpar Tudo
    const modalLimparTudo = document.getElementById("modalLimparTudo");
    const botaoConfirmarLimpeza = document.getElementById("botaoConfirmarLimpeza");
    const botaoCancelarLimpeza = document.getElementById("botaoCancelarLimpeza");

    // Modal Adicionar
    const modalAdicionar = document.getElementById("modalAdicionar");
    const modalAdicionarCard = modalAdicionar.querySelector(".modal");
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
    const statsFogo = document.getElementById("statsFogo");

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
                    denovo: '😍',
                    fogo: '🔥'
                };

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
            opcoes.colors = ['#5C4033', '#6A5141', '#856D4D', '#3D2B1F'];
        } else if (rating === 'denovo') {
            opcoes.colors = ['#ff69b4', '#ff1493', '#c71585', '#db7093'];
        } else if (rating === 'fogo') {
            opcoes.colors = ['#ff4d00', '#ff7d00', '#ff0000', '#ffd700'];
            opcoes.particleCount = 150;
            opcoes.spread = 100;
        } else if (rating === 'bom') {
            opcoes.colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42'];
        }

        confetti(opcoes);
    };

    // --- LÓGICA DE ADICIONAR PESSOA ---
    botaoIncrementar.addEventListener('click', () => {
        inputNome.value = '';
        ratingSelecionado = null;
        document.querySelectorAll('.emoji').forEach(e => e.classList.remove('selected'));
        modalAdicionarCard.classList.remove('modal-fire-effect');
        toggleModal(modalAdicionar, true);
        inputNome.focus();
    });
    
    containerEmojis.addEventListener('click', (e) => {
        if (e.target.classList.contains('emoji')) {
            modalAdicionarCard.classList.remove('modal-fire-effect');
            document.querySelectorAll('.emoji').forEach(el => el.classList.remove('selected'));
            
            e.target.classList.add('selected');
            ratingSelecionado = e.target.dataset.rating;

            if (ratingSelecionado === 'fogo') {
                modalAdicionarCard.classList.add('modal-fire-effect');
            }
        }
    });

    botaoConfirmarAdicao.addEventListener('click', () => {
        const nome = inputNome.value.trim();
        if (nome && ratingSelecionado) {
            const novaPessoa = {
                id: Date.now(),
                name: nome,
                rating: ratingSelecionado,
                date: new Date().toLocaleDateString('pt-BR')
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
        statsFogo.innerText = pessoas.filter(p => p.rating === 'fogo').length;
    };

    contadorDisplay.addEventListener('click', () => {
        calcularStats();
        toggleModal(modalStats, true);
    });

    botaoFecharStats.addEventListener('click', () => toggleModal(modalStats, false));
    
    // --- LÓGICA DO HEADER DINÂMICO ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            header.classList.add('header-shrink');
        } else {
            header.classList.remove('header-shrink');
        }
    });

    // --- LÓGICA GERAL DE MODAIS ---
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