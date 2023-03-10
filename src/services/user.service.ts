import bcrypt from "bcryptjs";
import { Request } from "express";

import mongoose, { Types } from "mongoose";
import User, { IUser } from "../models/user.model";
import * as configs from "../configs/user.config";
import { validationResult } from "express-validator";

export const fetchUserByEmail = async (email: string) => {
  try {
    const existingUser: IUser | null = await User.findOne({ email: email });
    // .populate("reservation");
    // .populate({
    //   path: "hallId",
    //   populate: {
    //     path: "bookings",
    //     model: "Booking",
    //   },
    // });
    if (!existingUser) throw new Error(configs.errors.notFound.key);
    return existingUser;
  } catch (err) {
    throw new Error(configs.errors.serverError.key);
  }
};

export const fetchUserById = async (id: string) => {
  const user: IUser | null = await User.findById(id);
  if (!user) throw new Error(configs.errors.wrongCredentials.key);
  return user;
};

export const arePasswordsIdentical = async (password: string, confirmPassword: string) => {
  if (password !== confirmPassword) throw new Error(configs.errors.passwordsNotEqual.key);
};

export const areCredentialsValid = async (receivedPassword: string, actualPassword: string) => {
  const isValidPassword = await bcrypt.compare(receivedPassword, actualPassword);
  if (!isValidPassword) throw new Error(configs.errors.wrongCredentials.key);
};

export const doesUserExist = async (email: string) => {
  const existingUser = await User.findOne({ email: email });
  if (existingUser) throw new Error(configs.errors.userExists.key);
};

export const generateHashedPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const createUser = (req: Request, hashedPassword: string) => {
  const createdUser = new User({
    ...req.body,
    password: hashedPassword,
    favorites: [],
    hallId: null,
    reservation: null,
    chatRooms: [],
  });

  return createdUser;
};

export const saveUser = async (createdUser: IUser) => {
  await createdUser.save();
};

export const generateUserResponseData = (user: IUser, token: string, message: string) => {
  return {
    message: `logged in with ${user.email}`,
    userInfo: user.toObject({ getters: true }),
    hallInfo:
      user.hallId instanceof Types.ObjectId
        ? user.hallId
        : user.hallId?.toObject({ getters: true }),
    token: token,
  };
};

export const validateData = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) throw new Error(configs.errors.invalidData.key);
};

export const toggleFavoriteHall = (user: IUser, hallId: string) => {
  const index = user.favorites.findIndex((id) => id.toString() === hallId);

  if (index < 0) return user.favorites.push(new mongoose.Types.ObjectId(hallId));
  const newFavorites = user.favorites.filter((id) => id.toString() !== hallId);
  user.favorites = newFavorites;
};

const addHall = (hallId: string) => {
  // const newHallId = new mongoose.Types.ObjectId(hallId);
};
