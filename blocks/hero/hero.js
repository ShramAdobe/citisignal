/**
 * loads and decorates the hero
 * @param {Element} block The hero block element
 */

export default async function decorate(block) {
  const [_, contentOne] = block.children;

  contentOne?.classList.add('overlay');
}