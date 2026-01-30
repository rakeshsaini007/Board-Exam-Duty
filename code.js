
/**
 * GOOGLE APPS SCRIPT - DEPLOY AS WEB APP
 * Setting: Execute as: "Me", Access: "Anyone"
 */

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const teacherSheet = ss.getSheetByName("TeacherList");
    const centreSheet = ss.getSheetByName("Centre");

    if (!teacherSheet || !centreSheet) {
      return createJsonResponse({ status: 'error', message: 'Sheets "TeacherList" or "Centre" not found.' });
    }

    // Fetch Teachers
    const teacherData = teacherSheet.getDataRange().getValues();
    const headers = teacherData[0];
    const teachers = teacherData.slice(1).map(row => {
      return {
        hrmsCode: String(row[0]),
        name: row[1],
        gender: row[2],
        schoolName: row[3],
        mobileNumber: String(row[4]),
        examinationCentre: row[5]
      };
    });

    // Fetch Centres
    const centreData = centreSheet.getDataRange().getValues();
    const centres = centreData.slice(1).map(row => ({ name: row[0] }));

    return createJsonResponse({
      status: 'success',
      data: {
        teachers: teachers,
        centres: centres
      }
    });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("TeacherList");
    
    if (postData.action === 'update') {
      const hrmsCode = String(postData.hrmsCode);
      const newCentre = postData.centre;
      
      const data = sheet.getDataRange().getValues();
      let foundIndex = -1;
      
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]) === hrmsCode) {
          foundIndex = i + 1; // Sheets are 1-indexed
          break;
        }
      }
      
      if (foundIndex !== -1) {
        sheet.getRange(foundIndex, 6).setValue(newCentre); // Column 6 is Examination Centre
        return createJsonResponse({ status: 'success', message: 'Record updated.' });
      } else {
        return createJsonResponse({ status: 'error', message: 'HRMS Code not found.' });
      }
    }
    
    return createJsonResponse({ status: 'error', message: 'Unknown action.' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup dummy data if needed
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let tSheet = ss.getSheetByName("TeacherList");
  if(!tSheet) {
    tSheet = ss.insertSheet("TeacherList");
    tSheet.appendRow(["HRMS Code", "Name of Teacher", "Gender", "School Name", "Mobile Number", "Examination Centre"]);
    tSheet.appendRow(["419255", "MANZOOLRUL HAQ NAVAZ KHAN", "M", "RATANPURA (Composite)", "9997067514", "ABC"]);
    tSheet.appendRow(["2166936", "PANKAJ KUMAR", "M", "RATANPURA (Composite)", "8279856228", "ABC"]);
    tSheet.appendRow(["419144", "SUNIL SINGH", "M", "RATANPURA (Composite)", "9457019542", "XYZ"]);
  }
  
  let cSheet = ss.getSheetByName("Centre");
  if(!cSheet) {
    cSheet = ss.insertSheet("Centre");
    cSheet.appendRow(["Centre Name"]);
    cSheet.appendRow(["ABC"]);
    cSheet.appendRow(["XYZ"]);
    cSheet.appendRow(["PQR"]);
  }
}
