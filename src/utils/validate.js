const validator = require("validator");

const validate = (reqBody) => {
  const firstName = reqBody.firstName?.trim();
  const lastName = reqBody.lastName?.trim();
  const email = reqBody.email?.trim();
  const password = reqBody.password;
  const pin = reqBody.pin;

  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Enter a valid email");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  }
  if (!pin || !/^\d{4,6}$/.test(pin)) {
    throw new Error("PIN must be 4-6 digits");
  }
  return { firstName, lastName, email, password, pin};
};

const validateEditProfile = (reqBody) => {
  
  const allowedFields = new Set(["firstName", "lastName"]);
  if (Object.keys(reqBody).length === 0) {
    throw new Error("Profile update cannot be empty");
  }
  const isEditAllowed = Object.keys(reqBody).every((field) =>
    allowedFields.has(field)
  );

  if (!isEditAllowed) {
    throw new Error("Invalid fields in profile update");
  }

  return reqBody;
};

module.exports = { validate, validateEditProfile };
