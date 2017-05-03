var nodemailer = require('nodemailer');

// environment vals like: EMAIL_ADR='your@email' EMAIL_PWD='your_password' npm start
function SendEmail(emailAdr, emailPwd, senderName) {
	this.emailAdr = emailAdr;
	this.emailPwd = emailPwd;
	this.senderName = senderName;
}

SendEmail.prototype.send = function (emailAddressTo, subject, text)
{

	var transporter = nodemailer.createTransport({
	     service: 'gmail', // no need to set host or port etc.
	     auth: {
			user: this.emailAdr,
	        pass: this.emailPwd
		 }
	});

	var mailOptions = {
	    from: '"' + this.senderName + '"<noreply@senacor.com>', // sender address
	    to: emailAddressTo, // list of receivers
	    subject: subject, // Subject line
	    text: text, // plaintext body
	};

	console.log("Will send email from: " + this.emailAdr + " to " + emailAddressTo);

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log("Error happened: " + error);
	    }
	    console.log('Message sent: ' + info.response);
	});
};

module.exports = SendEmail;
