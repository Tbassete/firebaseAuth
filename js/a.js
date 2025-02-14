dbRefUsers.child('tasks')
  .once('value')
  .then((snapshot) => {
    const allBooks = snapshot.val();
    const filteredBooks = [];
    const userId = firebase.auth().currentUser.uid; // Obtém o ID do usuário logado

    for (const key in allBooks) {
      const book = allBooks[key];
      const rentalHistory = book.rentalHistory;

      // Verifica se o usuário já leu o livro ou se ele é o doador
      let hasRead = false;
      let isDonor = book.donatedById === userId; // Verifica se é o doador

      if (rentalHistory && typeof rentalHistory === 'object') {
        for (const historyKey in rentalHistory) {
          const rentalEntry = rentalHistory[historyKey];

          if (rentalEntry.rentedById === userId) {
            hasRead = true;
            break; // Sai do loop interno, pois já encontrou o userId
          }
        }
      }

      // Se o usuário já leu ou é o doador, adiciona à lista
      if (hasRead || isDonor) {
        filteredBooks.push({ ...book, key });
      }
    }

    // Agora, para cada livro filtrado, cria o card e os botões
    filteredBooks.forEach((book) => {
      const card = document.createElement('div');
      card.classList.add('book-card');
      card.innerHTML = `<h3>${book.title}</h3>`;

      // Criar botão para exibir resenhas
      const btnMostrarResenhas = document.createElement('button');
      btnMostrarResenhas.textContent = 'Mostrar Resenhas';
      btnMostrarResenhas.setAttribute('class', 'btn-mostrar-resenhas');
      card.appendChild(btnMostrarResenhas);

      // Criar a div das resenhas (inicialmente oculta)
      const resenhasContainer = document.createElement('div');
      resenhasContainer.setAttribute('class', 'resenhaDiv');
      resenhasContainer.setAttribute('id', `resenhasContainer-${book.key}`);
      resenhasContainer.style.display = 'none';
      card.appendChild(resenhasContainer);

      // Criar botão de postar resenha (se for elegível)
      if (hasRead || isDonor) {
        const btnPostarResenha = document.createElement('button');
        btnPostarResenha.textContent = 'Postar Resenha';
        btnPostarResenha.setAttribute('class', 'btn-postar-resenha');
        btnPostarResenha.addEventListener('click', () => {
          postarResenha(book.key);
        });
        card.appendChild(btnPostarResenha);
      }

      // Evento de clique para carregar as resenhas
      btnMostrarResenhas.addEventListener('click', () => {
        resenhasContainer.style.display = 'block';

        // Verifica se já carregou para evitar requisições duplicadas
        if (resenhasContainer.children.length > 0) return;

        dbRefUsers.child(`tasks/${book.key}/resenhas`).once('value')
          .then(snapshot => {
            if (snapshot.exists() && snapshot.hasChildren()) {
              snapshot.forEach(childSnapshot => {
                const resenhaData = childSnapshot.val();

                const resenhaDiv = document.createElement('div');
                resenhaDiv.classList.add('resenha-item');

                resenhaDiv.innerHTML = `
                  <div class="resenha-header">
                    <img src="${resenhaData.resenhaByImg}" alt="User Image" class="resenha-avatar">
                    <strong>${resenhaData.resenhaBy}</strong>
                    <span class="resenha-date">${new Date(resenhaData.resenhaAt).toLocaleString()}</span>
                  </div>
                  <p class="resenha-text">${resenhaData.resenha}</p>`;

                resenhasContainer.appendChild(resenhaDiv);
              });
            } else {
              resenhasContainer.innerHTML = `<p>Sem resenhas disponíveis.</p>`;
            }
          })
          .catch(error => {
            console.error('Erro ao carregar resenhas:', error);
          });
      });

      // Adiciona o card ao container principal
      document.getElementById('bookContainer').appendChild(card);
    });
  })
  .catch((error) => {
    console.error('Erro ao carregar livros:', error);
  });

// Função para postar resenha (exemplo)
function postarResenha(bookKey) {
  const resenhaTexto = prompt('Digite sua resenha:');
  if (resenhaTexto) {
    const novaResenha = {
      resenha: resenhaTexto,
      resenhaBy: userName, // Pegando o nome do usuário
      resenhaByImg: userImage, // Pegando a imagem do usuário
      resenhaAt: Date.now(),
    };

    dbRefUsers.child(`tasks/${bookKey}/resenhas`).push(novaResenha)
      .then(() => {
        alert('Resenha postada com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao postar resenha:', error);
      });
  }
}
