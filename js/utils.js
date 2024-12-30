// const { default: firebase } = require("firebase/compat/app")

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
  element.style.display = 'block'
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
  showItem(userContent)
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

//atributos extras de verificação de auth

var actionCodeSettings = {
  url: 'https://todo-13563.firebaseapp.com'
}
