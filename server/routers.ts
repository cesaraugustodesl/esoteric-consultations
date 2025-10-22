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
  createNumerology,
  getUserNumerologies,
  createPayment,
  updatePayment,
  getPayment,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { createPaymentPreference } from "./payment";
import { generateAstralMapPDF } from "./pdf";
import { numerologyRouter } from "./numerologyRouter";
import { paymentRouter } from "./paymentRouter";

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
          context: z.string().min(5, "Contexto deve ter no mínimo 5 caracteres"),
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
        const responsesWithQuestions: Array<{question: string, answer: string}> = [];

        // Responder cada pergunta
        for (const question of questions) {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `Você é um intérprete de Tarot com sabedoria ancestral. Responda com profundidade, detalhes e insights genuínos, mantendo linguagem simples e acessível.

REQUISITO OBRIGATÓRIO: Sua resposta DEVE ter entre 250-350 palavras. Não seja breve. Expanda MUITO a resposta com reflexões profundas, insights espirituais e orientações práticas.

Sua resposta deve:
- Começar com uma resposta clara (sim/não/talvez/tudo indica que sim)
- Explicar o significado de forma sutil e poética com detalhes
- Incluir insights profundos sobre a energia envolvida
- Descrever o que as cartas revelam sobre a situação
- Oferecer orientação prática e acionável
- Usar linguagem natural, conversacional e envolvente
- Nunca mencionar que você é uma IA
- Ser inspiradora mas realista
- Expandir com reflexões adicionais sobre o tema`,
              },
              {
                role: "user",
                content: `Contexto da situação: ${context}\n\nPergunta para leitura de Tarot: ${question}\n\nResponda com profundidade (250-350 palavras). Não resuma. Seja muito detalhado.`,
              },
            ],
          });

          const content = response.choices[0].message.content;
          const contentStr =
            typeof content === "string" ? content : "";
          responses.push(contentStr);
          responsesWithQuestions.push({ question, answer: contentStr });
        }

        // Gerar resumo geral
        const resumoResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um intérprete de Tarot com sabedoria ancestral. Crie um resumo geral profundo das leituras.

O resumo deve:
- Sintetizar as principais tendências e padrões
- Oferecer uma visão holística da situação
- Incluir insights sobre o caminho e as oportunidades
- Ser inspirador, sutil e prático
- Usar linguagem poética mas acessível
- Ter entre 200-250 palavras
- Nunca mencionar que você é uma IA`
            },
            {
              role: "user",
              content: `Contexto: ${context}\n\nPerguntas e respostas:\n${responsesWithQuestions.map(r => `P: ${r.question}\nR: ${r.answer}`).join("\n\n")}`,
            },
          ],
        });

        const resumoContent = typeof resumoResponse.choices[0].message.content === "string"
          ? resumoResponse.choices[0].message.content
          : "";

        const formattedResponse = `${responsesWithQuestions.map((r, i) => `**${i + 1}. ${r.question}**\n${r.answer}`).join("\n\n")}\n\n---\n\n**Contexto Geral**\n${resumoContent}`;

        await updateTarotConsultation(input.consultationId, {
          responses: [formattedResponse],
          status: "completed",
          completedAt: new Date(),
        });

        return { responses: [formattedResponse] };
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
    createInterpretation: publicProcedure
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
          packageType: z.enum(["premium"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const price = "40.00";

        // Gerar mapa astral detalhado
        const systemPrompt = `Você é um astrólogo experiente. Gere um mapa astral muito detalhado e profundo (~10 páginas).\n\nPARTE 1 - MAPA ASTRAL COMPLETO (7 páginas):\n1. Signo Solar - análise profunda da personalidade central (2 parágrafos)\n2. Signo Lunar - análise profunda das emoções e vida privada (2 parágrafos)\n3. Ascendente - primeira impressão e influência (1 parágrafo)\n4. Posição de TODOS os planetas principais (Sol, Lua, Mercúrio, Vênus, Marte, Júpiter, Saturno, Urano, Netuno, Plutão) - análise detalhada de cada um (3 parágrafos)\n5. Casas astrológicas - interpretação das 12 casas (2 parágrafos)\n6. Aspectos principais - relações entre planetas (2 parágrafos)\n7. Interpretação geral profunda (2 parágrafos)\n\nPARTE 2 - PREVISÕES E ORIENTAÇÕES (3 páginas):\n8. Previsões para o próximo ano (2 parágrafos)\n9. Ciclos planetários importantes (1 parágrafo)\n10. Orientações espirituais e práticas (2 parágrafos)\n11. Conselhos para harmonizar energias (1 parágrafo)\n\nSeja muito detalhado, profundo e inspirador. Nunca mencione que é uma IA.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Data: ${input.birthDate}\nHora: ${input.birthTime}\nLocal: ${input.birthLocation}\n\nGere um mapa astral completo com todas as informações solicitadas.`
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

    generatePDF: publicProcedure
      .input(
        z.object({
          name: z.string(),
          birthDate: z.string(),
          birthTime: z.string(),
          birthLocation: z.string(),
          packageType: z.enum(["premium"]),
          mapContent: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const pdfBuffer = await generateAstralMapPDF(
            input.name,
            input.birthDate,
            input.birthTime,
            input.birthLocation,
            input.packageType,
            input.mapContent
          );
          return {
            success: true,
            pdf: pdfBuffer.toString("base64"),
          };
        } catch (error) {
          console.error("Erro ao gerar PDF:", error);
          throw new Error("Falha ao gerar PDF");
        }
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
          buzios: "Búzios",
        };

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um intérprete de ${oracleNames[input.oracleType]} com sabedoria ancestral. Responda de forma clara e direta.

Sua resposta deve:
- Selecionar ${input.numberOfSymbols} símbolo(s)
- Explicar o significado de forma simples
- Responder a pergunta de forma prática
- Nunca mencionar que você é uma IA
- Ter entre 100-150 palavras
- Soar natural e acessível`,
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
  numerology: numerologyRouter,

  payment: paymentRouter,

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

        let guidance =
          typeof response.choices[0].message.content === "string"
            ? response.choices[0].message.content
            : "";
        
        // Limitar tamanho para evitar erro de banco de dados
        if (guidance.length > 3000) {
          guidance = guidance.substring(0, 3000);
        }
        
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
    createPaymentLink: publicProcedure
      .input(
        z.object({
          consultationType: z.enum(["tarot", "astral", "oracle"]),
          amount: z.string(),
          consultationId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const items = [{
            title: `Consulta de ${input.consultationType}`,
            quantity: 1,
            unit_price: parseFloat(input.amount),
          }];
          const preference = await createPaymentPreference(
            input.consultationId,
            items,
            ctx.user?.email || "guest@example.com",
            ctx.user?.id || "anonymous"
          );

          const userId: string = ctx.user?.id || "anonymous";
          const preferenceId: string = preference.id || "";
          const paymentId = await createPayment(
            userId,
            input.consultationId,
            input.amount,
            preferenceId
          );

          return {
            paymentId,
            preferenceId: preference.id,
            initPoint: preference.init_point,
          };
        } catch (error) {
          throw new Error("Failed to create payment preference");
        }
      }),

    getPaymentStatus: publicProcedure
      .input(z.object({ paymentId: z.string() }))
      .query(async ({ input }) => {
        const payment = await getPayment(input.paymentId);
        return payment;
      }),

    updatePaymentStatus: publicProcedure
      .input(
        z.object({
          paymentId: z.string(),
          status: z.enum(["pending", "approved", "failed", "refunded"]),
        })
      )
      .mutation(async ({ input }) => {
        await updatePayment(input.paymentId, { status: input.status });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

