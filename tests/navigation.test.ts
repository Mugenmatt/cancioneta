import { goBackOrHome, HOME_HREF, type BackRouter } from '@/core/navigation';

function makeRouter(canGoBack: boolean): BackRouter<string> & { back: jest.Mock; replace: jest.Mock } {
  return {
    canGoBack: () => canGoBack,
    back: jest.fn(),
    replace: jest.fn(),
  };
}

describe('HOME_HREF', () => {
  it('apunta a la ruta raíz', () => {
    expect(HOME_HREF).toBe('/');
  });
});

describe('goBackOrHome', () => {
  it('usa el historial real cuando hay una pantalla anterior', () => {
    const router = makeRouter(true);

    goBackOrHome(router, '/');

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('va al inicio cuando no hay historial previo', () => {
    const router = makeRouter(false);

    goBackOrHome(router, HOME_HREF);

    expect(router.replace).toHaveBeenCalledWith(HOME_HREF);
    expect(router.back).not.toHaveBeenCalled();
  });
});
