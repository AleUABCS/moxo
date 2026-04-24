// Ejemplo de regex
// var regex = new RegExp("ab+c")


// Variable para almacenar el código
var code = ""

// Variable del área de texto
var code_area = document.getElementById("code-area")

// Variable del botón "Ejecutar"
let button = document.getElementById("run-button")


button.addEventListener("click", function() {
    code = code_area.value
    
    console.log("Código: \n",code)
    
    
    let regPrint = /imprimir/
    
    var found = regPrint.exec(code)
    if (found) {
        console.log("Imprimir enontrado")
    } else {
        console.log("No hubo coincidencia")
    }
})