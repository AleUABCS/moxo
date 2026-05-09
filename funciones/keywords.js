
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
let reg_si_no = /\bsi_no\b/
let reg_fin_si = /\bfin_si\b/
let reg_fin_si_no = /\bfin_si_no\b/

let reg_leer = /\bleer\b/
let reg_leer_variable = /^[a-zA-Z_$][a-zA-Z0-9_$]*\s*=\s*leer$/ // Para leer el nombre de la variable a asignar el valor
let reg_leer_variable = /leer\s*(\S+)/
let reg_texto_antes_leer = /\S+.*(?=leer)/ // Para comprobar si hay texto antes de la palabra leer

let reg_mientras = /\bmientras\b/
let reg_fin_mientras = /\bfin_mientras\b/
let reg_mientras_condicion = /mientras\s*\(([^)]*)\)/ // Para conseguir la condición del [mientras]

// RegExp para texto entre comillas
let reg_text_in_quotes = /"([^"]*)"/
// RegExp para texto después de dos puntos ":"
let reg_text_after_colon = /:\s*(.*)/
// RegExp línea en blanco (blank)
let reg_blank = /^\s*$/
// RegExp para detectar nombres de variables
let reg_variable = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
// RegExp para separar los numeros o variables y comparadores de una condición
let reg_tokens = /\s*(\S+)\s*([<>=!]+)\s*(\S+)\s*/

button.addEventListener("click", function () {
    terminal.value = ""
    code = code_area.value +"\n end"
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
            if (line.match(reg_imprimir_con_operador)) { // Caso de error: se intentó imprimir con operador entre la palabra clave y el texto
                console.log("Error: la palabra reservada [imprimir] no necesita un operador entre el dato y la palabra reservada [imprimir] (ejemplo correcto: imprimir x).")
            } else {
                let print = line.match(reg_text_in_quotes) // Si se va a imprimir texto entre comillas
                if (print != null){
                    console.log(
                        "Palabra clave: imprimir \n",
                        "Dato: " + print[1]
                    )
                    writeTerminal(print[1])
                } 
                else { // Si lo que se va a imprimri es texto asigando a una variable ([imprimir x] por ejemplo)
                    let print = line.match(reg_imprimir_variable)
                    if (print != null) {
                        console.log(
                            "Palabra clave: imprimir \n",
                            "Dato: ", print[1]
                        )
                        console.log("Valor: ", variables[print[1]])
                        writeTerminal(variables[print[1]])
                    }
                }
            }
        }

        if (reg_si.exec(line)) {
            console.log("[si] encontrado")
            
            let condition = line.match(reg_si_condicion)
            
            if (condition != null) {
                var if_code_block = []
                var if_else_code_block = []
                var else_flag = false

                let tokens = condition[1].match(reg_tokens)
                if (tokens != null) {
                    var left = tokens[1]
                    let operator = tokens[2]
                    var right = tokens[3]
                    
                    flag = evaluateCondition(left, operator, right)
                    
                    i++

                    // Consumir líneas del bloque [si]
                    while (!splitCode[i].includes("fin_si")) {
                        if_code_block.push(splitCode[i])
                        i++
                    }

                    i++

                    // Saltar líneas en blanco
                    while (splitCode[i].match(reg_blank)) {
                        i++
                    }

                    // Consumir líneas del [si_no] si las hay
                    if (splitCode[i].match(reg_si_no)) {
                        else_flag = true
                        i++
                        while (!splitCode[i].match(reg_fin_si_no)) {
                            if_else_code_block.push(splitCode[i])
                            i++
                        }
                    }

                    console.log(if_code_block)
                    console.log(if_else_code_block.length == 0? "No else" : if_else_code_block)

                    if (flag) {
                        moxoExecute(if_code_block.join("\n"))
                    } else if (else_flag) {
                        moxoExecute(if_else_code_block.join("\n"))
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

            let condition = line.match(reg_mientras_condicion)

            if (condition != null) {
                let while_code_block = []
                let flag = false

                let tokens = condition[1].match(reg_tokens)

                let left = tokens[1]
                let operator = tokens[2]
                let right = tokens[3]

                flag = evaluateCondition(left, operator, right)

                i++

                while (!splitCode[i].match(reg_fin_mientras)) {
                    while_code_block.push(splitCode[i])
                    i++
                }
                let x = 1
                while (flag && x != 10) {
                    flag = evaluateCondition(left, operator, right)
                    moxoExecute(while_code_block.join("\n"))
                    x++
                }
            }
        }

        i++
    }

}

function evaluateCondition(left, operator, right) {
    let flag = false

    // Si alguno de los token es una variable
    if (left.match(reg_variable)) {
        console.log("Valor de la variable " + "[" + left + "]" + ": " + variables[left])
        left = variables[left]
    }
    if (right.match(reg_variable)) {
        console.log("Valor de la variable " + right + ": " + variables[right])
        right = variables[right]
    }

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
    return flag
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

function writeError () {
    terminal.value += "\n"
}

function writeConsole (text) {
    code_area.value += text
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

code_area.addEventListener("keydown", function addTab (e) {
    if (e.key === "Tab") {
        e.preventDefault()
        writeConsole ("\t")
    }
})