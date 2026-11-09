# Nexa 0.1 — Manual del lenguaje

> **Estado:** documentación de Nexa 0.1.0. Describe el intérprete que existe actualmente en el repositorio; no incluye características planeadas que todavía no funcionan.

Nexa es un lenguaje experimental con instrucciones en español. Los programas se guardan en archivos con extensión `.nx`. En esta versión, el intérprete admite variables, expresiones, salida de texto, entrada básica, condiciones y bucles.

- **Playground:** https://ericsnet.github.io/Nexa/
- **Repositorio:** https://github.com/ericsnet/Nexa
- **Intérprete:** `nexa.js`

## 1. Estructura de un programa

Un archivo Nexa contiene instrucciones, normalmente una por línea. Los bloques se delimitan con dos puntos opcionales al abrirlos y la palabra `fin` al cerrarlos.

```text
programa MiPrograma

variable nombre = "Nexa"
mostrar "Hola, " + nombre
```

La línea `programa MiPrograma` es opcional: el intérprete la reconoce, pero no cambia la ejecución. El nombre del programa no se utiliza todavía como módulo ni como espacio de nombres.

Las instrucciones vacías se ignoran. No es necesario añadir punto y coma al final de cada línea.

## 2. Comentarios

Todo lo que aparece después de `#` en una línea se considera comentario y no se ejecuta.

```text
# Esto es un comentario
variable edad = 16 # También se permite al final de una instrucción
mostrar edad
```

El carácter `#` dentro de una cadena entre comillas no inicia un comentario.

## 3. Variables

### Declarar una variable

Hay dos formas equivalentes:

```text
variable edad = 16
crear variable nombre con valor "Nexa"
```

La primera forma es más compacta; la segunda se parece más al lenguaje natural.

### Cambiar su valor

Una variable ya declarada puede recibir un nuevo valor:

```text
variable contador = 1
contador = contador + 1
mostrar contador
```

La asignación no declara variables nuevas. Si intentas asignar un valor a un nombre que todavía no existe, Nexa genera un error. Declara primero la variable con `variable` o `crear variable`.

### Tipos de datos

Nexa determina el tipo a partir del valor inicial. En 0.1 existen estos valores:

| Tipo | Ejemplos |
|---|---|
| Número | `10`, `3.14`, `-8` |
| Texto | `"Hola"`, `'Nexa'` |
| Booleano | `verdadero`, `falso` |
| Nulo | `nulo` |

También se reconocen los literales ingleses `true`, `false` y `null`.

No hay todavía declaraciones explícitas de tipo, constantes ni estructuras de datos como listas o diccionarios.

### Nombres de variables

Los nombres pueden contener letras, números y guion bajo, pero deben empezar por una letra o por `_`. Se admiten letras acentuadas y la letra ñ. Por ejemplo:

```text
variable nombre = "Ana"
variable edad2 = 14
variable _puntos = 100
variable año = 2026
```

Los nombres distinguen mayúsculas y minúsculas: `edad` y `Edad` son variables diferentes.

## 4. Mostrar información

Estas tres instrucciones son equivalentes:

```text
mostrar "Hola"
escribir "Hola"
imprimir "Hola"
```

También se admite escribir la expresión entre paréntesis:

```text
mostrar("Resultado: " + (5 * 3))
```

La instrucción evalúa la expresión y envía su resultado a la salida del programa.

## 5. Textos y cadenas

Los textos pueden escribirse entre comillas dobles o simples:

```text
mostrar "Hola, mundo"
mostrar 'Hola, mundo'
```

Secuencias de escape admitidas:

| Secuencia | Resultado |
|---|---|
| `\\n` | Salto de línea dentro del texto |
| `\\t` | Tabulación |
| `\\\\` | Barra invertida |
| `\\" ` | Comilla doble |
| `\\'` | Comilla simple |

Se pueden concatenar textos con el operador `+`:

```text
variable nombre = "Nexa"
mostrar "Hola, " + nombre
```

