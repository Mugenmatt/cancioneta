import appConfig from '../app.json';

const ICON = './assets/images/icono-cancioneta.png';

describe('ícono de Cancioneta', () => {
  it('usa el PNG nuevo en Expo, iOS, Android y web', () => {
    expect(appConfig.expo.icon).toBe(ICON);
    expect(appConfig.expo.ios.icon).toBe(ICON);
    expect(appConfig.expo.android.icon).toBe(ICON);
    expect(appConfig.expo.android.adaptiveIcon.foregroundImage).toBe(ICON);
    expect(appConfig.expo.web.favicon).toBe(ICON);
  });
});
