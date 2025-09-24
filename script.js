document.addEventListener('DOMContentLoaded', () => {

    // --- SELEÇÃO DE ELEMENTOS DO DOM ---
    const header = document.getElementById("header");
    const contadorDisplay = document.getElementById("contador");
    const listaPessoasDisplay = document.getElementById("listaPessoas");
    const estadoVazioDisplay = document.getElementById("estadoVazio");
    const overlay = document.getElementById("overlay");
    const toastContainer = document.getElementById("toastContainer");
    const tituloPrincipal = document.getElementById('tituloPrincipal');
    const subtituloListaAtual = document.getElementById('subtituloListaAtual');

    // Botões
    const botaoIncrementar = document.getElementById("botaoIncrementar");
    const botaoDecrementar = document.getElementById("botaoDecrementar");
    const botaoLimparTudo = document.getElementById("botaoLimparTudo");
    const botaoAchievements = document.getElementById("botaoAchievements");
    const botaoVerListas = document.getElementById('botaoVerListas');

    // Modais e seus conteúdos
    const todosOsModais = document.querySelectorAll('.modal-container');
    const modalLimparTudo = document.getElementById("modalLimparTudo");
    const botaoConfirmarLimpeza = document.getElementById("botaoConfirmarLimpeza");

    const modalAdicionar = document.getElementById("modalAdicionar");
    const modalAdicionarTitulo = document.getElementById('modalAdicionarTitulo');
    const containerAvaliacao = document.getElementById('containerAvaliacao');
    const modalAdicionarCard = modalAdicionar.querySelector(".modal");
    const botaoConfirmarAdicao = document.getElementById("botaoConfirmarAdicao");
    const inputNome = document.getElementById("inputNome");
    const containerEmojis = document.getElementById("containerEmojis");

    const modalStats = document.getElementById("modalStats");
    const statsTotal = document.getElementById("statsTotal");
    const statsRatingContainer = document.getElementById('statsRatingContainer');

    const modalAchievements = document.getElementById("modalAchievements");
    const listaAchievementsDisplay = document.getElementById("listaAchievements");
    
    const modalListas = document.getElementById('modalListas');
    const gerenciadorDeListas = document.getElementById('gerenciadorDeListas');
    const botaoAbrirModalCriarLista = document.getElementById('botaoAbrirModalCriarLista');

    const modalCriarLista = document.getElementById('modalCriarLista');
    const inputNomeLista = document.getElementById('inputNomeLista');
    const inputEmojiLista = document.getElementById('inputEmojiLista');
    const botaoSalvarNovaLista = document.getElementById('botaoSalvarNovaLista');

    // --- ESTRUTURA DE DADOS PRINCIPAL ---
    let appData = {};
    const ratingEmojiMap = { ruim: '🤮', bom: '😊', denovo: '😍', fogo: '🔥' };

    const inicializarDados = () => {
        const dadosSalvos = JSON.parse(localStorage.getItem('lollipopData'));
        const dadosAntigos = JSON.parse(localStorage.getItem('pessoas'));

        if (dadosSalvos) {
            appData = dadosSalvos;
            // Garante que novas conquistas sejam adicionadas ao estado salvo
            for (const key in masterAchievements) {
                if (!appData.achievements.hasOwnProperty(key)) {
                    appData.achievements[key] = masterAchievements[key];
                }
            }
        } else {
            appData = {
                currentListId: 'beijos',
                achievements: JSON.parse(JSON.stringify(masterAchievements)),
                lists: {
                    'beijos': { id: 'beijos', title: 'Beijos', emoji: '🍭', entries: dadosAntigos || [], ratingsEnabled: true }
                }
            };
        }
        if (dadosAntigos) {
            localStorage.removeItem('pessoas');
            localStorage.removeItem('achievements');
        }
        saveData();
    };

    const saveData = () => {
        localStorage.setItem('lollipopData', JSON.stringify(appData));
    };


    // --- LÓGICA DE CONQUISTAS ---
    const masterAchievements = {
        first_entry: { title: 'Quebra-Gelo', description: 'Você adicionou sua primeira pessoa!', icon: '🧊', unlocked: false },
        reach_10: { title: 'Popular', description: 'Atingiu 10 pessoas na lista!', icon: '🎉', unlocked: false },
        reach_25: { title: 'Ícone Local', description: 'Atingiu 25 pessoas na lista!', icon: '🌟', unlocked: false },
        all_ratings: { title: 'Crítico Experiente', description: 'Usou todas as avaliações.', icon: '🧐', unlocked: false },
        three_fire: { title: 'Pegando Fogo!', description: 'Registrou 3x seguidas com 🔥.', icon: '🥵', unlocked: false },
        organizer: { title: 'Organizador(a)', description: 'Criou sua primeira lista personalizada.', icon: '🗂️', unlocked: false },
        time_capsule: { title: 'Cápsula do Tempo', description: 'Possui um registro de mais de um ano.', icon: '⏳', unlocked: false },
        cupids_arrow: { title: 'Flecha do Cupido', description: 'Adicionou alguém no Dia dos Namorados.', icon: '💘', unlocked: false },
    };

    const showToast = (id) => {
        const achievement = masterAchievements[id];
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon">${achievement.icon}</span><div class="toast-details"><h4>${achievement.title}</h4><p>Conquista desbloqueada!</p></div>`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    };
    
    const checkAchievements = () => {
        const achievements = appData.achievements;
        const beijos = appData.lists.beijos.entries;
        let achievementUnlocked = false;

        const unlock = (id) => {
            if (!achievements[id].unlocked) {
                achievements[id].unlocked = true;
                showToast(id);
                achievementUnlocked = true;
            }
        };

        if (beijos.length >= 1) unlock('first_entry');
        if (beijos.length >= 10) unlock('reach_10');
        if (beijos.length >= 25) unlock('reach_25');

        const ratingsUsed = new Set(beijos.map(p => p.rating));
        if (ratingsUsed.size === Object.keys(ratingEmojiMap).length) unlock('all_ratings');
        
        if (beijos.length >= 3 && beijos.slice(-3).every(p => p.rating === 'fogo')) unlock('three_fire');
        
        if (beijos.length > 0) {
            const umAnoEmMs = 365 * 24 * 60 * 60 * 1000;
            const agora = Date.now();
            if ([...beijos].sort((a,b) => a.id - b.id)[0].id < (agora - umAnoEmMs)) {
                unlock('time_capsule');
            }
        }
        
        const hoje = new Date();
        if (hoje.getMonth() === 1 && hoje.getDate() === 14) unlock('cupids_arrow');
        
        if(achievementUnlocked) saveData();
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    const renderizar = () => {
        const currentList = appData.lists[appData.currentListId];
        const entries = currentList.entries;
        
        tituloPrincipal.innerHTML = '<span>L</span>ollipop';
        subtituloListaAtual.innerText = currentList.title;

        contadorDisplay.innerText = entries.length;
        listaPessoasDisplay.innerHTML = '';
        if (entries.length === 0) {
            estadoVazioDisplay.style.display = 'block';
            listaPessoasDisplay.style.display = 'none';
            return;
        }
        estadoVazioDisplay.style.display = 'none';
        listaPessoasDisplay.style.display = 'block';

        const grupos = {};
        [...entries].sort((a, b) => b.id - a.id).forEach(entry => {
            const data = new Date(entry.id);
            const chave = `${data.getFullYear()}-${data.getMonth()}`;
            if (!grupos[chave]) grupos[chave] = [];
            grupos[chave].push(entry);
        });

        for (const chave in grupos) {
            const [ano, mes] = chave.split('-');
            const nomeMes = new Date(ano, mes).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
            const headerItem = document.createElement('li');
            headerItem.className = 'lista-group-header';
            headerItem.textContent = nomeMes;
            listaPessoasDisplay.appendChild(headerItem);
            
            grupos[chave].forEach(entry => {
                const item = document.createElement('li');
                item.className = 'lista-item';
                item.dataset.id = entry.id;
                const emojiHtml = currentList.ratingsEnabled ? `<span class="lista-item-emoji">${ratingEmojiMap[entry.rating] || ''}</span>` : '';
                item.innerHTML = `${emojiHtml}<p class="lista-item-nome">${entry.name}</p><p class="lista-item-data">${entry.date}</p><button class="botao-deletar-item" title="Deletar ${entry.name}">🗑️</button>`;
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
        const opcoes = { particleCount: 100, spread: 70, origin: { y: 0.6 } };
        if (rating === 'ruim') opcoes.colors = ['#5C4033', '#6A5141', '#856D4D', '#3D2B1F'];
        else if (rating === 'denovo') opcoes.colors = ['#ff69b4', '#ff1493', '#c71585', '#db7093'];
        else if (rating === 'fogo') {
            opcoes.colors = ['#ff4d00', '#ff7d00', '#ff0000', '#ffd700'];
            opcoes.particleCount = 150;
            opcoes.spread = 100;
        } else if (rating === 'bom') opcoes.colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42'];
        confetti(opcoes);
    };

    // --- LÓGICA DE EVENTOS ---
    
    botaoIncrementar.addEventListener('click', () => {
        const currentList = appData.lists[appData.currentListId];
        inputNome.value = '';
        ratingSelecionado = null;
        modalAdicionarTitulo.innerText = `Adicionar em ${currentList.title}`;
        containerAvaliacao.style.display = currentList.ratingsEnabled ? 'block' : 'none';
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
            if (ratingSelecionado === 'fogo') modalAdicionarCard.classList.add('modal-fire-effect');
        }
    });

    botaoConfirmarAdicao.addEventListener('click', () => {
        const nome = inputNome.value.trim();
        const currentList = appData.lists[appData.currentListId];
        if (nome && (!currentList.ratingsEnabled || ratingSelecionado)) {
            const novoItem = { id: Date.now(), name: nome, rating: currentList.ratingsEnabled ? ratingSelecionado : null, date: new Date().toLocaleDateString('pt-BR') };
            currentList.entries.push(novoItem);
            if (currentList.id === 'beijos') checkAchievements();
            saveData();
            renderizar();
            toggleModal(modalAdicionar, false);
            if(currentList.ratingsEnabled) dispararAnimacao(ratingSelecionado);
        } else if (!nome) alert('Por favor, digite um nome.');
        else if (currentList.ratingsEnabled && !ratingSelecionado) alert('Por favor, escolha uma avaliação.');
    });

    botaoDecrementar.addEventListener('click', () => {
        const entries = appData.lists[appData.currentListId].entries;
        if (entries.length > 0 && confirm(`Tem certeza que deseja remover "${entries[entries.length - 1].name}"?`)) {
            entries.pop();
            saveData();
            renderizar();
        }
    });

    listaPessoasDisplay.addEventListener('click', (e) => {
        if (e.target.classList.contains('botao-deletar-item')) {
            const item = e.target.closest('.lista-item');
            const entryId = Number(item.dataset.id);
            const currentList = appData.lists[appData.currentListId];
            const entry = currentList.entries.find(p => p.id === entryId);
            if(confirm(`Tem certeza que deseja remover "${entry.name}"?`)){
                currentList.entries = currentList.entries.filter(p => p.id !== entryId);
                saveData();
                renderizar();
            }
        }
    });

    botaoLimparTudo.addEventListener('click', () => {
        if (appData.lists[appData.currentListId].entries.length > 0) toggleModal(modalLimparTudo, true);
        else alert("A lista já está vazia!");
    });
    
    botaoConfirmarLimpeza.addEventListener('click', () => {
        appData.lists[appData.currentListId].entries = [];
        saveData();
        renderizar();
        toggleModal(modalLimparTudo, false);
    });

    contadorDisplay.addEventListener('click', () => {
        const currentList = appData.lists[appData.currentListId];
        statsTotal.innerText = currentList.entries.length;
        statsRatingContainer.style.display = currentList.ratingsEnabled ? 'flex' : 'none';
        if (currentList.ratingsEnabled) {
            document.querySelectorAll('#statsRatingContainer strong').forEach(el => el.innerText = 0);
            currentList.entries.forEach(entry => {
                const ratingKey = entry.rating.charAt(0).toUpperCase() + entry.rating.slice(1);
                const ratingEl = document.getElementById(`stats${ratingKey}`);
                if(ratingEl) ratingEl.innerText = parseInt(ratingEl.innerText) + 1;
            });
        }
        toggleModal(modalStats, true);
    });

    botaoAchievements.addEventListener('click', () => {
        listaAchievementsDisplay.innerHTML = '';
        for (const id in masterAchievements) {
            const achievement = appData.achievements[id];
            const item = document.createElement('li');
            item.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
            item.innerHTML = `<span class="achievement-icon">${masterAchievements[id].icon}</span><div class="achievement-details"><h4>${achievement.title}</h4><p>${masterAchievements[id].description}</p></div>`;
            listaAchievementsDisplay.appendChild(item);
        }
        toggleModal(modalAchievements, true);
    });

    botaoVerListas.addEventListener('click', () => {
        gerenciadorDeListas.innerHTML = '';
        for (const id in appData.lists) {
            const lista = appData.lists[id];
            const item = document.createElement('li');
            item.className = `list-manager-item ${id === appData.currentListId ? 'active' : ''}`;
            item.dataset.id = id;
            item.innerHTML = `<span class="achievement-icon">${lista.emoji}</span><div class="list-manager-details"><h4>${lista.title}</h4></div>`;
            if (id !== 'beijos') {
                item.innerHTML += `<button class="botao-deletar-lista" title="Deletar lista">🗑️</button>`;
            }
            gerenciadorDeListas.appendChild(item);
        }
        toggleModal(modalListas, true);
    });

    gerenciadorDeListas.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('botao-deletar-lista')) {
            e.stopPropagation();
            const listId = target.closest('.list-manager-item').dataset.id;
            if (confirm(`Tem certeza que deseja apagar a lista "${appData.lists[listId].title}"? Isso não pode ser desfeito.`)) {
                delete appData.lists[listId];
                if (appData.currentListId === listId) {
                    appData.currentListId = 'beijos';
                }
                saveData();
                renderizar();
                target.closest('.list-manager-item').remove();
            }
        } else if (target.closest('.list-manager-item')) {
            const listId = target.closest('.list-manager-item').dataset.id;
            appData.currentListId = listId;
            saveData();
            renderizar();
            toggleModal(modalListas, false);
        }
    });
    
    botaoAbrirModalCriarLista.addEventListener('click', () => {
        inputNomeLista.value = '';
        inputEmojiLista.value = '';
        toggleModal(modalListas, false);
        toggleModal(modalCriarLista, true);
    });

    botaoSalvarNovaLista.addEventListener('click', () => {
        const nome = inputNomeLista.value.trim();
        const emoji = inputEmojiLista.value.trim();
        if (nome && emoji) {
            const novoId = `lista_${Date.now()}`;
            appData.lists[novoId] = { id: novoId, title: nome, emoji: emoji, entries: [], ratingsEnabled: false };
            if (!appData.achievements.organizer.unlocked) {
                appData.achievements.organizer.unlocked = true;
                showToast('organizer');
            }
            saveData();
            toggleModal(modalCriarLista, false);
            botaoVerListas.click();
        } else alert('Por favor, preencha o nome e o emoji.');
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) header.classList.add('header-shrink');
        else header.classList.remove('header-shrink');
    });

    document.querySelectorAll('.modal-container').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-fechar-button') || e.target.classList.contains('cancel')) {
                toggleModal(modal, false);
            }
        });
    });
    overlay.addEventListener('click', () => todosOsModais.forEach(m => toggleModal(m, false)));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') todosOsModais.forEach(m => toggleModal(m, false)); });

    // --- INICIALIZAÇÃO ---
    inicializarDados();
    renderizar();
});