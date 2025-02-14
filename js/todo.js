

// todoForm.onsubmit = function(event){
//     event.preventDefault()// evita o redirecionamento da pagina
//     if(todoForm.name.value != ''){
//         var data = {
//             name: todoForm.name.value
//         }
//         dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(function(){
//             console.log('tarefa:'+ data.name+' adicionada com sucesso' )
//         }).catch(function(error){
//             console.log(error)
//         })



//         todoForm.name.value = ''
//     }else{
//         alert('o nome da tarefa nao pode estar vazio')
//     }
// }

// 
// versao gpt
// 

todoForm.onsubmit = function(event) {
  event.preventDefault(); // Evita o redirecionamento da página
  const user = firebase.auth().currentUser;
  const userName = user.displayName;

  // Verifica se o nome do usuário está atualizado
  if (!userName) {
    alert('Por favor, atualize seu nome no perfil antes de doar um livro.');
    return; // Impede a doação se o nome não estiver atualizado
  }

  if (todoForm.name.value !== '') {
      var file = todoForm.file.files[0]; // Seleciona o primeiro arquivo da seleção de arquivos
      
      if (file) { // Verifica se o arquivo foi selecionado
          if (file.type.includes('image')) { // Verifica se o arquivo é uma imagem
              // Compõe o nome do arquivo
              var imgName = firebase.database().ref().push().key + '-' + file.name;
              // Compõe o caminho do arquivo
              var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName;
              // Cria uma referência de arquivo no caminho acima
              var storageRef = firebase.storage().ref(imgPath);
              // Inicia o processo de upload
              var upload = storageRef.put(file)

              trackUpload(upload).then(function() {
                storageRef.getDownloadURL().then(function(downloadURL) {
                  var data = {
                    imgUrl: downloadURL,
                    name: todoForm.name.value,
                    nameToLowerCase: todoForm.name.value.toLowerCase(),
                    Genero: todoForm.Genero.value,
                    userNameDoador: user.displayName,
                    userIdDoador: firebase.auth().currentUser.uid, // Adiciona o userId do usuário atual
                    photoUrlDoador: user.photoURL
                };

                // Insere a tarefa na referência 'tasks'
                dbRefUsers.child('tasks').push(data).then(function() {
                    console.log('Livro ' + data.name + ' adicionado com sucesso');
                }).catch(function(error) {
                    console.log('Erro ao adicionar o livro:', error);
                });

                todoForm.name.value = ''; 
                todoForm.file.value = '';
                }).catch(function(error) {
                  showError('Erro ao adicionar o livro', error);
                })
                
              });

          } else {
              console.log('O arquivo selecionado não é uma imagem');
          }
      } else {
          alert('O livro precisa de uma foto da capa');
      }
  } else {
      alert('O título do livro não pode estar vazio');
  }
};
//busca atraves do filtro 
function BuscarFiltro() {
  hideItem(pagination)
  const filtroGenero = document.getElementById('FiltroGeneros').value; // Obtém o gênero selecionado
  const userId = firebase.auth().currentUser.uid; // Obtém o ID do usuário atual
  
  dbRefUsers.child('tasks').once('value')
    .then((snapshot) => {
      const allBooks = snapshot.val();
      const filteredBooks = [];
      console.log("Dados brutos do Firebase:", allBooks);
      // Filtra os livros com base no gênero selecionado
      for (const key in allBooks) {
        const book = allBooks[key];
        if (book.Genero === filtroGenero) {
          filteredBooks.push({ ...book, key });
        }
      }
      
      // Exibe os livros filtrados
      ulTodoList.innerHTML = ''; // Limpa a lista antes de adicionar os livros filtrados
      let num = 0;
      if (filteredBooks.length > 0) {
        filteredBooks.forEach((book) => {
          const card = document.createElement('div');
          card.setAttribute('class', 'todo-card');
          card.setAttribute('id', book.key);

// Adiciona imagem do livro
      // Adiciona uma imagem padrão enquanto a imagem real é carregada
      const imgLi = document.createElement('img');
      const defaultImg = 'img/loading.gif'; // Caminho para sua imagem padrão
      imgLi.src = defaultImg; // Define a imagem padrão inicialmente
      imgLi.setAttribute('class', 'imgTodo');
      imgLi.setAttribute('id', `img-${book.key}`);

      // Troca para a imagem real após o carregamento
      const realImgUrl = book.imgUrl; // URL da imagem real
      const imgLoader = new Image(); // Cria um pré-carregador para a imagem real
      imgLoader.onload = function () {
        imgLi.src = realImgUrl; // Substitui a imagem padrão pela imagem real
      };
      imgLoader.onerror = function () {
        console.error(`Erro ao carregar a imagem: ${realImgUrl}`);
      };
      imgLoader.src = realImgUrl; // Inicia o carregamento da imagem real

      card.appendChild(imgLi);

          // Nome do livro
          const title = document.createElement('h3');
          title.textContent = book.name || 'Sem Título';
          card.appendChild(title);

          // Gênero do livro
          const genre = document.createElement('p');
          genre.textContent = 'Gênero: ' + (book.Genero || 'Indefinido');
          card.appendChild(genre);

          // Informações do doador
          var donorInfo = document.createElement('div');
          donorInfo.setAttribute('class', 'donor-info');
          
          // Nome do doador
          var donorName = document.createElement('p');
          donorName.textContent = 'Doado por: ' + (book.userNameDoador);
          donorInfo.appendChild(donorName);
          
          card.appendChild(donorInfo);
          
          // Disponibiliza os botões de edição somente para o admin
          if (userId === '60ATcph6xShfJB7wfqFxBIGaZp32') {
              const actions = document.createElement('div');
              actions.setAttribute('class', 'actions');

              // Botão de excluir
              const removeBtn = document.createElement('button');
              removeBtn.textContent = 'Excluir';
              removeBtn.setAttribute('onclick', `removeTodo("${book.key}")`);
              removeBtn.setAttribute('class', 'danger');
              actions.appendChild(removeBtn);

              // Botão de editar
              const updateBtn = document.createElement('button');
              updateBtn.textContent = 'Editar';
              updateBtn.setAttribute('onclick', `updateTodo("${book.key}")`);
              updateBtn.setAttribute('class', 'alternative');
              actions.appendChild(updateBtn);

              card.appendChild(actions);
          }

          // Verifica se o livro está alugado
          dbRefUsers.child(`tasks/${book.key}/currentRental`).once('value')
              .then(snapshot => {
                  const rental = snapshot.val();

                  if (rental) {
                      // Mostra quem está alugando
                      const rentedBy = document.createElement('p');
                      rentedBy.textContent = `Reservado no momento por: ${rental.rentedBy}`;
                      card.appendChild(rentedBy); // Exibe diretamente no card

                      // Se o usuário atual alugou o livro, mostra o botão de devolver
                      if (rental.rentedById === userId) {
                          const returnBtn = document.createElement('button');
                          returnBtn.textContent = 'Devolver';
                          returnBtn.setAttribute('onclick', `returnBook("${book.key}")`);
                          returnBtn.setAttribute('class', 'return');
                          card.appendChild(returnBtn); // Exibe o botão de devolver diretamente no card
                      }
                  } else {
                      // Se não estiver alugado, mostra o botão de alugar
                      const rentBtn = document.createElement('button');
                      rentBtn.textContent = 'Alugar';
                      rentBtn.setAttribute('onclick', `rentBook("${book.key}", "${book.name}")`);
                      rentBtn.setAttribute('class', 'rent');
                      card.appendChild(rentBtn); // Exibe o botão de alugar diretamente no card
                  }
              })
              .catch(error => {
                  console.error('Erro ao verificar o status de aluguel:', error);
              });

          ulTodoList.appendChild(card);
          num++;
        });
        todoCount.innerHTML = `${num} ${num > 1 ? 'Livros' : 'Livro'} exibidos nesta página.`;
      } else {
        ulTodoList.innerHTML = 'Nenhum livro encontrado para esse gênero.';
      }
    })
    .catch((error) => {
      console.error('Erro ao buscar livros:', error);
    });
}






