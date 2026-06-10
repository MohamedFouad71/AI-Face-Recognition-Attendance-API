import nodemailer from 'nodemailer';

// Create a transporter using SMTP

const isSMTPVarsExists = () => {
  return (
    process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS
  );
};

const sendEmail = async (email: string, message: string) => {
  if (!isSMTPVarsExists) throw new Error('ERROR: SMTP Enviromental Variables Missing');

  const transporter = nodemailer.createTransport({
    // @ts-ignore
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log('SMTP Connection Error:', error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });

  await transporter.sendMail({
    from: '"Face Recognition Attendance System" <test@example.com>', // sender address
    to: email, // list of recipients
    subject: 'Password Reset Token', // subject line
    text: message, // plain text body
    // html: '<b>Hello world?</b>',
  });

  if (process.env.NODE_ENV === 'development') console.log(`message sent successfully: ${message}`);
  return true;
};

export default sendEmail;