Si uno de los operandos de `+` es texto, el otro se convierte a texto y ambos se concatenan.

## 6. Operadores

### Operadores matemáticos

| Operador | Significado | Ejemplo |
|---|---|---|
| `+` | Suma o concatenación | `5 + 2` |
| `-` | Resta | `5 - 2` |
| `*` | Multiplicación | `5 * 2` |
| `/` | División | `10 / 2` |
| `%` | Resto de la división | `10 % 3` |
| `**` | Potencia | `2 ** 3` |

También se admiten estas palabras en expresiones sin comillas:

| Palabra | Equivalencia |
|---|---|
| `mas` o `más` | `+` |
| `menos` | `-` |
| `por` | `*` |
| `entre` | `/` |

Ejemplo:

```text
mostrar 10 mas 5
mostrar 10 entre 2
```

### Operadores de comparación

| Operador | Significado |
|---|---|
| `>` | Mayor que |
| `<` | Menor que |
| `>=` | Mayor o igual que |
| `<=` | Menor o igual que |
| `==` | Igualdad estricta |
| `!=` | Distinto |

Nexa también reconoce estas expresiones naturales:

| Expresión | Operador |
|---|---|
| `es mayor que`, `es más grande que`, `supera a` | `>` |
| `es menor que`, `es más pequeño que` | `<` |
| `es mayor o igual que`, `es más grande o igual que` | `>=` |
| `es menor o igual que`, `es más pequeño o igual que` | `<=` |
| `es igual a`, `es igual que` | `==` |
| `es distinto de`, `es diferente de` | `!=` |

Ejemplo:

```text
variable X = 10
variable Y = 5

si X es mas grande que Y haz:
    mostrar "X es mayor que Y"
fin
```

### Operadores lógicos

| Operador | Significado |
|---|---|
| `&&` | Y lógico |
| `||` | O lógico |
| `!` o `no` | Negación |

Los operadores `&&` y `||` evalúan de izquierda a derecha con cortocircuito: si el resultado ya se conoce, no evalúan la parte derecha.

### Prioridad de operadores

De mayor a menor prioridad:

1. Paréntesis.
2. Operadores unarios: `!`, `no`, `+` y `-`.
3. Potencia: `**`.
4. Multiplicación, división y resto: `*`, `/`, `%`.
5. Suma y resta: `+`, `-`.
6. Comparaciones: `>`, `<`, `>=`, `<=`.
7. Igualdad: `==`, `!=`.
8. Y lógico: `&&`.
9. O lógico: `||`.

Utiliza paréntesis cuando quieras dejar clara una operación:

```text
mostrar (2 + 3) * 4
```

## 7. Condiciones

La instrucción `si` ejecuta un bloque cuando su condición es verdadera.

```text
variable edad = 16

si edad es mayor que 18 haz:
    mostrar "Mayor de edad"
fin
```

Los dos puntos y la palabra `haz` son opcionales. También puedes utilizar paréntesis:

```text
si (edad >= 18):
    mostrar "Mayor de edad"
fin
```

### Alternativa: si no

Puedes añadir un bloque alternativo con `si no` o `sino`:

```text
si edad >= 18:
    mostrar "Mayor de edad"
si no:
    mostrar "Menor de edad"
fin
```

El bloque alternativo también puede escribirse como `sino:`. Cada condición completa debe terminar con un único `fin`.

## 8. Repeticiones

### Repetir un número de veces

```text
repetir 3 veces:
    mostrar "Hola"
fin
```

La cantidad puede ser una expresión:

```text
variable vueltas = 2
repetir vueltas + 1 veces:
    mostrar "Vuelta"
fin
```

También se admite la forma con paréntesis:

```text
repetir (3):
    mostrar "Hola"
fin
```

La cantidad debe ser un número entero entre 0 y 10000.

### Mientras se cumpla una condición

```text
variable contador = 0

mientras contador es menor que 3 haz:
    mostrar contador
    contador = contador + 1
fin
```

La condición se vuelve a comprobar antes de cada iteración. Asegúrate de modificar alguna variable para que el bucle pueda terminar.

