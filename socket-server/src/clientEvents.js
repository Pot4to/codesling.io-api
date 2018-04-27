import axios from 'axios';

import { success } from './lib/log';
import {
  serverInitialState,
  clientOneServerChanged,
  clientTwoServerChanged,
  serverLeave,
  serverRun,
  serverMessage,
} from './serverEvents';

/**
 *
 *  Client emissions (server listeners)
 *
 *  more on socket emissions:
 *  @url {https://socket.io/docs/emit-cheatsheet/}
 *
 *  @param room is an ES6 Map, containing { id, state }
 *  @url {https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map}
 *
 */
const clientReady = ({ io, client, room, player }, payload) => {
  success('client ready heard', io, client, room, player);
  serverInitialState({ io, client, room }, payload);
};

const clientOneUpdate = ({ io, client, room }, payload) => {
  const { text, player } = payload;
  success('client update heard. payload.text = ', payload);
  room.set('playerOne.text', text);
  clientOneServerChanged({ io, client, room, player });
};

const clientTwoUpdate = ({ io, client, room }, payload) => {
  const { text, player } = payload;
  success('client update heard. payload.text = ', payload);
  room.set('playerTwo.text', text);
  clientTwoServerChanged({ io, client, room, player });
};

const clientDisconnect = ({ io, room }) => {
  success('client disconnected');
  serverLeave({ io, room });
};

const clientRun = async ({ io, room }, payload) => {
  success('running code from client. room.get("text") = ', room.get('text'));
  // Get text from the player that hit run
  const { text, player } = payload;
  //URLs for the servers
  const url = process.env.CODERUNNER_SERVICE_URL;
  const restUrl = process.env.REST_SERVER_URL;
  //First check that the room has no winner
  if (!room.get('winner')) {
        try {
          const { test } = room.get('challenge');
          const { data } = await axios.post(`${url}/submit-code`, { code: text, test: test });
          const stdout = data;
          // get rid of non-solved tests
          const reducer = data.console.filter(item => {
            return item !== 'solved'
          });
          // if there are no failing tests,
          if (data.console.filter(item => item !== 'solved').length === 0) {
            //update room to have a winner, 
            room.set('winner', player);
            //emit the winner and data to the clients
            stdout.winner = player;
            serverRun({ io, room }, { stdout, player });
          } else {
            // emit text to client - no winner
            serverRun({ io, room }, { stdout, player });
          }
        } catch (e) {
          success('error posting to coderunner service from socket server. e = ', e);
        }
  } else {
    //winner is present in room: 
    let stdout = {console: `winner has already been determined, the winner was player ${room.get('winner')}`}
    serverRun({ io, room }, { stdout, player })
  }
};

const clientMessage = async ({ io, room }, payload) => {
  success('client message heard');
  const url = process.env.REST_SERVER_URL;
  try {
    const { data } = await axios.post(`${url}/messages/`, payload);
    serverMessage({ io, room }, data);
  } catch (e) {
    success('error saving message to the database. e = ', e);
  }
};

const clientEmitters = {
  'client.ready': clientReady,
  'clientOne.update': clientOneUpdate,
  'clientTwo.update': clientTwoUpdate,
  'client.disconnect': clientDisconnect,
  'client.run': clientRun,
  'client.message': clientMessage,
};

export default clientEmitters;
