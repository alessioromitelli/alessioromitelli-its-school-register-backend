const con = require('./connector');
const jwt = require('jsonwebtoken');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var auth = require('./authentication');


function initLessonRoutes(app) {

    app.post('/createlesson', jsonParser, auth.authenticateToken, async (req, res) => {
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

    app.patch('/updatelesson/:id', jsonParser, auth.authenticateToken, async (req, res) => {
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

    app.delete('/deletelesson/:id', auth.authenticateToken, async (req, res) => {
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

    app.get('/getalllessons', auth.authenticateToken, async (req, res) => {
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

    app.get('/getcalendar', jsonParser, auth.authenticateToken, async (req, res) => {
        let month = req.query.mounth;
        let year = req.query.year;
        try {
            const [data] = await con.execute(`select * from lessons where startdate LIKE ?`, [`${year}-${month}%`]);

            res.json(data);
        } catch (err) {
            console.log("Getcalendar Error:" + err);
            res.json({ error: true, errormessage: "GENERIC_ERROR" });
        }

        //recupera il calendario
        //filtrato per anno/mese
    })

    app.post('/generateevents', jsonParser, auth.authenticateToken, async (req, res) => {
        let requestbody = req.body;
        try {
            // Verifica se il modulo esiste
            let validation = await con.query(`select id from modules where id = ?`, [requestbody.id_module]);
            if (validation[0].length < 1) {
                console.log("Modulo non trovato");
                res.json({ error: true, errormessage: "ID_MODULE_NOT_EXIST" });
                return;
            }


            // Creazione delle lezioni
            let currentDate = new Date(requestbody.startdate);
            let enddate = new Date(requestbody.enddate);
            let arrLessons = [];

            while (currentDate <= enddate) {
                // Verifica se il giorno corrente corrisponde a quello specificato
                if (currentDate.getDay() == requestbody.day) {
                    const year = currentDate.getFullYear();  // Usa getFullYear() invece di getYear()
                    const month = currentDate.getMonth();
                    const day = currentDate.getDate();  // Usa getDate() per ottenere il giorno del mese

                    // Creazione della data di inizio e fine della lezione
                    const startDate = new Date(year, month, day, requestbody.starthour, requestbody.startminute);
                    //const startDate = new Date(`${year}-${month + 1}-${day} ${requestbody.starthour}:${requestbody.startminute}`);
                    const endDate = new Date(year, month, day, requestbody.endhour, requestbody.endminute);

                    // Verifica se ci sono conflitti di lezioni
                    validation = await con.query(`select id from lessons where id_module = ? and ? between startdate and enddate or ? between startdate and enddate`,
                        [requestbody.id_module, startDate, endDate]);
                    if (validation[0].length <= 0) {
                        // Esecuzione della query SQL per inserire la lezione
                        let [data] = await con.execute(
                            `INSERT INTO lessons (startdate, enddate, id_module) VALUES (?,?,?)`, [startDate, endDate, requestbody.id_module]
                        );
                        arrLessons.push({ id: data.insertId, startdate: startDate, enddate: endDate, id_module: requestbody.id_module });
                    }
                }
                // Avanzamento della data al prossimo giorno
                currentDate.setDate(currentDate.getDate() + 1);  // Passa al giorno successivo
            }

            // Risposta JSON con i dati
            res.json(arrLessons);

        } catch (err) {
            console.log("Errore durante la creazione delle lezioni:", err);
            res.json({ error: true, errormessage: "GENERIC_ERROR", details: err.message });
        }
    });


    app.post('/signpresence', jsonParser, auth.authenticateToken, async (req, res) => {
        let requestbody = req.body;
        try {
            
            let validation = await con.query(`SELECT id FROM lessons WHERE id = ?`, [requestbody.id_lesson]);
            if (validation.length < 1) {
                return res.json({ error: true, errormessage: "ID_LESSON_NOT_EXIST" });
            }
            validation = await con.query(`SELECT id FROM users WHERE id = ?`, [requestbody.id_user]);
            if (validation.length < 1) {
                return res.json({ error: true, errormessage: "ID_USER_NOT_EXIST" });
            }
            //vede se la data della firma è dello stesso giorno della lezione
            validation = await con.query(
                `SELECT id FROM lessons WHERE ? BETWEEN startdate AND enddate AND id = ?`, [requestbody.signdate,  requestbody.id_lesson]);
            if (validation.length === 0) {
                return res.json({ error: true, errormessage: "INVALID_SIGN" });
            }
            //è gia stato firmato
            validation = await con.query(`SELECT * FROM lessons_presences WHERE  id_user = ? AND id_lesson= ?`, [requestbody.id_user, requestbody.id_lesson]);
            console.log(validation)
            if (validation[0].length >0) {
                return res.json({ error: true, errormessage: "SIGNPRESENCE_EXIST" });
            }

            const [data] = await con.execute(`INSERT INTO lessons_presences (id_lesson, id_user, signdate) VALUES (?, ?, ?)`, [requestbody.id_lesson, requestbody.id_user, requestbody.signdate]);
            res.json({ success: true, data });

        } catch (err) {
            console.error("signpresence Error:", err);
            res.json({ error: true, errormessage: "GENERIC_ERROR" });
        }
    });


    app.get('/getlessonpresences', jsonParser, auth.authenticateToken, async (req, res) => {
        let lesson = req.query.id_lesson;
        try {
            const [data] = await con.execute(`select * from lessons_presences where id_lesson = ?`, [lesson]);

            res.json(data);
        } catch (err) {
            console.log("Getlessonpresence Error:" + err);
            res.json({ error: true, errormessage: "GENERIC_ERROR" });
        }

        //recupera l'elenco delle presenze
        //dato l'id lezione
    })

    app.get('/getuserpresences', jsonParser, auth.authenticateToken, async (req, res) => {
        let requestbody = req.body;
        //recupera l'elenco delle presenze
        //dell'utente corrente, da data a data
    })

    app.get('/getmodulepresences', jsonParser, auth.authenticateToken, async (req, res) => {
        let requestbody = req.body;
        //recupera l'elenco delle presenze
        //per il modulo indicato; opzionale filtro per utente
    })

    app.get('/calculateuserpresences', jsonParser, auth.authenticateToken, async (req, res) => {
        let requestbody = req.body;
        //recupera l'elenco delle presenze
        //utente e calcola la percentuale presenze rispetto al totale ore di ogni modulo
    })

}

module.exports = initLessonRoutes;