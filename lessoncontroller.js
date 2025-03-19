const con = require('./connector');
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user

        next()
    })
}

function initLessonRoutes(app) {

    app.post('/createlesson', jsonParser, authenticateToken, async (req, res) => {
        let requestbody = req.body;
        try {

            //data validation
            let validation = await con.query(`select id from modules where id = ?`, [requestbody.id_module]);
            if (validation[0].length < 1) {
                res.json({ error: true, errormessage: "ID_MODULE_NOT_EXIST" })
                return;
            }
            validation = await con.query(`select id from lessons where id_module = ? and ? between startdate and enddate or ? between startdate and enddate`, [requestbody.id_module, requestbody.startdate, requestbody.enddate]);
            if (validation[0].length > 0) {
                res.json({ error: true, errormessage: "LESSON_EXISTS" });
                return;
            }

            //lesson creation
            const [data] = await con.execute(`insert into lessons (startdate, enddate, argument, note, id_module) values (?,?,?,?,?)`, [requestbody.startdate, requestbody.enddate, requestbody.argument, requestbody.note, requestbody.id_module]);
            res.json(data);
        } catch (err) {
            console.log("Createlesson Error: " + err);
            res.json({ error: true, errormessage: "GENERIC_ERROR" });
        }
    })

    app.patch('/updatelesson/:id', jsonParser, authenticateToken, async (req, res) => {
        let patchid = req.params.id;
        let requestbody = req.body;
        try {

            //data validation
            let validation = await con.query(`select id from lessons where id = ?`, [patchid]);
            if (validation[0].length < 1) {
                res.json({ error: true, errormessage: "INVALID_LESSON_ID" });
                return;
            }

            validation = await con.query(`select id from lessons where startdate = ? and enddate=? and id <> ?`, [requestbody.startdate, requestbody.enddate, patchid]);
            if (validation[0].length > 0) {
                res.json({ error: true, errormessage: "LESSON_EXISTS" });
                return;
            }
            validation = await con.query(`select id from modules where id=? `, [requestbody.id_module]);
            if (validation[0].length < 1) {
                res.json({ error: true, errormessage: "MODULE_NOT_EXISTS" });
                return;
            }

            //update lesson
            const data = await con.execute(`update lessons set startdate = ?, enddate = ? , argument=?,note=? ,id_module=? where id = ?`, [requestbody.startdate, requestbody.enddate, requestbody.argument, requestbody.note, requestbody.id_module, patchid]);
            res.json(data);

        } catch (err) {
            console.log("Updatelesson Error: " + err);
            res.json({ error: true, errormessage: "GENERIC_ERROR" });
        }

    })

    app.delete('/deletelesson/:id', authenticateToken, async (req, res) => {
        let deleteid = req.params.id;
        try {

            //data validation
            const validation = await con.query(`select id from lessons where id = ?`, [deleteid]);
            if (validation[0].length < 1) {
                res.json({ error: true, errormessage: "INVALID_LESSON_ID" });
                return;
            }

            //delete lesson
            const data = await con.execute(`delete from lessons where id = ?`, [deleteid]);
            res.json(data);
        } catch (err) {
            console.log("Deletelesson Error: " + err);
            res.json({ error: true, errormessage: "GENERIC_ERROR" });
        }
    })

    app.get('/getalllessons', authenticateToken, async (req, res) => {
        pagenumber = (req.query.pagenumber - 1) * req.query.pagesize;
        pagesize = (req.query.pagenumber * req.query.pagesize) - 1;
        try {
            const [data] = await con.execute(`select * from lessons LIMIT ${pagenumber},${pagesize}`);

            res.json(data);
        } catch (err) {
            console.log("Getalllessons Error:" + err);
            res.json({ error: true, errormessage: "GENERIC_ERROR" });
        }
    })

    app.get('/getcalendar', jsonParser, authenticateToken, async (req, res) => {
       
        let year=req.query.year;
        let month=req.query.mounth;
        //recupera il calendario
        //filtrato per anno/mese
         
                try {
                    const [data] = await con.execute(`select * from lessons where startdate like ?`,[`${year}-${month}%`]);
        
                    res.json(data);
                } catch (err) {
                    console.log("Getcalendars Error:" + err);
                    res.json({ error: true, errormessage: "GENERIC_ERROR" });
                }
    })

    app.post('/generateevents', jsonParser, authenticateToken, async (req, res) => {
        let requestbody = req.body;
        try {
            // Verifica se il modulo esiste
            let validation = await con.query(`select id from modules where id = ?`, [requestbody.id_module]);
            if (validation[0].length < 1) {
                console.log("Modulo non trovato");
                res.json({ error: true, errormessage: "ID_MODULE_NOT_EXIST" });
                return;
            }

            // Verifica se ci sono conflitti di lezioni
            validation = await con.query(`select id from lessons where id_module = ? and (? between startdate and enddate or ? between startdate and enddate)`,
                [requestbody.id_module, requestbody.startdate, requestbody.enddate]);
            if (validation[0].length > 0) {
                console.log("Lezione esistente nel periodo indicato");
                res.json({ error: true, errormessage: "LESSON_EXISTS" });
                return;
            }

            // Creazione delle lezioni
            let currDate = new Date(requestbody.startdate);
            const endDate = new Date(requestbody.enddate);
             const lessons = [];

            while (currDate <= endDate) {
                // Verifica se il giorno della settimana corrisponde
                if (currDate.getDay() === requestbody.day) {
                    // Crea la lezione con l'orario di inizio e fine
                    const lessonStart = new Date(currDate);
                    lessonStart.setHours(requestbody.starthour, requestbody.startminute, 0, 0); // Imposta l'orario di inizio

                    const lessonEnd = new Date(currDate);
                    lessonEnd.setHours(requestbody.endhour, requestbody.endminute, 0, 0); // Imposta l'orario di fine

                    // Converti la data in formato MySQL 'YYYY-MM-DD HH:MM:SS'
                    const startdate = lessonStart.toISOString().slice(0, 19).replace('T', ' '); // Rimuovi il 'T' e il 'Z'
                    const enddate = lessonEnd.toISOString().slice(0, 19).replace('T', ' '); // Rimuovi il 'T' e il 'Z'

                    const argument = requestbody.argument || null;
                    const note = requestbody.note || null;
                    const idModule = requestbody.id_module;

                    // Debug: log per verificare i dettagli della lezione
                    console.log("Creando lezione:", startdate, enddate, argument, note, idModule);

                    // Inserisci la lezione nel database
                    const [data] = await con.execute(`insert into lessons (startdate, enddate, argument, note, id_module) values (?,?,?,?,?)`, 
                        [startdate, enddate, argument, note, idModule]);

                    // Debug: log per vedere il risultato della query
                    console.log("Lezione inserita:", data);

                    lessons.push(data); // Aggiungi la lezione creata all'elenco
                }

                // Passa al giorno successivo
                currDate.setDate(currDate.getDate() + 1);
            }

            // Risposta con i dati delle lezioni create
            res.json({ lessons });

        } catch (err) {
            console.log("Errore durante la creazione delle lezioni:", err);
            res.json({ error: true, errormessage: "GENERIC_ERROR", details: err.message });
        }
    });


    app.post('/signpresence', jsonParser, authenticateToken, async (req, res) => {
        let requestbody = req.body;
    
        try {
            // **1. Validazione ID Lezione**
            let [validation] = await con.query(`SELECT id FROM lessons WHERE id = ?`, [requestbody.id_lesson]);
            if (validation.length < 1) {
                return res.json({ error: true, errormessage: "ID_LESSON_NOT_EXIST" });
            }
    
            // **2. Validazione ID Utente**
            [validation] = await con.query(`SELECT id FROM users WHERE id = ?`, [requestbody.id_user]);
            if (validation.length < 1) {
                return res.json({ error: true, errormessage: "ID_USER_NOT_EXIST" });
            }
    
            // **3. Controllo validità della data**
            [validation] = await con.query(
                `SELECT id FROM lessons WHERE ? >= startdate AND ? <= enddate AND id = ?`,
                [requestbody.signdate, requestbody.signdate, requestbody.id_lesson]
            );
            if (validation.length === 0) {
                return res.json({ error: true, errormessage: "INVALID_SIGN" });
            }
    
            // **4. Controllo se l'utente ha già firmato per quella data**
            [validation] = await con.query(
                `SELECT id FROM lessons_presence WHERE id_user = ? AND signdate = ?`,
                [requestbody.id_user, requestbody.signdate]
            );
            if (validation.length > 0) {
                return res.json({ error: true, errormessage: "SIGNPRESENCE_EXIST" });
            }
    
            // **5. Inserimento firma presenza**
            const [data] = await con.execute(
                `INSERT INTO lessons_presence (id_lesson, id_user, signdate) VALUES (?, ?, ?)`,
                [requestbody.id_lesson, requestbody.id_user, requestbody.signdate]
            );
    
            res.json({ success: true, data });
    
        } catch (err) {
            console.error("signpresence Error:", err);
            res.json({ error: true, errormessage: "GENERIC_ERROR" });
        }
    });
    

    app.get('/getlessonpresences', jsonParser, authenticateToken, async (req, res) => {
        let requestbody = req.body;
        //recupera l'elenco delle presenze
        //dato l'id lezione
    })

    app.get('/getuserpresences', jsonParser, authenticateToken, async (req, res) => {
        let requestbody = req.body;
        //recupera l'elenco delle presenze
        //dell'utente corrente, da data a data
    })

    app.get('/getmodulepresences', jsonParser, authenticateToken, async (req, res) => {
        let requestbody = req.body;
        //recupera l'elenco delle presenze
        //per il modulo indicato; opzionale filtro per utente
    })

    app.get('/calculateuserpresences', jsonParser, authenticateToken, async (req, res) => {
        let requestbody = req.body;
        //recupera l'elenco delle presenze
        //utente e calcola la percentuale presenze rispetto al totale ore di ogni modulo
    })

}

module.exports = initLessonRoutes;