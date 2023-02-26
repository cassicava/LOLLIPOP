
let contador = document.getElementById("contador");

contador.innerText =  localStorage.getItem("contador") || "0";

let pessoa = JSON.parse(localStorage.getItem('pessoa') ?? '[]')
let contextList = document.querySelector(".lista");
let liElement = document.createElement('li')


function renderizar(){

    if(pessoa.length > 0){
        
        pessoa.forEach(element => {
            contextList.innerHTML += `<li>${element}<li/>`
        });
    }
}
renderizar()

function incrementar(){
    contador.innerHTML = parseInt(contador.innerText) + 1;
    var nome = prompt("Quem você beijou?");
    pessoa.push(nome)
    addLista(nome);
    salvarContato()
    localStorage.setItem('pessoa', JSON.stringify(pessoa))
}

function addLista(nome){
    contextList.innerHTML += `<li>${nome}<li/>`
}

function decrementar(){


    
    contador.innerHTML = parseInt(contador.innerText) - 1;
    salvarContato()
    pessoa.pop()
    localStorage.setItem('pessoa', JSON.stringify(pessoa))
    renderizar
    
    if(pessoa.length >= 0){
        contextList.innerHTML = ''
        pessoa.forEach(element => {
            contextList.innerHTML += `<li>${element}<li/>`
        });
    }

}

function limpar(){
    contador.innerHTML = 0;
    let contextList = document.querySelector(".lista");
    contextList.innerHTML = ` `
    salvarContato()

    pessoa = [];
    localStorage.setItem('pessoa', JSON.stringify(pessoa))
}

function salvarContato(){
    localStorage.setItem("contador", contador.innerText)
}