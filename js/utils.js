
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
var userImg2 =document.getElementById('userImg2')
var userName = document.getElementById('userName')
var todoForm = document.getElementById('todoForm')
var todoCount = document.getElementById('todoCount')
var ulTodoList = document.getElementById('ulTodoList')
var RentedBooksList = document.getElementById('RentedBooksList')
var RentCount = document.getElementById('RentCount')
var search = document.getElementById('search')
var userInfo = document.getElementById('userInfo')
var todoList = document.getElementById('todoList')
var progressFeedback =document.getElementById('progressFeedback')
var progress = document.getElementById('progress')
var playPauseBtn = document.getElementById('playPauseBtn')
var cancelBtn =document.getElementById('cancelBtn')
var resetTodoForm = document.getElementById('resetTodoForm')

var confirmTodoUpdate = document.getElementById('confirmTodoUpdate')
var todoFormTitle = document.getElementById('todoFormTitle')

var headerBoots = document.getElementById('headerBoots')
var footerr = document.getElementById('footerr')

var DestaquesMega = document.getElementById('DestaquesMega')
var updatePhoto =document.getElementById('updatePhoto')
var  pagination = document.getElementById('pagination-controls')
var indexedBooks = document.getElementById('indexedBooks')
var buscar = document.getElementById('buscar')
var LogOut = document.getElementById('LogOut')

var formResenha = document.getElementById('formResenha')
var popUp = document.getElementById('popUp')
var resenhasContainer = document.getElementById('resenhasContainer')
var resenhaPopup = document.getElementById('resenhaPopup')
var resenhaDiv = document.getElementById('resenhaDiv')
var divFiltros = document.getElementById('divFiltros')
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
    emailVerified.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check-fill" viewBox="0 0 16 16">
    <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
  </svg>
`;

    hideItem(sendEmailVerificationDiv)
  }else{
    if(user.emailVerified){
      emailVerified.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-patch-check-fill" viewBox="0 0 16 16">
        <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708"/>
      </svg>
    `;
    
      hideItem(sendEmailVerificationDiv)
    }else{
      emailVerified.innerHTML='autentique o seu email'
      showItem(sendEmailVerificationDiv)
    }
  }
  userImg2.src = user.photoURL ? user.photoURL : 'img/unknownUser.png'
  userImg.src = user.photoURL ? user.photoURL : 'img/unknownUser.png'
  userName.innerHTML = user.displayName
  userEmail.innerHTML= user.email
  hideItem(auth)
  showItem(headerBoots)


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
    hideItem(pagination)
    const searchValue = search.value.toLowerCase(); // Mantém o valor exato da pesquisa
    console.log('Pesquisa iniciada:', searchValue);

    dbRefUsers.child('tasks')
      .orderByChild('nameToLowerCase') // Ordena as tarefas pelo campo 'name'
      .startAt(searchValue) // Começa a partir do valor da pesquisa (case sensitive)
      .endAt(searchValue + '\uf8ff') // Termina até um valor muito alto para cobrir todas as possibilidades
      .once('value')
      .then(function (snapshot) {
        console.log('Dados recebidos:', snapshot.val());

        const filteredTasks = [];

        // Itera sobre as chaves do objeto recebido do Firebase
        snapshot.forEach(function (taskSnapshot) {
          const task = taskSnapshot.val();
          console.log('Livro encontrado:', task);

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
    showItem(pagination)
  }
};

  showItem(userContent)
  showItem(footerr)
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
    showItem(pagination)
  });
}



//mostra a tela de authentication
function showAuth(){
  hideItem(headerBoots)
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
  hideItem(todoForm)
  hideItem(DestaquesMega)
  hideItem(LogOut)
  hideItem(divFiltros)
  fillRentedBooksList()
}

// exibe os destaques da biblioteca

function Destaques(){
  showItem(DestaquesMega)
  hideItem(todoList)
  hideItem(todoForm)
  hideItem(userInfo)
  hideItem(divFiltros)
  fetchAndFillHighlights()
  fillHighlightsFromFirebase()
  fillIndex()
}

function começarLeitura(){
  hideItem(DestaquesMega)
  hideItem(todoForm)
  hideItem(userInfo)
  showItem(todoList)
  showItem(divFiltros)
}

function DoarLivros(){
  showItem(todoForm)
  hideItem(divFiltros)
  hideItem(todoList)
  hideItem(userInfo)
  hideItem(DestaquesMega)
}

function closeDoarLivros(){
  showItem(todoList)
  hideItem(todoForm)
  showItem(divFiltros)
}

function CallSigOut(){
  showItem(LogOut)
}

function cancel(){
  hideItem(LogOut)
  }
//atributos extras de verificação de auth

var actionCodeSettings = {
  // url: 'https://todo-13563.firebaseapp.com' //voltar para esse depois
  url: 'https://megatecabrasil.web.app/'
  // ur: 'https://127.0.0.1'
}


// abrir e fechar resenhas

function abrirPopup() {
  const resenhaPopup = document.getElementById('resenhaPopup');
  if (resenhaPopup) {
    resenhaPopup.classList.add('show');

  } else {
    console.error("Popup não encontrado no DOM!");
  }
}

// Função para fechar popup
function fecharPopup() {
  const resenhaPopup = document.getElementById('resenhaPopup');
  if (resenhaPopup) {

    resenhaPopup.classList.remove('show');
  }
}


// configurações da nav do header


// Seleciona o menu colapsável e os itens de navegação
const navbarCollapse = document.getElementById('navbarsExampleXxl');
const navItems = document.querySelectorAll('#ulHeader .nav-item');

// Adiciona um evento de clique a cada item do menu
navItems.forEach((item) => {
  item.addEventListener('click', () => {
    // Verifica se o menu está aberto
    if (navbarCollapse.classList.contains('show')) {
      // Fecha o menu removendo a classe 'show'
      const bootstrapCollapse = new bootstrap.Collapse(navbarCollapse);
      bootstrapCollapse.hide();
    }
  });
});


var database = firebase.database()
var dbRefUsers = database.ref('users')