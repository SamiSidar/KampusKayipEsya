package com.yeditepe.kampuskayipesya.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

/**
 * EmailService — Email gönderim servisi.
 *
 * Gmail SMTP üzerinden doğrulama kodu gönderir.
 * MAIL_USERNAME ve MAIL_PASSWORD environment variable'ları gereklidir.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Email doğrulama kodu gönderir.
     *
     * @param to    Alıcı email adresi
     * @param code  6 haneli doğrulama kodu
     */
    public void sendVerificationEmail(String to, String code) {
        String subject = "Kampüs Kayıp Eşya — Email Doğrulama Kodu";
        String htmlContent = buildVerificationEmailHtml(code);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Doğrulama emaili gönderildi: {}", to);
        } catch (MessagingException e) {
            log.error("Email gönderilemedi: {}", to, e);
            throw new RuntimeException("Email gönderilemedi. Lütfen daha sonra tekrar deneyin.");
        }
    }

    /**
     * Doğrulama emaili HTML şablonu.
     */
    private String buildVerificationEmailHtml(String code) {
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
                  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
                    <h2 style="color: #1a3a6b; text-align: center; margin-bottom: 8px;">
                      Kampüs Kayıp Eşya
                    </h2>
                    <p style="color: #6b7280; text-align: center; font-size: 14px; margin-bottom: 24px;">
                      Yeditepe Üniversitesi
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 24px;">
                    <p style="color: #374151; font-size: 15px;">
                      Merhaba,
                    </p>
                    <p style="color: #374151; font-size: 15px;">
                      Hesabınızı doğrulamak için aşağıdaki kodu uygulamaya girin:
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                      <span style="display: inline-block; background: #1a3a6b; color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px 32px; border-radius: 12px;">
                        %s
                      </span>
                    </div>
                    <p style="color: #6b7280; font-size: 13px; text-align: center;">
                      Bu kod <strong>10 dakika</strong> geçerlidir.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                      Bu emaili siz talep etmediyseniz, lütfen dikkate almayın.
                    </p>
                  </div>
                </body>
                </html>
                """.formatted(code);
    }
}