// rastreia o progresso de upload


function trackUpload(upload){
  return new Promise(function(resolve, reject){
    showItem(progressFeedback)
    upload.on('state_changed', 
      function (snapshot){//segundo arumento recebe informações sobre o upload
        progress.value = snapshot.bytesTransferred / snapshot.totalBytes * 100 
      }, function(error){//terceiro argumento executa em caso de erro no upload
        hideItem(progressFeedback)
        reject(error)
      },function(){//quarto argumento que executa em caso de sucesso do upload
        console.log('sucesso no upload')
        hideItem(progressFeedback)
        resolve()
      })
  
   var playPauseUpload = true // estado de controle do upload (pausado ou em andamento)
   playPauseBtn.onclick = function(){
    playPauseUpload = !playPauseUpload // inverte o estado de controle do botao
  
    if(playPauseUpload){
      upload.resume()
      playPauseBtn.innerHTML='Pausar'
      console.log('upload retomado')
    }else{
      upload.pause()
      playPauseBtn.innerHTML ='Continuar'
      console.log('upload pausado')
    }
   }
   cancelBtn.onclick = function(){
    upload.cancel()
    hideItem(progressFeedback)
   } 
  })   
}

// 
//testes
// 
let currentPage = 0; // Variável global para controlar a página atual
const itemsPerPage = 9; // Itens por página
let tasks = []; // Array global para armazenar as tarefas

function fillTodoList(tasks) {
  if (!Array.isArray(tasks)) {
    console.error('O parâmetro "tasks" precisa ser um array válido.');
    return;
  }

  // Limpar a lista de tarefas
  ulTodoList.innerHTML = '';
  let num = 0;

  // Cálculo dos índices para a paginação
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const tasksToShow = tasks.slice(startIndex, endIndex);

  if (tasksToShow.length > 0) {
    tasksToShow.forEach(function (task) {
      // Criação do contêiner do card
      const card = document.createElement('div');
      card.setAttribute('class', 'todo-card');
      // card.setAttribute('id', task.key);

      

// Criar botão para exibir resenhas
const btnMostrarResenhas = document.createElement('button');
btnMostrarResenhas.textContent = 'Mostrar Resenhas';
btnMostrarResenhas.setAttribute('class', 'btn-mostrar-resenhas');
card.appendChild(btnMostrarResenhas);

// Criar a div das resenhas (inicialmente vazia e oculta)
const resenhasContainer = document.createElement('div');
resenhasContainer.setAttribute('class', 'resenhaDiv');
resenhasContainer.setAttribute('id', 'resenhasContainer');
resenhasContainer.style.display = 'none'; // Oculta a div inicialmente
card.appendChild(resenhasContainer);

// Evento de clique para carregar as resenhas
btnMostrarResenhas.addEventListener('click', () => {
  // Exibe a div ao clicar
  resenhasContainer.style.display = 'block';

  // Verifica se já carregou para evitar requisições duplicadas
  if (resenhasContainer.children.length > 0) return;

  // Consultar o banco de dados
  dbRefUsers.child(`tasks/${task.key}/resenhas`).once('value')
    .then(snapshot => {
      if (snapshot.exists() && snapshot.hasChildren()) { 
        snapshot.forEach(snapshot => {

          const allBooks = snapshot.val();
          const filteredBooks = [];
          const userId = firebase.auth().currentUser.uid; // Obtém o ID do usuário logado
      
          // for (const key in allBooks) {
          //   const book = allBooks[key];
          //   const rentalHistory = book.rentalHistory;
      
          //   // Verifica se o usuário já leu o livro ou se ele é o doador
          //   var hasRead = true;
          //   var isDonor = book.donatedById === userId; // Verifica se é o doador
          //   var isDonorOK =true
          //   // if (rentalHistory && typeof rentalHistory === 'object') {
          //   //   for (const historyKey in rentalHistory) {
          //   //     const rentalEntry = rentalHistory[historyKey];
      
          //   //     if (rentalEntry.rentedById === userId) {
          //   //       hasRead = true;
          //   //       console.log('ja leu')
          //   //       break; // Sai do loop interno, pois já encontrou o userId
          //   //     }
          //   //     if(isDonor){
          //   //       isDonorOK = true;
          //   //       console.log('é o doador')
          //   //       break;
          //   //     }
          //   //   }
          //   // }else{
          //   //   console.log("nao passou na primeira logica")
          //   // }
          // }

          // if(isDonorOK||hasRead){
          //   const btnPostarResenha = document.createElement('button');
          //   btnPostarResenha.textContent = 'Postar Resenha';
          //   btnPostarResenha.setAttribute('class', 'btn-postar-resenha');
          //   btnPostarResenha.addEventListener('click', () => {
          //     sentResenha(task.key);
          //   });
          // }



          const resenhaData = snapshot.val();
          // Criando elementos dinamicamente
          const resenhaDiv = document.createElement('div');
          resenhaDiv.classList.add('resenha-item');

          resenhaDiv.innerHTML = `
            <div class="resenha-header">
              <img src="${resenhaData.resenhaByImg}" alt="User Image" class="userImg3">
              <strong>${resenhaData.resenhaBy}</strong>
              <span class="resenha-date">${new Date(resenhaData.resenhaAt).toLocaleString()}</span>
            </div>
            <p class="resenha-text">${resenhaData.resenha}</p>`;

          resenhasContainer.appendChild(resenhaDiv);
          

        });

        console.log('passou aqui');
        const btnPostarResenha = document.createElement('button');
        btnPostarResenha.textContent = 'Postar Resenha';
        btnPostarResenha.setAttribute('class', 'btn-postar-resenha');
        btnPostarResenha.addEventListener('click', () => {
          sentResenha(task.key);
        });

        const resenhaForm = document.createElement('form')
        resenhaForm.setAttribute('id', `resenhaForm/${task.key}`)
        const TxtResenha = document.createElement('input')
        TxtResenha.setAttribute('id', `TextResenha/${task.key}`)
        resenhaForm.appendChild(TxtResenha)
        card.appendChild(resenhaForm)
        card.appendChild(btnPostarResenha);

      } else {
        console.log('passou aqui');
        const btnPostarResenha = document.createElement('button');
        btnPostarResenha.textContent = 'Postar Resenha';
        btnPostarResenha.setAttribute('class', 'btn-postar-resenha');
        btnPostarResenha.addEventListener('click', () => {
          sentResenha(task.key);
        });

        const resenhaForm = document.createElement('form')
        resenhaForm.setAttribute('id', `resenhaForm/${task.key}`)
        const TxtResenha = document.createElement('input')
        TxtResenha.setAttribute('id', `TextResenha/${task.key}`)
        resenhaForm.appendChild(TxtResenha)
        card.appendChild(resenhaForm)
        card.appendChild(btnPostarResenha);


        resenhasContainer.innerHTML = `<p>Sem resenhas disponíveis.</p>`;
      }    

    })
    .catch(error => {
      console.error('Erro ao carregar resenhas:', error);
    });
});

                  

      

      
      // Adiciona imagem do livro
      // Adiciona uma imagem padrão enquanto a imagem real é carregada
      const imgLi = document.createElement('img');
      const defaultImg = 'img/loading.gif'; // Caminho para sua imagem padrão
      imgLi.src = defaultImg; // Define a imagem padrão inicialmente
      imgLi.setAttribute('class', 'imgTodo');
      imgLi.setAttribute('id', `img-${task.key}`);

      // Troca para a imagem real após o carregamento
      const realImgUrl = task.imgUrl; // URL da imagem real
      const imgLoader = new Image(); // Cria um pré-carregador para a imagem real
      imgLoader.onload = function () {
        imgLi.src = realImgUrl; // Substitui a imagem padrão pela imagem real
      };
      imgLoader.onerror = function () {
        console.error(`Erro ao carregar a imagem: ${realImgUrl}`);
      };
      imgLoader.src = realImgUrl; // Inicia o carregamento da imagem real

      card.appendChild(imgLi);
      // Adiciona o nome do livro
      const title = document.createElement('h3');
      title.textContent = task.name || 'Sem Título';
      card.appendChild(title);

      // Gênero do livro
      var genre = document.createElement('p');
      genre.textContent = 'Gênero: ' + (task.Genero );
      card.appendChild(genre);

      // Informações do doador
      var donorInfo = document.createElement('div');
      donorInfo.setAttribute('class', 'donor-info');

      // Nome do doador
      var donorName = document.createElement('p');
      donorName.textContent = 'Doado por: ' + (task.userNameDoador);
      donorInfo.appendChild(donorName);

      card.appendChild(donorInfo);
      //disnponibiliza os botoes de edição somente para mim
      const userId = firebase.auth().currentUser.uid;
      if (userId === '60ATcph6xShfJB7wfqFxBIGaZp32') {
          const actions = document.createElement('div');
          actions.setAttribute('class', 'actions');

          // Botão de excluir
          const removeBtn = document.createElement('button');
          removeBtn.textContent = 'Excluir';
          removeBtn.setAttribute('onclick', `removeTodo("${task.key}")`);
          removeBtn.setAttribute('class', 'danger');
          actions.appendChild(removeBtn);

          // Botão de editar
          const updateBtn = document.createElement('button');
          updateBtn.textContent = 'Editar';
          updateBtn.setAttribute('onclick', `updateTodo("${task.key}")`);
          updateBtn.setAttribute('class', 'alternative');
          actions.appendChild(updateBtn);

          const indexBtn = document.createElement('button');
          indexBtn.textContent = 'Indicar';
          indexBtn.setAttribute('onclick', `indexBook("${task.key}")`);
          indexBtn.setAttribute('class', 'alternative');
          actions.appendChild(indexBtn);

          card.appendChild(actions);
      }


          
            // Verifica se o livro está alugado
            dbRefUsers.child(`tasks/${task.key}/currentRental`).once('value')
                .then(snapshot => {
                    const rental = snapshot.val();
                    const userId = firebase.auth().currentUser.uid; // Obtém o ID do usuário atual

                    if (rental) {
                        // Mostra quem está alugando
                        const rentedBy = document.createElement('p');
                        rentedBy.textContent = `Reservado no momento por: ${rental.rentedBy}`;
                        card.appendChild(rentedBy); // Exibe diretamente no card

                        // Se o usuário atual alugou o livro, mostra o botão de devolver
                        if (rental.rentedById === userId) {
                            const returnBtn = document.createElement('button');
                            returnBtn.textContent = 'Devolver';
                            returnBtn.setAttribute('onclick', `returnBook("${task.key}")`);
                            returnBtn.setAttribute('class', 'return');
                            card.appendChild(returnBtn); // Exibe o botão de devolver diretamente no card
                        }
                    } else {
                        // Se não estiver alugado, mostra o botão de alugar
                        const rentBtn = document.createElement('button');
                        rentBtn.textContent = 'Alugar';
                        rentBtn.setAttribute('onclick', `rentBook("${task.key}", "${task.name}")`);
                        rentBtn.setAttribute('class', 'rent');
                        card.appendChild(rentBtn); // Exibe o botão de alugar diretamente no card
                    }
                })
                .catch(error => {
                    console.error('Erro ao verificar o status de aluguel:', error);
                });

            ulTodoList.appendChild(card);
            num++;
    });

    todoCount.innerHTML = `${num} ${num > 1 ? 'Livros' : 'Livro'} exibidos nesta página.`;
  } else {
    todoCount.innerHTML = 'Nenhum livro disponível nesta página.';
  }

  updatePaginationControls(tasks.length, tasks);
}

