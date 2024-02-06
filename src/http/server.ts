import fastify from 'fastify';
import { getPoll, createPoll, voteOnPoll } from './routes';
import cookie from '@fastify/cookie';

const app = fastify();

app.register(cookie, {
  secret: "polls-are-cool",
  hook: "onRequest",
});

app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server is running on port 3333');
});