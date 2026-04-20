function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.date || "",
    data.type || "",
    data.selectedDay || "",
    data.workoutTitle || "",
    data.readiness || "",
    data.sleep || "",
    data.energy || "",
    data.stress || "",
    data.backPain || "",
    data.nerve || "",
    data.anklePain || "",
    data.ankleStability || "",
    data.shoulder || "",
    data.dogWalk || "",
    Array.isArray(data.completedExercises) ? data.completedExercises.join(", ") : "",
    data.notes || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}
