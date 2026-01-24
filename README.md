# TWO BIRDS ONE WORD

**[Play Now](https://two-birds-one-word-1.onrender.com)**

## Instructions:

The host chooses two words, generated at random. The players must choose one word that associates best with both of the words chosen by the host. The players must then explain the association to the host, and the host will judge each player, and crown a winner. Once a player wins three rounds, the player wins the game.

## Local run instructions:

1. Clone the repo:

```bash
   git clone https://github.com/tbanken/two-birds-one-word
   cd two-birds-one-word
```

2. Start the server:

```bash
cd server
npm install
node index.js
```

3. In a new terminal, start the frontend:

```bash
cd two-birds-one-word
npm install
npm run dev
```

4. Open browser in `http://localhost:5173/`

## Hosted server:

- The frontend and backend is hosted on Render

## TODO:

- No ties allowed
- Reasonable word dictionary (lots of obscure words as of right now)
- Aesthetics improvement- logo, font, css stuff
- Resolve the component monolith
- QoL improvements for any oddities(back button, resolving notifications(eg "Host has left the game")
- Fun domain name
