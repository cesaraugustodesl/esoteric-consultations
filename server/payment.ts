import { MercadoPagoConfig, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "",
});

export interface PaymentItem {
  title: string;
  quantity: number;
  unit_price: number;
  description?: string;
}

export async function createPaymentPreference(
  consultationId: string,
  items: PaymentItem[],
  userEmail: string,
  userId: string
) {
  try {
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: items.map((item, index) => ({
          id: `item-${index}`,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unit_price,
          description: item.description,
        })),
        payer: {
          email: userEmail,
        },
        back_urls: {
          success: `${process.env.VITE_APP_URL || "http://localhost:3000"}/payment/success?consultation_id=${consultationId}`,
          failure: `${process.env.VITE_APP_URL || "http://localhost:3000"}/payment/failure?consultation_id=${consultationId}`,
          pending: `${process.env.VITE_APP_URL || "http://localhost:3000"}/payment/pending?consultation_id=${consultationId}`,
        },
        notification_url: `${process.env.VITE_APP_URL || "http://localhost:3000"}/api/webhooks/mercado-pago`,
        external_reference: consultationId,
        metadata: {
          consultation_id: consultationId,
          user_id: userId,
        },
      },
    });

    return response;
  } catch (error) {
    console.error("Erro ao criar preferência de pagamento:", error);
    throw error;
  }
}

export async function getPaymentStatus(paymentId: string) {
  try {
    // Implementar busca de status do pagamento
    // Este é um exemplo simplificado
    return null;
  } catch (error) {
    console.error("Erro ao obter status do pagamento:", error);
    throw error;
  }
}

