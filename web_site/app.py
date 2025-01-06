from flask import Flask, render_template, request, redirect, url_for, flash
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # For flash messages

# Configuration for your email account
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "herbalcyberguardians@gmail.com"  # Replace with your email
EMAIL_PASSWORD = "svhn jrvv crat gium"       # Replace with your email app password

@app.route('/')
def contact_page():
    return render_template('home.html')  # Your HTML form

@app.route('/send-mail', methods=['POST'])
def send_mail():
    try:
        # Get form data
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        
        # Create the email
        subject = f"Message from {name}"
        body = f"""
        You have received a new message from your website's contact form:

        Name: {name}
        Email: {email}
        Message: {message}
        """
        
        # Set up the MIME email
        msg = MIMEMultipart()
        msg['From'] = email
        msg['To'] = EMAIL_ADDRESS
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))

        # Connect to the SMTP server and send the email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(email, EMAIL_ADDRESS, msg.as_string())
        server.quit()

        flash('Message sent successfully!', 'success')
        return redirect(url_for('contact_page'))
    except Exception as e:
        print(f"Error: {e}")
        flash('An error occurred while sending your message. Please try again later.', 'danger')
        return redirect(url_for('contact_page'))

if __name__ == "__main__":
    app.run(debug=True)
