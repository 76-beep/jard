/** RO schema foundation. Run manually in a NEW Apps Script project.
 * This creates new spreadsheets only. Never migrates or modifies existing data.
 * No public HTTP endpoint is provided until identity/tenant authorization is configured.
 */
const RO_SCHEMA = Object.freeze({
  Companies: ['CompanyID','CompanyName','OwnerUserID','PlanID','Status','StartsAt','ExpiresAt','SpreadsheetID','CreatedAt'],
  Plans: ['PlanID','Name','PriceSAR','ValidityDays','MaxUsers','MaxRecords','MaxOperations','MaxConcurrentOperations','Status'],
  Users: ['UserID','CompanyID','IdentitySubject','Email','FullName','Role','Status','CreatedAt'],
  Devices: ['DeviceID','UserID','CredentialPublicKey','Status','BoundAt','RevokedAt'],
  Sessions: ['SessionID','UserID','CompanyID','TokenHash','DeviceID','ExpiresAt','RevokedAt'],
  Audit: ['AuditID','CompanyID','ActorID','Action','EntityID','DetailsJSON','CreatedAt']
});
const RO_TENANT_SCHEMA = Object.freeze({
  Operations: ['OperationID','CompanyID','Name','Branch','Type','SupervisorID','Status','CreatedBy','CreatedAt','ClosedAt'],
  Assignments: ['OperationID','UserID','AssignedAt'],
  Reference: ['OperationID','Barcode','ItemName','ExpectedQty'],
  Counts: ['RecordID','OperationID','Barcode','ActualQty','Location','EmployeeID','DeviceID','Note','ServerTimestamp','ClientRequestID','Excluded'],
  Reviews: ['ReviewID','OperationID','Barcode','Location','RecordIDsJSON','Decision','ActorID','Reason','CreatedAt'],
  Audit: ['AuditID','ActorID','Action','EntityID','DetailsJSON','CreatedAt']
});
function roCreateSchema_(title, schema) {
  const ss = SpreadsheetApp.create(title);
  const initial = ss.getSheets()[0];
  Object.keys(schema).forEach((name,index)=> {
    const sheet = index===0 ? initial.setName(name) : ss.insertSheet(name);
    const columns = schema[name];
    // All identifiers/barcodes remain text. Quantity conversion belongs in the API.
    sheet.getRange(1,1,sheet.getMaxRows(),columns.length).setNumberFormat('@');
    sheet.getRange(1,1,1,columns.length).setValues([columns]).setFontWeight('bold').setBackground('#d9eee6');
    sheet.setFrozenRows(1); sheet.setRightToLeft(true);
  });
  return ss;
}
function roSetupNewEnvironment() {
  const props=PropertiesService.getScriptProperties();
  const lock=LockService.getScriptLock(); lock.waitLock(30000);
  try {
    if(props.getProperty('RO_CENTRAL_ID')) throw new Error('RO environment already exists. No files changed.');
    const ss=roCreateSchema_('RO — السجل المركزي الجديد',RO_SCHEMA);
    props.setProperty('RO_CENTRAL_ID',ss.getId());
    console.log(ss.getUrl());
  } finally {lock.releaseLock();}
}
function roValidateCount_(input) {
  if(!input || typeof input.barcode!=='string' || !input.barcode.trim() || input.barcode.length>100) throw new Error('INVALID_BARCODE');
  if(!Number.isSafeInteger(input.quantity)||input.quantity<0||input.quantity>1000000000)throw new Error('INVALID_QUANTITY');
  if(typeof input.location!=='string'||!input.location.trim()||input.location.length>80)throw new Error('INVALID_LOCATION');
  if(typeof input.requestId!=='string'||!input.requestId||input.requestId.length>100)throw new Error('INVALID_REQUEST_ID');
  return {barcode:input.barcode.trim(),quantity:input.quantity,location:input.location.trim(),requestId:input.requestId};
}
