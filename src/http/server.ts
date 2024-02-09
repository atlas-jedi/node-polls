import fastify from 'fastify';
import { getPoll, createPoll, voteOnPoll } from './routes';
import { fastifyWebsocket } from '@fastify/websocket';
import cookie from '@fastify/cookie';
import { pollResults } from './ws/poll-results';

const app = fastify();

app.register(cookie, {
  secret: "polls-are-cool",
  hook: "onRequest",
});

app.register(fastifyWebsocket);
app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);
app.register(pollResults);

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server is running on port 3333');
});