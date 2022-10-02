const nodemailer= require('nodemailer')
const htmlToText= require('html-to-text')
const pug= require('pug')


module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName= user.firstName;
        this.url = url;
        this.from = `Oluwole Olanipekun <${process.env.EMAIL_FROM}>`; 
    }

    newTransport(){
        if (process.env.MODE === 'production'){
           return 1
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

    async send(template, subject){
        //Define email options
        //1) Render Html based on pug template
        const html= pug.renderFile(`${__dirname}\\..\\views\\emails\\${template}.pug`, {
            firstName: this.firstName, 
            url: this.url, 
            subject
        })
        const mailOptions= {
            form: this.from,
            to:this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };
        //2) create transport 
            await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome(){
        await this.send('welcome', 'Welcome to mooveX lets help you find your dream apartment')
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

}