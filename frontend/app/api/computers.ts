import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const computers = await prisma.computer.findMany();
      return res.json(computers);
    } catch (error) {
      console.error("Ошибка при получении компьютеров:", error);
      return res.status(500).json({ error: "Ошибка при получении компьютеров" });
    }
  }

  if (req.method === 'POST') {
    try {
      const { status } = req.body;
      const newComputer = await prisma.computer.create({ data: { status } });
      return res.json(newComputer);
    } catch (error) {
      console.error("Ошибка при добавлении компьютера:", error);
      return res.status(500).json({ error: "Ошибка при добавлении компьютера" });
    }
  }

  return res.status(405).end(); // Method Not Allowed
}
