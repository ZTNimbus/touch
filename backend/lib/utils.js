import jwt from "jsonwebtoken";

function generateToken(userId, res) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie(
    "jwt",
    token,

    {
      maxAge: 7 * 24 * 60 * 60 * 1000,

      httpOnly: true, //Prevent XSS

      sameSite: "strict", //Prevent CSRF

      secure: process.env.NODE_ENV !== "development",
    }
  );

  return token;
}

export { generateToken };