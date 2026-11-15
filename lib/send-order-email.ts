import { Resend } from 'resend';

// ✅ API Key initialize karo
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  totalAmount: number,
  customerName: string
) {
  if (!email) return { success: false, error: "No email provided" };

  try {
    const { data, error } = await resend.emails.send({
      // ✅ Free account ke liye yeh email use karna zaroori hai
      from: 'ZUNLLY <onboarding@resend.dev>', 
      to: [email],
      subject: `Order Confirmed! #${orderNumber} - ZUNLLY`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #292722;">
          <h1 style="color: #b49a62; text-align: center;">ZUNLLY</h1>
          <h2>Thank you for your order, ${customerName || 'Customer'}!</h2>
          <p>We have received your order and are processing it. Here are your order details:</p>
          
          <div style="background-color: #f8f7f4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e6e1d9;">
            <p style="margin: 0;"><strong>Order Number:</strong> #${orderNumber}</p>
            <p style="margin: 10px 0 0 0;"><strong>Total Amount:</strong> PKR ${totalAmount.toLocaleString('en-PK')}</p>
          </div>
          
          <p>We will notify you once your order is shipped.</p>
          <br/>
          <p>Best regards,<br/>The ZUNLLY Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ RESEND API ERROR:", error);
      return { success: false, error };
    }

    console.log("✅ EMAIL SENT SUCCESSFULLY:", data);
    return { success: true, data };
  } catch (error) {
    console.error("❌ EMAIL CATCH ERROR:", error);
    return { success: false, error };
  }
}