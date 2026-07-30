/**
 * Standardizes the whileInView trigger across the app.
 * once: true ensures animations don't replay repeatedly.
 * margin: "-50px" triggers the animation slightly before it hits the viewport edge.
 */
export const revealOptions = {
  once: true,
  margin: "-50px",
};

export const revealOptionsEarly = {
  once: true,
  margin: "-100px",
};
