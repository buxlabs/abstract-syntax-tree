# Zaczynamy

Pakiet pozwala na analizę i transformację skryptów napisanych w języku JavaScript. Pozwala m.in. na przetworzenie programu na abstrakcyjne drzewo składniowe, przeszukiwanie drzewa, zmianę węzłów oraz ponowne wygenerowanie programu.

## Wspierane Środowiska

Pakiet jest dedykowany głównie pod środowisko Node.js. Wspierane wersje są określone w pliku `package.json` w polu `engines`.

## Instalacja

```
$ npm install abstract-syntax-tree
```

## Interaktywny REPL

Możesz przetestować bibliotekę wewnątrz REPL udostępnionego przez Node.js. Aby go otworzyć po prostu wpisz w konsoli:

```
$ node
> const { parse } = require('abstract-syntax-tree')
> const tree = parse('const answer = 42')
> console.log(tree)
```