function updatePaginationControls(totalItems, tasks) {
  const paginationControls = document.getElementById('pagination-controls');
  paginationControls.innerHTML = '';

  // Cálculo do total de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Exibir informações de paginação
  const pageInfo = document.createElement('span');
  pageInfo.textContent = `Página ${currentPage + 1} de ${totalPages}`;
  paginationControls.appendChild(pageInfo);

  // Botão "Anterior"
  if (currentPage > 0) {
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Anterior';
    prevButton.onclick = () => {
      currentPage--;
      fillTodoList(tasks);
  
      // Voltar ao início da página (onde fica todoCount)
      todoCount.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    paginationControls.appendChild(prevButton);
  }
  
  // Botão "Próximo"
  if ((currentPage + 1) * itemsPerPage < totalItems) {
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Próximo';
    nextButton.onclick = () => {
      currentPage++;
      fillTodoList(tasks);
  
      // Voltar ao início da página (onde fica todoCount)
      todoCount.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    paginationControls.appendChild(nextButton);
  }
  
}

// Exemplo de carregamento inicial
// exibe os destaques

function fetchAndFillHighlights() {


  dbRefUsers.child('tasks')
    .once('value')
    .then((snapshot) => {
      const allTasks = snapshot.val();
    


      if (!allTasks) {
        console.error("Nenhum dado encontrado no Firebase.");
        return;
      }

      // Transformar os dados em um array
      const tasksArray = Object.keys(allTasks).map(key => ({ key, ...allTasks[key] }));

      if (tasksArray.length === 0) {
        console.error("Nenhuma livro válida encontrada no banco de dados.");
        return;
      }


      fillHighlightsFromFirebase(tasksArray);
    })
    .catch((error) => {
      console.error("Erro ao buscar livros do Firebase:", error);
    });
}


function fillHighlightsFromFirebase(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    console.error("Os dados fornecidos não são válidos ou estão vazios.");
    return;
  }


  // Exemplo: Preenchendo a lista de destaques
  const livrosMaisLidos = document.querySelector("#DestaquesMega .highlights-container .highlight:nth-child(1) ul");
  const pessoasMaisLeram = document.querySelector("#DestaquesMega .highlights-container .highlight:nth-child(2) ul");
  const pessoasMaisDoaram = document.querySelector("#DestaquesMega .highlights-container .highlight:nth-child(3) ul");

  // Limpar listas existentes
  livrosMaisLidos.innerHTML = "";
  pessoasMaisLeram.innerHTML = "";
  pessoasMaisDoaram.innerHTML = "";

  tasks.forEach(task => {
    const { name, Genero, rentalHistory, photoUrlDoador } = task;

    // Livros mais lidos
      // Selecionar o elemento onde os livros mais lidos serão exibidos
const livrosMaisLidos = document.querySelector("#DestaquesMega .highlights-container .highlight:nth-child(1) ul");
livrosMaisLidos.innerHTML = ""; // Limpar lista existente

// Ordenar as tarefas com base no número de vezes que o livro foi alugado
const sortedTasks = tasks
  .filter(task => task.rentalHistory) // Filtrar apenas os livros com histórico de aluguel
  .sort((a, b) => Object.keys(b.rentalHistory).length - Object.keys(a.rentalHistory).length);

// Pegar os 3 primeiros livros mais lidos
const top3Books = sortedTasks.slice(0, 3);

// Preencher a lista com os 3 livros mais lidos
top3Books.forEach(task => {
  const { name, Genero, rentalHistory } = task;
  const rentalCount = Object.keys(rentalHistory).length; // Contar os alugueis

  const listItem = document.createElement("li");
  listItem.textContent = `${name || "Sem Nome"} - Gênero: ${Genero || "Desconhecido"} - Alugado ${rentalCount} vezes`;
  livrosMaisLidos.appendChild(listItem);
});


    // Pessoas que mais leram
// Selecionar o elemento onde as pessoas que mais leram serão exibidas
const pessoasMaisLeram = document.querySelector("#DestaquesMega .highlights-container .highlight:nth-child(2) ul");
pessoasMaisLeram.innerHTML = ""; // Limpar lista existente

// Criar um contador para quantificar os alugueis por pessoa
const readerCounts = {};

// Iterar sobre as tarefas para acumular os dados
tasks.forEach(task => {
  if (task.rentalHistory) {
    Object.values(task.rentalHistory).forEach(history => {
      const rentedBy = history.rentedBy || "Desconhecido";
      const rentedByPhoto = history.rentedByImg || "img/dummy-geschichte.jpg";
      

      // Incrementar o contador e armazenar a foto
      if (!readerCounts[rentedBy]) {
        readerCounts[rentedBy] = { count: 0, photo: rentedByPhoto };
      }
      readerCounts[rentedBy].count++;
    });
  }
});

// Transformar o contador em um array de pares [nome, dados] e ordenar
const sortedReaders = Object.entries(readerCounts)
  .sort(([, a], [, b]) => b.count - a.count) // Ordenar por quantidade decrescente
  .slice(0, 3); // Pegar os 3 que mais leram

// Preencher a lista com os 3 leitores mais frequentes
sortedReaders.forEach(([reader, { count, photo }]) => {
  const listItem = document.createElement("li");
  const img = document.createElement("img");
  img.src = photo;
  img.alt = reader;
  img.classList.add("user-photo");
  

  const name = document.createElement("span");
  name.textContent = `${reader} - Leu ${count} livros`;

  listItem.appendChild(img);
  listItem.appendChild(name);
  pessoasMaisLeram.appendChild(listItem);
});



    // Pessoas que mais doaram
// Selecionar o elemento onde as pessoas que mais doaram serão exibidas
const pessoasMaisDoaram = document.querySelector("#DestaquesMega .highlights-container .highlight:nth-child(3) ul");
pessoasMaisDoaram.innerHTML = ""; // Limpar lista existente

// Criar um contador para quantificar as doações por pessoa
const donorCounts = {};

// Iterar sobre as tarefas para acumular os dados
tasks.forEach(task => {
  const donor = task.userNameDoador || "Desconhecido";
  const donorPhoto = task.photoUrlDoador || "img/unknownUser.png";

  // Incrementar o contador e armazenar a foto
  if (!donorCounts[donor]) {
    donorCounts[donor] = { count: 0, photo: donorPhoto };
  }
  donorCounts[donor].count++;
});

// Transformar o contador em um array de pares [nome, dados] e ordenar
const sortedDonors = Object.entries(donorCounts)
  .sort(([, a], [, b]) => b.count - a.count) // Ordenar por quantidade decrescente
  .slice(0, 3); // Pegar os 3 que mais doaram

// Preencher a lista com os 3 doadores mais frequentes
sortedDonors.forEach(([donor, { count, photo }]) => {
  const listItem = document.createElement("li");
  const img = document.createElement("img");
  img.src = photo;
  img.alt = donor;
  img.classList.add("user-photo");
  
  const name = document.createElement("span");
  name.textContent = `${donor} - Doou ${count} livros`;

  listItem.appendChild(img);
  listItem.appendChild(name);
  listItem.setAttribute('id','imgUser')
  pessoasMaisDoaram.appendChild(listItem);
});


  });

  console.log("Destaques preenchidos com sucesso.");
}







// // remade by gpt
// function fillTodoList(tasks) {
//   // Limpar a lista de tarefas
//   ulTodoList.innerHTML = '';
//   let num = 0;

//   // Verifica se tasks é um array válido
//   if (Array.isArray(tasks) && tasks.length > 0) {
//     tasks.forEach(function (task) {
//       // Criação do contêiner do card
//       var card = document.createElement('div');
//       card.setAttribute('class', 'todo-card');
//       card.setAttribute('id', task.key); // Adiciona um ID único ao card

//       // Imagem do livro
//       var imgLi = document.createElement('img');
//       imgLi.src = task.imgUrl; 
//       imgLi.setAttribute('class', 'imgTodo');
//       imgLi.setAttribute('id', `img-${task.key}`);
//       card.appendChild(imgLi);

//       // Nome do livro
//       var title = document.createElement('h3');
//       title.textContent = task.name || 'Sem Título';
//       card.appendChild(title);

//       // Gênero do livro
//       var genre = document.createElement('p');
//       genre.textContent = 'Gênero: ' + (task.Genero );
//       card.appendChild(genre);

//       // Informações do doador
//       var donorInfo = document.createElement('div');
//       donorInfo.setAttribute('class', 'donor-info');

//       // Nome do doador
//       var donorName = document.createElement('p');
//       donorName.textContent = 'Doado por: ' + (task.userNameDoador);
//       donorInfo.appendChild(donorName);

//       card.appendChild(donorInfo);
//       //disnponibiliza os botoes de edição somente para mim
//       const userId = firebase.auth().currentUser.uid;
//       if (userId === '60ATcph6xShfJB7wfqFxBIGaZp32') {
//           const actions = document.createElement('div');
//           actions.setAttribute('class', 'actions');

//           // Botão de excluir
//           const removeBtn = document.createElement('button');
//           removeBtn.textContent = 'Excluir';
//           removeBtn.setAttribute('onclick', `removeTodo("${task.key}")`);
//           removeBtn.setAttribute('class', 'danger');
//           actions.appendChild(removeBtn);

//           // Botão de editar
//           const updateBtn = document.createElement('button');
//           updateBtn.textContent = 'Editar';
//           updateBtn.setAttribute('onclick', `updateTodo("${task.key}")`);
//           updateBtn.setAttribute('class', 'alternative');
//           actions.appendChild(updateBtn);

//           card.appendChild(actions);
//       }


          
//             // Verifica se o livro está alugado
//             dbRefUsers.child(`tasks/${task.key}/currentRental`).once('value')
//                 .then(snapshot => {
//                     const rental = snapshot.val();
//                     const userId = firebase.auth().currentUser.uid; // Obtém o ID do usuário atual

//                     if (rental) {
//                         // Mostra quem está alugando
//                         const rentedBy = document.createElement('p');
//                         rentedBy.textContent = `Alugado no momento por: ${rental.rentedBy}`;
//                         card.appendChild(rentedBy); // Exibe diretamente no card

//                         // Se o usuário atual alugou o livro, mostra o botão de devolver
//                         if (rental.rentedById === userId) {
//                             const returnBtn = document.createElement('button');
//                             returnBtn.textContent = 'Devolver';
//                             returnBtn.setAttribute('onclick', `returnBook("${task.key}")`);
//                             returnBtn.setAttribute('class', 'return');
//                             card.appendChild(returnBtn); // Exibe o botão de devolver diretamente no card
//                         }
//                     } else {
//                         // Se não estiver alugado, mostra o botão de alugar
//                         const rentBtn = document.createElement('button');
//                         rentBtn.textContent = 'Alugar';
//                         rentBtn.setAttribute('onclick', `rentBook("${task.key}", "${task.name}")`);
//                         rentBtn.setAttribute('class', 'rent');
//                         card.appendChild(rentBtn); // Exibe o botão de alugar diretamente no card
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Erro ao verificar o status de aluguel:', error);
//                 });

//             ulTodoList.appendChild(card);
//             num++;
//         });

//     todoCount.innerHTML = `${num} ${num > 1 ? 'Livros' : 'Livro'}:`;
//   } else {
//     todoCount.innerHTML = 'Nenhum livro disponível.';
//   }
// }


// historico de leitura do usuario
function HistoricoDeLeitura(){
  const userId = firebase.auth().currentUser.uid; // Obtém o ID do usuário atual 
  RentedBooksList.innerHTML = '';
  let num = 0; // Inicializa o contador

  dbRefUsers.child('tasks')
    .once('value')
    .then((snapshot) =>{
      const allBooks = snapshot.val()
      const filteredBooks = []

      for (const key in allBooks) {
        const book = allBooks[key];
        const rentalHistory = book.rentalHistory;
      
        // Verifica se rentalHistory existe e é um objeto
        if (rentalHistory && typeof rentalHistory === 'object') {
          for (const historyKey in rentalHistory) {
            const rentalEntry = rentalHistory[historyKey];
            
            // Verifica se o rentedById corresponde ao userId
            if (rentalEntry.rentedById === userId) {
              filteredBooks.push({ ...book, key });
              break; // Sai do loop interno, pois já encontramos o userId neste livro
            }
          }
        }
      }
      

            // Verifica se há livros alugados
            if (filteredBooks.length > 0) {
              filteredBooks.forEach((book) => {
                // Criação do contêiner do card
                const card = document.createElement('div');
                card.setAttribute('class', 'todo-card');
                card.setAttribute('id', book.key);
      
// Adiciona imagem do livro
      // Adiciona uma imagem padrão enquanto a imagem real é carregada
      const imgLi = document.createElement('img');
      const defaultImg = 'img/loading.gif'; // Caminho para sua imagem padrão
      imgLi.src = defaultImg; // Define a imagem padrão inicialmente
      imgLi.setAttribute('class', 'imgTodo');
      imgLi.setAttribute('id', `img-${book.key}`);

      // Troca para a imagem real após o carregamento
      const realImgUrl = book.imgUrl; // URL da imagem real
      const imgLoader = new Image(); // Cria um pré-carregador para a imagem real
      imgLoader.onload = function () {
        imgLi.src = realImgUrl; // Substitui a imagem padrão pela imagem real
      };
      imgLoader.onerror = function () {
        console.error(`Erro ao carregar a imagem: ${realImgUrl}`);
      };
      imgLoader.src = realImgUrl; // Inicia o carregamento da imagem real

      card.appendChild(imgLi);
      
                // Nome do livro
                const title = document.createElement('h3');
                title.textContent = book.name || 'Sem Título';
                card.appendChild(title);
      
                // Gênero do livro
                const genre = document.createElement('p');
                genre.textContent = 'Gênero: ' + (book.Genero || 'Indefinido');
                card.appendChild(genre);
      
                // Informações do aluguel
                if (book.rentalHistory && typeof book.rentalHistory === 'object') {
                  // Pega a primeira entrada do rentalHistory
                  const firstRentalKey = Object.keys(book.rentalHistory)[0];
                  if (firstRentalKey) {
                    const rentedAt = book.rentalHistory[firstRentalKey].rentedAt;
                    if (rentedAt) {
                      const rentedBy = document.createElement('p');
                      rentedBy.textContent = `Alugado por você em: ${new Date(rentedAt).toLocaleDateString()}`;
                      card.appendChild(rentedBy);
                    } else {
                      console.warn(`'rentedAt' não encontrado para o primeiro histórico do livro.`, book);
                    }
                  } else {
                    console.warn(`Nenhuma entrada em 'rentalHistory' para o livro.`, book);
                  }
                } else {
                  console.warn(`'rentalHistory' ausente ou inválido para o livro.`, book);
                }
                
      
      
                RentedBooksList.appendChild(card);
                num++; // Incrementa o contador para cada livro alugado
              });
      
              // Exibe a contagem de livros alugados no momento
              RentCount.innerHTML = `${num} ${num > 1 ? 'Livros alugados' : 'Livro alugado'} por você:`;
            } else {
              RentCount.innerHTML = 'Você não ainda não leu algum livro.';
            }
    })
}




// Exibe para o usuário quais são os livros que ele tem alugados no momento
function fillRentedBooksList() {
  const userId = firebase.auth().currentUser.uid; // Obtém o ID do usuário atual

  // Limpar a lista de livros alugados
  RentedBooksList.innerHTML = '';
  let num = 0; // Inicializa o contador

  dbRefUsers.child('tasks')
    .once('value')
    .then((snapshot) => {
      const allTasks = snapshot.val();
      const filteredTasks = [];

      // Filtra somente os livros alugados pelo usuário atual
      for (const key in allTasks) {
        const task = allTasks[key];
        if (task.currentRental && task.currentRental.rentedById === userId) {
          filteredTasks.push({ ...task, key });
        }
      }

      // Verifica se há livros alugados
      if (filteredTasks.length > 0) {
        filteredTasks.forEach((task) => {
          // Criação do contêiner do card
          const card = document.createElement('div');
          card.setAttribute('class', 'todo-card');
          card.setAttribute('id', task.key);

// Adiciona imagem do livro
      // Adiciona uma imagem padrão enquanto a imagem real é carregada
      const imgLi = document.createElement('img');
      const defaultImg = 'img/loading.gif'; // Caminho para sua imagem padrão
      imgLi.src = defaultImg; // Define a imagem padrão inicialmente
      imgLi.setAttribute('class', 'imgTodo');
      imgLi.setAttribute('id', `img-${task.key}`);

      // Troca para a imagem real após o carregamento
      const realImgUrl = task.imgUrl; // URL da imagem real
      const imgLoader = new Image(); // Cria um pré-carregador para a imagem real
      imgLoader.onload = function () {
        imgLi.src = realImgUrl; // Substitui a imagem padrão pela imagem real
      };
      imgLoader.onerror = function () {
        console.error(`Erro ao carregar a imagem: ${realImgUrl}`);
      };
      imgLoader.src = realImgUrl; // Inicia o carregamento da imagem real

      card.appendChild(imgLi);

          // Nome do livro
          const title = document.createElement('h3');
          title.textContent = task.name || 'Sem Título';
          card.appendChild(title);

          // Gênero do livro
          const genre = document.createElement('p');
          genre.textContent = 'Gênero: ' + (task.Genero || 'Indefinido');
          card.appendChild(genre);

          // Informações do aluguel
          const rentedBy = document.createElement('p');
          rentedBy.textContent = `Alugado por você em: ${new Date(task.currentRental.rentedAt).toLocaleDateString()}`;
          card.appendChild(rentedBy);

          // Botão de devolver
          const returnBtn = document.createElement('button');
          returnBtn.textContent = 'Devolver';
          returnBtn.setAttribute('onclick', `returnBook("${task.key}")`);
          returnBtn.setAttribute('class', 'return');
          card.appendChild(returnBtn);

          RentedBooksList.appendChild(card);
          num++; // Incrementa o contador para cada livro alugado
        });

        // Exibe a contagem de livros alugados no momento
        RentCount.innerHTML = `${num} ${num > 1 ? 'Livros alugados' : 'Livro alugado'} por você:`;
      } else {
        RentCount.innerHTML = 'Você não alugou nenhum livro.';
      }
    })
    .catch((error) => {
      console.error('Erro ao carregar os livros alugados:', error);
      RentCount.innerHTML = 'Erro ao carregar os livros alugados.';
    });
}


// função que exibe os livros que o usuario doou

function MyDonateBooks() {
  const userId = firebase.auth().currentUser.uid; // Obtém o ID do usuário atual

  // Limpar a lista de livros doados
  RentedBooksList.innerHTML = '';
  let num = 0; // Inicializa o contador

  dbRefUsers.child('tasks')
    .once('value')
    .then((snapshot) => {
      const allTasks = snapshot.val();
      const filteredTasks = [];

      // Filtra somente os livros doados pelo usuário atual
      for (const key in allTasks) {
        const task = allTasks[key];
        if (task.
          userIdDoador
           === userId) {
          filteredTasks.push({ ...task, key });
        }
      }

      // Verifica se há livros doados
      if (filteredTasks.length > 0) {
        filteredTasks.forEach((task) => {
          // Criação do contêiner do card
          const card = document.createElement('div');
          card.setAttribute('class', 'todo-card');
          card.setAttribute('id', task.key);

// Adiciona imagem do livro
      // Adiciona uma imagem padrão enquanto a imagem real é carregada
      const imgLi = document.createElement('img');
      const defaultImg = 'img/loading.gif'; // Caminho para sua imagem padrão
      imgLi.src = defaultImg; // Define a imagem padrão inicialmente
      imgLi.setAttribute('class', 'imgTodo');
      imgLi.setAttribute('id', `img-${task.key}`);

      // Troca para a imagem real após o carregamento
      const realImgUrl = task.imgUrl; // URL da imagem real
      const imgLoader = new Image(); // Cria um pré-carregador para a imagem real
      imgLoader.onload = function () {
        imgLi.src = realImgUrl; // Substitui a imagem padrão pela imagem real
      };
      imgLoader.onerror = function () {
        console.error(`Erro ao carregar a imagem: ${realImgUrl}`);
      };
      imgLoader.src = realImgUrl; // Inicia o carregamento da imagem real

      card.appendChild(imgLi);

          // Nome do livro
          const title = document.createElement('h3');
          title.textContent = task.name || 'Sem Título';
          card.appendChild(title);

          // Gênero do livro
          const genre = document.createElement('p');
          genre.textContent = 'Gênero: ' + (task.Genero || 'Indefinido');
          card.appendChild(genre);

          // // Informações da doação
          // const donatedOn = document.createElement('p');
          // donatedOn.textContent = `Doado em: ${new Date(task.donatedAt).toLocaleDateString()}`;
          // card.appendChild(donatedOn);

          // Botão para editar detalhes do livro doado
          const editBtn = document.createElement('button');
          editBtn.textContent = 'Editar';
          editBtn.setAttribute('onclick', `updateTodo("${task.key}")`);
          editBtn.setAttribute('class', 'edit');
          card.appendChild(editBtn);

          RentedBooksList.appendChild(card);
          num++; // Incrementa o contador para cada livro doado
        });

        // Exibe a contagem de livros doados no momento
        RentCount.innerHTML = `${num} ${num > 1 ? 'Livros doados' : 'Livro doado'} por você:`;
      } else {
        RentCount.innerHTML = 'Você não doou nenhum livro.';
      }
    })
    .catch((error) => {
      console.error('Erro ao carregar os livros doados:', error);
      RentCount.innerHTML = 'Erro ao carregar os livros doados.';
    });
}




// se der errado eu volto para esssa
// function fillTodoList2(tasks) {
//   ulTodoList.innerHTML = '';
//   let num = 0;

//   // Verifica se tasks é um array válido
//   if (Array.isArray(tasks) && tasks.length > 0) {
//     tasks.forEach(function (task) {
//       var li = document.createElement('li');
//       li.setAttribute('id', task.key); // Adiciona um ID único ao <li>
//       li.setAttribute('class', 'listaLivros');

//       // Imagem do livro
//       var imgLi = document.createElement('img');
//       imgLi.src = task.imgUrl || 'img/defaultTodo.png'; // Usa a imagem padrão se não houver imgUrl
//       imgLi.setAttribute('class', 'imgTodo');
//       imgLi.setAttribute('id', `img-${task.key}`); // Adiciona um ID único à imagem
//       li.appendChild(imgLi);

//       // Título do livro
//       var spanTitulo = document.createElement('p');
//       spanTitulo.appendChild(document.createTextNode('Título:'));
//       li.appendChild(spanTitulo);

//       var spanLi = document.createElement('span');
//       spanLi.appendChild(document.createTextNode(task.name || 'Sem Título')); // Usa 'Sem Título' se não houver nome
//       li.appendChild(spanLi);

//       // Gênero do livro
//       var spanGenero = document.createElement('p');
//       spanGenero.appendChild(document.createTextNode('Gênero: ' + (task.Genero || 'Não especificado'))); // Usa 'Não especificado' se não houver gênero
//       li.appendChild(spanGenero);

//       // Nome do doador
//       var spanDoador = document.createElement('p');
//       spanDoador.appendChild(document.createTextNode('Doador: ' + (task.userName || 'Desconhecido'))); // Usa 'Desconhecido' se não houver nome do doador
//       li.appendChild(spanDoador);

//       // Email do doador
//       var spanEmail = document.createElement('p');
//       spanEmail.appendChild(document.createTextNode('Email: ' + (task.emailEditor || 'Não disponível'))); // Usa 'Não disponível' se não houver email
//       li.appendChild(spanEmail);



//       // Botão de excluir
//       var liRemoveBtn = document.createElement('button');
//       liRemoveBtn.appendChild(document.createTextNode('Excluir'));
//       liRemoveBtn.setAttribute('onclick', `removeTodo("${task.key}")`);
//       liRemoveBtn.setAttribute('class', 'danger todoBtn');
//       li.appendChild(liRemoveBtn);

//       // Botão de editar
//       var liUpdateBtn = document.createElement('button');
//       liUpdateBtn.appendChild(document.createTextNode('Editar'));
//       liUpdateBtn.setAttribute('onclick', `updateTodo("${task.key}")`);
//       liUpdateBtn.setAttribute('class', 'alternative todoBtn');
//       li.appendChild(liUpdateBtn);

//       ulTodoList.appendChild(li);
//       num++;
//     });

//     todoCount.innerHTML = `${num} ${num > 1 ? 'Livros' : 'Livro'}:`;
//   } else {
//     todoCount.innerHTML = 'Nenhum livro disponível.';
//   }
// }



 
  

// 
// fim da versao gpt
// 
// 

// exibe a lista de tarefa do usuario autenticado

// function fillTodoList(dataSnapshot){
//     ulTodoList.innerHTML =''
//     var num = dataSnapshot.numChildren()
//     todoCount.innerHTML = num + (num > 1 ? 'tarefas' : 'tarefa') + ':'
//     dataSnapshot.forEach(function(item){
//         var value = item.val()
//         var li = document.createElement('li')
//         var spanLi = document.createElement('span')
//         spanLi.appendChild(document.createTextNode(value.name))
//         li.appendChild(spanLi)
//         ulTodoList.appendChild(li)

// var liRemoveBtn = document.createElement('button')
// liRemoveBtn.appendChild(document.createTextNode('excluir'))
// liRemoveBtn.setAttribute('onclick','removeTodo(\"'+item.key+'\")')
// liRemoveBtn.setAttribute('class', 'danger todoBtn')
// li.appendChild(liRemoveBtn)

// var liUpdateBtn = document.createElement('button')
// liUpdateBtn.appendChild(document.createTextNode('editar'))
// liUpdateBtn.setAttribute('onclick', 'updateTodo(\"'+item.key+'\")')
// liUpdateBtn.setAttribute('class', 'alternative todoBtn')
// li.appendChild(liUpdateBtn)
//     })
// }

// função para indicar livro 
function indexBook(key, name ){
  const userId = firebase.auth().currentUser.uid;
  const userName = firebase.auth().currentUser.displayName;
  const user = firebase.auth().currentUser;

  const indexData = {
    indexBy: userName,
    indexById: userId,
    indexByImg: user.photoURL,
    indexAt:new Date().toISOString(),
  };

  dbRefUsers.child(`tasks/${key}/Indexed`).once('value').then((snapshot)=>{
    if(snapshot.exists()){
      alert('esse livro ja está indicado')
    }else{
      dbRefUsers.child(`tasks/${key}/Indexed`).set(indexData).then(()=>{
        dbRefUsers.child(`tasks/${key}/indexed`).push(indexData)
        alert('livro indicado com sucesso')
      }).catch(error =>{
        alert('erro ao indexar o livro', error)
      })
    }
  }).catch(error =>{
    alert('erro ao verificar se o livro ja esta indexado', error)
  })
}

// função para mostrar os livros indicados
function fillIndex(){
  dbRefUsers.child('tasks').once('value').then((snapshot)=>{
    const indexBooks = snapshot.val();
    const filteredBooks = []
    indexedBooks.innerHTML ='';
    let num =0;


    for (const key in indexBooks) {
      const book = indexBooks[key];
    
      // Verifica se o campo "indexed" existe e possui entradas.
      if (book.indexed && typeof book.indexed === 'object') {
        for (const indexKey in book.indexed) {
          const indexEntry = book.indexed[indexKey];
    
          // Verifica se a entrada "indexed" é válida.
          if (indexEntry.indexAt) {
            filteredBooks.push({ ...book, key });
            break; // Sai do loop interno após encontrar uma entrada válida.
          }
        }
      }
    }
    console.log(filteredBooks);
    // verifica se existe livros indicados
    if(filteredBooks.length>0){
      filteredBooks.forEach((book)=>{
                        // Criação do contêiner do card
                        const card = document.createElement('div');
                        card.setAttribute('class', 'todo-card');
                        card.setAttribute('id', book.key);
              
        // Adiciona imagem do livro
              // Adiciona uma imagem padrão enquanto a imagem real é carregada
              const imgLi = document.createElement('img');
              const defaultImg = 'img/loading.gif'; // Caminho para sua imagem padrão
              imgLi.src = defaultImg; // Define a imagem padrão inicialmente
              imgLi.setAttribute('class', 'imgTodo');
              imgLi.setAttribute('id', `img-${book.key}`);
        
              // Troca para a imagem real após o carregamento
              const realImgUrl = book.imgUrl; // URL da imagem real
              const imgLoader = new Image(); // Cria um pré-carregador para a imagem real
              imgLoader.onload = function () {
                imgLi.src = realImgUrl; // Substitui a imagem padrão pela imagem real
              };
              imgLoader.onerror = function () {
                console.error(`Erro ao carregar a imagem: ${realImgUrl}`);
              };
              imgLoader.src = realImgUrl; // Inicia o carregamento da imagem real
        
              card.appendChild(imgLi);
              
                        // Nome do livro
                        const title = document.createElement('h3');
                        title.textContent = book.name || 'Sem Título';
                        card.appendChild(title);
              
                        // Gênero do livro
                        const genre = document.createElement('p');
                        genre.textContent = 'Gênero: ' + (book.Genero || 'Indefinido');
                        card.appendChild(genre);


                        const userId = firebase.auth().currentUser.uid;
                        if (userId === '60ATcph6xShfJB7wfqFxBIGaZp32') {
                            const actions = document.createElement('div');
                            actions.setAttribute('class', 'actions');
            
                  
                            const indexBtn = document.createElement('button');
                            indexBtn.textContent = 'Remover indicação';
                            indexBtn.setAttribute('onclick', `unindexBook("${book.key}")`);
                            indexBtn.setAttribute('class', 'alternative');
                            actions.appendChild(indexBtn);
                  
                            card.appendChild(actions);
                        }          
              
                        indexedBooks.appendChild(card)
                        num++;
      })
    }else{
      console.log('nao temos livros indicados no momento')
    }
})}

// função para remover a indicação
function unindexBook(key) {
  const dbRefUsers = firebase.database().ref('users');

  dbRefUsers.child(`tasks/${key}/Indexed`).once('value').then((snapshot) => {
    if (!snapshot.exists()) {
      alert('Esse livro não está indexado.');
    } else {
      // Remove o dado principal de "Indexed".
      dbRefUsers.child(`tasks/${key}/Indexed`).remove().then(() => {
        alert('Indexação do livro removida com sucesso.');
      }).catch(error => {
        alert('Erro ao remover a indexação principal do livro.', error);
      });

      // Remove as entradas individuais de "indexed".
      dbRefUsers.child(`tasks/${key}/indexed`).remove().then(() => {
        console.log('Entradas adicionais de indexação removidas com sucesso.');
      }).catch(error => {
        console.error('Erro ao remover as entradas adicionais de indexação.', error);
      });
    }
  }).catch(error => {
    alert('Erro ao verificar se o livro está indexado.', error);
  });
}

// // função para mostrar as resenhas
// function showResenha(key, name) {
//   const resenhasContainer = document.getElementById('resenhasContainer');
//   resenhasContainer.innerHTML = ''; // Limpa o conteúdo antes de carregar novas resenhas
//   showItem(formResenha)
//   dbRefUsers.child(`tasks/${key}/resenhas`).once('value')
//     .then(snapshot => {
//       if (snapshot.exists()) {
//         snapshot.forEach(childSnapshot => {
//           const resenhaData = childSnapshot.val();

//           // Criando elementos dinamicamente
//           const resenhaDiv = document.createElement('div');
//           resenhaDiv.classList.add('resenha-item');

//           resenhaDiv.innerHTML = `
//             <div class="resenha-header">
//               <img src="${resenhaData.resenhaByImg}" alt="User Image" class="resenha-avatar">
//               <strong>${resenhaData.resenhaBy}</strong>
//               <span class="resenha-date">${new Date(resenhaData.resenhaAt).toLocaleString()}</span>
//             </div>
//             <p class="resenha-text">${resenhaData.resenha}</p>`;
//           resenhasContainer.appendChild(resenhaDiv);
//         });
//       } else {
//         resenhasContainer.innerHTML = `<p>Sem resenhas disponíveis.</p>`;
//       }
//     })
//     .catch(error => {
//       console.error('Erro ao carregar resenhas:', error);
//     });
    
// }





// função para publicar resenha
function sentResenha(key, name) {
  const user = firebase.auth().currentUser;
  const userId = user.uid;

  const TxtResenha = document.getElementById(`TextResenha/${key}`).value; // Obtém o valor do input corretamente

  if (!TxtResenha.trim()) {
    alert("Por favor, escreva uma resenha antes de postar.");
    return;
  }

  const resenhaData = {
    resenhaBy: user.displayName,
    resenhaById: userId,
    resenhaByImg: user.photoURL,
    resenhaAt: new Date().toISOString(),
    resenha: TxtResenha, // Agora está pegando o valor do input corretamente
  };

  dbRefUsers.child(`tasks/${key}/resenhas`).push(resenhaData)
    .then(() => {
      alert('Resenha publicada com sucesso');
      document.getElementById(`TextResenha/${key}`).value = ""; // Limpa o campo após postar
    })
    .catch(error => {
      console.error('Erro ao postar a resenha:', error);
    });
}


// função para alugar livro
function rentBook(key, name) {
  const userId = firebase.auth().currentUser.uid;
  const userName = firebase.auth().currentUser.displayName;

  // Verifica se o nome do usuário está preenchido
  if (!userName) {
    alert('Por favor, atualize seu nome no perfil antes de alugar um livro.');
    return; // Impede o aluguel se o nome não estiver atualizado
  }
  const user = firebase.auth().currentUser;
  const rentalData = {
    rentedBy: userName,
    rentedById: userId,
    rentedByImg: user.photoURL,
    rentedAt: new Date().toISOString(),
  };

  // Verifica se o livro já está alugado
  dbRefUsers.child(`tasks/${key}/currentRental`).once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        alert('Este livro já está reservado.');
      } else {
        // Marca como alugado
        dbRefUsers.child(`tasks/${key}/currentRental`).set(rentalData)
          .then(() => {
            // Adiciona ao histórico
            dbRefUsers.child(`tasks/${key}/rentalHistory`).push(rentalData);
            alert('Livro reservado com sucesso!');
          })
          .catch(error => {
            console.error('Erro ao marcar o livro como alugado:', error);
          });
      }
    })
    .catch(error => {
      console.error('Erro ao verificar o status de aluguel:', error);
    });
}


