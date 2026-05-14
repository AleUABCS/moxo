
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
// Panel de errores
let errors_terminal = document.getElementById("errors-terminal")
// Variable global para esperar el enter en terminal
let onEnter = null
// Botón para mostrar panel de erorres
let errors_button = document.getElementById("error-panel-button")
// Botón para mostrar panel de ayuda
let help_button = document.getElementById("help-button")

const clear_button = document.getElementById("clear-button")

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
let reg_leer_variable = /^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*leer$/ // Para leer el nombre de la variable a asignar el valor
let reg_texto_antes_leer = /\S+.*(?=leer)/ // Para comprobar si hay texto antes de la palabra leer

let reg_mientras = /\bmientras\b/
let reg_fin_mientras = /\bfin_mientras\b/
let reg_mientras_condicion = /mientras\s*\(([^)]*)\)/ // Para conseguir la condición del [mientras]

let reg_asignacion = /^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(.+)$/
let reg_operacion  = /[+\-*\/%]/

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
// RegExp para obtener las variables en una operación
let reg_variables_en_operacion = /[a-zA-Z_$][a-zA-Z0-9_$]*/g
// RegExp para obtener todos los valores de una operación, se tiene que usar split("=") primero
let reg_valores_en_operacion = /[a-zA-Z_]\w*|\d+(\.\d+)?/g


button.addEventListener("click", function () {
    variables = {}
    terminal.value = ""
    errors_terminal.value = ""
    code = code_area.value +"\n end"
    console.log("Código crudo: \n",code)

    moxoExecute(code)
})

// Divide el código en líneas y evalúa y ejecuta los tokens línea por línea
async function moxoExecute (code_block) {
    let splitCode = code_block.split("\n") // Separar código por líneas

    // Para debug
    console.log("Código separado: ")
    splitCode.forEach(line => {
        console.log(line)
    });
    
    var i = 0
    var line
    let operation_line

    while (i < splitCode.length) {
        line = splitCode[i]

        //-calcular
        operation_line = line.match(reg_asignacion)
        if (operation_line != null) {

            let op_right = line.split("=")[1]
            let values = op_right.match(reg_valores_en_operacion)
            let op_lenght = values.length

            console.log("Operación encontrada")
            let operation = operation_line[2]
            let operation_og = operation
            let asignation = false
            // Convertir las variables a su valor
            if (operation != "leer") {

                let op_variables = operation.match(reg_variables_en_operacion)
                if (op_variables != null) {
                    for (let v of op_variables) {
                        operation = operation.replaceAll(v, variables[v])
                        if (!variables[v] && !Number(v) && op_lenght > 1){
                            writeError("Parece que una de las variables con las que hiciste una operación no es un número. Solo puedes hacer operaciones con variables que tengan un valor numérico")
                        } else if (variables[v] && op_lenght == 1) asignation = true
                    }
                }
                
                let result = calcOperation(operation)
                if (result == null && op_lenght > 1) {  
                    writeError(
                    "Alguno de los operadores que usaste en la línea [" + (i+1) + "] no parece ser un operador real" +
                    " o válido en este lenguaje. Los operadores válidos son: + (suma), - (resta), * (multiplicación)" + 
                    ", / (división), % (módulo)")
                }

                if (op_lenght > 1) line = line.replace(operation_og, result)
                else line.replace(operation_og, values[0])
                
                // Debug
                console.log("Línea evaluada: " + line)
                
                // Asignar resultado a la variable
                if (op_lenght > 1 || asignation) variables[operation_line[1]] = result
                else variables[operation_line[1]] = values[0]
            }
        }

        // -imprimir
        if (reg_imprimir.exec(line)) {
            console.log("[imprimir] enontrado")
            if (line.match(reg_imprimir_con_operador)) { // Caso de error: se intentó imprimir con operador entre la palabra clave y el texto
                writeError("La instrucción [imprimir] no necesita un operador. Ejemplo correcto: (imprimir x).")
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

                        variables[print[1]] ?? writeError(
                            "La variable [" + print[1] + "] no existe. Para poder imprimir una variable "+
                            "tienes que crearla primero de esta forma (variable = valor)"
                        )
                        writeTerminal(variables[print[1]])
                    }
                }
            }
        }

        // -si
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
                        if (splitCode[i].match("end")) writeError(
                            "Faltó agregar [fin_si] al final del cuerpo de la esctructura condicional [si]"
                        )
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
                            if (i >= splitCode.length)
                                writeError("Te faltó agregar [fin_si_no] al final de la estructura condicional [si_no]")
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

        // -leer
        if (reg_leer.exec(line)) {
            console.log("[leer] encontrado")
                leer = line.match(reg_leer_variable)
                if (leer != null) {
                    writeTerminal(leer[1]+": ")
                    
                    console.log(
                        "Palabra clave: leer \n",
                        "Dato : ", leer[1]
                    )
                }
            await waitForEnter()
        }

        // -mientras
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
                    if (splitCode[i].match("end")) writeError(
                            "Faltó agregar [fin_mientras] al final del cuerpo de la esctructura condicional [mientras]"
                        )
                    i++
                }
                
                let x = 0
                while (flag && x < 500) { // Límite de 500 por si se ciclaaa
                    x++
                    moxoExecute(while_code_block.join("\n"))
                    flag = evaluateCondition(left, operator, right)
                }
            }
        }

        i++
    }

}

