// Logout confirmation messages
export const LOGOUT_MESSAGES = [
  {
    title: "Logout",
    message: "Are you sure you want to logout?"
  },
  {
    title: "Leaving Already?",
    message: "Wait, are you really leaving? We were just getting started! 👋"
  },
  {
    title: "Hold On!",
    message: "Before you go... are you absolutely sure?"
  },
  {
    title: "Goodbye?",
    message: "This isn't goodbye forever, right? 🥺"
  },
  {
    title: "See You Soon?",
    message: "You'll come back soon, won't you? 😊"
  },
  {
    title: "Wait!",
    message: "But we were having such a good time! Really logging out?"
  },
  {
    title: "Breaking Up?",
    message: "It's not me, it's you... logging out? 💔"
  },
  {
    title: "One More Thing...",
    message: "Did you remember to save everything? Ready to logout?"
  },
  {
    title: "Logout",
    message: "Your memories will miss you... Sure about this? 🤖"
  },
  {
    title: "Plot Twist!",
    message: "What if I told you... you don't have to leave? 🎭"
  }
];

// Get a random logout message
export const getRandomLogoutMessage = () => {
  const randomIndex = Math.floor(Math.random() * LOGOUT_MESSAGES.length);
  return LOGOUT_MESSAGES[randomIndex];
};
