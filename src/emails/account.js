// const sendGridAPIKey = Enter API Key here
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(sendGridAPIKey) //setting api key

const sendWelcomeEmail = (email, name) => {
	sgMail.send({
		to: email,
		from: 'taskmanager@manager.com',
		subject: 'Welcome',
		text: `Welcome ${name} to the Task Manager App`
	})
}

module.exports = sendWelcomeEmail