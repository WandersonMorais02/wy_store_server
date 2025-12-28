import "dotenv/config";
import sgMail from "../../config/sendgrid.js";

const FROM_EMAIL = process.env.MAIL_FROM;

/* ===============================
   EMAIL DE VERIFICAÇÃO
================================ */
export async function sendVerifyEmail(email, token) {
  const link = `${process.env.FRONT_URL}/check-email?token=${token}`;

  try {
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: "Confirme seu email",
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <div style="background:#0f172a; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:22px;">Confirme seu email</h1>
          </div>

          <div style="padding:30px; color:#333;">
            <p style="font-size:16px; line-height:1.6;">
              Olá 👋,<br/><br/>
              Obrigado por se cadastrar! Para ativar sua conta, precisamos confirmar seu endereço de email.
            </p>

            <div style="text-align:center; margin:30px 0;">
              <a href="${link}"
                style="
                  background:#2563eb;
                  color:#ffffff;
                  text-decoration:none;
                  padding:14px 28px;
                  border-radius:6px;
                  font-size:16px;
                  font-weight:bold;
                  display:inline-block;
                ">
                Confirmar email
              </a>
            </div>

            <p style="font-size:14px; color:#555; line-height:1.5;">
              Se você não criou uma conta, pode ignorar este email com segurança.
            </p>

            <p style="font-size:13px; color:#888; margin-top:30px;">
              Este link é válido por tempo limitado.
            </p>
          </div>

          <div style="background:#f1f5f9; text-align:center; padding:15px; font-size:12px; color:#777;">
            © ${new Date().getFullYear()} • Todos os direitos reservados
          </div>

        </div>
      </div>
      `,
    });
  } catch (err) {
    console.error("Erro ao enviar email de verificação:", err.response?.body || err);
    throw new Error("EMAIL_SEND_FAILED");
  }
}

/* ===============================
   EMAIL DE BOAS-VINDAS
================================ */
export async function sendWelcomeEmail(email, name) {
  try {
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: "Bem-vindo 🎉 Sua conta está ativa!",
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          
          <div style="background:#16a34a; padding:20px; text-align:center;">
            <h1 style="color:#ffffff; margin:0; font-size:22px;">🎉 Bem-vindo!</h1>
          </div>

          <div style="padding:30px; color:#333;">
            <p style="font-size:16px; line-height:1.6;">
              Olá <strong>${name}</strong>,<br/><br/>
              Sua conta foi ativada com sucesso! Ficamos muito felizes em ter você com a gente.
            </p>

            <p style="font-size:15px; line-height:1.6;">
              Agora você pode aproveitar todos os recursos da plataforma, explorar novidades
              e ter a melhor experiência possível 🚀
            </p>

            <p style="font-size:15px; line-height:1.6; margin-top:20px;">
              💙 Obrigado por confiar em nós.  
              Conte com a gente sempre que precisar!
            </p>
          </div>

          <div style="background:#f1f5f9; text-align:center; padding:15px; font-size:12px; color:#777;">
            © ${new Date().getFullYear()} • Feito com dedicação para você
          </div>

        </div>
      </div>
      `,
    });
  } catch (err) {
    console.error("Erro ao enviar email de boas-vindas:", err.response?.body || err);
  }
}
