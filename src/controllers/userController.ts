import { Response, NextFunction } from "express";
import userModel from "../models/userModel";
import jwt from "jsonwebtoken";
import bycrpt from "bcrypt";
import { CustomRequest } from "../utils/request-model";
/**
 *
 * @param id
 * @returns token for login
 */
const signToken = (id: string) => {
  return jwt.sign({ id }, String(process.env.JWT_SECRET), {
    expiresIn: String(process.env.JWT_EXPIRES_IN)
  });
};

/**
 * Single method to handle token for the login
 * @param req
 * @param user
 * @param statusCode
 * @param res
 * @param message
 */
const createSenderToken = (
  req: CustomRequest,
  user: CustomRequest["body"],
  statusCode: number,
  res: Response,
  message: string
) => {
  const token = signToken(user._id);
  const cookiesOption = {
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  res.cookie("jwt", token, cookiesOption);
  
  user.password = undefined;
  
  res.status(statusCode).json({
    status: "success",
    code: res.statusCode,
    token,
    data: {
      user
    },
    request_time: req.requestTime,
    message: message
  });
};

/**
 * Method for signup for user
 * @param req
 * @param res
 * @param next
 */
export const signup = async (req: CustomRequest, res: Response) => {
  try {
    const { name, email, role, password, confirmpassword } = req.body;
    if (password !== confirmpassword) {
      return res.status(400).json({
        error: "Passwords don't match",
        code: res.statusCode
      });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User already exsist", code: res.statusCode });
    }

    const hashedPassword = await bycrpt.hash(password, 10);

    let newUser = await userModel.create({
      name,
      email,
      role,
      password: hashedPassword
    });
    res.status(201).json({
      status: "success",
      code: res.statusCode,
      data: {
        newUser
      },
      request_time: req.requestTime,
      message: "You had been signed up successfully"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: res.statusCode,
      message: res.statusMessage
    });
  }
};

/**
 * Method for login
 */

export const login = async (req: CustomRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      code: res.statusCode,
      message: "Please provide email or password"
    });
  }

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    // User with the provided email not found in the database
    return res.status(401).json({ error: "Invalid credentials" });
  }

  if (typeof user.password !== "string") {
    return res.status(500).json({
      status: "error",
      code: res.statusCode,
      message: "Unexpected error occurred"
    });
  }

  const passwordMatch = await bycrpt.compare(password, user.password);

  if (!passwordMatch) {
    // User with the provided email not found in the database
    return res.status(401).json({
      status: "error",
      code: res.statusCode,
      message: "Password is incorrect"
    });
  }

  createSenderToken(req, user, 200, res, "You had been logged in successfully");
};
