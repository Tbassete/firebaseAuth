

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
// btnMostrarResenhas.textContent = 'Mostrar Resenhas';
btnMostrarResenhas.setAttribute('class', 'btnMostrarResenhas');
card.appendChild(btnMostrarResenhas);

// Evento de clique para carregar as resenhas
btnMostrarResenhas.addEventListener('click', async () => {

  const divFormResenha = document.createElement('div')
  divFormResenha.setAttribute('id', 'divFormResenha')
  divFormResenha.innerHTML = ''
  
  resenhasContainer.innerHTML = ''
  resenhaPopup.innerHTML = ''
  resenhaDiv.innerHTML =''
  // Verifica se já carregou para evitar requisições duplicadas
  if (resenhasContainer.children.length > 0) return;

    // Obtendo leitores antes de buscar resenhas
    const user = firebase.auth().currentUser.uid
    var leu = false;
    const leitores = await hasRead(task.key, userId).then(hasRead => {
      if (hasRead) {
        console.log("o usuario ja leu este livro")
        leu = true;
      } else {
        console.log("O usuário ainda não leu este livro.");
        leu = false
      }
      // console.log(leu)
    });

  // Consultar o banco de dados
  dbRefUsers.child(`tasks/${task.key}/resenhas`).once('value')
    .then(snapshot => {
      if (snapshot.exists() && snapshot.hasChildren()) { 
        snapshot.forEach(childSnapshot => {

          
          
          const resenhaData = childSnapshot.val(); // Obtém os dados da resenha
          const resenhaSnapshot = snapshot.val()
          const resenhaID = childSnapshot.key;
          const DonoResenha = resenhaData.resenhaById
          
       
          if(DonoResenha === user ||userId === '60ATcph6xShfJB7wfqFxBIGaZp32' ){
            console.log("DonoResenha")
            const resenhaDiv1 = document.createElement('div'); 
            resenhaDiv1.classList.add('resenha-item');
          
            resenhaDiv1.innerHTML = `
             <div class="resenhaDiv1">
             <button class="close-btn" onclick="fecharPopup()">×</button>
             <div class="resenha-header">
                    
                    <img src="${resenhaData.resenhaByImg}" alt="User Image" class="userImg4">
                    <div>
                      <strong>${resenhaData.resenhaBy} <span class="resenha-date"> ${new Date(resenhaData.resenhaAt).toLocaleString()} </span> 
                          <button class="lixeira" onclick="removeResenha('${task.key}', '${resenhaID}')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                            <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                          </svg>
                          </button>
                      </strong>
                      
                      <p class="resenha-text">${resenhaData.resenha}</p>
                      </div>
                      </div>
                      <hr>
                </div>`;
            resenhaDiv.appendChild(resenhaDiv1)
            resenhaPopup.appendChild(resenhaDiv)
            resenhasContainer.appendChild(resenhaPopup)

          }else{
            console.log('nao é o dono da resenha')
            const resenhaDiv1 = document.createElement('div'); 
            resenhaDiv1.classList.add('resenha-item');
          
            resenhaDiv1.innerHTML = `
             <div class="resenhaDiv1">
             <button class="close-btn" onclick="fecharPopup()">×</button>
             <div class="resenha-header">
                    
                    <img src="${resenhaData.resenhaByImg}" alt="User Image" class="userImg4">
                    <div>
                      <strong>${resenhaData.resenhaBy} <span class="resenha-date"> ${new Date(resenhaData.resenhaAt).toLocaleString()} </span>
                      </strong>
                      
                      <p class="resenha-text">${resenhaData.resenha}</p>
                      </div>
                      </div>
                      <hr>
                </div>`;
            resenhaDiv.appendChild(resenhaDiv1)
            resenhaPopup.appendChild(resenhaDiv)
            resenhasContainer.appendChild(resenhaPopup)

          }


          
        });
        setTimeout(() => abrirPopup(), 100);

        if(leu || userId === '60ATcph6xShfJB7wfqFxBIGaZp32'){

          const resenhaDiv1 = document.createElement('div'); 
          resenhaDiv1.classList.add('resenha-item');
          const divPutResenha =  document.createElement('div');
  
          const formId = `resenhaForm/${task.key}`;
          const existingForm = document.getElementById(formId);
          
          if (!existingForm) {
              const btnPostarResenha = document.createElement('button');
              btnPostarResenha.textContent = 'Postar Resenha';
              btnPostarResenha.setAttribute('class', 'btn-postar-resenha');
              btnPostarResenha.addEventListener('click', () => {
                  sentResenha(task.key);
              });
          
              const resenhaForm = document.createElement('form');
              resenhaForm.setAttribute('id', formId);
              resenhaForm.setAttribute('action', `sentResenha(${task.key})`)
              const TxtResenha = document.createElement('textarea');
              TxtResenha.setAttribute('id', `TextResenha/${task.key}`);
              TxtResenha.setAttribute('class', 'inputResenha');
              
              resenhaForm.appendChild(TxtResenha);
              divFormResenha.appendChild(resenhaForm);
              divFormResenha.appendChild(btnPostarResenha);
              divPutResenha.appendChild(divFormResenha)
              resenhaDiv.appendChild(divPutResenha);
              resenhaPopup.appendChild(resenhaDiv)
              resenhasContainer.appendChild(resenhaPopup)
          }
        }else{
          const resenhaDiv1 = document.createElement('div'); 
          resenhaDiv1.classList.add('resenha-item');
  
          resenhaDiv1.innerHTML = `
          <div class="resenhaDiv1">
          <button class="close-btn" onclick="fecharPopup()">×</button>
          <div class="resenha-header">
                
          <img src="img/dummy-geschichte.jpg" class="userImg4"></img>
                 <div>
                    <h2>
                        Que tal esta diversão?
                    </h2>
                    <p> Mergulhe na leitura e depois conte para gente o que achou!  </p>
                 </div>
               </div>
             </div>`;
             resenhaDiv.appendChild(resenhaDiv1)
             
         resenhaPopup.appendChild(resenhaDiv)
         resenhasContainer.appendChild(resenhaPopup)
        }
        

      } else {
        console.log('nao tem resenhas');

        const resenhaDiv1 = document.createElement('div'); 
        resenhaDiv1.classList.add('resenha-item');

        resenhaDiv1.innerHTML = `
        <div class="resenhaDiv1">
        <button class="close-btn" onclick="fecharPopup()">×</button>
        <div class="resenha-header">
              <img src="img/dummy-geschichte.jpg" class="userImg4"></img>
               <div>
               <h1>
                   Que tal esta diversão?
               </h1>
                  <h2>
                      seja o primeiro a postar uma resenha! 
                       mergulhe no mundo da leitura e depois conte para a gente o que achou!  
                      </h2>
               </div>
             </div>
           </div>`;
           resenhaDiv.appendChild(resenhaDiv1)
           
       resenhaPopup.appendChild(resenhaDiv)
       resenhasContainer.appendChild(resenhaPopup)


       if(leu || userId === '60ATcph6xShfJB7wfqFxBIGaZp32'){

        const resenhaDiv1 = document.createElement('div'); 
        resenhaDiv1.classList.add('resenha-item');
        const divPutResenha =  document.createElement('div');

        const formId = `resenhaForm/${task.key}`;
        const existingForm = document.getElementById(formId);
        
        if (!existingForm) {
            const btnPostarResenha = document.createElement('button');
            btnPostarResenha.textContent = 'Postar Resenha';
            btnPostarResenha.setAttribute('class', 'btn-postar-resenha');
            btnPostarResenha.addEventListener('click', () => {
                sentResenha(task.key);
            });
        
            const resenhaForm = document.createElement('form');
            resenhaForm.setAttribute('id', formId);
            resenhaForm.setAttribute('action', `sentResenha(${task.key})`)
            const TxtResenha = document.createElement('textarea');
            TxtResenha.setAttribute('id', `TextResenha/${task.key}`);
            TxtResenha.setAttribute('class', 'inputResenha');
            
            resenhaForm.appendChild(TxtResenha);
            divFormResenha.appendChild(resenhaForm);
            divFormResenha.appendChild(btnPostarResenha);
            divPutResenha.appendChild(divFormResenha)
            resenhaDiv.appendChild(divPutResenha);
            resenhaPopup.appendChild(resenhaDiv)
            resenhasContainer.appendChild(resenhaPopup)
        }
      }else{
        const resenhaDiv1 = document.createElement('div'); 
        resenhaDiv1.classList.add('resenha-item');

        resenhaDiv1.innerHTML = `
        <div class="resenhaDiv1">
        <button class="close-btn" onclick="fecharPopup()">×</button>
        <div class="resenha-header">
              
               <div>

               </div>
             </div>
           </div>`;
           resenhaDiv.appendChild(resenhaDiv1)
           
       resenhaPopup.appendChild(resenhaDiv)
       resenhasContainer.appendChild(resenhaPopup)
      }
        
      }    
      setTimeout(() => abrirPopup(), 100);

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
      
      
      btnMostrarResenhas.appendChild(imgLi);
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

function hasRead(taskKey, userId) {
  return dbRefUsers.child(`tasks/${taskKey}/rentalHistory`).once('value')
    .then(snapshot => {
      if (snapshot.exists() && snapshot.hasChildren()) {
        // Percorre cada entrada do rentalHistory e coleta os rentedById
        const leitores = [];
        snapshot.forEach(childSnapshot => {
          const rentedById = childSnapshot.val().rentedById;
          if (rentedById) {
            leitores.push(rentedById);
          }
        });
        return leitores.includes(userId); // Verifica se o userId está na lista
      } else {
        console.log("Não possui um histórico de leitores");
        return false;
      }
    })
    .catch(error => {
      console.error("Erro ao buscar leitores:", error);
      return false;
    });
}



// historico de leitura do usuario
function HistoricoDeLeitura(){
  const userId = firebase.auth().currentUser.uid; // Obtém o ID do usuário atual 
  RentedBooksList.innerHTML = '';
  let num = 0; // Inicializa o contador

  dbRefUsers.child('tasks')
    .once('value')
    .then((snapshot) =>{
      const allBooks = snapshot.val()
      const filteredBooks = []//array que vai armazenar os livros filtrados

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


// função para publicar resenha
function sentResenha(key) {
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


// Função para remover uma resenha
function removeResenha(taskKey, resenhaKey) {
  const user = firebase.auth().currentUser;
  const userId = user.uid;
  const dbRefUsers = firebase.database().ref('users');
  console.log("taskKey:", taskKey);
console.log("resenhaKey:", resenhaKey);
  // Obtém a resenha específica
  dbRefUsers.child(`tasks/${taskKey}/resenhas/${resenhaKey}`).once('value')
    .then(snapshot => {
      const resenhaData = snapshot.val();
      console.log("resenhaData:", resenhaData);
      if (!resenhaData) {
        console.error("Resenha não encontrada ou o caminho está incorreto.");
        alert("Resenha não encontrada.");
        return;
      }

      // Verifica se o usuário é o autor da resenha ou um administrador
      if (resenhaData.resenhaById === userId || userId === '60ATcph6xShfJB7wfqFxBIGaZp32') {
        dbRefUsers.child(`tasks/${taskKey}/resenhas/${resenhaKey}`).remove()
          .then(() => {
            alert("Resenha removida com sucesso.");
          })
          .catch(error => {
            console.error("Erro ao remover resenha:", error);
          });
      } else {
        alert("Você não tem permissão para remover esta resenha.");
      }
    })
    .catch(error => {
      console.error("Erro ao buscar resenha:", error);
    });
}

function qualquercoisa(buttonElement) {
  const resenhaData = JSON.parse(buttonElement.getAttribute('data-resenha'));
  console.log(resenhaData);
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




