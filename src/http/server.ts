import fastify from 'fastify';
import { createPoll } from './routes/create-poll';

const app = fastify();

app.register(createPoll);

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server is running on port 3333');
});