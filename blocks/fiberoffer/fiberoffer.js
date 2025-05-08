export default function decorate(block) {
    const offerText = block.children[0];
    const offerCTA = block.children[1];
    const offerImage = block.children[2];
  
    offerText.id = 'offerText';
    offerText.className = 'offerText';
    offerCTA.id = 'offerCTA';
    offerCTA.className = 'offerCTA';
    offerImage.id = 'offerImage';
    offerImage.className = 'offerImage';
  }
  