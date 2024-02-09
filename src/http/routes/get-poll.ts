import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { z } from 'zod';
import { redis } from "../../lib/redis";

export async function getPoll(app: FastifyInstance) {
  app.get('/polls/:pollId', async (req, res) => {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = getPollParams.parse(req.params);

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          }
        }
      },
    });

    if (!poll) {
      return res.status(404).send({
        error: 'Poll not found',
      });
    }

    // Get the votes from Redis
    const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES');

    // Convert the result into a dictionary
    const votes = result.reduce((obj, line, index) => {
      if (index % 2 === 0) {
        const score = result[index + 1];
        obj[line] = parseInt(score, 10);
      }
      return obj;
    }, {} as Record<string, number>);

    return res.send({
      poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map(option => ({
          id: option.id,
          title: option.title,
          score: (option.id in votes) ? votes[option.id] : 0,
        }))
      }
    });
  });
}