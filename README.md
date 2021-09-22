# CodeployAcademyS3select
aws nodejs lambda with s3select feature

Tramite S3-Select è possibile effettuare operazioni SQL su file JSON o CSV.
Questa semplice lambda permette di effettuare una query sul file s3sample.json.

E' possibile impostare una classica condizione where tramite l'inserimento nelle variabili key,value.

Lambda che può essere integrata con Api Gateway per poter esporre un'api GET che effettua una'interrogazione sui dati
JSON salvati in S3.
