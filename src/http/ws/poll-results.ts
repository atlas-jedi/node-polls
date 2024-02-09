import { FastifyInstance } from 'fastify';
import { voting } from '../../utils/voting-pub-sub';
import { z } from 'zod';

export async function pollResults(app: FastifyInstance) {
  app.get('/polls/:pollId/results', { websocket: true }, async (connection, req) => {
    const getPollParams = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = getPollParams.parse(req.params);

    voting.subscribe(pollId, (message) => {
      connection.socket.send(JSON.stringify(message));
    });
  });
}