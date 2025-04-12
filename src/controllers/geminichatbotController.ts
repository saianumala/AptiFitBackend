import { Request, Response } from "express";
import prisma from "../prisma";
import { generateUserContext } from "../utils/geminiChatbot";
import { geminiChatbot } from "../utils/personalisedAi";

export const createChatMessage = async (req: Request, res: Response) => {
  const { message } = req.body;
  const userId = req.user?.userId;

  try {
    // Store user message
    await prisma.chatMessage.create({
      data: {
        userId,
        role: "user",
        message,
      },
    });

    // Generate prompt with user context
    let prompt = await generateUserContext({ userData: req.user });
    prompt += `Based on the details above, respond to the following user message: "${message}"
        Ensure your response considers:
        - The user's preferences (cuisine, workout type, health goals, etc.).
        - Their body metrics (BMI, BMR, TDEE, etc.).
        - Their planned meals and any deviations from them.
        - Their workout plan and any recovery actions suggested.
        - The current time and location for relevant suggestions (e.g., meal timing, workout scheduling).

        Provide a concise yet comprehensive answer that directly addresses the user's query while leveraging their profile information for personalization. If the user's message is a general question, use the profile to provide contextually relevant information or suggestions. If the message relates to a specific aspect of their plan (meal, workout, recovery), prioritize information from that section.
        give the response in a json format like this {
          response: ""       
        }
        `;

    const response = await geminiChatbot(prompt);
    console.log(response);
    // Store bot response

    const createdMessage = await prisma.chatMessage.create({
      data: {
        userId,
        role: "bot",
        message: response.response,
      },
    });

    res.status(200).json({ message: createdMessage.message });
  } catch (error: any) {
    res.status(500).json({ errorMessage: error.message, error });
  }
};

export const getChatMessages = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    console.log(userId);
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        message: true,
      },
    });
    console.log(messages);
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getChatMessageById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const message = await prisma.chatMessage.findFirst({
      where: { id, userId },
    });

    if (!message) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    res.status(200).json(message);
  } catch (error: any) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const updateChatMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.user?.userId;

  try {
    const updated = await prisma.chatMessage.updateMany({
      where: { id, userId },
      data: { message },
    });

    if (updated.count === 0) {
      res.status(404).json({ error: "Message not found or unauthorized" });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteChatMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;

  try {
    const deleted = await prisma.chatMessage.deleteMany({
      where: { id, userId },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: "Message not found or unauthorized" });
      return;
    }

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ errorMessage: error.message });
  }
};
