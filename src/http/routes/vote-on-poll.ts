import { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";
import { z } from 'zod';
import { redis } from "../../lib/redis";
import { voting } from "../../utils/voting-pub-sub";

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (req, res) => {
    const voteOnPollBody = z.object({
      pollOptionId: z.string().uuid(),
    });

    const voteOnPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = voteOnPollParams.parse(req.params);
    const { pollOptionId } = voteOnPollBody.parse(req.body);

    let { sessionId } = req.cookies;

    if (!sessionId) {
      sessionId = randomUUID();

      res.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        signed: true,
        httpOnly: true,
      });
    } else {
      const userPreviousVoteOnPoll = await prisma.vote.findUnique({
        where: {
          sessionId_pollId: {
            sessionId,
            pollId,
          }
        }
      });

      if (userPreviousVoteOnPoll && userPreviousVoteOnPoll.pollOptionId != pollOptionId) {
        await prisma.vote.delete({
          where: {
            id: userPreviousVoteOnPoll.id,
          }
        });

        // Decrement the poll option's score in Redis
        const votes = await redis.zincrby(pollId, -1, userPreviousVoteOnPoll.pollOptionId);

        // Publish the previous vote to the WebSocket
        voting.publish(pollId, {
          pollOptionId: userPreviousVoteOnPoll.pollOptionId,
          voteCount: Number(votes),
        });
      } else if (userPreviousVoteOnPoll) {
        return res.status(400).send({
          error: 'User already voted on this poll'
        });
      }
    }

    await prisma.vote.create({
      data: {
        sessionId,
        pollId,
        pollOptionId,
      }
    });

    // Increment the poll option's score in Redis
    const votes = await redis.zincrby(pollId, 1, pollOptionId);

    // Publish the vote to the WebSocket
    voting.publish(pollId, {
      pollOptionId,
      voteCount: Number(votes),
    });

    return res.status(201).send();
  });
}