El intérprete detiene un bucle `mientras` después de 10000 iteraciones como límite de seguridad.

## 9. Pedir información al usuario

### Función `preguntar`

La expresión `preguntar()` muestra una solicitud de entrada y devuelve el texto que introduce el usuario:

```text
nombre = preguntar("¿Cómo te llamas?")
mostrar "Hola, " + nombre
```

También existe el alias `leer()`:

```text
respuesta = leer("Escribe algo:")
```

### Forma natural

También puedes pedir y guardar una respuesta con esta instrucción:

```text
preguntar "¿Cómo te llamas?" y guardar en nombre
mostrar "Hola, " + nombre
```

La entrada siempre se recibe como texto. Si necesitas operar con ella como número, la conversión automática no está implementada todavía en esta versión.

En el playground, la entrada depende del cuadro de diálogo del navegador. En la ejecución local depende de la terminal.

## 10. Funciones disponibles

En Nexa 0.1 todavía no se pueden definir funciones propias. La única función integrada disponible es la entrada de texto:

| Función | Descripción | Ejemplo |
|---|---|---|
| `preguntar(texto)` | Solicita una respuesta y la devuelve como texto. | `nombre = preguntar("Nombre:")` |
| `leer(texto)` | Alias de `preguntar`. | `dato = leer("Dato:")` |

No existen todavía funciones matemáticas integradas como `raiz()`, `redondear()` o `azar()`. Tampoco se pueden crear funciones con `funcion` o `definir`.

## 11. Ejemplo completo

```text
programa CalculadoraSencilla

variable numero1 = 12
variable numero2 = 4
variable resultado = numero1 + numero2

mostrar "Primer número: " + numero1
mostrar "Segundo número: " + numero2
mostrar "Suma: " + resultado
mostrar "Producto: " + (numero1 * numero2)

si numero1 es mayor que numero2 haz:
    mostrar "El primer número es mayor"
si no:
    mostrar "El segundo número es mayor o son iguales"
fin

variable contador = 1
repetir 3 veces:
    mostrar "Repetición " + contador
    contador = contador + 1
fin
```

## 12. Errores y límites

El intérprete informa de errores con el número de línea cuando puede identificarlo. Algunos ejemplos:

- Usar una variable que no existe.
- Intentar asignar un valor a una variable que no se ha declarado.
- Escribir una instrucción que Nexa no reconoce.
- Olvidar `fin` al cerrar un bloque.
- Dividir o calcular el resto entre cero.
- Superar los límites de iteraciones o de instrucciones.

El intérprete limita la ejecución a 100000 instrucciones por defecto. Puedes cambiar ese límite al utilizar el motor desde JavaScript mediante la opción `maxSteps`; el límite de 10000 iteraciones por bucle sigue aplicándose.

### Características que aún no forman parte de Nexa 0.1

No se deben utilizar todavía estas construcciones:

- Funciones definidas por el programador.
- Clases, objetos e interfaces.
- Listas, matrices y diccionarios.
- Importación de módulos o bibliotecas.
- Manejo de excepciones desde Nexa.
- Bucles `para`, `romper` o `continuar`.
- Tipos explícitos y constantes.
- Operadores de incremento como `++`.
- Compilación a código máquina.

Estas características podrían añadirse en versiones posteriores, pero no son parte de la sintaxis implementada actualmente.

## 13. Ejecutar archivos `.nx` en local

Con Node.js 18 o posterior, desde la carpeta del repositorio:

```bash
node bin/nexa.js examples/hola_mundo.nx
```

También se admite:

```bash
node bin/nexa.js ejecutar examples/hola_mundo.nx
```

Para ejecutar las pruebas del intérprete:

```bash
npm test
```

---

**Versión de esta referencia:** Nexa 0.1.0  
**Última revisión:** 9 de noviembre de 2026  
**Nota:** esta documentación describe el comportamiento real del intérprete de esa versión. Si una característica no aparece como implementada aquí, no debe asumirse que funciona.
