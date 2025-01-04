// const { default: firebase } = require("firebase/compat/app")



//traduz a verificação de email
firebase.auth().languageCode = 'pt-br'

authForm.onsubmit = function(event){
    showItem(loading)
    event.preventDefault()
    if(authForm.submitAuthForm.innerHTML == 'Acessar'){ 
        firebase.auth().signInWithEmailAndPassword(authForm.email.value, 
            authForm.password.value ).catch(function (error){
                    showError('falha no acesso ', error)
            })
    }else{
        firebase.auth().createUserWithEmailAndPassword(authForm.email.value, 
            authForm.password.value ).catch(function (error){
                showError('falha no cadastro ', error)
            })
    }
}

firebase.auth().onAuthStateChanged(function(user){
    hideItem(loading)
    if(user){
       showUserContent(user)
    }else{
        showAuth()
    }
})

// função que permite o usuario se deslogar do app 
function signOut(){

    firebase.auth().signOut().catch(function(error){
        showError('erro ao sair '+ error)
    })
}

//envia email de verificicação

function sendEmailVerification(){
    showItem(loading)
    var user = firebase.auth().currentUser
    user.sendEmailVerification(actionCodeSettings).then(function(){
        alert('email de verificação foi enviado')
    }).catch(function(error){
        showError('falha ao enviar email de verificação '+ error)
    }).finally(function(){
        hideItem(loading)
    })
    
    }


    //reset de senha

  function  sendPasswordResetEmail(){
    var email = prompt('email para redefinir a senha:', authForm.email.value)
    if(email){
        showItem(loading)
        firebase.auth().sendPasswordResetEmail(email, actionCodeSettings).then(function(){
            alert('email para resetar a senha foi enviado.')
        }).catch(function(error){
            showError('falha ao enviar email para redefinir a senha', error)
        }).finally(function(){
            hideItem(loading)
        })
    }else{
        alert('preencha o campo de email.')
    }
  }

  //função que permite o login pelo google

  function signInWithGoogle(){
    showItem(loading)
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(function(error){
        console.log(error)
    }).finally(function(){
        hideItem(loading)
    })
  }

  // função que permite atualizar informações de usuarios

  function updateUserName(){
    var newUserName = prompt('informe um novo nome de usuario.')
    if (newUserName && newUserName != ''){
      
        userName.innerHTML = newUserName
        firebase.auth().currentUser.updateProfile({
            displayName: newUserName
        }).catch(function(error){
            console.log(error)
            alert('ocorreu um erro ao atualizar o nome')
        })
    }else{
        alert('preencha o campo com caracteres válidos')
    }
  }


  // função de exckuir a conta 

  function deleteUserAccount(){
    var confirmation = confirm('realmente deseja excluir a conta?')
    if(confirmation){
        showItem(loading)
        firebase.auth().currentUser.delete().then(function(){
            alert('conta excluida com sucesso')
        }).catch(function(error){
            alert("houve um erro ao excluir a sua conta")
            console.log(error)
        }).finally(function(){
            hideItem(loading)
        })
    }
  }