function returnBook(bookKey) {
  const userId = firebase.auth().currentUser.uid; // ID do usuário atual

  // Obtém a referência do livro no Firebase
  dbRefUsers.child(`tasks/${bookKey}/currentRental`)
    .once('value')
    .then(snapshot => {
      const rental = snapshot.val();

      // Verifica se o livro está alugado pelo usuário atual
      if (rental && rental.rentedById === userId) {
        // Remove a informação de aluguel
        return dbRefUsers.child(`tasks/${bookKey}/currentRental`).remove();
      } else {
        throw new Error('Você não está autorizado a devolver este livro.');
      }
    })
    .then(() => {
      alert('Livro devolvido com sucesso!');
      // Atualiza a lista de livros alugados
      fillRentedBooksList();
    })
    .catch(error => {
      console.error('Erro ao devolver o livro:', error);
      alert('Erro ao devolver o livro. Tente novamente.');
    });
}



function removeTodo(key) {

  var todoImg = document.querySelector(`#img-${key}`); // Seleciona pelo ID único da imagem
  console.log('Imagem:', todoImg);

  if (!todoImg) {
      console.warn('Imagem não encontrada para o ID:', key);
      return;
  }

  dbRefUsers.child('tasks').child(key).once('value').then(function(snapshot) {
      var task = snapshot.val();

      if (task ) {
          var confirmation = confirm('Realmente deseja remover esta tarefa?');
          if (confirmation) {
              dbRefUsers.child('tasks').child(key).remove()
                  .then(() => {
                      // Remove o elemento do DOM
                      var selectedItem = document.querySelector('#' + key);
                      if (selectedItem) selectedItem.remove();
                      alert('Tarefa removida com sucesso!');

                      // Remove a imagem do Firebase Storage
                      if (todoImg && todoImg.src) {
                          removeFile(todoImg.src);
                      } else {
                          console.warn('Imagem não encontrada ou src é indefinido.');
                      }
                  })
                  .catch((error) => {
                      showError('Erro ao excluir a tarefa.', error);
                      console.log(error);
                  });
          }
      } else {
          alert('Você não tem permissão para remover esta tarefa');
          console.log('Tentativa de remoção não permitida. Usuário não é o criador.');
      }
  }).catch(function(error) {
      showError('Erro ao acessar a tarefa no Firebase.', error);
      console.log(error);
  });
}


  
  //remove arquivos do firebase storage

  function removeFile(imgUrl) {
    console.log(imgUrl);
  
    // Identifique o caminho relativo ao Firebase Storage
    var filePath = decodeURIComponent(imgUrl.split('/o/')[1].split('?')[0]);
  
    if (filePath !== 'img/defaultTodo.png') {
      firebase.storage().ref(filePath).delete()
        .then(() => {
          console.log('Imagem removida com sucesso');
        })
        .catch((error) => {
          console.error('Erro ao remover o arquivo:', error);
        });
    } else {
      console.log('Nenhum arquivo foi removido');
    }
  }



