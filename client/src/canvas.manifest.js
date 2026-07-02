export const manifest = {
  screens: {
    scr_aoh0js: { name: "Lobby", route: "/", state: { "phase": "lobby" }, position: { "x": 160, "y": 220 } },
    scr_yhjmv0: { name: "Transmitting D-Mail", route: "/", state: { "phase": "connecting", "mode": "create" }, position: { "x": 2960, "y": 220 } },
    scr_f79xer: { name: "Attempting Convergence", route: "/", state: { "phase": "connecting", "mode": "join" }, position: { "x": 1560, "y": 220 } },
    scr_adxjuz: { name: "In Call", route: "/", state: { "phase": "call" }, position: { "x": 4360, "y": 220 } }
  },
  sections: {
    sec_17jz3y: { name: "Communication flow", x: 0, y: 0, width: 5720, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_17jz3y", children: [
    { kind: "screen", id: "scr_aoh0js" },
    { kind: "screen", id: "scr_f79xer" },
    { kind: "screen", id: "scr_yhjmv0" },
    { kind: "screen", id: "scr_adxjuz" }]
  }]

};