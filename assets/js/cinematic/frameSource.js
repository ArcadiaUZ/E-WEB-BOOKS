import { CONFIG } from '../config.js';
import { frameName } from '../core/env.js';

const dirFor = (tier) => (tier === 'mobile' ? CONFIG.frames.mobileDir : CONFIG.frames.desktopDir);

export function createFrameSource(count) {
  let tier = CONFIG.frames.desktopPrefix;

  return {
    get count() {
      return count;
    },
    get tier() {
      return tier;
    },
    setTier(next) {
      tier = next;
    },
    url(index, forcedTier) {
      const name = frameName(index, CONFIG.frames.pad);
      return `${dirFor(forcedTier || tier)}/${name}.${CONFIG.frames.ext}`;
    },
    tinyUrl(index) {
      return `${CONFIG.frames.tinyDir}/${frameName(index, CONFIG.frames.pad)}.${CONFIG.frames.ext}`;
    },
    thumbUrl(index) {
      return `${CONFIG.frames.thumbDir}/${frameName(index, CONFIG.frames.pad)}.${CONFIG.frames.ext}`;
    },
    posterUrl() {
      return 'assets/frames/poster.jpg';
    },
  };
}
