export function isValidJSON(text) {
  if (typeof text !== "string") {
    return false;
  }
  
  try {
    var json = JSON.parse(text);
    return typeof json === "object";
  } catch (error) {
    return false;
  }
}
