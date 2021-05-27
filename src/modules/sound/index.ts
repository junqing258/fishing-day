let bg = '';
export function playMusic(url: string, loops?: number, complete?: Laya.Handler, startTime?: number): void {
  if (bg === url) return;
  bg = url;
  Laya.SoundManager.playMusic(url, loops, complete, startTime);
}

export function playSound(url: string, loops?: number, complete?: Laya.Handler): void {
  Laya.SoundManager.playSound(url, loops, complete);
}
