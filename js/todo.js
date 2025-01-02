

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

        var file = todoForm.file.files[0]//seleciona o primeiro arquivo da seleção de arquivos
        if(file != ''){//verifica se o arquivo foi selecionado
            if(file.type.include('image')){//verifica se o arquivo é uma imagem

                // compõe o nome do arquivo
                var imgName = firebase.database().ref().push().key + '-'+file.name
                //compõe o caminho do arquivo
                var imgPath ='todoListFiles /' + firebase.auth().currentUser.uid + '/'+imgName
                //cria uma referencia de arquivo no caminho acima
                var storageRef = firebase.storage().ref(imgPath)
                //inicia o processo de upload
                storageRef.push(file)
            }
        }

        var data = {
            name: todoForm.name.value,
            userId: firebase.auth().currentUser.uid // Adiciona o userId do usuário atual
        };

        // Insere a tarefa na referência 'tasks'
        dbRefUsers.child('tasks').push(data).then(function() {
            console.log('Tarefa: ' + data.name + ' adicionada com sucesso');
        }).catch(function(error) {
            console.log('Erro ao adicionar tarefa:', error);
        });

        todoForm.name.value = ''; // Limpa o campo de entrada após adicionar a tarefa
    } else {
        alert('O nome da tarefa não pode estar vazio');
    }
};

function fillTodoList(tasks) {
    ulTodoList.innerHTML = '';
    let num = 0;

    // Verifica se tasks é um array
    if (Array.isArray(tasks) && tasks.length > 0) {
        tasks.forEach(function(task) {
            var li = document.createElement('li');
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
        todoCount.innerHTML = 'Nenhuma tarefa encontrada.';
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

// versao nova de remover tarefas

function removeTodo(key) {
    var userId = firebase.auth().currentUser.uid; // Obtém o uid do usuário autenticado
  
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
              var selectedItem = document.querySelector('[data-key="' + key + '"]'); // Encontra o item pelo atributo data-key
              if (selectedItem) {
                selectedItem.remove(); // Remove o item da lista no DOM
              }
              alert('Tarefa removida com sucesso!');
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
  