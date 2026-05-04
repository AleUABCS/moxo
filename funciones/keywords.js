
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

button.addEventListener("click", function () {
    terminal.value = ""
    code = code_area.value
    console.log("Código crudo: \n",code)

    moxoExecute(code)
})

// Divide el código en líneas y evalúa y ejecuta los tokens línea por línea
function moxoExecute (code_block) {
    let splitCode = code_block.split("\n") // Separar código por líneas

    // Para debug
    console.log("Código separado: ")
    splitCode.forEach(line => {
        console.log(line)
    });
    
    var i = 0
    var line

    while (i < splitCode.length) {
        line = splitCode[i]
        if (reg_imprimir.exec(line)) {
            console.log("[imprimir] enontrado")
            if (line.match(reg_imprimir_con_operador)) {
                console.log("Error: la palabra reservada [imprimir] no necesita un operador entre el dato y la palabra reservada [imprimir] (ejemplo correcto: imprimir x).")
            } else {
                let print = line.match(reg_text_in_quotes)
                if (print != null){
                    console.log(
                        "Palabra clave: imprimir \n",
                        "Dato: " + print[1]
                    )
                    writeTerminal(print[1])
                } 
                else {
                    let print = line.match(reg_imprimir_variable)
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

        if (reg_si.exec(line)) {
            console.log("[si] encontrado")
            
            let condition = line.match(reg_si_condicion)
            
            if (condition != null) {
                var flag = false
                var if_code_block = []
                var isSingleLine = false
                
                let tokens = condition[1].match(reg_si_tokens)
                if (tokens != null) {
                    let left = tokens[1]
                    let operator = tokens[2]
                    let right = tokens[3]
                    
                    if (operator == "==") {
                        if (left === right) {
                            console.log("Condición = true")
                            flag = true
                        } else {
                            console.log("Condición = false")
                        }
                    } else if (operator == "<") {
                        if (left < right) {
                            console.log("Condición = true")
                            flag = true
                        } else {
                            console.log("Condición = false")
                        }
                    } else if (operator == ">") {
                        if (left > right) {
                            console.log("Condición = true")
                            flag = true
                        } else {
                            console.log("Condición = false")
                        }
                    } else if (operator == "<=") {
                        if (left <= right) {
                            console.log("Condición = true")
                            flag = true
                        } else {
                            console.log("Condición = false")
                        }
                    } else if (operator == ">=") {
                        if (left >= right) {
                            console.log("Condición = true")
                            flag = true
                        } else {
                            console.log("Condición = false")
                        }
                    }
                    
                    while (!splitCode[i].includes("{") && !isSingleLine) {
                        i++
                        if (splitCode[i].match(/[a-zA-Z0-9]/)) {
                            isSingleLine = true
                        }
                    }
                    if (!isSingleLine) {
                        i++
                    } else {
                        if_code_block = splitCode[i]
                    }
                    while (!splitCode[i].includes("}") && !isSingleLine) {
                        if_code_block.push(splitCode[i])
                        i++
                    }

                    console.log(if_code_block)

                    if (flag && !isSingleLine) {
                        moxoExecute(if_code_block.join("\n"))
                    } else {
                        moxoExecute(if_code_block)
                    }
                    
                    console.log(
                        " Palbra clave: si \n", 
                        "Números: [", left, ", ", right, "] \n",
                        "Operador: ", "[", operator, "]")
                }
            }
        }

        if (reg_leer.exec(line)) {
            console.log("[leer] encontrado")
            if (line.match(reg_texto_antes_leer)) {
                console.log("Error: La palabra reservada [leer] tiene que ser asignada a una variable (ejemplo correcto: leer = x)")
            } else {
                
                leer = line.match(reg_leer_variable)
                if (leer != null) {
                    writeTerminal(leer[1]+": ")
                    
                    console.log(
                        "Palabra clave: leer \n",
                        "Dato : ", leer[1]
                    )
                }
            }
        }

        if (reg_mientras.exec(line)) {
            console.log("[mientras] encontrado")
        }

        if (reg_si_no.exec(line)) {
            console.log("[si_no] encontrado")
        }

        if (reg_fin_si.exec(line)) {
            console.log("[fin_si] encontrado")
        }

        if (reg_fin_si_no.exec(line)) {
            console.log("[fin_si_no] encontrado")
        }
        
        if (reg_fin_mientras.exec(line)) {
            console.log("[fin_mientras] encontrado")
        }

        i++
    }

}

function writeTerminal (text) {
    if (terminal.disabled == true) {
        terminal.disabled = false
        console.log("terminal habilitada")
    }
    if (terminal.value == "") {
        terminal.value += text
    } else {
        terminal.value += "\n"+text
    }
}

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