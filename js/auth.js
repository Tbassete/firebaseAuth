authForm.onsubmit = function(event){
    showItem(loading)
    event.preventDefault()
    if(authForm.submitAuthForm.innerHTML == 'Acessar'){ 
        firebase.auth().signInWithEmailAndPassword(authForm.email.value, 
            authForm.password.value ).catch(function (error){
                console.log("erro:" + error)
                hideItem(loading)
            })
    }else{
        firebase.auth().createUserWithEmailAndPassword(authForm.email.value, 
            authForm.password.value ).catch(function (error){
                console.log("erro:" + error)
                hideItem(loading)
            })
    }
}

firebase.auth().onAuthStateChanged(function(user){
    hideItem(loading)
    if(user){
        console.log("usuario authenticado")
        console.log(user)
    }else{
        console.log("nao autenticado")
    }
})