
// Variable para almacenar el código
var code = ""
//Arreglo para almacenar las variables
var variables = {}
// Área de texto para el código
let code_area = document.getElementById("code-area")
// Botón "Ejecutar"
let button = document.getElementById("run-button")
// Terminal
let terminal = document.getElementById("terminal")
// Función del botón

//Esta variable es global para que el eventListener de la terminal peuda conseguir su valor,
//es el nombre (String) de la nueva variable a almacenar
let leer

// RegExp para cada palabra clave
let reg_imprimir = /\bimprimir\b/
let reg_imprimir_variable = /imprimir\s*(\S+)/ // Si el dato a imprimir no está entre comillas (es una variable o está mal)
let reg_imprimir_con_operador = /imprimir\s*=\s*\S+/ // Comprueba si está el operador "=" entre imprimir y el dato a imprimir (por ejemplo: "imprimir = x" (lo cual es incorrecto))

let reg_si = /\bsi\b/
let reg_si_condicion = /si\s*\(([^)]*)\)/ // Texto entre paréntesis
let reg_si_tokens = /\s*(\S+)\s*([<>=!]+)\s*(\S+)\s*/ // Para separar los numeros y comparadores de la condición

let reg_leer = /\bleer\b/
let reg_leer_variable = /leer\s*(\S+)/
let reg_texto_antes_leer = /\S+.*(?=leer)/ // Para comprobar si hay texto antes de la palabra leer

let reg_mientras = /\bmientras\b/
let reg_si_no = /\bsi_no\b/
let reg_fin_si = /\bfin_si\b/
let reg_fin_si_no = /\bfin_si_no\b/
let reg_fin_mientras = /\bfin_mientras\b/

// RegExp para texto entre comillas
let reg_text_in_quotes = /"([^"]*)"/
// RegExp para texto después de dos puntos ":"
let reg_text_after_colon = /:\s*(.*)/

button.addEventListener("click", function() {
    code = code_area.value
    console.log("Código: \n",code)
    
    // Casos de cada palabra clave
    if (reg_imprimir.exec(code)) {
        console.log("[imprimir] enontrado")
        if (code.match(reg_imprimir_con_operador)) {
            console.log("Error: la palabra reservada [imprimir] no necesita un operador entre el dato y la palabra reservada [imprimir] (ejemplo correcto: imprimir x).")
        } else {
            let print = code.match(reg_text_in_quotes)
            if (print != null){
                console.log(
                    "Palabra clave: imprimir \n",
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
                    console.log("Valor: ", variables[print[1]])
                }
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
        if (code.match(reg_texto_antes_leer)) {
            console.log("Error: La palabra reservada [leer] tiene que ser asignada a una variable (ejemplo correcto: leer = x)")
        } else {

            leer = code.match(reg_leer_variable)
            if (leer != null) {
                writeTerminal(leer[1]+": ")
                
                console.log(
                    "Palabra clave: leer \n",
                    "Dato : ", leer[1]
                )
            }
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

// Al presionar ENTER en la terminal
terminal.addEventListener("keydown", function saveVariable (e) {
    if (e.key === "Enter") {
        //Toma el texto después de los dos puntos ":"
        let value = terminal.value.match(reg_text_after_colon)
        if (value != null) {
            variables[leer[1]] = value[1]
            console.log("Valor guardado: " + value[1])
        }
    }
})

function writeTerminal (text) {
    if (terminal.disabled == true) {
        console.log("terminal habilitada")
    }
    terminal.value = text
}