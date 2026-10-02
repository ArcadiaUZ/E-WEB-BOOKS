export const CONFIG = {
  googleClientId: '',
  auth: {
    storageKey: 'lumen.session.v1',
  },
  reader: {
    progressKey: 'lumen.progress.v1',
    storageKey: 'lumen.reader.v1',
  },
  frames: {
    desktopDir: 'assets/frames/desktop',
    mobileDir: 'assets/frames/mobile',
    tinyDir: 'assets/frames/tiny',
    thumbDir: 'assets/frames/thumb',
    ext: 'webp',
    pad: 4,
    desktopPrefix: 'desktop',
    mobilePrefix: 'mobile',
    preloadCount: 12,
    concurrency: 6,
    keep: 46,
  },
};
