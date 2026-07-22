# Előkövetelmények
* Valami webszerver. Pl. telepítesz egy Node.js-t, majd command line-ban belelépsz a játék mappájába, és "npx http-server -c-1".


# Kérdések megadása
* Szerkeszd a "questions.json"-t, magától értetődő lesz
* A `correct` szám 0-tól indexelt
* A kérdések megjelenítési sorrendje megegyezik a json-ben lévő sorrenddel


# Jutalmak módosítása
* `index.html` 81-95-ig sorai
* Alulról felfele növekszik a nyeremény
* Maximum 24 karakter fér ki, utána szétesik a GUI.   
Ez javítható a "style.css"-ben a "#logo" tulajdonságainak mókolásával:
    1. a max-width a logó méretét szabályozza
    1. majd mivel a megváltozott méret miatt elcsúszik a logó, a margin-left és margin-top hangolásával lehet újra középre gyógyítani


# Játékmenet
* Erősen eseményvezérelt, szinte minden csak kattintásra történik.
* Rossz válasz esetén is tovább megy a játék, a jutalmak zöldek vagy pirosak lesznek a választól függően.

## Kezdés
1. Bal felül katt a "Mehet!"-re -> nagyban feljön a logó + epic zene
1. Katt a logóra -> Bejön a fő felület zene és kérdés nélkül (lehet ismertetni a "jutalmakat")
1. Még egy katt -> elindul a háttérzene és megjelenik az első kérdés

## Kérdések megjelenítése
* A válaszlehetőségek 1-1 kattintásra jönnek fel.  
Javaslom a kérdés szövegét vagy 
a logó környéki üres részt kattintani, hogy véletlenül se jelölj meg semmit a negyedik katt után.

## Válaszadás
1. Első katt megjelöl
1. Második katt (bárhol) megmutatja a helyes választ.  
Ekkor egy pár másodperc késleltetés van, mielőtt enged továbbkattintani (bárhol) a következő kérdésre.

## Fontos tudni játékvezetéshez
- Telefon:
    1. Első kattra indul a 30 másodperces zene
    1. Második kattra (bárhol) vonalbontás  
    FIGYELEM: A 30 másodperc zene végén nincs vonalbontás, érdemes gyakorolni a második katt időzítését.
- Közönség:
    1. Első kattra végtelenítve megy a szavazós zene
    1. Második kattra (bárhol) megáll
- Megjelölőzenékben lévő dobolás hossza:
    - 1-5 kérdés: nincs
    - 6-9 kérdés: 00:14, ne húzd sokáig
    - 10-15 kérdés: 01:10, lehet feszíteni a húrt
