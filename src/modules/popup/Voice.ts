import { ui } from '@/ui/layaMaxUI';
import { querySelector } from '@/utils/util';

const { SoundManager } = Laya;
export default class Voice extends ui.DlgVoiceUI {
  static instance: Voice;
  constructor() {
    super();
    this.zOrder = 99;
  }
  static getInstance(): Voice {
    if (!Voice.instance) Voice.instance = new Voice();
    return Voice.instance;
  }
  public init(): void {
    const musicSlider = querySelector(this, 'musicSlider') as Laya.Slider;
    const soundSlider = querySelector(this, 'soundSlider') as Laya.Slider;

    SoundManager.useAudioMusic = false;

    const musicVolume = localStorage.getItem(`volume_music`) || 0.5;
    const soundVolume = localStorage.getItem(`volume_sound`) || 0.5;

    musicSlider.value = Number(musicVolume) * 100;
    soundSlider.value = Number(soundVolume) * 100;
    SoundManager.setMusicVolume(Number(musicVolume));
    SoundManager.setSoundVolume(Number(soundVolume));

    musicSlider.changeHandler = Laya.Handler.create(
      this,
      (value) => {
        SoundManager.setMusicVolume(value / 100);
      },
      null,
      false,
    );
    musicSlider.on('changed', this, () => {
      localStorage.setItem(`volume_music`, String(musicSlider.value / 100));
    });

    soundSlider.changeHandler = Laya.Handler.create(
      this,
      (value) => {
        SoundManager.setSoundVolume(value / 100);
      },
      null,
      false,
    );
    soundSlider.on('changed', this, () => {
      localStorage.setItem(`volume_sound`, String(soundSlider.value / 100));
    });
  }
}
