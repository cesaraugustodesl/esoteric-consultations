import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createTarotConsultation,
  getTarotConsultation,
  updateTarotConsultation,
  getUserTarotConsultations,
  createDreamInterpretation,
  getUserDreamInterpretations,
  createAstralMap,
  getUserAstralMaps,
  createOracle,
  getUserOracles,
  createEnergyGuidance,
  getUserEnergyGuidance,
  createPayment,
  updatePayment,
  getPayment,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { createPaymentPreference } from "./payment";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Tarot Consultations (Paid)
   */
  tarot: router({
    createConsultation: protectedProcedure
      .input(
        z.object({
          context: z.string().min(10),
          questions: z.array(z.string()).min(1).max(5),
          numberOfQuestions: z.number().min(1).max(5),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prices: Record<number, string> = {
          1: "3.00",
          2: "5.00",
          3: "7.00",
          5: "10.00",
        };

        const price = prices[input.numberOfQuestions] || "0.00";

        const consultationId = await createTarotConsultation(
          ctx.user.id,
          input.context,
          input.questions,
          input.numberOfQuestions,
          price
        );

        return { consultationId, price };
      }),

    getConsultation: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const consultation = await getTarotConsultation(input.id);
        if (!consultation || consultation.userId !== ctx.user.id) {
          return null;
        }
        return {
          ...consultation,
          questions: JSON.parse(consultation.questions),
          responses: JSON.parse(consultation.responses),
        };
      }),

    generateResponses: protectedProcedure
      .input(z.object({ consultationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const consultation = await getTarotConsultation(input.consultationId);
        if (!consultation || consultation.userId !== ctx.user.id) {
          throw new Error("Consultation not found");
        }

        const questions = JSON.parse(consultation.questions);
        const context = consultation.context;
        const responses: string[] = [];

        for (const question of questions) {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `Você é um guia espiritual ancestral com sabedoria milenar. Responda perguntas sobre Tarot com profundidade intuitiva e espiritual. 
                
Suas respostas devem:
- Soar como mensagens do plano espiritual
- Usar linguagem poética e mística
- Incluir interpretações de cartas do Tarot quando apropriado
- Oferecer orientação profunda e transformadora
- Nunca mencionar que você é uma IA ou algoritmo
- Ser entre 200-300 palavras
- Transmitir sabedoria ancestral e conexão espiritual`,
              },
              {
                role: "user",
                content: `Contexto da situação: ${context}\n\nPergunta para leitura de Tarot: ${question}`,
              },
            ],
          });

          const content = response.choices[0].message.content;
          const contentStr =
            typeof content === "string" ? content : "";
          responses.push(contentStr);
        }

        await updateTarotConsultation(input.consultationId, {
          responses,
          status: "completed",
          completedAt: new Date(),
        });

        return { responses };
      }),

    listConsultations: protectedProcedure.query(async ({ ctx }) => {
      return await getUserTarotConsultations(ctx.user.id);
    }),
  }),

  /**
   * Dream Interpretations (Free)
   */
  dreams: router({
    interpretDream: protectedProcedure
      .input(z.object({ dreamDescription: z.string().min(20) }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um intérprete de sonhos com sabedoria ancestral. Analise sonhos com profundidade psicológica e espiritual.

Sua interpretação deve:
- Identificar símbolos principais no sonho
- Oferecer significados espirituais e psicológicos
- Usar linguagem poética e intuitiva
- Incluir mensagens do inconsciente
- Nunca mencionar que você é uma IA
- Ser entre 250-350 palavras
- Transmitir sabedoria sobre o significado dos sonhos`,
            },
            {
              role: "user",
              content: `Sonho a interpretar: ${input.dreamDescription}`,
            },
          ],
        });

        const interpretation =
          typeof response.choices[0].message.content === "string"
            ? response.choices[0].message.content
            : "";

        const symbolMatches = interpretation.match(/símbolo[^:]*:\s*([^\n]+)/gi) || [];
        const symbols = symbolMatches.map((s) => s.replace(/símbolo[^:]*:\s*/i, ""));

        const dreamId = await createDreamInterpretation(
          ctx.user.id,
          input.dreamDescription,
          interpretation,
          symbols
        );

        return { dreamId, interpretation, symbols };
      }),

    listInterpretations: protectedProcedure.query(async ({ ctx }) => {
      return await getUserDreamInterpretations(ctx.user.id);
    }),
  }),

  /**
   * Astral Maps (Paid)
   */
  astral: router({
    createMap: protectedProcedure
      .input(
        z.object({
          birthDate: z.string(),
          birthTime: z.string(),
          birthLocation: z.string(),
          packageType: z.enum(["basic", "premium"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prices: Record<string, string> = {
          basic: "30.00",
          premium: "50.00",
        };

        const price = prices[input.packageType];

        const mapId = await createAstralMap(
          ctx.user.id,
          input.birthDate,
          input.birthTime,
          input.birthLocation,
          {},
          "",
          input.packageType,
          price
        );

        return { mapId, price };
      }),

    generateMap: protectedProcedure
      .input(z.object({ mapId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return { success: true };
      }),

    listMaps: protectedProcedure.query(async ({ ctx }) => {
      return await getUserAstralMaps(ctx.user.id);
    }),
  }),

  /**
   * Oracles (Paid)
   */
  oracle: router({
    createConsult: protectedProcedure
      .input(
        z.object({
          oracleType: z.enum(["runas", "anjos", "buzios"]),
          question: z.string().min(10),
          numberOfSymbols: z.number().min(1).max(5),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prices: Record<number, string> = {
          1: "5.00",
          3: "12.00",
          5: "20.00",
        };

        const price = prices[input.numberOfSymbols] || "0.00";

        const oracleId = await createOracle(
          ctx.user.id,
          input.oracleType,
          input.question,
          input.numberOfSymbols,
          [],
          [],
          price
        );

        return { oracleId, price };
      }),

    generateInterpretation: protectedProcedure
      .input(z.object({ oracleId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return { success: true };
      }),

    listConsults: protectedProcedure.query(async ({ ctx }) => {
      return await getUserOracles(ctx.user.id);
    }),
  }),

  /**
   * Energy Guidance (Free)
   */
  energy: router({
    getGuidance: protectedProcedure
      .input(z.object({ topic: z.string().min(5) }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um guia energético e espiritual com sabedoria ancestral. Ofereça orientações sobre energia, chakras e desenvolvimento espiritual.

Sua orientação deve:
- Abordar o tópico com profundidade espiritual
- Incluir informações sobre chakras relevantes
- Oferecer práticas de harmonização energética
- Usar linguagem poética e intuitiva
- Nunca mencionar que você é uma IA
- Ser entre 200-300 palavras
- Transmitir sabedoria sobre energias e transformação`,
            },
            {
              role: "user",
              content: `Tópico para orientação energética: ${input.topic}`,
            },
          ],
        });

        const guidance =
          typeof response.choices[0].message.content === "string"
            ? response.choices[0].message.content
            : "";
        const chakraMatch = guidance.match(/chakra[^:]*:\s*([^\n]+)/i);
        const chakraFocus = chakraMatch ? chakraMatch[1].trim() : "Chakra do Coração";

        const guidanceId = await createEnergyGuidance(
          ctx.user.id,
          input.topic,
          guidance,
          chakraFocus
        );

        return { guidanceId, guidance, chakraFocus };
      }),

    listGuidance: protectedProcedure.query(async ({ ctx }) => {
      return await getUserEnergyGuidance(ctx.user.id);
    }),
  }),

  /**
   * Payments
   */
  payments: router({
    createPaymentLink: protectedProcedure
      .input(
        z.object({
          consultationId: z.string(),
          amount: z.string(),
          numberOfQuestions: z.number(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const preference = await createPaymentPreference(
            input.consultationId,
            [
              {
                title: `Leitura de Tarot - ${input.numberOfQuestions} pergunta(s)`,
                quantity: 1,
                unit_price: parseFloat(input.amount),
                description: "Consulta esoterica com respostas profundas do plano espiritual",
              },
            ],
            ctx.user.email || "user@example.com",
            ctx.user.id
          );

          return {
            paymentLink: preference.init_point,
            preferenceId: preference.id,
          };
        } catch (error) {
          console.error("Erro ao criar link de pagamento:", error);
          throw new Error("Falha ao criar link de pagamento");
        }
      }),

    createPayment: protectedProcedure
      .input(
        z.object({
          consultationId: z.string(),
          amount: z.string(),
          paymentMethod: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const paymentId = await createPayment(
          ctx.user.id,
          input.consultationId,
          input.amount,
          input.paymentMethod
        );

        // Notify owner of new payment
        await notifyOwner({
          title: "Novo Pagamento Recebido",
          content: `Usuário ${ctx.user.name} iniciou um pagamento de R$ ${input.amount} para consulta de Tarot.`,
        });

        return { paymentId };
      }),

    updatePaymentStatus: protectedProcedure
      .input(
        z.object({
          paymentId: z.string(),
          status: z.enum(["pending", "approved", "failed", "refunded"]),
          externalPaymentId: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const payment = await getPayment(input.paymentId);
        if (!payment || payment.userId !== ctx.user.id) {
          throw new Error("Payment not found");
        }

        await updatePayment(input.paymentId, {
          status: input.status,
          externalPaymentId: input.externalPaymentId,
        });

        if (input.status === "approved") {
          await updateTarotConsultation(payment.consultationId, {
            paymentStatus: "completed",
          });
        }

        return { success: true };
      }),

    getPayment: protectedProcedure
      .input(z.object({ paymentId: z.string() }))
      .query(async ({ ctx, input }) => {
        const payment = await getPayment(input.paymentId);
        if (!payment || payment.userId !== ctx.user.id) {
          return null;
        }
        return payment;
      }),
  }),
});

export type AppRouter = typeof appRouter;

