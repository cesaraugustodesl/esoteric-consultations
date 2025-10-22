import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createNumerology, getUserNumerologies } from "./db";
import { invokeLLM } from "./_core/llm";

export const numerologyRouter = router({
  createReading: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(3),
        birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Calculate numerological numbers
      const calculateNumber = (text: string): number => {
        const letters = text.toUpperCase().replace(/[^A-Z]/g, "");
        let sum = 0;
        for (let char of letters) {
          sum += char.charCodeAt(0) - 64;
        }
        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
          sum = sum.toString().split("").reduce((a, b) => a + parseInt(b), 0);
        }
        return sum;
      };

      const calculateDateNumber = (date: string): number => {
        const parts = date.split("-");
        let sum = parseInt(parts[0]) + parseInt(parts[1]) + parseInt(parts[2]);
        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
          sum = sum.toString().split("").reduce((a, b) => a + parseInt(b), 0);
        }
        return sum;
      };

      const destinyNumber = calculateNumber(input.fullName);
      const soulNumber = calculateNumber(
        input.fullName.split(" ").map(word => word[0]).join("")
      );
      const personalityNumber = calculateNumber(
        input.fullName.split(" ").map(word => word[word.length - 1]).join("")
      );
      const expressionNumber = calculateNumber(input.fullName);
      const currentYear = new Date().getFullYear();
      const personalYear = calculateDateNumber(
        `${currentYear}-${input.birthDate.split("-")[1]}-${input.birthDate.split("-")[2]}`
      );

      // Generate interpretations via LLM
      const generateInterpretation = async (number: number, type: string): Promise<string> => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um especialista em numerologia com profundo conhecimento dos significados numéricos. Ofereça interpretações precisas e inspiradoras.

Sua interpretação deve:
- Ser clara e significativa
- Conectar o número com a vida da pessoa
- Oferecer insights práticos
- Nunca mencionar que você é uma IA
- Ter entre 80-120 palavras
- Soar natural e profissional`,
            },
            {
              role: "user",
              content: `Interprete o Número ${type} na numerologia: ${number}`,
            },
          ],
        });

        return typeof response.choices[0].message.content === "string"
          ? response.choices[0].message.content
          : "";
      };

      const [destinyInterp, soulInterp, personalityInterp, expressionInterp, yearInterp] =
        await Promise.all([
          generateInterpretation(destinyNumber, "de Destino"),
          generateInterpretation(soulNumber, "da Alma"),
          generateInterpretation(personalityNumber, "da Personalidade"),
          generateInterpretation(expressionNumber, "de Expressão"),
          generateInterpretation(personalYear, "do Ano Pessoal"),
        ]);

      const price = "25.00";
      const numerologyId = await createNumerology(
        ctx.user?.id || "anonymous",
        input.fullName,
        input.birthDate,
        destinyNumber,
        soulNumber,
        personalityNumber,
        expressionNumber,
        personalYear,
        destinyInterp,
        soulInterp,
        personalityInterp,
        expressionInterp,
        yearInterp,
        price
      );

      return {
        numerologyId,
        price,
        fullName: input.fullName,
        birthDate: input.birthDate,
        destinyNumber,
        soulNumber,
        personalityNumber,
        expressionNumber,
        personalYear,
        destinyInterpretation: destinyInterp,
        soulInterpretation: soulInterp,
        personalityInterpretation: personalityInterp,
        expressionInterpretation: expressionInterp,
        yearInterpretation: yearInterp,
        summary: `Leitura numerológica completa de ${input.fullName}`,
      };
    }),

  listReadings: publicProcedure.query(async ({ ctx }) => {
    if (ctx.user) {
      return await getUserNumerologies(ctx.user.id);
    }
    return [];
  }),
});

