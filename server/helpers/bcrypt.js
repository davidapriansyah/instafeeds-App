import bcrypt from "bcryptjs";

const hash = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

const compare = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

export { hash, compare };
