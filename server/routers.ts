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
  createRadinicTable,
  getUserRadinicTables,
  createEnergyGuidance,
  getUserEnergyGuidance,
  createPayment,
  updatePayment,
  getPayment,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

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

    listConsultations: protectedProcedure.query(async ({ ctx }) => {
      const consultations = await getUserTarotConsultations(ctx.user.id);
      return consultations.map((c) => ({
        ...c,
        questions: JSON.parse(c.questions),
        responses: JSON.parse(c.responses),
      }));
    }),

    generateResponses: protectedProcedure
      .input(z.object({ consultationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const consultation = await getTarotConsultation(input.consultationId);
        if (!consultation || consultation.userId !== ctx.user.id) {
          throw new Error("Consultation not found");
        }

        const questions = JSON.parse(consultation.questions);
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
                content: `Pergunta para leitura de Tarot: ${question}`,
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
  }),

  /**
   * Dream Interpretations (Free)
   */
  dreams: router({
    interpretDream: protectedProcedure
      .input(z.object({ dreamDescription: z.string().min(10) }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
          {
            role: "system",
            content: `Você é um intérprete de sonhos com conhecimento profundo de simbologia e psicologia espiritual.

Sua interpretação deve:
- Identificar símbolos principais no sonho
- Oferecer interpretações místicas e psicológicas
- Conectar com temas de autoconhecimento e crescimento espiritual
- Usar linguagem poética e intuitiva
- Nunca mencionar que você é uma IA
- Ser entre 300-400 palavras
- Incluir uma lista de símbolos-chave identificados`,
          },
            {
              role: "user",
              content: `Interprete este sonho: ${input.dreamDescription}`,
            },
          ],
        });

        const interpretation =
          typeof response.choices[0].message.content === "string"
            ? response.choices[0].message.content
            : "";

        // Extract symbols from interpretation
        const symbolsMatch = interpretation.match(
          /Símbolos-chave:([\s\S]*?)(?=\n\n|$)/
        );
        const symbols = symbolsMatch
          ? symbolsMatch[1]
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s)
          : [];

        const dreamId = await createDreamInterpretation(
          ctx.user.id,
          input.dreamDescription,
          interpretation,
          symbols
        );

        return { dreamId, interpretation, symbols };
      }),

    listDreams: protectedProcedure.query(async ({ ctx }) => {
      const dreams = await getUserDreamInterpretations(ctx.user.id);
      return dreams.map((d) => ({
        ...d,
        symbols: d.symbols ? JSON.parse(d.symbols) : [],
      }));
    }),
  }),

  /**
   * Radinic Tables (Free)
   */
  radinic: router({
    consult: protectedProcedure
      .input(z.object({ question: z.string().min(10) }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um especialista em radiônica e energias vibracionais. Responda consultas sobre radiônica com profundidade espiritual.

Sua resposta deve:
- Explicar a frequência energética relacionada à pergunta
- Oferecer orientação baseada em princípios radiônicos
- Usar linguagem mística e intuitiva
- Incluir recomendações para harmonização energética
- Nunca mencionar que você é uma IA
- Ser entre 250-350 palavras
- Transmitir sabedoria sobre energias e vibrações`,
            },
            {
              role: "user",
              content: `Consulta radiônica: ${input.question}`,
            },
          ],
        });

        const responseText =
          typeof response.choices[0].message.content === "string"
            ? response.choices[0].message.content
            : "";
        const frequencyMatch = responseText.match(/frequência[^:]*:\s*([^\n]+)/i);
        const energyFrequency = frequencyMatch ? frequencyMatch[1].trim() : "Frequência Harmônica";

        const radinicId = await createRadinicTable(
          ctx.user.id,
          input.question,
          responseText,
          energyFrequency
        );

        return { radinicId, response: responseText, energyFrequency };
      }),

    listConsults: protectedProcedure.query(async ({ ctx }) => {
      return await getUserRadinicTables(ctx.user.id);
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
- Ser entre 250-350 palavras
- Transmitir sabedoria transformadora`,
            },
            {
              role: "user",
              content: `Orientação energética sobre: ${input.topic}`,
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
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const payment = await getPayment(input.id);
        if (!payment || payment.userId !== ctx.user.id) {
          return null;
        }
        return payment;
      }),
  }),
});

export type AppRouter = typeof appRouter;

