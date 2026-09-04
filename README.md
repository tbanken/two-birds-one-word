# TWO BIRDS ONE WORD

**[Play Now](https://twobirdsoneword.com/)**

## Instructions:

The host starts a game and (optionally) picks a judge. Two words are generated based on the selected word mode (Easy / Medium / Hard). Players submit one word that connects both prompts. The judge rates each connection anonymously (names hidden and shuffled), then results are revealed. First to the set number of round wins takes the game.

## Features:

- **Word modes:** Easy, Medium, and Hard curated lists (plus Datamuse)
- **Flexible judge:** Host can assign any player as judge (judge does not submit)
- **Anonymous judging:** Submissions shown as Entry A/B/C… in random order
- **Auto-advance:** Round ends when everyone has submitted
- **Results for everyone:** Prompt words and scores shown on results and game over

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

## Hosted:

- Play at [twobirdsoneword.com](https://twobirdsoneword.com/)
- Backend hosted on Render

## TODO:

- Aesthetics improvement — logo, font, css stuff
- QoL improvements for any oddities (back button, notifications)