//atualiza tarefas
var updateTodoKey = null
function updateTodo(key){
  updateTodoKey = key
  var todoName = document.querySelector('#' + key + ' > h3')
  todoFormTitle.innerHTML = '<strong> Editar o livro: </str ' +todoName.innerHTML
  todoForm.name.value = todoName.innerHTML
  hideItem(submitTodoForm)
  showItem(cancelUpdateTodo)
  hideItem(todoList)
  showItem(todoForm)
}

// restaura o estado inicial do formulario

function resetTodoForm(){
  todoFormTitle.innerHTML = 'Doar um livro'
  hideItem(cancelUpdateTodo)
  showItem(todoList)
  submitTodoForm.style.display ='initial'
  todoForm.name.value =''
  todoForm.file.value =''
  todoForm.Genero.value =''
}

function confirmTodoUpdate(){
  hideItem(cancelUpdateTodo)

  if(todoForm.name.value != ''){
    var file = todoForm.file.files[0]; // Seleciona o primeiro arquivo da seleção de arquivos
    var todoImg = document.querySelector(`#img-${updateTodoKey}`);
    if (file) { // Verifica se o arquivo foi selecionado
        if (file.type.includes('image')) { // Verifica se o arquivo é uma imagem
            // Compõe o nome do arquivo
            var imgName = firebase.database().ref().push().updateTodoKey + '-' + file.name;
            // Compõe o caminho do arquivo
            var imgPath = 'todoListFiles/' + firebase.auth().currentUser.uid + '/' + imgName;
            // Cria uma referência de arquivo no caminho acima
            var storageRef = firebase.storage().ref(imgPath);
            // Inicia o processo de upload
            var upload = storageRef.put(file)

          trackUpload(upload).then(function(){
            storageRef.getDownloadURL().then(function(downloadURL){
              const user = firebase.auth().currentUser;
              var data = {
                imgUrl: downloadURL,
                name: todoForm.name.value,
                nameToLowerCase: todoForm.name.value.toLowerCase(),
                Genero: todoForm.Genero.value,
                editadoPor: user.displayName,
                emailEditor: user.email,
                photoUrlEditor: user.photoURL
              }

              dbRefUsers.child('tasks').child(updateTodoKey).update(data).then(function () {
                console.log('livro atualizado com sucesso');
              }).catch(function (error) {
                console.error('Falha ao atualizar o livro:', error);
                showError('Falha ao atualizar o livro', error);
              });

              removeFile(todoImg.src)
              resetTodoForm()
            })
          }).catch(function(error){
            showError('falha ao atualizar o livro '+error)
          })

        }else{
          alert('o arquivo selecionado precisa ser uma imagem')
        }
      }else{//nenhuma imagem foi selecionada
        const user = firebase.auth().currentUser;
        var data = {
          name: todoForm.name.value,
          nameToLowerCase: todoForm.name.value.toLowerCase(),
          Genero: todoForm.Genero.value,
          editadoPor: user.displayName,
          emailEditor: user.email,
          photoUrlEditor: user.photoURL
        }

        dbRefUsers.child('tasks').child(updateTodoKey).update(data).then(function () {
          console.log('livro atualizado com sucesso');
         
        }).catch(function (error) {
          console.error('Falha ao atualizar o livro:', error);
          showError('Falha ao atualizar o livro', error);
        });
        resetTodoForm()
      }
  }else{
    alert('o nome do livro nao pode ser vazio')
  }
}




