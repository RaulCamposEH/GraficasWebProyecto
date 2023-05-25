class Temporizador {

  constructor(totalTime) {
    this.totalTime = totalTime
    this.leftTime = this.totalTime
    this.timeEnded = false
    this.startTimer = false
    this.timePause = false
  }

  start() {
    this.startTimer = true
  }

  pause() {
    this.timePause = true
  }

  resume() {
    this.timePause = false
  }

  stop() {
    this.leftTime = this.totalTime
    this.timeEnded = false
    this.startTimer = false
  }

  updateTimer(deltaTime) {
    if (this.startTimer && !this.timePause) {
      if (this.timeEnded) return
      this.leftTime -= deltaTime
      if (this.leftTime <= 0) {
        this.leftTime = 0;
        this.timeEnded = true; // Marca el temporizador como terminado si ha llegado a cero
      }
    }
  }

  resetTimer() {
    this.leftTime = this.totalTime
    this.timeEnded = false
  }
}

export default Temporizador