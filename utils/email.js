const nodemailer= require('nodemailer')
const htmlToText= require('html-to-text')
const pug= require('pug')


module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.name= user.name.split(' ')[0];
        this.url = url;
        this.from = `Oxford Language School <${process.env.EMAIL_FROM}>`; 
    }

    newTransport(){
        console.log(!process.env.NODE_ENV)
        if (process.env.MODE==='production') {
            // Sendgrid
            return nodemailer.createTransport({
              service: 'SendGrid',
              auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_APIKEY
              }
            });
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth:{
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject, message){
        //Define email options
        //1) Render Html based on pug template
        const html= pug.renderFile(`${__dirname}\\..\\views\\emails\\${template}.pug`, {
            name: this.name, 
            url: this.url,
            message, 
            subject
        })
        const mailOptions= {
            from: this.from,
            to:this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };
        //2) create transport 
            await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to Oxford Language School')
    }

    async sendPasswordReset(){
        await this.send('passwordReset',
            `click the button below, Your password reset token is valid for only 10 minutes \n
            if you did not request to change password ignore this`
        )
    }

    async sendPasswordChanged(){
        await this.send('passwordChanged', 'Your Password has been changed sucessfully')

    }

    async sendActivate(){
        await this.send('Your Account has been Activated')
    }
    async sendClass(tutorial){
        await this.send('class', `${this.name}, your class has been scheduled`, 
        `Your class has been sheduled for ${tutorial.scheduledTime} please ${this.name}, kindly try meet up with your class \n
        your session expires at ${tutorial.deadLine}`)
    }
    async sendClassUpdate(tutorial){
        await this.send('class', `OXLS, class updated`,`Your class with ${tutorial.tutor.name.toUpperCase()} class link has been updated, 
        follow this link ${tutorial.skypeLink || tutorial.zoomLink} to join the class on ${tutorial.scheduledTime} follow for the scheduled time`)
    }
    async sendApplication(){
        await this.send('application', 'Application as Teacher', 'There has been an Application on OXLS for the role of a Teacher')
    }
    async sendApproval(){
        await this.send('application', 'Approved Application', `Congratulations ${this.name}!!, your application has been approved, \n
        please kindly follow this link this link Expires in 24 hours`)
    }
    async sendDisapproval(){
        await this.send('disapproval', 'OXLS', `Sorry ${this.name}, we regret to inform you that your application \n
        as a techer on our platform has been disapproved, your application wasn't convincing enough, you can re-apply`)
    }

}