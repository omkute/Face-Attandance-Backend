import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res.status(401).json({
        msg: "User is not Authenticated",
        success: false,
      });
    const decode = await jwt.verify(token, process.env.SECRET_KEY);
    if (!decode)
      return res.status(401).json({
        msg: " Invalid Token",
      });
    if (decode.length && !decode.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden, insufficient permissions" });
    }
    req.id = decode.userId; // const req = {id:""}
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// New middleware for handling redirects based on authentication
// const redirectBasedOnAuth = async (req, res, next) => {
//     try {
//         const token = req.cookies.token;
//         if (token) {
//             // If user has a token, redirect to home page
//             return res.redirect('/');
//         } else {
//             // If no token, redirect to login page
//             return res.redirect('/login');
//         }
//     } catch (error) {
//         console.log(error);
//         return res.redirect('/login');
//     }
// }

export { isAuthenticated };
