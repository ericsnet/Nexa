# Nexa

**Nexa** es un lenguaje de programación experimental en español. Su objetivo es permitir código legible mediante una mezcla de expresiones naturales y sintaxis compacta.

> Estado: versión 0.1.0 experimental. La gramática todavía puede cambiar.

## Probarlo online

Abre el [playground de Nexa](https://ericsnet.github.io/Nexa/) para escribir y ejecutar programas `.nx` directamente en el navegador. No requiere descargas ni cuenta. El intérprete se ejecuta localmente en tu navegador.

## Primer programa

Guarda este código como `hola_mundo.nx`:

```text
programa HolaMundo

variable nombre = "mundo"
mostrar "Hola, " + nombre
```

## Sintaxis de la versión 0.1

### Mostrar información

```text
mostrar "Hola"
escribir "Hola"
imprimir("Hola")
```

### Variables

```text
crear variable edad con valor 15
variable nombre = "Nexa"
```

Los tipos se infieren automáticamente. En esta versión se admiten números, textos y valores lógicos (`verdadero` y `falso`).

### Operaciones

```text
resultado = (10 + 5) * 2
resultado = 10 mas 5
```

Operadores disponibles: `+`, `-`, `*`, `/`, `%`, `**`, `>`, `<`, `>=`, `<=`, `==` y `!=`. También se reconocen algunas expresiones como `es mayor que`, `es menor que`, `es igual a`, `mas`, `menos`, `por` y `entre`.

### Condiciones

```text
si edad es mayor que 18 haz:
    mostrar "Mayor de edad"
si no:
    mostrar "Menor de edad"
fin
```

También se admite la forma compacta:

```text
si (edad > 18):
    mostrar "Mayor de edad"
fin
```

### Bucles

```text
repetir 3 veces:
    mostrar "Hola"
fin

variable contador = 0
mientras contador es menor que 3 haz:
    mostrar contador
    contador = contador + 1
fin
```

### Entrada de datos

```text
nombre = preguntar("¿Cómo te llamas?")
mostrar "Hola, " + nombre
```

También funciona `preguntar "¿Cómo te llamas?" y guardar en nombre`.

## Ejecutarlo en local

Requiere Node.js 18 o posterior.

```bash
node bin/nexa.js examples/hola_mundo.nx
node bin/nexa.js ejecutar examples/hola_mundo.nx
```

Para instalar el comando `nexa` globalmente desde una copia local del repositorio:

```bash
npm link
nexa examples/hola_mundo.nx
```

Ejecuta las pruebas con:

```bash
npm test
```

## Alcance y límites actuales

Nexa 0.1 es un intérprete, no un compilador nativo. El motor está implementado en JavaScript para poder compartir la misma implementación entre el playground y la herramienta de línea de comandos. **Los programas Nexa se escriben en `.nx`, no en JavaScript.**

Esta primera versión incluye salida, variables, expresiones, condiciones, bucles y entrada básica. Todavía no incluye funciones definidas por el usuario, clases, módulos, gestión avanzada de errores, concurrencia, bibliotecas estándar amplias ni generación de código máquina. Se incorporarán por fases después de estabilizar la gramática básica.

La ejecución tiene límites para evitar bucles accidentales demasiado largos. No ejecutes código de terceros que no entiendas en tu entorno local.

## Licencia

Nexa se distribuye bajo la licencia MIT. Consulta [LICENSE](LICENSE).
