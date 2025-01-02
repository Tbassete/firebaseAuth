

todoForm.onsubmit = function(event){
    event.preventDefault()// evita o redirecionamento da pagina
    if(todoForm.name.value != ''){
        var data = {
            name: todoForm.name.value
        }
        dbRefUsers.child(firebase.auth().currentUser.uid).push(data).then(function(){
            console.log('tarefa:'+ data.name+' adicionada com sucesso' )
        }).catch(function(error){
            console.log(error)
        })

        todoForm.name.value = ''
    }else{
        alert('o nome da tarefa nao pode estar vazio')
    }
}


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

function fillTodoList(dataSnapshot) {
    ulTodoList.innerHTML = '';
    let num = 0;

    dataSnapshot.forEach(function(userSnapshot) {
        userSnapshot.forEach(function(item) {
            var value = item.val();
            var li = document.createElement('li');
            var spanLi = document.createElement('span');
            spanLi.appendChild(document.createTextNode(value.name));
            li.appendChild(spanLi);
            ulTodoList.appendChild(li);
            num++;

            var liRemoveBtn = document.createElement('button')
            liRemoveBtn.appendChild(document.createTextNode('excluir'))
            liRemoveBtn.setAttribute('onclick','removeTodo(\"'+item.key+'\")')
            liRemoveBtn.setAttribute('class', 'danger todoBtn')
            li.appendChild(liRemoveBtn)

            var liUpdateBtn = document.createElement('button')
            liUpdateBtn.appendChild(document.createTextNode('editar'))
            liUpdateBtn.setAttribute('onclick', 'updateTodo(\"'+item.key+'\")')
            liUpdateBtn.setAttribute('class', 'alternative todoBtn')
            li.appendChild(liUpdateBtn)
        });
    });

    todoCount.innerHTML = num + (num > 1 ? ' tarefas' : ' tarefa') + ':';
}


//remove tarefas de um usuario
// function removeTodo(key){
//     var confirmation = confirm('realmente deseja remover ?')
//     if(confirmation){
//         dbRefUsers.child(firebase.auth().currentUser.uid).child(key).remove().catch(function(error){
//             showError('erro ao excluir', error)
//             console.log(error)
//         })
//     }
// }

// codigo para qualquer um conseguir remover

function removeTodo(key) {
    var confirmation = confirm('Realmente deseja remover?');
    if (confirmation) {
        dbRefUsers.once('value')
            .then((snapshot) => {
                let taskFound = false;

                snapshot.forEach((userSnapshot) => {
                    if (userSnapshot.hasChild(key)) {
                        userSnapshot.child(key).ref.remove()
                            .then(() => {
                                alert('Tarefa removida com sucesso!');
                                taskFound = true;
                            })
                            .catch((error) => {
                                showError('Erro ao excluir a tarefa.', error);
                                console.log(error);
                            });
                    }
                });

                if (!taskFound) {
                    alert('Tarefa não encontrada.');
                }
            })
            .catch((error) => {
                showError('Erro ao acessar o banco de dados.', error);
                console.log(error);
            });
    }
}

// função para editar as tarefas

function updateTodo (key){
    var selectedItem = document.getElementsByTagName(key)
    var newTodoName = prompt('escolha o novo nome para a tarefa', selectedItem.innerHTML)
    if(newTodoName != ''){
        var data ={
            name: newTodoName
        }

        dbRefUsers.child(firebase.auth().currentUser.uid).child(key).update(data).then(function(){
            console.log('tarefa atualizada com sucesso')
        }).catch(function(error){
            showError('falha ao atualizar a tarefa', error)
        })
    }else{
        alert('o nome da tarefa nao pode estar vazio')
    }

}
