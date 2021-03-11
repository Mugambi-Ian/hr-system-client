import config from "./config";
import firebase from "firebase";

firebase.initializeApp(config());
firebase.analytics();

export const _firebase = firebase;
export const _database = firebase.database();
export const _storage = firebase.storage();
export const _auth = firebase.auth();

firebase.analytics();

export const validField = (x) => {
  return x.length !== 0;
};