function waitForEnter() {
  return new Promise(resolve => {
    onEnter = (val) => { onEnter = null; resolve(val); };
  });
}

function calcOperation(expr) {
    try {
        return eval(expr)
    } catch {
        return null
    }
}

function evaluateCondition(left, operator, right) {
    let flag = false
    let left_null = false
    let right_null = false

    // Si alguno de los token es una variable
    if (left.match(reg_variable)) {
        console.log("Valor de la variable " + "[" + left + "]" + ": " + variables[left])
        if (variables[left] != null)
            left = Number(variables[left])
        else left_null = true
    } else {
        left = Number(left)
    }
    if (right.match(reg_variable)) {
        console.log("Valor de la variable " + right + ": " + variables[right])
        if (variables[right] != null)
            right = Number(variables[right])
        else right_null = true
    } else {
        right = Number(right)
    }
    
    if (!left_null && !right_null) {
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
        } else if (operator == "!=") {
            if (left != right) {
                console.log("Condición = true")
                flag = true
            } else {
                console.log("Condición = false")
            }
        } else {
            writeError(
                "El comparador que utilizaste no parece ser un comparador real o válido en este lenguaje. " + 
                "Los operadores válidos son: \n" +
                "== (igual), > (mayor que), < (menor que), >= (mayor o igual), " + 
                "<= (menor o igual), != (diferente de)"
            )
        }
    } else {
        if (left_null) {
            writeError(
                "La variable [" + left + "] no existe. Para usar una variable primero tienes que definirla " +
                "de la siguiente forma (variable = valor)"
            )
        }
        if (right_null) {
            writeError(
                "La variable [" + right + "] no existe. Para usar una variable primero tienes que definirla " +
                "de la siguiente forma (variable = valor)"
            )
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

function writeConsole (text) {
    code_area.value += text
}

function writeError (error_text) {
    if (errors_terminal.value == "")
        errors_terminal.value += error_text
    else
        errors_terminal.value += "\n" + error_text
}

// Al presionar ENTER en la terminal
terminal.addEventListener("keydown", function saveVariable (e) {
    if (e.key === "Enter") {
        e.preventDefault()
        //Toma el texto después de los dos puntos ":"
        let value = terminal.value.match(reg_text_after_colon)
        if (value != null) {
            variables[leer[1]] = value[1]
            console.log("Valor guardado: " + value[1])
        }
        if (onEnter) 
            onEnter()
        terminal.value = ""
    }
})

code_area.addEventListener("keydown", function addTab (e) {
    if (e.key === "Tab") {
        e.preventDefault()
        writeConsole ("\t")
    }
})

help_button.addEventListener("click", function () {
    document.getElementById("errors-terminal").style.display = "none"
    document.getElementById("help-panel").style.display = "block"
})

errors_button.addEventListener("click", function () {
    document.getElementById("help-panel").style.display = "none"
    document.getElementById("errors-terminal").style.display = "block"
})

clear_button.addEventListener("click", function () {
    errors_terminal.value = ""
    terminal.value = ""
    code_area.value = ""
})