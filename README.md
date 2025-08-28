Betygsgrundande gruppinlämningsuppgift: Metadata-sökmotorn
star_outline
unfold_more
Teamets (4-5 personer stort) uppgift är att bygga en sökmotor som arbetar med metadata:

Vad ska ni skapa?
Den ska kunna ‘matas’ med filer (foton, pdf-filer, ljudfiler, PowerPoint-dokument), extrahera dessa filers metadata och lägga in dem i en databas.
Användaren av sökmotorn ska, i ett webbaserat gränssnitt, kunna söka efter filer baserade på detaljer i deras metadata och få ett sökresultat, från vilket man kan nå (titta på/eller ladda hem) filerna.
User stories
Nya user stories kan komma att läggas till eller gamla tas bort av produktägaren, men dessa är de vi har just nu:

Som systemägare vill jag ha en MySQL-databas som på ett bra sätt kan lagra metadata om olika typer av filer så att det går att söka upp en fil via en sökning i metadatan.
Som systemägare vill jag att det finns ett system för att utifrån mappar med filer extrahera metadata om filerna och spara metadatan relaterad till filnamn/sökväg i databasen.
Som besökare vill att jag att det finns ett webbaserat gränssnitt för sökning i metadatan, så att det blir lätt för mig att söka och se resultat.
Som besökare vill jag kunna välja vad jag vill söka (en viss filtyp) så att systemet förstår vilken typ av data jag vill söka efter.
Som besökare vill jag kunna söka på både filnamn och olika metadata så att jag lätt kan hitta det jag söker efter.
Som besökare vill jag kunna söka på ett bra sätt i metadatan (t.ex. om något är lika med, inte lika med, större än, mindre än, ungefär lika med för text) ett visst värde, så att det blir enkelt för mig att förfina min sökning.
Som besökare vill jag kunna söka geografiskt när metadatan innehåller geografisk information (latitud och longitud).
Som besökare och systemägare vill jag att systemet har en mängd testdata (icke copyright-skyddad) så att jag kan testa att systemet fungerar som det ska. (Bloggen kommer att ge dig förslag på datasets med olika typer av filer, men hittar du andra filsamlingar med bra metadata är du välkommen att använda dem, dock med liknande omfång som de datasets som finns på bloggen.)
Vilka tekniker ska ni använda
Ni ska använda er av följande tekniker:

Node.js för att extrahera metadata från filer (tillsammans med olika tillägg).
Node.js för att skapa en webbserver med REST-api mot databas och som även serverar frontend-filer.
MySQL (som molnserver) för att lagra metadatan.
Webbaserad frontend (HTML, CSS och JavaScript)
Git för att versionshantera er kod i ett s.k. git-repository.
Hur betygs sätts din insats i teamet?
Betygssättning:

G för en fungerande sökmotor.
VG för en fungerande sökmotor med som är lättanvänd och returnerar sökresultat ordnade efter hur bra/relevanta de är.
Betyg sätts individuellt och är baserade på:

Hur aktivt du har deltagit i arbetet
Hur stor andel av kod/commits du har skrivit i ert gemensamma git-repository.
Ditt betyg på grupparbetet vägs samman med betyget på en individuell rapport om ditt arbete i teamet till ett slutbetyg för kursen Metadata.

Observera!
Gitignorera:

node_modules (går alltid att återskapa genom att skriva npm-install)
alla mappar med binära filer (som pdf, mp3, jpg, PowerPoiints etc)
spara istället binära filer gemensamt t.ex. på Google Drive och ge alla gruppen instruktioner för hur man klistrar in dessa mappar i ert lokala repo.
SAMT VIKTIGT: Ha inte inloggningsinfo (användarnamn, lösenhord, host, port etc) på GitHub, lagra t.ex. detta i en gitignorerad JSON-fil som sedan kan klistras in i ditt lokala repo. (Alternativt .env-filer)