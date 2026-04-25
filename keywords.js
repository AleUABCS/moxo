
// Variable para almacenar el código
var code = ""
//Arreglo para almacenar las variables
var variables = {}
// Variable del área de texto
var code_area = document.getElementById("code-area")
// Variable del botón "Ejecutar"
let button = document.getElementById("run-button")

// Función del botón
button.addEventListener("click", function() {
    code = code_area.value
    console.log("Código: \n",code)
    
    // RegExp para cada palabra clave
    let reg_imprimir = /\bimprimir\b/
    let reg_imprimir_variable = /imprimir\s*(\S+)/ // Si el dato a imprimir no está entre comillas (es una variable o está mal)

    let reg_si = /\bsi\b/
    let reg_si_condicion = /si\s*\(([^)]*)\)/ // Texto entre paréntesis
    let reg_si_tokens = /\s*(\S+)\s*([<>=!]+)\s*(\S+)\s*/ // Para separar los numeros y comparadores de la condición

    let reg_leer = /\bleer\b/
    let reg_leer_variable = /leer\s*(\S+)/

    let reg_mientras = /\bmientras\b/
    let reg_si_no = /\bsi_no\b/
    let reg_fin_si = /\bfin_si\b/
    let reg_fin_si_no = /\bfin_si_no\b/
    let reg_fin_mientras = /\bfin_mientras\b/

    // RegExp para texto entre comillas
    let text_in_quotes = /"([^"]*)"/

    // Casos de cada palabra clave
    if (reg_imprimir.exec(code)) {
        console.log("[imprimir] enontrado")
        let print = code.match(text_in_quotes)
        if (print != null){
            console.log(
                "Palabra calve: imprimir \n",
                "Dato: " + print[1]
            )
        } 
        else {
            let print = code.match(reg_imprimir_variable)
            if (print != null) {
                console.log(
                    "Palabra clave: imprimir \n",
                    "Dato: ", print[1]
                )
            }
        }
    } 
    if (reg_si.exec(code)) {
        console.log("[si] encontrado")

        let condicion = code.match(reg_si_condicion)
        if (condicion != null) {
            

            let tokens = condicion[1].match(reg_si_tokens)
            if (tokens != null) {
                let left = tokens[1]
                let operator = tokens[2]
                let right = tokens[3]

                console.log(
                    " Palbra clave: si \n",
                    "Números: [", left, ", ", right, "] \n",
                    "Operador: ", "[", operator, "]")
            }
        }
    }
    if (reg_leer.exec(code)) {
        console.log("[leer] encontrado")
        let leer = code.match(reg_leer_variable)
        if (leer != null) {
            variables[leer[1]] = "Variable guardada" // (Por ahora no se puede asignar el valor desde la consola)
            console.log(
                "Palabra clave: leer \n",
                "Dato : ", leer[1]
            )
        }
    }
    if (reg_mientras.exec(code)) {
        console.log("[mientras] encontrado")
    }
    if (reg_si_no.exec(code)) {
        console.log("[si_no] encontrado")
    }
    if (reg_fin_si.exec(code)) {
        console.log("[fin_si] encontrado")
    }
    if (reg_fin_si_no.exec(code)) {
        console.log("[fin_si_no] encontrado")
    }
    if (reg_fin_mientras.exec(code)) {
        console.log("[fin_mientras] encontrado")
    }
})