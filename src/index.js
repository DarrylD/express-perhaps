//@flow

const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');
const Rx = require('rx');

const app = express()

//NOTE middleware for express
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const PORT = process.env.PORT || 7000;

//promises
const handleEmailSend = (uid:string) => new Promise( async (resolve) => {
    console.log(`Sending email to ${uid}`);
    resolve('emailId-12323')
})

//streams
const handleUserCheck$ = (userUid:string) => Rx.Observable
    .of( true ) //checking for user
    .map(() => userUid) //just streaming the uid opposed the the data from the Promise


//epics?
const doSendEmail$ = ({uid}:{uid:string}) => Rx.Observable
    .of(uid)
    .flatMap(handleUserCheck$) //making sure the person is a user
    .flatMap( email => Rx.Observable
        .fromPromise( handleEmailSend(email) ) //sending email
    )


app.get('/', (req, res) => res.send('some server') )

app.post('/sendEmail', (req, res) => {

    const {
        uid,
    } = req.body

    if(!uid) return res.status(400).send('Missing data');

    doSendEmail$({uid})
        .subscribe(
            (emailInfo) => {
                console.log('Sent email!');
                res.json({ emailInfo })
            },
            (errorRes) =>  {
                console.log('Error', errorRes);
                res.status(500).send(errorRes);
            },
            () => console.log('Done queuing email')
        );

});


app.listen(PORT, () => console.log(`Running on ${PORT}!`) )
