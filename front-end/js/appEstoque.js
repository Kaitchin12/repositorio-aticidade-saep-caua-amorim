
var modal = document.getElementById("myModal");
var btn = document.getElementById("myBtn");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() { modal.style.display = "flex"; }
span.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) {
  if (event.target == modal) { modal.style.display = "none"; }
}




const formulario = document.querySelector(".formulario-modal");

formulario.addEventListener("submit", async (event) => {
    event.preventDefault(); 



    let nomeProd = document.querySelector(".input-nome-modal").value;
    let precoProd = document.querySelector(".input-preco").value;
    let qtdProd = document.querySelector(".input-quantidade").value;

 
    const dadosProduto = {
        nome_prod: nomeProd, 
        preco: parseFloat(precoProd),
        quantidade: parseInt(qtdProd) 
    };

    

    try {
        const response = await fetch('http://localhost:2005/produtoCadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosProduto)
        });

        const respostaTexto = await response.text();

        if (response.ok) {
            alert("Sucesso: Produto cadastrado!"); 
            modal.style.display = "none";
            formulario.reset(); 
           
        } else {
            alert("Erro do servidor: " + respostaTexto);
        }

    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao conectar com o servidor.");
    }
});