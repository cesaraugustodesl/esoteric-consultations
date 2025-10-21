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
    createConsultation: publicProcedure
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
          ctx.user?.id || "anonymous",
          input.context,
          input.questions,
          input.numberOfQuestions,
          price
        );

        return { consultationId, price };
      }),

    getConsultation: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const consultation = await getTarotConsultation(input.id);
        if (!consultation || (ctx.user && consultation.userId !== ctx.user.id)) {
          return null;
        }
        return {
          ...consultation,
          questions: JSON.parse(consultation.questions),
          responses: JSON.parse(consultation.responses),
        };
      }),

    generateResponses: publicProcedure
      .input(z.object({ consultationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const consultation = await getTarotConsultation(input.consultationId);
        if (!consultation || (ctx.user && consultation.userId !== ctx.user.id)) {
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
                content: `Você é um intérprete de Tarot com sabedoria ancestral. Responda de forma clara, direta e objetiva, sem rodeios.

Suas respostas devem:
- Ser diretas e focadas na pergunta
- Usar linguagem simples e clara
- Oferecer orientação prática e útil
- Nunca mencionar que você é uma IA
- Ter entre 100-150 palavras
- Soar natural e acessível
- Responder especificamente o que foi perguntado`,
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

    listConsultations: publicProcedure.query(async ({ ctx }) => {
      if (ctx.user) {
        return await getUserTarotConsultations(ctx.user.id);
      }
      return [];
    }),
  }),

  /**
   * Dream Interpretations (Free)
   */
  dreams: router({
    interpretDream: publicProcedure
      .input(z.object({ dreamDescription: z.string().min(20) }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um intérprete de sonhos com sabedoria ancestral. Analise sonhos com profundidade psicológica e espiritual.

Sua interpretação deve:
- Identificar os símbolos principais
- Explicar o significado de forma simples
- Ser prática e útil
- Nunca mencionar que você é uma IA
- Ter entre 150-200 palavras
- Soar natural e acessível`,
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
          ctx.user?.id || "anonymous",
          input.dreamDescription,
          interpretation,
          symbols
        );

        return { dreamId, interpretation, symbols };
      }),

    listInterpretations: publicProcedure.query(async ({ ctx }) => {
      if (ctx.user) {
        return await getUserDreamInterpretations(ctx.user.id);
      }
      return [];
    }),
  }),

  /**
   * Astral Maps (Paid)
   */
  astral: router({
    createMap: publicProcedure
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

        // Gerar mapa astral
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Voce eh um astrologo com sabedoria ancestral. Gere um mapa astral simplificado de forma clara e direta.

Seu mapa deve:
- Incluir signo solar, lunar e ascendente
- Explicar a personalidade de forma simples
- Dar dicas praticas
- Nunca mencionar que voce eh uma IA
- Ter entre 150-200 palavras
- Soar natural e acessivel`,
            },
            {
              role: "user",
              content: `Data: ${input.birthDate}, Hora: ${input.birthTime}, Local: ${input.birthLocation}`,
            },
          ],
        });

        const mapContent =
          typeof response.choices[0].message.content === "string"
            ? response.choices[0].message.content
            : "";

        const mapId = await createAstralMap(
          ctx.user?.id || "anonymous",
          input.birthDate,
          input.birthTime,
          input.birthLocation,
          {},
          mapContent,
          input.packageType,
          price
        );

        return { mapId, price, mapContent };
      }),

    generateMap: publicProcedure
      .input(z.object({ mapId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return { success: true };
      }),

    listMaps: publicProcedure.query(async ({ ctx }) => {
      if (ctx.user) {
        return await getUserAstralMaps(ctx.user.id);
      }
      return [];
    }),
  }),

  /**
   * Oracles (Paid)
   */
  oracle: router({
    createConsult: publicProcedure
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

        const oracleNames: Record<string, string> = {
          runas: "Runas",
          anjos: "Anjos",
          buzios: "Buzios",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Voce eh um interprete de ${oracleNames[input.oracleType]} com sabedoria ancestral. Responda de forma clara e direta.

Sua resposta deve:
- Selecionar ${input.numberOfSymbols} simbolo(s)
- Explicar o significado de forma simples
- Responder a pergunta de forma pratica
- Nunca mencionar que voce eh uma IA
- Ter entre 100-150 palavras
- Soar natural e acessivel`,
            },
            {
              role: "user",
              content: `Pergunta: ${input.question}`,
            },
          ],
        });

        const interpretation =
          typeof response.choices[0].message.content === "string"
            ? response.choices[0].message.content
            : "";

        const oracleId = await createOracle(
          ctx.user?.id || "anonymous",
          input.oracleType,
          input.question,
          input.numberOfSymbols,
          [],
          interpretation.split("\n"),
          price
        );

        return { oracleId, price, interpretation };
      }),

    generateInterpretation: publicProcedure
      .input(z.object({ oracleId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return { success: true };
      }),

    listConsults: publicProcedure.query(async ({ ctx }) => {
      if (ctx.user) {
        return await getUserOracles(ctx.user.id);
      }
      return [];
    }),
  }),

  /**
   * Energy Guidance (Free)
   */
  energy: router({
    getGuidance: publicProcedure
      .input(z.object({ topic: z.string().min(5) }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um guia energético e espiritual com sabedoria ancestral. Ofereça orientações sobre energia, chakras e desenvolvimento espiritual.

Sua orientação deve:
- Ser clara e direta
- Abordar o tópico de forma prática
- Incluir dicas úteis sobre chakras
- Oferecer ações concretas
- Nunca mencionar que você é uma IA
- Ter entre 150-200 palavras
- Soar natural e acessível`,
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
          ctx.user?.id || "anonymous",
          input.topic,
          guidance,
          chakraFocus
        );

        return { guidanceId, guidance, chakraFocus };
      }),

    listGuidance: publicProcedure.query(async ({ ctx }) => {
      if (ctx.user) {
        return await getUserEnergyGuidance(ctx.user.id);
      }
      return [];
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

