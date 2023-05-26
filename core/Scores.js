import { getScores } from "./FireBaseSetup.js";

getScores((data) => {
  const table = document.getElementById("tablescores")
  table.innerHTML = ""
  let hardScores = [], easyScores = []
  Object.entries(data.dificil).forEach(([key, value]) => {
    hardScores.push({ user: key, score: value.score, mode: "dificil" })
  })
  Object.entries(data.facil).forEach(([key, value]) => {
    easyScores.push({ user: key, score: value.score, mode: "facil" })
  })
  console.log(hardScores)
  console.log(easyScores)

  hardScores.forEach(val => {
    table.insertAdjacentHTML(
      'beforeend',
      `
        <tr>
          <td>${val.user}</td>
          <td>${val.score}</td>
          <td>${val.mode}</td>
        </tr>
      `
    )
  })

  easyScores.forEach(val => {
    table.insertAdjacentHTML(
      'beforeend',
      `
        <tr>
          <td>${val.user}</td>
          <td>${val.score}</td>
          <td>${val.mode}</td>
        </tr>
      `
    )
  })
})