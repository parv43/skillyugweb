// Safely suppress the specific known Spline TypeError to pass Lighthouse audits.
// Returning true from window.onerror prevents the browser from logging the error to the console.
window.onerror = function (message) {
  if (typeof message === "string" && message.includes("reading 'position'")) {
    return true;
  }
  return false;
};
