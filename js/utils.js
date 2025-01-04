
// Defindo referências para elementos da página
var authForm = document.getElementById('authForm')
var authFormTitle = document.getElementById('authFormTitle')
var register = document.getElementById('register')
var access = document.getElementById('access')
var loading = document.getElementById('loading')

var auth = document.getElementById('auth')
var userContent = document.getElementById('userContent')
var userEmail = document.getElementById('userEmail')

var sendEmailVerificationDiv = document.getElementById('sendEmailVerificationDiv')

var emailVerified = document.getElementById('emailVerified')

var passwordReset = document.getElementById('passwordReset')

var userImg = document.getElementById('userImg')

var userName = document.getElementById('userName')

var todoForm = document.getElementById('todoForm')
var todoCount = document.getElementById('todoCount')
var ulTodoList = document.getElementById('ulTodoList')

var search = document.getElementById('search')

var userInfo = document.getElementById('userInfo')
var todoList = document.getElementById('todoList')

var progressFeedback =document.getElementById('progressFeedback')
var progress = document.getElementById('progress')

var playPauseBtn = document.getElementById('playPauseBtn')
var cancelBtn =document.getElementById('cancelBtn')


// Alterar o formulário de autenticação para o cadastro de novas contas
function toggleToRegister() {
  authForm.submitAuthForm.innerHTML = 'Cadastrar conta'
  authFormTitle.innerHTML = 'Insira seus dados para se cadastrar'
  hideItem(register)
  showItem(access)
  hideItem(passwordReset)
}

// Alterar o formulário de autenticação para o acesso de contas já existentes
function toggleToAccess() {
  authForm.submitAuthForm.innerHTML = 'Acessar'
  authFormTitle.innerHTML = 'Acesse a sua conta para continuar'
  hideItem(access, passwordReset)
  showItem(register)
  showItem(passwordReset)
}

// Simpplifica a exibição de elementos da página
function showItem(element) {
  element.style.display = 'initial'
}

// Simpplifica a remoção de elementos da página
function hideItem(element) {
  element.style.display = 'none'
}

//mostrar conetudo para usuarios authenticated
function showUserContent(user){
  if(user.providerData[0].providerId != 'password'){
    emailVerified.innerHTML='email verificado'
    hideItem(sendEmailVerificationDiv)
  }else{
    if(user.emailVerified){
      emailVerified.innerHTML='email verificado'
      hideItem(sendEmailVerificationDiv)
    }else{
      emailVerified.innerHTML='autentique o seu email'
      showItem(sendEmailVerificationDiv)
    }
  }

  userImg.src = user.photoURL ? user.photoURL : 'img/unknownUser.png'
  userName.innerHTML = user.displayName
  userEmail.innerHTML= user.email
  hideItem(auth)



getDefaultTodoList()


// metodo feito pela udemy
// search.onkeyup =function(){
//   if(search.value != ''){
//     // busca tarefas filtradas somente uma vez
//     dbRefUsers.orderByChild('name')
//     .startAt(search.value)
//     .endAt(search.value + '\uf8ff')
//     .once('value').then( function(dataSnapshot) {
//       fillTodoList(dataSnapshot);
//     });
//   }else{
//     getDefaultTodoList()
//   }
// }


// metodo novo para mostrar todas as tarefas iterando por todos os usuarios
search.onkeyup = function () {
  if (search.value !== '') {
    const searchValue = search.value.toLowerCase();
    console.log('Pesquisa iniciada:', searchValue);

    dbRefUsers.child('tasks')
      .orderByChild('name') // Ordena as tarefas pelo campo 'name'
      .startAt(searchValue) // Começa a partir do valor da pesquisa
      .endAt(searchValue + '\uf8ff') // Termina até um valor muito alto para cobrir todas as possibilidades
      .once('value')
      .then(function (snapshot) {
        console.log('Dados recebidos:', snapshot.val());

        const filteredTasks = [];

        // Itera sobre as chaves do objeto recebido do Firebase
        snapshot.forEach(function (taskSnapshot) {
          const task = taskSnapshot.val();
          console.log('Tarefa encontrada:', task);

          // Adiciona a chave à tarefa para poder usá-la na exclusão/edição
          filteredTasks.push({ ...task, key: taskSnapshot.key });
        });

        console.log('Tarefas filtradas:', filteredTasks); // Verifique as tarefas filtradas
        fillTodoList(filteredTasks); // Passe o array filtrado diretamente
      })
      .catch(function (error) {
        console.error('Erro ao recuperar dados do Firebase:', error);
      });
  } else {
    getDefaultTodoList(); // Retorna à lista padrão quando o campo de pesquisa estiver vazio
  }
};

  showItem(userContent)
}

// busca as tarefas em tempo real (listagem padrão)
function getDefaultTodoList() {
  dbRefUsers.child('tasks').orderByChild('name').on('value', function(dataSnapshot) {
    // Cria um array de tarefas a partir do dataSnapshot
    const tasks = [];

    dataSnapshot.forEach(function(taskSnapshot) {
      const task = taskSnapshot.val();
      // Adiciona a chave à tarefa para poder usá-la na exclusão/edição
      tasks.push({ ...task, key: taskSnapshot.key });
    });

    // Passa as tarefas para a função fillTodoList
    fillTodoList(tasks);
  });
}



//mostra a tela de authentication
function showAuth(){
  hideItem(userContent)
  showItem(auth)
}
// cebtralizar e traduzir erros 
function showError(prefix, error) {



  console.log(error.code);
  hideItem(loading);

  switch (error.code) {
    case 'auth/invalid-email':
    case 'auth/wrong-password':
      alert(prefix + ' email ou senha incorretos');
      break;
    default:
      alert(prefix + ' ' + error.message);
      break;
  }
}

// esconde o perfil

function closeProfile(){
  hideItem(userInfo)
  showItem(todoList)
}


// exibe o perfil

function showProfile(){
  showItem(userInfo)
  hideItem(todoList)
}

//atributos extras de verificação de auth

var actionCodeSettings = {
  // url: 'https://todo-13563.firebaseapp.com' //voltar para esse depois
  url: 'http://127.0.0.1'
}

var database = firebase.database()
var dbRefUsers = database.ref('users')