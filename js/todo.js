

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

              trackUpload(upload).then(function(){
                storageRef.getDownloadURL().then(function(downloadURL){
                  const user = firebase.auth().currentUser;
                  var data = {
                    imgUrl: downloadURL,
                    name: todoForm.name.value,
                    userName: user.displayName,
                    userId: firebase.auth().currentUser.uid // Adiciona o userId do usuário atual
                };
    
                // Insere a tarefa na referência 'tasks'
                dbRefUsers.child('tasks').push(data).then(function() {
                    console.log('Tarefa: ' + data.name + ' adicionada com sucesso');
                }).catch(function(error) {
                    console.log('Erro ao adicionar o livro:', error);
                });
    
                todoForm.name.value = ''; 
                todoForm.file.value = '';
                }).catch(function(error){
                  showError('erro ao adicionar o livro', error)
                })
                
              })


          } else {
              console.log('O arquivo selecionado não é uma imagem');
          }
      } else {
          alert('o livro precisa de uma foto da capa');
      }
  } else {
      alert('O nome da tarefa não pode estar vazio');
  }
};

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

function fillTodoList(tasks) {
    ulTodoList.innerHTML = '';
    let num = 0;

    // Verifica se tasks é um array
    if (Array.isArray(tasks) && tasks.length > 0) {
        tasks.forEach(function(task) {
          

            var li = document.createElement('li');

            var imgLi = document.createElement('img')
            imgLi.src = task.imgUrl ? task.imgUrl: 'img/defaultTodo.png'
            imgLi.setAttribute('class','imgTodo')
            li.appendChild(imgLi)
            var spanLi = document.createElement('span');
            spanLi.appendChild(document.createTextNode(task.name));
            li.appendChild(spanLi);
            ulTodoList.appendChild(li);

            var liRemoveBtn = document.createElement('button');
            liRemoveBtn.appendChild(document.createTextNode('excluir'));
            liRemoveBtn.setAttribute('onclick', 'removeTodo("' + task.key + '")');
            liRemoveBtn.setAttribute('class', 'danger todoBtn');
            li.appendChild(liRemoveBtn);

            var liUpdateBtn = document.createElement('button');
            liUpdateBtn.appendChild(document.createTextNode('editar'));
            liUpdateBtn.setAttribute('onclick', 'updateTodo("' + task.key + '")');
            liUpdateBtn.setAttribute('class', 'alternative todoBtn');
            li.appendChild(liUpdateBtn);

            num++;
        });

        todoCount.innerHTML = num + (num > 1 ? ' tarefas' : ' tarefa') + ':';
    } else {
        todoCount.innerHTML = 'Nenhuma livro disponivel.';
    }
}
 
  

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

//exibe todas as tarefas.





  

// remove tarefas de um usuario feito pela udemy

// function removeTodo(key){
//     var confirmation = confirm('realmente deseja remover ?')
//     if(confirmation){
//         dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove().catch(function(error){
//             showError('erro ao excluir', error)
//             console.log(error)
//         })
//     }
// }

// versao nova de remover tarefas tenho que arrumar pois nao esta removendo a imagem do banco de dados.

function removeTodo(key) {
  var userId = firebase.auth().currentUser.uid; // Obtém o uid do usuário autenticado
  var todoName = document.querySelector('#' + key + ' > span');
  var todoImg = document.querySelector('#' + key + ' > img');

  // Busca a tarefa no Firebase para verificar o userId
  dbRefUsers.child('tasks').child(key).once('value').then(function(snapshot) {
    var task = snapshot.val();

    // Verifica se o usuário autenticado é o criador da tarefa
    if (task && task.userId === userId) {
      var confirmation = confirm('Realmente deseja remover esta tarefa?');

      if (confirmation) {
        // Remove a tarefa do Firebase
        dbRefUsers.child('tasks').child(key).remove()
          .then(() => {
            // Se a tarefa foi removida com sucesso, também a remove do DOM
            var selectedItem = document.querySelector('[data-key="' + key + '"]');
            if (selectedItem) {
              selectedItem.remove(); // Remove o item da lista no DOM
            }
            alert('Tarefa removida com sucesso!');

            // Verifica se a imagem existe antes de tentar removê-la
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

  function removeFile(imgUrl){
    console.log(imgUrl)
    var result = imgUrl.indexOf('img/defaultTodo.png')

    if(result == -1){
      firebase.storage().refFromURL(imgUrl).delete().then(()=>{
        console.log('imagem removida com sucesso')
      }).catch((error)=>{
        console.log('falha ao remover o arquivo')
        console.log(error)
      })
    }else{
      console.log('nenhum arquivo foi removido')
    }
  }

// codigo para qualquer um conseguir remover

// function removeTodo(key) {
//     var confirmation = confirm('Realmente deseja remover?');
//     if (confirmation) {
//         dbRefUsers.once('value')
//             .then((snapshot) => {
//                 let taskFound = false;

//                 snapshot.forEach((userSnapshot) => {
//                     if (userSnapshot.hasChild(key)) {
//                         userSnapshot.child(key).ref.remove()
//                             .then(() => {
//                                 alert('Tarefa removida com sucesso!');
//                                 taskFound = true;
//                             })
//                             .catch((error) => {
//                                 showError('Erro ao excluir a tarefa.', error);
//                                 console.log(error);
//                             });
//                     }
//                 });

//                 if (!taskFound) {
//                     alert('Tarefa não encontrada.');
//                 }
//             })
//             .catch((error) => {
//                 showError('Erro ao acessar o banco de dados.', error);
//                 console.log(error);
//             });
//     }
// }

// função para editar as tarefas pela udemy

// function updateTodo (key){
//     var selectedItem = document.getElementsByTagName(key)
//     var newTodoName = prompt('escolha o novo nome para a tarefa', selectedItem.innerHTML)
//     if(newTodoName != ''){
//         var data ={
//             name: newTodoName
//         }

//         dbRefUsers.child(firebase.auth().currentUser.uid).child(key).update(data).then(function(){
//             console.log('tarefa atualizada com sucesso')
//         }).catch(function(error){
//             showError('falha ao atualizar a tarefa', error)
//         })
//     }else{
//         alert('o nome da tarefa nao pode estar vazio')
//     }

// }


// função para editar tarefas do jeito novo

function updateTodo(key) {
    var userId = firebase.auth().currentUser.uid; // Obtém o uid do usuário autenticado
  
    // Busca a tarefa no Firebase para verificar o userId
    dbRefUsers.child('tasks').child(key).once('value').then(function(snapshot) {
      var task = snapshot.val();
  
      // Verifica se o usuário autenticado é o criador da tarefa
      if (task && task.userId === userId) {

  
          var newTodoName = prompt('Escolha o novo nome para a tarefa'); // Usa innerText para pegar o nome da tarefa
          if (newTodoName != '' && newTodoName) {
            var data = {
              name: newTodoName
            };
  
            // Atualiza o Firebase com a nova tarefa
            dbRefUsers.child('tasks').child(key).update(data).then(function () {
              console.log('Tarefa atualizada com sucesso');
            }).catch(function (error) {
              console.error('Falha ao atualizar a tarefa:', error);
              showError('Falha ao atualizar a tarefa', error);
            });
          } else {
            alert('O nome da tarefa não pode estar vazio');
          }
        
        
      } else {
        alert('Você não tem permissão para atualizar esta tarefa');
        console.log('Tentativa de atualização não permitida. Usuário não é o criador.');
      }
    }).catch(function(error) {
      console.error('Erro ao verificar a tarefa no Firebase:', error);
      showError('Erro ao verificar a tarefa', error);
    });
  }
  