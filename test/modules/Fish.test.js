import Fish from '@/modules/fishes/Fish';
import Tropical from '@/modules/fishes/Tropical';

describe('Fish', function () {
  it('A fish will be created', (done) => {
    const fish = Fish.createByClass(Tropical, { trapType: 1 });
    // fish.move();
    expect(fish instanceof Laya.Sprite).toBe(true);
    done();
  });

  afterEach(() => {
    Laya.stage.destroyChildren();
  });
});
