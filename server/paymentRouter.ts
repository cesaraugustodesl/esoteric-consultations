import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { payments } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const MERCADO_PAGO_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY;

export const paymentRouter = router({
  // Criar preferência de pagamento no Mercado Pago
  createPreference: publicProcedure
    .input(
      z.object({
        consultationType: z.enum(["tarot", "astral", "oracle", "numerology"]),
        amount: z.number().positive(),
        description: z.string(),
        consultationId: z.string(),
        userEmail: z.string().email().optional(),
        userName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Allow anonymous users - use provided email/name or defaults
      const userEmail = input.userEmail || ctx.user?.email || "guest@consultas-esoteric.com";
      const userName = input.userName || ctx.user?.name || "Visitante";
      const userId = ctx.user?.id || `guest_${Date.now()}`;

      // Validar token de acesso
      if (!MERCADO_PAGO_ACCESS_TOKEN) {
        console.error("MERCADO_PAGO_ACCESS_TOKEN não configurado");
        throw new Error("Configuração de pagamento não disponível");
      }

      try {
        const baseUrl = process.env.VITE_APP_URL || "http://localhost:3000";
        
        const payloadBody = {
          items: [
            {
              title: input.description,
              quantity: 1,
              unit_price: input.amount,
              currency_id: "BRL",
            },
          ],
          payer: {
            email: userEmail,
            name: userName,
          },
          back_urls: {
            success: `${baseUrl}/payment/success`,
            failure: `${baseUrl}/payment/failure`,
            pending: `${baseUrl}/payment/pending`,
          },

          external_reference: input.consultationId,
          notification_url: `${baseUrl}/api/payment-webhook`,
          statement_descriptor: "CONSULTAS ESOTERIC",
        };

        console.log("Enviando preferência ao Mercado Pago:", { consultationId: input.consultationId, amount: input.amount });

        const response = await fetch(
          "https://api.mercadopago.com/checkout/preferences",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(payloadBody),
          }
        );

        const responseText = await response.text();
        console.log("Resposta do Mercado Pago:", { status: response.status, bodyLength: responseText.length });

        if (!response.ok) {
          console.error("Erro na resposta do Mercado Pago:", responseText);
          throw new Error(`Falha ao criar preferência: ${response.status} - ${responseText}`);
        }

        let preference;
        try {
          preference = JSON.parse(responseText);
        } catch (e) {
          console.error("Erro ao parsear resposta JSON:", responseText);
          throw new Error("Resposta inválida do Mercado Pago");
        }

        if (!preference.id || !preference.init_point) {
          console.error("Resposta do Mercado Pago sem init_point:", preference);
          throw new Error("Resposta incompleta do Mercado Pago");
        }

        // Salvar pagamento pendente no banco
        const db = await getDb();
        if (!db) throw new Error("Banco de dados não disponível");
        
        const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(payments).values({
          id: paymentId,
          userId: userId,
          consultationId: input.consultationId,
          amount: input.amount.toString(),
          paymentMethod: "mercado_pago",
          externalPaymentId: preference.id,
          status: "pending",
        });

        console.log("Pagamento criado com sucesso:", { paymentId, preferenceId: preference.id });

        return {
          preferenceId: preference.id,
          initPoint: preference.init_point,
          paymentId,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Erro ao criar preferência:", errorMessage);
        throw new Error(`Erro ao processar pagamento: ${errorMessage}`);
      }
    }),

  // Verificar status do pagamento
  checkPaymentStatus: publicProcedure
    .input(z.object({ paymentId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Banco de dados não disponível");
        
        const payment = await db.select().from(payments).where(eq(payments.id, input.paymentId)).limit(1);
        const paymentRecord = payment[0];

        if (!paymentRecord) {
          throw new Error("Pagamento não encontrado");
        }

        // Se o pagamento já foi aprovado, retornar status
        if (paymentRecord.status === "approved") {
          return {
            status: "approved",
            paymentId: input.paymentId,
          };
        }

        // Verificar status no Mercado Pago
        if (paymentRecord.externalPaymentId) {
          const response = await fetch(
            `https://api.mercadopago.com/v1/payments/search?external_reference=${paymentRecord.consultationId}`,
            {
              headers: {
                Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const mpPayment = data.results[0];
              const status = mpPayment.status;

              // Atualizar status no banco se aprovado
              if (status === "approved") {
                const db = await getDb();
                if (db) {
                  await db
                    .update(payments)
                    .set({ status: "approved" })
                    .where(eq(payments.id, input.paymentId));
                }

                return {
                  status: "approved",
                  paymentId: input.paymentId,
                };
              }
            }
          }
        }

        return {
          status: paymentRecord.status,
          paymentId: input.paymentId,
        };
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        throw new Error("Erro ao verificar pagamento");
      }
    }),

  // Webhook para receber notificações do Mercado Pago
  webhook: publicProcedure
    .input(
      z.object({
        type: z.string().optional(),
        data: z.object({ id: z.string() }).optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.type === "payment" && input.data?.id) {
        try {
          const response = await fetch(
            `https://api.mercadopago.com/v1/payments/${input.data.id}`,
            {
              headers: {
                Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
              },
            }
          );

          if (response.ok) {
            const mpPayment = await response.json();

            if (mpPayment.status === "approved" && mpPayment.external_reference) {
              // Encontrar e atualizar o pagamento
              const db = await getDb();
              if (!db) return { success: true };
              
              const paymentList = await db.select().from(payments).where(eq(payments.consultationId, mpPayment.external_reference)).limit(1);
              const payment = paymentList[0];

              if (payment) {
                const db2 = await getDb();
                if (db2) {
                  await db2
                    .update(payments)
                    .set({ status: "approved" })
                    .where(eq(payments.id, payment.id));
                }
              }
            }
          }
        } catch (error) {
          console.error("Erro ao processar webhook:", error);
        }
      }

      return { success: true };
    }),
});

